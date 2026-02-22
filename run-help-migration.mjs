import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rndegttgwtpkbjtvjgnc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZGVndHRnd3Rwa2JqdHZqZ25jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzMjEyMCwiZXhwIjoyMDg0MDA4MTIwfQ.a4o3lg5Qz64n38eI9xBPfx__cTUugiigLrfKBc5K_lM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Creating help system tables...');
  
  // Create tables using individual inserts/checks since we can't run raw SQL
  // Instead, let's just test if tables exist by trying to select from them
  
  // Test if help_articles exists
  const { error: articlesError } = await supabase.from('help_articles').select('id').limit(1);
  
  if (articlesError && articlesError.message.includes('does not exist')) {
    console.log('Tables do not exist yet. Please run the SQL manually in Supabase Dashboard.');
    console.log('\nSQL to run:');
    console.log('------------');
    const sql = `
-- Help articles with embeddings for RAG search
CREATE TABLE help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL DEFAULT 'pwd',
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  related_feature TEXT,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  helpful_yes INTEGER DEFAULT 0,
  helpful_no INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

-- Help FAQs for quick answers
CREATE TABLE help_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL DEFAULT 'pwd',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Help search analytics
CREATE TABLE help_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL DEFAULT 'pwd',
  query TEXT NOT NULL,
  results_count INTEGER,
  clicked_article_id UUID REFERENCES help_articles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_searches ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all for authenticated" ON help_articles FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON help_faqs FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON help_searches FOR ALL USING (true);
`;
    console.log(sql);
    process.exit(1);
  }
  
  console.log('✅ help_articles table exists');
  
  // Check FAQs
  const { error: faqsError } = await supabase.from('help_faqs').select('id').limit(1);
  if (faqsError && faqsError.message.includes('does not exist')) {
    console.log('❌ help_faqs table missing');
    process.exit(1);
  }
  console.log('✅ help_faqs table exists');
  
  // Check searches
  const { error: searchesError } = await supabase.from('help_searches').select('id').limit(1);
  if (searchesError && searchesError.message.includes('does not exist')) {
    console.log('❌ help_searches table missing');
    process.exit(1);
  }
  console.log('✅ help_searches table exists');
  
  console.log('\n✅ All help system tables are ready!');
}

runMigration().catch(console.error);
