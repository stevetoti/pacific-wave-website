// Supabase Edge Function: seo-keyword-research
// Generates keyword suggestions with search intent analysis

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KeywordSuggestion {
  keyword: string
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial'
  difficulty: 'low' | 'medium' | 'high'
  relevance: 'high' | 'medium' | 'low'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, industry, location } = await req.json()

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `You are an SEO keyword research expert. Generate keyword suggestions for the following topic.

Topic: ${topic}
${industry ? `Industry: ${industry}` : ''}
${location ? `Target Location: ${location}` : ''}

Generate 12-15 keyword suggestions. For each keyword include:
1. The keyword phrase (2-5 words typically work best)
2. Search intent: informational (learning), navigational (finding), transactional (buying), or commercial (comparing/researching to buy)
3. Estimated difficulty: low (easy to rank), medium, or high (very competitive)
4. Relevance to the topic: high, medium, or low

Include a mix of:
- Short-tail keywords (1-2 words, higher volume)
- Long-tail keywords (3-5 words, more specific)
- Question-based keywords ("how to...", "what is...")
- Local keywords if location is specified

Respond in JSON format only:
{
  "keywords": [
    {
      "keyword": "ai business automation",
      "intent": "commercial",
      "difficulty": "medium",
      "relevance": "high"
    },
    ...
  ],
  "primaryKeyword": "the best primary target keyword",
  "secondaryKeywords": ["keyword2", "keyword3"]
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    const textContent = data.content[0]?.text || ''

    let result
    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found')
      }
    } catch {
      result = { 
        keywords: [{ keyword: topic, intent: 'informational', difficulty: 'medium', relevance: 'high' }],
        primaryKeyword: topic,
        secondaryKeywords: []
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
