// Supabase Edge Function: stripe-admin
// Creates and updates Stripe products, prices, and payment links from the admin dashboard.
// Requires: STRIPE_SECRET_KEY secret set in Supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAILS = ["marcosjscabral@gmail.com"];
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth token" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user || !ADMIN_EMAILS.includes(user.email || "")) {
      return new Response(JSON.stringify({ error: "Unauthorized: admin only" }), {
        status: 403,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // ─── ACTION: CREATE PRODUCT + PRICE + PAYMENT LINK ───
    if (action === "create_product") {
      const { title, price_cents, currency = "usd" } = body;
      if (!title || !price_cents) {
        return new Response(JSON.stringify({ error: "title and price_cents are required" }), {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      // 1. Create Stripe Product
      const product = await stripe.products.create({
        name: `${title} - Digital Edition`,
        description: `Digital translation book: ${title}`,
        metadata: { source: "traxbook-admin" },
      });

      // 2. Create Stripe Price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: price_cents,
        currency: currency,
      });

      // 3. Create Payment Link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
        after_completion: {
          type: "redirect",
          redirect: { url: "https://traduz-facil.vercel.app/?stripe_success=true" },
        },
      });

      return new Response(JSON.stringify({
        success: true,
        stripe_product_id: product.id,
        stripe_price_id: price.id,
        stripe_payment_link: paymentLink.url,
      }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // ─── ACTION: UPDATE PRICE (archive old, create new) ───
    if (action === "update_price") {
      const { stripe_product_id, stripe_price_id_old, price_cents, currency = "usd" } = body;
      if (!stripe_product_id || !price_cents) {
        return new Response(JSON.stringify({ error: "stripe_product_id and price_cents required" }), {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      // 1. Archive old price if exists
      if (stripe_price_id_old) {
        try {
          await stripe.prices.update(stripe_price_id_old, { active: false });
        } catch (e) {
          console.warn("Could not archive old price:", e.message);
        }
      }

      // 2. Create new price
      const newPrice = await stripe.prices.create({
        product: stripe_product_id,
        unit_amount: price_cents,
        currency: currency,
      });

      // 3. Create new Payment Link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [{ price: newPrice.id, quantity: 1 }],
        after_completion: {
          type: "redirect",
          redirect: { url: "https://traduz-facil.vercel.app/?stripe_success=true" },
        },
      });

      return new Response(JSON.stringify({
        success: true,
        stripe_price_id: newPrice.id,
        stripe_payment_link: paymentLink.url,
      }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // ─── ACTION: LIST PRODUCTS (for sync check) ───
    if (action === "list_products") {
      const products = await stripe.products.list({ limit: 50, active: true });
      const result = [];
      for (const prod of products.data) {
        const prices = await stripe.prices.list({ product: prod.id, active: true, limit: 5 });
        result.push({
          id: prod.id,
          name: prod.name,
          prices: prices.data.map(p => ({
            id: p.id,
            unit_amount: p.unit_amount,
            currency: p.currency,
          })),
        });
      }
      return new Response(JSON.stringify({ success: true, products: result }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("stripe-admin error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
