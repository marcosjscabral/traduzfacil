-- =====================================================================
-- TRAXBOOK: Migração Completa para Integração Stripe
-- Execute no Supabase SQL Editor (em ordem)
-- =====================================================================

-- ─── 1. Colunas novas na tabela profiles ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_since TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_upload_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_upload_at TIMESTAMPTZ;

-- ─── 2. Colunas novas na tabela catalog ───
ALTER TABLE catalog ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE catalog ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
ALTER TABLE catalog ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT;

-- ─── 3. Tabela de compras individuais (livros/combos) ───
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  amount_total INTEGER,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Users can read their own purchases
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Service role (webhook) can insert purchases
CREATE POLICY "Service role can insert purchases" ON purchases
  FOR INSERT WITH CHECK (true);

-- ─── 4. Atualizar livros existentes no catálogo com Payment Links ───
UPDATE catalog 
SET stripe_payment_link = 'https://buy.stripe.com/5kQ00j4DsaTodmo35wcwg01'
WHERE stripe_price_id = 'price_1TOIaIF0lxCQwtFqj99VXrl0';

UPDATE catalog 
SET stripe_payment_link = 'https://buy.stripe.com/14A8wPgmagdIgyA8pQcwg02'
WHERE stripe_price_id = 'price_1TOIaIF0lxCQwtFq9YDWh6dz';

UPDATE catalog 
SET stripe_payment_link = 'https://buy.stripe.com/5kQ14n0nc9Pk5TW9tUcwg05'
WHERE stripe_price_id = 'price_1TOLTwF0lxCQwtFqCD8vs4Z8';

UPDATE catalog 
SET stripe_payment_link = 'https://buy.stripe.com/bJe9ATee25z40zC0Xocwg04'
WHERE stripe_price_id = 'price_1TOLYkF0lxCQwtFq2CwVM2XR';

-- ─── 5. Verificar resultado ───
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

SELECT id, title, stripe_price_id, stripe_payment_link FROM catalog;
