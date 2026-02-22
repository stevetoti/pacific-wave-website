-- GEO (Generative Engine Optimization) Features for SEO Hub
-- Migration: 2025-02-22

-- Brand mentions tracking
CREATE TABLE IF NOT EXISTS seo_brand_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL DEFAULT 'pwd',
  platform TEXT NOT NULL, -- reddit, youtube, linkedin, wikipedia, etc.
  url TEXT,
  mention_text TEXT,
  sentiment TEXT DEFAULT 'neutral', -- positive, neutral, negative
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform targeting preferences
CREATE TABLE IF NOT EXISTS seo_platform_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL UNIQUE DEFAULT 'pwd',
  target_chatgpt BOOLEAN DEFAULT true,
  target_perplexity BOOLEAN DEFAULT true,
  target_google_ai BOOLEAN DEFAULT true,
  target_gemini BOOLEAN DEFAULT true,
  target_claude BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site llms.txt content
CREATE TABLE IF NOT EXISTS seo_llms_txt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL UNIQUE DEFAULT 'pwd',
  site_name TEXT,
  site_description TEXT,
  key_pages JSONB DEFAULT '[]'::jsonb,
  contact_info JSONB DEFAULT '{}'::jsonb,
  content TEXT,
  last_generated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Citability analysis history
CREATE TABLE IF NOT EXISTS seo_citability_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL DEFAULT 'pwd',
  content_title TEXT,
  content_text TEXT,
  overall_score INTEGER,
  paragraph_scores JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_seo_brand_mentions_site_id ON seo_brand_mentions(site_id);
CREATE INDEX IF NOT EXISTS idx_seo_brand_mentions_platform ON seo_brand_mentions(platform);
CREATE INDEX IF NOT EXISTS idx_seo_citability_analyses_site_id ON seo_citability_analyses(site_id);

-- Enable RLS
ALTER TABLE seo_brand_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_platform_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_llms_txt ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_citability_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for now, admin access only via anon key)
CREATE POLICY "Allow all access to seo_brand_mentions" ON seo_brand_mentions FOR ALL USING (true);
CREATE POLICY "Allow all access to seo_platform_targets" ON seo_platform_targets FOR ALL USING (true);
CREATE POLICY "Allow all access to seo_llms_txt" ON seo_llms_txt FOR ALL USING (true);
CREATE POLICY "Allow all access to seo_citability_analyses" ON seo_citability_analyses FOR ALL USING (true);

-- Insert default platform targets for pwd if not exists
INSERT INTO seo_platform_targets (site_id, target_chatgpt, target_perplexity, target_google_ai, target_gemini, target_claude)
VALUES ('pwd', true, true, true, true, true)
ON CONFLICT (site_id) DO NOTHING;
