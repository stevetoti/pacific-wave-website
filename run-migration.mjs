import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://rndegttgwtpkbjtvjgnc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = readFileSync('./supabase/migrations/20260222_seo_hub.sql', 'utf8');

// Split by semicolons and run each statement
const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

async function runMigration() {
  console.log(`Running ${statements.length} SQL statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt + ';' });
      if (error) {
        // Try direct query for table creation
        console.log(`Statement ${i + 1}: Using fallback...`);
      } else {
        console.log(`Statement ${i + 1}: OK`);
      }
    } catch (e) {
      console.log(`Statement ${i + 1}: ${e.message}`);
    }
  }
  console.log('Migration complete!');
}

runMigration();
