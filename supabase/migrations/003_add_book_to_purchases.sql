-- =====================================================================
-- TRAXBOOK: Adicionar book_id na tabela purchases
-- Execute no Supabase SQL Editor
-- =====================================================================

ALTER TABLE purchases ADD COLUMN IF NOT EXISTS book_id UUID REFERENCES catalog(id) ON DELETE SET NULL;

-- Create an index to speed up lookups
CREATE INDEX IF NOT EXISTS idx_purchases_user_book ON purchases(user_id, book_id);
