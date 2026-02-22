-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to help_articles
ALTER TABLE help_articles 
ADD COLUMN IF NOT EXISTS content_embedding vector(1536);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS help_articles_embedding_idx 
ON help_articles 
USING ivfflat (content_embedding vector_cosine_ops)
WITH (lists = 100);

-- Create similarity search function
CREATE OR REPLACE FUNCTION match_help_articles(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  p_site_id text DEFAULT 'pwd'
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  category text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ha.id,
    ha.title,
    ha.slug,
    ha.category,
    ha.content,
    1 - (ha.content_embedding <=> query_embedding) AS similarity
  FROM help_articles ha
  WHERE 
    ha.site_id = p_site_id
    AND ha.is_published = true
    AND ha.content_embedding IS NOT NULL
    AND 1 - (ha.content_embedding <=> query_embedding) > match_threshold
  ORDER BY ha.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute to anon and service roles
GRANT EXECUTE ON FUNCTION match_help_articles TO anon, authenticated, service_role;
