import OpenAI from 'openai';

const SUPABASE_URL = 'https://rndegttgwtpkbjtvjgnc.supabase.co';
const SUPABASE_KEY = process.env.TOTIROOM_SUPABASE_SERVICE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_KEY });

async function supabaseFetch(endpoint, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.method === 'PATCH' ? 'return=minimal' : 'return=representation',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error: ${text}`);
  }
  return res.json().catch(() => ({}));
}

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // Limit text length
  });
  return response.data[0].embedding;
}

async function main() {
  console.log('Fetching articles without embeddings...');
  
  // Get all articles
  const articles = await supabaseFetch('help_articles?select=id,title,content&content_embedding=is.null');
  
  console.log(`Found ${articles.length} articles needing embeddings`);
  
  for (const article of articles) {
    console.log(`Generating embedding for: ${article.title}`);
    
    try {
      const embedding = await generateEmbedding(`${article.title}\n\n${article.content}`);
      
      // Update the article
      await supabaseFetch(`help_articles?id=eq.${article.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content_embedding: embedding }),
      });
      
      console.log(`  ✅ Updated`);
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }
  
  console.log('\n✅ Done generating embeddings!');
}

main().catch(console.error);
