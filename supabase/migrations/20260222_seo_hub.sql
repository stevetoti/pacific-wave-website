-- SEO Hub Database Schema
-- Created: 2026-02-22
-- Purpose: Complete SEO management system with memory and tracking

-- ============================================
-- 1. TARGET KEYWORDS - Keywords we want to rank for
-- ============================================
CREATE TABLE IF NOT EXISTS seo_target_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL DEFAULT 'pwd', -- For multi-site support later
  keyword TEXT NOT NULL,
  search_volume INT,
  difficulty INT, -- 0-100 scale
  cpc DECIMAL(10,2), -- Cost per click estimate
  intent TEXT, -- informational, commercial, transactional, navigational
  priority TEXT DEFAULT 'medium', -- high, medium, low
  status TEXT DEFAULT 'tracking', -- tracking, ranking, lost, achieved
  target_url TEXT, -- Which page should rank for this
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, keyword)
);

-- ============================================
-- 2. RANKINGS HISTORY - Daily snapshots of keyword positions
-- ============================================
CREATE TABLE IF NOT EXISTS seo_rankings_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL DEFAULT 'pwd',
  keyword TEXT NOT NULL,
  position INT, -- 1-100, NULL if not ranking
  url TEXT, -- Which URL is ranking
  previous_position INT,
  change INT, -- Positive = improved, negative = dropped
  search_engine TEXT DEFAULT 'google',
  location TEXT DEFAULT 'Vanuatu',
  recorded_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, keyword, recorded_at, search_engine)
);

-- ============================================
-- 3. SEO TASKS - AI-generated and manual tasks
-- ============================================
CREATE TABLE IF NOT EXISTS seo_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL DEFAULT 'pwd',
  task_type TEXT NOT NULL, -- content, technical, backlink, local, optimization
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium', -- critical, high, medium, low
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, skipped
  due_date DATE,
  related_keyword TEXT,
  related_url TEXT,
  ai_generated BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. SEO MEMORY - Long-term context and decisions
-- ============================================
CREATE TABLE IF NOT EXISTS seo_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL DEFAULT 'pwd',
  memory_type TEXT NOT NULL, -- decision, insight, competitor, strategy, performance
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  importance TEXT DEFAULT 'normal', -- critical, high, normal, low
  tags TEXT[], -- For searchability
  expires_at DATE, -- Some memories should expire
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. CONTENT OPPORTUNITIES - Suggested articles
-- ============================================
CREATE TABLE IF NOT EXISTS seo_content_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL DEFAULT 'pwd',
  keyword TEXT NOT NULL,
  suggested_title TEXT,
  search_volume INT,
  difficulty INT,
  opportunity_score INT, -- Calculated: high volume + low difficulty = high score
  content_type TEXT, -- blog, landing_page, guide, comparison
  competitor_urls TEXT[], -- Who's ranking for this
  status TEXT DEFAULT 'suggested', -- suggested, approved, writing, published, rejected
  assigned_to TEXT,
  published_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. COMPETITOR TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS seo_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL DEFAULT 'pwd',
  competitor_url TEXT NOT NULL,
  competitor_name TEXT,
  domain_authority INT,
  monthly_traffic INT,
  keywords_count INT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  last_analyzed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, competitor_url)
);

-- ============================================
-- 7. GMB (Google My Business) TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS seo_gmb_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL DEFAULT 'pwd',
  business_name TEXT NOT NULL,
  place_id TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  category TEXT,
  rating DECIMAL(2,1),
  review_count INT,
  is_verified BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. SEO SETTINGS & API KEYS
-- ============================================
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL DEFAULT 'pwd',
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, setting_key)
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_seo_keywords_site ON seo_target_keywords(site_id);
CREATE INDEX IF NOT EXISTS idx_seo_rankings_site_date ON seo_rankings_history(site_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_seo_tasks_site_status ON seo_tasks(site_id, status);
CREATE INDEX IF NOT EXISTS idx_seo_memory_site_type ON seo_memory(site_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_seo_opportunities_site ON seo_content_opportunities(site_id, status);

-- ============================================
-- INITIAL DATA - Default SEO Tasks
-- ============================================
INSERT INTO seo_tasks (site_id, task_type, title, description, priority, ai_generated) VALUES
('pwd', 'technical', 'Verify Google Search Console', 'Ensure Search Console is properly connected and verified', 'high', true),
('pwd', 'technical', 'Submit XML Sitemap', 'Submit sitemap.xml to Google Search Console', 'high', true),
('pwd', 'content', 'Optimize Homepage Meta Tags', 'Review and optimize homepage title and description', 'high', true),
('pwd', 'local', 'Claim Google My Business', 'Set up and verify Google My Business listing', 'high', true),
('pwd', 'content', 'Create Cornerstone Content', 'Write comprehensive guides for main service areas', 'medium', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS for calculated fields
-- ============================================
CREATE OR REPLACE FUNCTION calculate_opportunity_score(volume INT, difficulty INT)
RETURNS INT AS $$
BEGIN
  -- Higher volume + lower difficulty = higher score
  -- Max score is 100
  IF volume IS NULL OR difficulty IS NULL THEN
    RETURN 50;
  END IF;
  RETURN LEAST(100, GREATEST(0, 
    (LEAST(volume, 10000)::FLOAT / 100) + (100 - difficulty)
  )::INT);
END;
$$ LANGUAGE plpgsql;
