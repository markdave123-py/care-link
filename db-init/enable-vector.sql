-- Enable vector extension exactly once
CREATE EXTENSION IF NOT EXISTS vector;

-- Add the embedding column to HPTypes only if it’s missing
ALTER TABLE "HPTypes"
  ADD COLUMN IF NOT EXISTS embedding vector(768);