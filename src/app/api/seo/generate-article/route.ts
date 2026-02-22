import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface Competitor {
  position: number;
  domain: string;
  url: string;
  title: string;
  description?: string;
}

export async function POST(request: Request) {
  try {
    const { keyword, competitors, searchVolume, difficulty } = await request.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    // Generate article using OpenAI
    const topCompetitors = (competitors || []).slice(0, 5);
    const competitorAnalysis = topCompetitors.map((c: Competitor, i: number) => 
      `${i + 1}. ${c.domain} - "${c.title}" (${c.url})`
    ).join('\n');

    const prompt = `You are an expert SEO content writer for Pacific Wave Digital, a leading digital agency in Vanuatu specializing in web development, AI solutions, and digital transformation for Pacific Island businesses.

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

OUTPUT FORMAT (return as JSON):
{
  "title": "Your SEO-optimized title here",
  "excerpt": "A compelling 150-character meta description",
  "content": "The full article content in markdown format",
  "tags": ["tag1", "tag2", "tag3"],
  "targetKeyword": "${keyword}"
}

Return ONLY valid JSON, no additional text.`;

    if (!OPENAI_API_KEY) {
      // Fallback: Create a template article if no OpenAI key
      const title = `Complete Guide to ${keyword.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} in Vanuatu`;
      const fallbackContent = {
        title,
        excerpt: `Discover everything you need to know about ${keyword} in Vanuatu. Expert insights from Pacific Wave Digital.`,
        content: `# ${title}

## Introduction

If you're looking for expert ${keyword} services in Vanuatu, you've come to the right place. Pacific Wave Digital specializes in delivering top-tier digital solutions for businesses across the Pacific Islands.

## Why ${keyword.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Matters

In today's digital landscape, ${keyword} has become essential for businesses looking to grow and compete effectively.

## Our Approach

At Pacific Wave Digital, we take a comprehensive approach to ${keyword}, combining:

- **Local Expertise**: Deep understanding of the Vanuatu market
- **Global Standards**: International best practices adapted for Pacific businesses
- **AI-Powered Solutions**: Cutting-edge technology to drive results

## Key Benefits

1. **Increased Visibility**: Stand out in local and regional searches
2. **Better User Experience**: Modern, responsive designs
3. **Measurable Results**: Track your ROI with detailed analytics

## Top Competitors Analysis

Our research shows these are the current leaders for "${keyword}" in Vanuatu:

${topCompetitors.map((c: Competitor, i: number) => `${i + 1}. **${c.domain}** - ${c.title}`).join('\n')}

## How Pacific Wave Digital Can Help

Ready to outrank your competition? Pacific Wave Digital offers:

- Professional web development
- SEO optimization
- AI-powered automation
- Digital marketing strategies

## Conclusion

Don't let your competition dominate the search results. Contact Pacific Wave Digital today to discuss how we can help your business succeed with ${keyword}.

---

*Pacific Wave Digital - Digital Innovation for the Pacific*`,
        tags: [keyword.split(' ')[0], 'Vanuatu', 'Pacific Wave Digital'],
        targetKeyword: keyword
      };

      // Create blog post draft
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      
      const { data: post, error: insertError } = await supabase
        .from('blog_posts')
        .insert({
          site_id: 'pwd',
          title: fallbackContent.title,
          slug: slug + '-' + Date.now(),
          excerpt: fallbackContent.excerpt,
          content: fallbackContent.content,
          published: false,
          keywords: fallbackContent.tags,
          category: 'SEO Content',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Failed to create blog post:', insertError);
        return NextResponse.json({ error: 'Failed to create blog post', details: insertError }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Article draft created (template)',
        post: post,
        redirectUrl: `/admin/blog/edit/${post.id}`,
      });
    }

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
          { role: 'system', content: 'You are an expert SEO content writer. Always respond with valid JSON only.' },
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
    
    const { data: post, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        site_id: 'pwd',
        title: articleData.title,
        slug: slug + '-' + Date.now(),
        excerpt: articleData.excerpt,
        content: articleData.content,
        published: false,
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
    await supabase
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

  } catch (error) {
    console.error('Article generation error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
