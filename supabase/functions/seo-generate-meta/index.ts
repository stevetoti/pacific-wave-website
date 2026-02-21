// Supabase Edge Function: seo-generate-meta
// Generates SEO-optimized meta tags using Claude AI

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, content } = await req.json()

    if (!topic && !content) {
      return new Response(
        JSON.stringify({ error: 'Either topic or content is required' }),
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

    const prompt = `You are an SEO expert. Generate optimized meta tags for a webpage.

${topic ? `Topic: ${topic}` : ''}
${content ? `Content: ${content.substring(0, 2000)}` : ''}

Generate:
1. A compelling meta title (maximum 60 characters, include primary keyword near the start)
2. A meta description (maximum 160 characters, include a call-to-action, be compelling)
3. 5-8 relevant keywords for this content

Respond in JSON format only:
{
  "title": "The meta title here",
  "description": "The meta description here",
  "keywords": ["keyword1", "keyword2", "keyword3", ...]
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
        max_tokens: 500,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'AI service error', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    const textContent = data.content[0]?.text || ''
    
    // Parse JSON from response
    let result
    try {
      // Extract JSON from the response (handle potential markdown code blocks)
      const jsonMatch = textContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Raw:', textContent)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse AI response',
          raw: textContent 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
