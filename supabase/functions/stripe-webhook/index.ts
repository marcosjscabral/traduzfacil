// supabase/functions/stripe-webhook/index.ts
// Supabase Edge Function to handle Stripe webhook events
// Deploy with: supabase functions deploy stripe-webhook --no-verify-jwt

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Stripe requires raw body for signature verification
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Use the service role key so we can bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Simple HMAC-SHA256 signature verification for Stripe webhooks
async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  try {
    const parts = sigHeader.split(',')
    const timestampPart = parts.find(p => p.startsWith('t='))
    const sigPart = parts.find(p => p.startsWith('v1='))

    if (!timestampPart || !sigPart) return false

    const timestamp = timestampPart.split('=')[1]
    const expectedSig = sigPart.split('=')[1]

    // Check timestamp is within 5 minutes
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - parseInt(timestamp)) > 300) return false

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
    const computedSig = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return computedSig === expectedSig
  } catch (e) {
    console.error('Signature verification error:', e)
    return false
  }
}

serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  // Verify webhook signature
  const isValid = await verifyStripeSignature(body, sig, STRIPE_WEBHOOK_SECRET)
  if (!isValid) {
    console.error('Invalid Stripe webhook signature')
    return new Response('Invalid signature', { status: 401 })
  }

  const event = JSON.parse(body)
  console.log(`Received Stripe event: ${event.type}`)

  try {
    switch (event.type) {
      // ─── CHECKOUT COMPLETED (Payment Link or Checkout Session) ───
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.client_reference_id // This is the Supabase user ID we passed
        const customerEmail = session.customer_details?.email
        const stripeCustomerId = session.customer
        const mode = session.mode // 'subscription' or 'payment'

        console.log(`Checkout completed: userId=${userId}, email=${customerEmail}, mode=${mode}`)

        if (!userId) {
          console.error('No client_reference_id found in session. Cannot identify user.')
          // Try to find user by email as fallback
          if (customerEmail) {
            const { data: profileByEmail } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', customerEmail)
              .single()

            if (profileByEmail) {
              console.log(`Found user by email fallback: ${profileByEmail.id}`)
              await supabase
                .from('profiles')
                .update({
                  is_premium: true,
                  stripe_customer_id: stripeCustomerId,
                  premium_since: new Date().toISOString(),
                })
                .eq('id', profileByEmail.id)

              return new Response(JSON.stringify({ received: true, user: profileByEmail.id }), { status: 200 })
            }
          }
          return new Response(JSON.stringify({ received: true, warning: 'no user identified' }), { status: 200 })
        }

        // Update user profile to premium
        if (mode === 'subscription') {
          const { error } = await supabase
            .from('profiles')
            .update({
              is_premium: true,
              stripe_customer_id: stripeCustomerId,
              stripe_subscription_id: session.subscription,
              premium_since: new Date().toISOString(),
            })
            .eq('id', userId)

          if (error) {
            console.error('Error updating profile to premium:', error)
            return new Response(JSON.stringify({ error: error.message }), { status: 500 })
          }
          console.log(`✅ User ${userId} upgraded to Premium (subscription)`)
        } else if (mode === 'payment') {
          // One-time payment (individual book or combo)
          // Store the purchase record
          const { error } = await supabase
            .from('purchases')
            .insert({
              user_id: userId,
              stripe_session_id: session.id,
              stripe_customer_id: stripeCustomerId,
              amount_total: session.amount_total,
              currency: session.currency,
              status: 'completed',
            })

          if (error) {
            console.error('Error recording purchase:', error)
            // Don't fail — the payment was successful
          }
          console.log(`✅ Purchase recorded for user ${userId}`)
        }
        break
      }

      // ─── SUBSCRIPTION CANCELLED ───
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const stripeCustomerId = subscription.customer

        console.log(`Subscription deleted for customer: ${stripeCustomerId}`)

        // Find user by stripe_customer_id and revoke premium
        const { error } = await supabase
          .from('profiles')
          .update({
            is_premium: false,
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', stripeCustomerId)

        if (error) {
          console.error('Error revoking premium:', error)
        } else {
          console.log(`✅ Premium revoked for customer ${stripeCustomerId}`)
        }
        break
      }

      // ─── SUBSCRIPTION UPDATED (e.g. plan change, renewal failure) ───
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const stripeCustomerId = subscription.customer
        const status = subscription.status

        console.log(`Subscription updated: customer=${stripeCustomerId}, status=${status}`)

        // If subscription becomes past_due or unpaid, revoke premium
        if (status === 'past_due' || status === 'unpaid' || status === 'canceled') {
          await supabase
            .from('profiles')
            .update({ is_premium: false })
            .eq('stripe_customer_id', stripeCustomerId)
          console.log(`⚠️ Premium paused for customer ${stripeCustomerId} (status: ${status})`)
        } else if (status === 'active') {
          await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('stripe_customer_id', stripeCustomerId)
          console.log(`✅ Premium reactivated for customer ${stripeCustomerId}`)
        }
        break
      }

      // ─── INVOICE PAYMENT FAILED ───
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const stripeCustomerId = invoice.customer
        console.log(`⚠️ Payment failed for customer: ${stripeCustomerId}`)
        // Optionally send notification — for now just log
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
})
