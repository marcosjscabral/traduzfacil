-- Migration: Add location_info to flashcards
-- Allows users to see where a word was highlighted (e.g. Chapter or Page)

ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS location_info TEXT;
