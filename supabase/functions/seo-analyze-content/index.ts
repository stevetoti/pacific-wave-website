// Supabase Edge Function: seo-analyze-content
// Analyzes content and provides SEO score with recommendations

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalysisResult {
  score: number
  recommendations: string[]
  keywordDensity: number
  wordCount: number
  readabilityScore: number
  headingAnalysis: {
    hasH1: boolean
    headingCount: number
  }
  metaAnalysis: {
    titleLength: number
    descriptionLength: number
  }
}

function calculateBasicMetrics(content: string, targetKeyword?: string): Partial<AnalysisResult> {
  // Strip HTML tags for word count
  const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = textOnly.split(' ').filter(w => w.length > 0)
  const wordCount = words.length

  // Calculate keyword density
  let keywordDensity = 0
  if (targetKeyword && wordCount > 0) {
    const keywordRegex = new RegExp(targetKeyword.toLowerCase(), 'gi')
    const matches = textOnly.toLowerCase().match(keywordRegex) || []
    keywordDensity = (matches.length / wordCount) * 100
  }

  // Check for headings
  const h1Matches = content.match(/<h1[^>]*>/gi) || []
  const allHeadings = content.match(/<h[1-6][^>]*>/gi) || []

  return {
    wordCount,
    keywordDensity: Math.round(keywordDensity * 100) / 100,
    headingAnalysis: {
      hasH1: h1Matches.length > 0,
      headingCount: allHeadings.length,
    },
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, targetKeyword, title, description } = await req.json()

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
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

    // Calculate basic metrics first
    const basicMetrics = calculateBasicMetrics(content, targetKeyword)

    const prompt = `You are an SEO expert. Analyze this content and provide a detailed SEO assessment.

Content to analyze:
${content.substring(0, 3000)}

${targetKeyword ? `Target Keyword: ${targetKeyword}` : ''}
${title ? `Current Title: ${title}` : ''}
${description ? `Current Description: ${description}` : ''}

Basic Metrics (already calculated):
- Word Count: ${basicMetrics.wordCount}
- Keyword Density: ${basicMetrics.keywordDensity}%
- Has H1: ${basicMetrics.headingAnalysis?.hasH1}
- Heading Count: ${basicMetrics.headingAnalysis?.headingCount}

Provide:
1. An overall SEO score from 0-100 (be realistic, most content scores 40-80)
2. A readability score from 0-100
3. 5-8 specific, actionable recommendations to improve SEO
4. Consider: keyword usage, content structure, readability, meta tags, internal linking opportunities

Respond in JSON format only:
{
  "score": 65,
  "readabilityScore": 70,
  "recommendations": [
    "Add the target keyword to the first paragraph",
    "Include more subheadings (H2, H3) to improve structure",
    "..."
  ]
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
        max_tokens: 800,
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

    let aiResult
    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found')
      }
    } catch {
      aiResult = { score: 50, readabilityScore: 50, recommendations: ['Unable to analyze content fully'] }
    }

    // Combine AI analysis with basic metrics
    const result: AnalysisResult = {
      score: aiResult.score || 50,
      recommendations: aiResult.recommendations || [],
      keywordDensity: basicMetrics.keywordDensity || 0,
      wordCount: basicMetrics.wordCount || 0,
      readabilityScore: aiResult.readabilityScore || 50,
      headingAnalysis: basicMetrics.headingAnalysis || { hasH1: false, headingCount: 0 },
      metaAnalysis: {
        titleLength: title?.length || 0,
        descriptionLength: description?.length || 0,
      },
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
