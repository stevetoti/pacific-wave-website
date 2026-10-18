import { z } from 'zod';
import { readJson, apiError } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { authorize, ADMIN_ROLES } from '@/lib/server/auth';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/clients';


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface Competitor {
  position: number;
  domain: string;
  url: string;
  title: string;
  description?: string;
}

export async function POST(request: Request) {
  const access = await authorize(request, ADMIN_ROLES);
  if (access.response) return access.response;
  try {
    const { keyword, competitors, searchVolume, difficulty } = await readJson(request, z.object({ keyword: z.string().trim().min(1).max(200), competitors: z.array(z.object({ position: z.number(), domain: z.string().max(500), url: z.string().max(2000), title: z.string().max(500) })).max(10).optional(), searchVolume: z.number().optional(), difficulty: z.number().optional() }));
    await rateLimit(request, 'generate-article', 10);

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    // Generate article using OpenAI
    const topCompetitors = (competitors || []).slice(0, 5);
    const competitorAnalysis = topCompetitors.map((c: Competitor, i: number) => 
      `${i + 1}. ${c.domain} - "${c.title}" (${c.url})`
    ).join('\n');

    const prompt = `You are an expert SEO content writer for Pacific Wave Digital, a digital agency based in Vanuatu specializing in web development, AI solutions, and digital transformation for Pacific Island businesses.

Write a comprehensive, SEO-optimized blog article targeting the keyword: "${keyword}"

CONTEXT:
- Target audience: Businesses in Vanuatu and the Pacific Islands
- Search volume: ${searchVolume || 'Unknown'} monthly searches
- Competition difficulty: ${difficulty || 'Unknown'}/100
- Current top competitors ranking for this keyword:
${competitorAnalysis || 'No competitor data available'}

REQUIREMENTS:
1. Create a compelling, click-worthy title that includes the keyword
2. Write 1500-2000 words of high-quality, informative content
3. Include the keyword naturally 5-8 times throughout the article
4. Structure with clear H2 and H3 headings
5. Include practical tips, examples, and actionable advice
6. Reference Vanuatu/Pacific Islands context where relevant
7. Include a strong call-to-action mentioning Pacific Wave Digital's services
8. Write in a professional but approachable tone
9. Do not invent testimonials, customers, awards, founding or launch dates, user/client/project counts, performance percentages, commercial outcomes, uptime guarantees or product availability. Use such claims only when supporting evidence is explicitly supplied. Otherwise explain the workflow and how results should be measured. Label any hypothetical example clearly; never call it a real case study or success story.
10. Do not promise rankings, sales growth or uninterrupted/round-the-clock service. Do not turn competitor titles, domains or ranking inputs into evidence of business outcomes. Keep the article a draft for human factual review.

OUTPUT FORMAT (return as JSON):
{
  "title": "Your SEO-optimized title here",
  "excerpt": "A compelling 150-character meta description",
  "content": "The full article content in markdown format",
  "tags": ["tag1", "tag2", "tag3"],
  "targetKeyword": "${keyword}"
}

Return ONLY valid JSON, no additional text.`;

    if (!OPENAI_API_KEY) return NextResponse.json({ error: 'AI generation is not configured; no draft created' }, { status: 503 });

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an SEO content writer. Use only supported factual claims. Never invent customer endorsements, measured outcomes or company history. Clearly label hypothetical examples. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({ error: 'AI generation failed', details: errorData }, { status: 500 });
    }

    const aiData = await openaiResponse.json();
    const aiContent = aiData.choices[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json({ error: 'No content generated' }, { status: 500 });
    }

    // Parse AI response
    let articleData;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      articleData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      return NextResponse.json({ error: 'Failed to parse AI response', raw: aiContent }, { status: 500 });
    }

    // Create blog post draft
    const slug = articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    const { data: post, error: insertError } = await getSupabaseAdmin()
      .from('blog_posts')
      .insert({
        site_id: 'pwd',
        title: articleData.title,
        slug: slug + '-' + Date.now(),
        excerpt: articleData.excerpt,
        content: articleData.content,
        published: false,
        focus_keyword: keyword,
        keywords: articleData.tags || [],
        category: 'SEO Content',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create blog post:', insertError);
      return NextResponse.json({ error: 'Failed to create blog post', details: insertError }, { status: 500 });
    }

    // Update content opportunity status
    await getSupabaseAdmin()
      .from('seo_content_opportunities')
      .update({ status: 'writing' })
      .eq('keyword', keyword)
      .eq('site_id', 'pwd');

    return NextResponse.json({
      success: true,
      message: 'Article generated successfully',
      post: post,
      redirectUrl: `/admin/blog/edit/${post.id}`,
    });

  } catch (error) { return apiError(error, '/api/seo/generate-article'); }
}
