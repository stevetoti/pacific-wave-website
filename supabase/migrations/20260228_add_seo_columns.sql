-- Add SEO-related columns to blog_posts table
-- Run this migration on Supabase SQL Editor

-- Add focus_keyword column for primary SEO keyword
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS focus_keyword TEXT DEFAULT NULL;

-- Add image_alt column for image SEO
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS image_alt TEXT DEFAULT NULL;

-- Add index for focus_keyword for faster SEO queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_focus_keyword 
ON blog_posts(focus_keyword) 
WHERE focus_keyword IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN blog_posts.focus_keyword IS 'Primary SEO focus keyword for the article';
COMMENT ON COLUMN blog_posts.image_alt IS 'Alt text for the featured image (SEO)';
