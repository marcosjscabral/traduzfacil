-- Insere o Plano Premium no catálogo para gerenciar via Admin Dashboard
INSERT INTO catalog (
  title,
  author,
  difficulty,
  epub_url,
  cover_url,
  free,
  premium_only,
  price_cents,
  stripe_product_id,
  stripe_price_id,
  stripe_payment_link,
  "Language"
) VALUES (
  'Traxbook Premium',
  'Traxbook Team',
  'Beginner',
  'none',
  'none',
  false,
  false,
  290,
  'prod_UPOLSAr2ZHNZiy',
  'price_1TQZZEF0lxCQwtFq9zKNq0iN',
  'https://buy.stripe.com/cNi28rc5U7Hcbeg7lMcwg0b',
  'English'
);
