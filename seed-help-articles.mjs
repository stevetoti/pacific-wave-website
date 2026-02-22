import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rndegttgwtpkbjtvjgnc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZGVndHRnd3Rwa2JqdHZqZ25jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzMjEyMCwiZXhwIjoyMDg0MDA4MTIwfQ.a4o3lg5Qz64n38eI9xBPfx__cTUugiigLrfKBc5K_lM';

const supabase = createClient(supabaseUrl, supabaseKey);

const articles = [
  // Getting Started
  {
    category: 'getting-started',
    title: 'Welcome to Pacific Wave Digital Admin',
    slug: 'welcome-to-pacific-wave-digital-admin',
    content: `# Welcome to Pacific Wave Digital Admin

Welcome to your all-in-one admin panel for managing your digital presence. This platform gives you powerful tools to control every aspect of your website and online marketing.

## What You Can Do Here

### Content Management
- **Blog Posts**: Create, edit, and publish blog content with our rich text editor
- **Media Library**: Upload and manage images, videos, and documents
- **SEO Settings**: Configure meta tags and optimization for each page

### SEO & Analytics
- **SEO Hub**: Track keyword rankings and discover content opportunities
- **Analytics**: View website traffic and user behavior
- **GEO (AI Optimization)**: Optimize your content for AI search engines

### Settings & Users
- **User Management**: Add team members and manage permissions
- **Site Settings**: Configure your website's branding and contact info

## Getting Started

1. **Explore the Dashboard**: Get an overview of your site's performance
2. **Check SEO Hub**: See how you're ranking for target keywords
3. **Review Blog Posts**: Ensure your content is up to date
4. **Configure Settings**: Make sure your branding is correct

Need help? Check out our other guides or contact support at hello@pacificwavedigital.com.`,
    tags: ['getting-started', 'overview', 'introduction'],
    related_feature: 'dashboard',
  },
  {
    category: 'getting-started',
    title: 'Understanding Your Dashboard',
    slug: 'understanding-your-dashboard',
    content: `# Understanding Your Dashboard

The Dashboard is your command center for monitoring your website's performance at a glance.

## Key Metrics

### Traffic Overview
- **Total Visitors**: Unique visitors to your site
- **Page Views**: Total pages viewed across all sessions
- **Bounce Rate**: Percentage of single-page visits
- **Avg. Session Duration**: How long visitors stay

### Content Stats
- **Published Posts**: Number of live blog posts
- **Draft Posts**: Posts waiting to be published
- **Total Media**: Files in your media library

### SEO Performance
- **Ranking Keywords**: Keywords you're appearing for in search
- **Top Position**: Your best ranking position
- **Content Opportunities**: Keywords you could target

## Quick Actions

From the dashboard, you can quickly:
- Create a new blog post
- Check latest analytics
- View recent submissions
- Access SEO Hub

## Tips

- Check your dashboard daily to stay informed
- Monitor bounce rate to identify content issues
- Watch for drops in traffic that might indicate problems`,
    tags: ['dashboard', 'metrics', 'analytics'],
    related_feature: 'dashboard',
  },
  {
    category: 'getting-started',
    title: 'First Steps After Login',
    slug: 'first-steps-after-login',
    content: `# First Steps After Login

Just logged in for the first time? Here's a quick guide to get you up and running.

## Step 1: Review Your Profile

Click on your profile in the sidebar to:
- Update your name and avatar
- Check your role and permissions
- View your last login time

## Step 2: Explore the Navigation

The sidebar contains all main sections:
- 📊 Dashboard - Overview of your site
- 📝 Blog Posts - Content management
- 🎯 SEO Hub - Keyword tracking and optimization
- 🖼️ Media Library - File management
- ⚙️ Settings - Site configuration

## Step 3: Check Site Settings

Go to Settings to verify:
- Site name and tagline
- Contact information
- Social media links
- Footer content

## Step 4: Set Up SEO Tracking

In SEO Hub:
1. Add your target keywords
2. Run a ranking check
3. Identify content opportunities

## Step 5: Create Your First Post

Ready to publish? Go to Blog Posts and:
1. Click "Create Post"
2. Write your content
3. Add images and formatting
4. Set SEO meta tags
5. Publish or save as draft

## Need Help?

- Use the Help Center (❓) for guides
- Ask AI for quick answers
- Contact support for complex issues`,
    tags: ['getting-started', 'tutorial', 'onboarding'],
    related_feature: null,
  },

  // SEO Hub
  {
    category: 'seo-hub',
    title: 'What is the SEO Hub?',
    slug: 'what-is-the-seo-hub',
    content: `# What is the SEO Hub?

The SEO Hub is your command center for search engine optimization. It combines keyword tracking, competitor analysis, and AI optimization tools in one place.

## Features Overview

### Keyword Tracking
- Add and monitor target keywords
- Track ranking positions over time
- Get search volume and difficulty data
- See competitor analysis for each keyword

### Content Opportunities
- AI-identified keyword gaps
- Suggested topics to write about
- Opportunity scoring based on volume and difficulty

### GEO (AI Optimization)
- **Citability Analyzer**: Check if AI can quote your content
- **Brand Authority**: Track where you're mentioned online
- **llms.txt**: Generate AI assistant files
- **AI Platforms**: Optimize for specific AI engines

### SEO Memory
- Automatic logging of ranking changes
- Research history and insights
- AI-generated recommendations

## Getting Started

1. Go to SEO Hub from the sidebar
2. Add your target keywords
3. Click "Check Rankings" to see positions
4. Review opportunities tab for content ideas
5. Use Citability Analyzer on your content

## Best Practices

- Track 10-20 focus keywords
- Check rankings weekly
- Act on content opportunities
- Monitor citability scores above 70`,
    tags: ['seo', 'keywords', 'rankings', 'optimization'],
    related_feature: 'seo-hub',
  },
  {
    category: 'seo-hub',
    title: 'How to Track Keywords',
    slug: 'how-to-track-keywords',
    content: `# How to Track Keywords

Keyword tracking helps you monitor where your website appears in search results for specific terms.

## Adding Keywords

1. Go to **SEO Hub** > **Keywords** tab
2. Click **+ Add Keyword**
3. Enter your target keyword
4. Click **Add**

The keyword will be added with "tracking" status.

## Getting Keyword Data

After adding a keyword:
1. Click **🔍 Research** next to the keyword
2. The system will fetch:
   - Monthly search volume
   - Keyword difficulty score
   - CPC (cost per click) data

## Checking Rankings

To see where you rank:
1. Click **Check Rankings** button
2. Wait for the system to check all keywords
3. View your position for each keyword

### Understanding Results
- **Green position**: You're ranking (great!)
- **"Not in top 100"**: You're not ranking yet
- **Competitors**: Sites ranking instead of you

## Generating Content

When you're not ranking for a keyword:
1. Click **✍️ Write Article** button
2. AI will analyze top competitors
3. A draft article will be created
4. Edit and publish to start ranking

## Tips

- Focus on keywords with difficulty under 40
- Target keywords with decent search volume (100+)
- Create dedicated pages for each keyword
- Update rankings weekly to track progress`,
    tags: ['keywords', 'tracking', 'seo', 'rankings'],
    related_feature: 'keywords',
  },
  {
    category: 'seo-hub',
    title: 'Checking Your Rankings',
    slug: 'checking-your-rankings',
    content: `# Checking Your Rankings

Understanding where you rank in search results is crucial for SEO success.

## How to Check Rankings

1. Navigate to **SEO Hub**
2. Go to the **Keywords** tab
3. Click **Check Rankings** at the top
4. Wait for the scan to complete (about 30 seconds per keyword)

## Understanding Position Data

### Ranking Positions
- **Position 1-3**: Excellent! Top of page 1
- **Position 4-10**: Good, still page 1
- **Position 11-20**: Page 2, needs improvement
- **Position 21+**: Low visibility, content refresh needed
- **Not in top 100**: Not ranking, new content needed

### Competitor Analysis
For each keyword, you'll see:
- Top 10 ranking domains
- Their page titles
- Their URLs

This helps you understand what content is working.

## Ranking History

The system automatically saves:
- Previous positions
- Position changes over time
- Competitor snapshots

## Improving Rankings

If you're not ranking well:
1. Check the competitor content
2. Create better, more comprehensive content
3. Use the **Write Article** feature for AI assistance
4. Ensure proper on-page SEO

## Frequency

We recommend checking rankings:
- Weekly for active campaigns
- Monthly for maintenance
- After publishing new content`,
    tags: ['rankings', 'positions', 'serp', 'competitors'],
    related_feature: 'rankings',
  },
  {
    category: 'seo-hub',
    title: 'Finding Content Opportunities',
    slug: 'finding-content-opportunities',
    content: `# Finding Content Opportunities

Content opportunities are keywords and topics where you have potential to rank but haven't created content yet.

## Accessing Opportunities

1. Go to **SEO Hub**
2. Click the **Opportunities** tab
3. View AI-suggested keywords

## How Opportunities Are Found

The system analyzes:
- Keywords related to your tracked terms
- Search volume and difficulty
- Competition gaps
- Your existing content

## Opportunity Scoring

Each opportunity has a score (0-100) based on:
- **Search Volume**: Higher volume = higher score
- **Difficulty**: Lower difficulty = higher score
- **Relevance**: How related to your business

Focus on opportunities scoring 60+ for best results.

## Taking Action

For each opportunity, you can:
1. **Add to Keywords**: Start tracking it
2. **Create Content**: Write a dedicated article
3. **Dismiss**: Remove from suggestions

## Content Creation Tips

When creating content for an opportunity:
- Target the exact keyword in your title
- Create comprehensive, 1500+ word content
- Include related subtopics
- Add images and formatting
- Optimize meta description

## Research Mode

Enter a seed keyword in the research box to:
- Find related keyword suggestions
- Discover new topic clusters
- Identify gaps in your content strategy`,
    tags: ['opportunities', 'content', 'keywords', 'strategy'],
    related_feature: 'opportunities',
  },

  // GEO (AI Search Optimization)
  {
    category: 'geo',
    title: 'What is GEO?',
    slug: 'what-is-geo',
    content: `# What is GEO?

GEO stands for **Generative Engine Optimization** - the practice of optimizing your content to appear in AI-generated answers from systems like ChatGPT, Perplexity, and Google AI Overview.

## Why GEO Matters

Traditional SEO focuses on ranking in Google's "10 blue links." But increasingly, users are getting answers directly from AI assistants. If your content isn't optimized for AI, you're missing out on a growing traffic source.

## Key Concepts

### Citability
How likely AI systems are to quote your content. Measured by:
- Clarity of statements
- Presence of facts and data
- Paragraph structure
- Quotability of phrases

### Brand Authority
How often your brand is mentioned across the web. More mentions = higher trust in AI systems.

### AI-Friendly Content
- Clear, factual statements
- Specific numbers and statistics
- Q&A format sections
- Proper citations

## GEO Tools in SEO Hub

1. **Citability Analyzer**: Score your content's AI-friendliness
2. **Brand Authority**: Track brand mentions
3. **llms.txt**: Create AI assistant guidance files
4. **AI Platforms**: Target-specific optimization tips

## Getting Started with GEO

1. Analyze your top content with Citability Analyzer
2. Identify areas scoring below 70
3. Rewrite using AI-friendly techniques
4. Track brand mentions for authority building
5. Generate and deploy llms.txt

## The Future

As AI search grows, GEO will become as important as traditional SEO. Start optimizing now to stay ahead.`,
    tags: ['geo', 'ai', 'optimization', 'citability'],
    related_feature: 'geo',
  },
  {
    category: 'geo',
    title: 'AI Citability Analyzer Guide',
    slug: 'ai-citability-analyzer-guide',
    content: `# AI Citability Analyzer Guide

The Citability Analyzer helps you understand how likely AI systems are to quote your content in their responses.

## What is Citability?

Citability measures how "quotable" your content is. AI systems prefer content that:
- Makes clear, definitive statements
- Contains specific facts and numbers
- Is well-structured and scannable
- Answers questions directly

## Using the Analyzer

1. Go to **SEO Hub** > **Citability** tab
2. Enter or paste your content
3. Add a title for tracking
4. Click **Analyze**

## Understanding Your Score

### Overall Score (0-100)
- **80-100**: Excellent - highly citable
- **60-79**: Good - some improvements needed
- **40-59**: Fair - significant work required
- **0-39**: Poor - major rewrite needed

### Paragraph Analysis
Each paragraph is scored individually:
- Word count (optimal: 134-167 words)
- Presence of numbers/statistics
- Definitiveness of statements
- Clarity of language

### Common Issues
- "Too short" - expand with more details
- "Too long" - break into smaller chunks
- "No statistics" - add specific data
- "Vague qualifiers" - remove "very," "really," etc.

## Improving Citability

### Add Specific Data
❌ "Many businesses see good results"
✅ "78% of businesses report a 2.5x increase in leads"

### Make Definitive Statements
❌ "SEO can sometimes help"
✅ "SEO improves organic traffic by an average of 40%"

### Optimal Paragraph Length
Aim for 134-167 words per paragraph - the sweet spot for AI quoting.

### Add Q&A Sections
Question-answer format is highly citable:
**What is citability?**
Citability measures how likely AI systems are to quote your content...

## Save and Track

All analyses are saved automatically. Review past analyses to track improvement over time.`,
    tags: ['citability', 'ai', 'content', 'optimization'],
    related_feature: 'citability',
  },
  {
    category: 'geo',
    title: 'Understanding Brand Authority',
    slug: 'understanding-brand-authority',
    content: `# Understanding Brand Authority

Brand Authority measures how your brand is perceived across the web, particularly by AI systems.

## Why Brand Authority Matters

AI systems like ChatGPT and Perplexity learn about brands from mentions across the internet. More quality mentions = higher trust = more AI recommendations.

## Components of Brand Authority

### Mention Volume
How often your brand is mentioned:
- Social media posts
- News articles
- Blog posts
- Forums (Reddit, Quora)
- Wikipedia entries

### Mention Sentiment
The tone of mentions:
- **Positive**: Praise, recommendations
- **Neutral**: Factual references
- **Negative**: Complaints, criticism

### Source Quality
Where you're mentioned matters:
- High authority sites (news, .edu, .gov)
- Industry publications
- Professional forums
- Social proof platforms

## Tracking Brand Mentions

1. Go to **SEO Hub** > **Brand Authority** tab
2. Click **+ Add Mention** to manually track
3. Enter:
   - Platform (Reddit, LinkedIn, etc.)
   - URL (if available)
   - Mention text
   - Sentiment

## Improving Brand Authority

### Create Quotable Content
- Write expert guides
- Publish original research
- Create helpful resources

### Engage on Platforms
- Answer questions on Quora
- Participate in Reddit discussions
- Post thought leadership on LinkedIn

### Earn Media Coverage
- Press releases for news
- Guest posts on industry blogs
- Podcast appearances

### Monitor and Respond
- Track mentions regularly
- Respond to discussions
- Address negative sentiment

## Authority Score

Your score (0-100) is calculated from:
- Number of mentions (+2 per mention)
- Positive mentions (+15 each)
- Neutral mentions (+5 each)
- Capped at 100

Aim for 20+ positive mentions to establish authority.`,
    tags: ['brand', 'authority', 'mentions', 'reputation'],
    related_feature: 'brand-authority',
  },
  {
    category: 'geo',
    title: 'How to Generate llms.txt',
    slug: 'how-to-generate-llms-txt',
    content: `# How to Generate llms.txt

llms.txt is a standardized file that helps AI assistants understand your business accurately.

## What is llms.txt?

Just like robots.txt guides search engine crawlers, llms.txt guides AI language models. It provides:
- Business description
- Key pages and their purpose
- Contact information
- Authoritative information

## Why You Need It

AI assistants often need to understand businesses quickly. llms.txt:
- Ensures accurate representation
- Highlights key services
- Provides correct contact info
- Prevents misinformation

## Generating Your File

1. Go to **SEO Hub** > **llms.txt** tab
2. Fill in your information:
   - Site name
   - Site description
   - Key pages (title, URL, description)
   - Contact email
   - Contact phone

3. Click **Save Configuration**
4. Click **Copy to Clipboard**

## Deploying llms.txt

Once generated, add the file to your website:

### Option 1: Root Directory
Place at: \`https://yoursite.com/llms.txt\`

### Option 2: .well-known Directory
Place at: \`https://yoursite.com/.well-known/llms.txt\`

## Example Format

\`\`\`
# Pacific Wave Digital

> Premium web development and digital marketing agency in Vanuatu

## About
Pacific Wave Digital provides professional web development, 
digital marketing, and technology solutions.

## Key Pages
- [Home](/): Main landing page
- [Services](/services): Our digital services
- [About](/about): About our company
- [Contact](/contact): Get in touch

## Services
- Web Development & Design
- Digital Marketing & SEO
- E-commerce Solutions

## Contact
- Email: hello@pacificwavedigital.com
- Phone: +678 7755 512
\`\`\`

## Best Practices

- Keep descriptions concise but informative
- Include all important pages
- Update when services change
- Use standard markdown format`,
    tags: ['llms-txt', 'ai', 'configuration', 'setup'],
    related_feature: 'llms-txt',
  },
  {
    category: 'geo',
    title: 'AI Platform Targeting Explained',
    slug: 'ai-platform-targeting-explained',
    content: `# AI Platform Targeting Explained

Different AI platforms have different preferences. Understanding these helps you optimize content for each.

## ChatGPT 🤖

### Preferences
- Clear, factual statements
- Specific numbers and dates
- Well-structured content
- FAQ sections

### Tips
1. Use definitive language ("X is" not "X might be")
2. Include statistics with sources
3. Create Q&A formatted content
4. Structure with clear headings

## Perplexity 🔍

### Preferences
- Comprehensive research
- Multiple citations
- Detailed explanations
- Academic-style content

### Tips
1. Cite authoritative sources
2. Use optimal paragraph length (134-167 words)
3. Include multiple perspectives
4. Add relevant links

## Google AI Overview 🌐

### Preferences
- Featured snippet format
- Schema markup
- Direct answers
- Mobile-optimized content

### Tips
1. Target featured snippets
2. Use structured data extensively
3. Match search intent precisely
4. Include tables and lists

## Gemini 💎

### Preferences
- Comprehensive topic coverage
- Clear, unambiguous language
- Visual content descriptions
- Multiple viewpoints

### Tips
1. Cover topics exhaustively
2. Avoid ambiguous phrases
3. Describe images in detail
4. Present balanced views

## Claude 🎭

### Preferences
- Nuanced, thoughtful content
- Acknowledgment of complexity
- Clear logical structure
- Primary sources

### Tips
1. Write with nuance
2. Acknowledge limitations
3. Use logical flow
4. Cite original sources

## Platform Targeting in SEO Hub

1. Go to **SEO Hub** > **AI Platforms** tab
2. Toggle which platforms to target
3. View platform-specific tips
4. Apply recommendations to content

## Multi-Platform Strategy

For best results:
1. Create comprehensive base content
2. Add citations for Perplexity
3. Structure for Google snippets
4. Include Q&A for ChatGPT
5. Maintain nuance for Claude`,
    tags: ['ai-platforms', 'chatgpt', 'perplexity', 'google-ai', 'optimization'],
    related_feature: 'ai-platforms',
  },

  // Blog Management
  {
    category: 'blog-management',
    title: 'Creating Blog Posts',
    slug: 'creating-blog-posts',
    content: `# Creating Blog Posts

Learn how to create and publish engaging blog content.

## Starting a New Post

1. Go to **Blog Posts** in the sidebar
2. Click **Create Post** or **+ New Post**
3. You'll enter the post editor

## The Post Editor

### Title
- Enter a clear, descriptive title
- Keep it under 60 characters for SEO
- Include your target keyword

### Content
Use the rich text editor to:
- Add headings (H2, H3)
- Format text (bold, italic)
- Create lists (bullet, numbered)
- Add links
- Insert images

### Featured Image
- Upload a high-quality image
- Recommended size: 1200x630px
- Use descriptive filenames

### Category
Select the most relevant category for your post.

### Excerpt
Write a short summary (150-300 characters) that appears in post lists.

## SEO Settings

### Meta Title
- Custom title for search results
- Include primary keyword
- Keep under 60 characters

### Meta Description
- Compelling summary for search
- Include call to action
- Keep under 160 characters

### Keywords
- Add relevant keywords
- Use 3-5 keywords per post

## Publishing

### Save as Draft
Click **Save Draft** to save without publishing.

### Publish
Click **Publish** to make the post live. You can also:
- Set a future publish date
- Keep as draft for review

## Best Practices

1. **Plan your content**: Outline before writing
2. **Optimize for SEO**: Use target keywords naturally
3. **Add visuals**: Break up text with images
4. **Format for scanning**: Use headings and lists
5. **Include CTAs**: Guide readers to next steps`,
    tags: ['blog', 'content', 'publishing', 'writing'],
    related_feature: 'blog',
  },
  {
    category: 'blog-management',
    title: 'SEO for Blog Posts',
    slug: 'seo-for-blog-posts',
    content: `# SEO for Blog Posts

Optimize your blog posts to rank higher in search results.

## Keyword Research

Before writing:
1. Identify your target keyword
2. Check search volume in SEO Hub
3. Analyze competition
4. Find related keywords

## On-Page SEO

### Title Optimization
- Include primary keyword at the start
- Keep under 60 characters
- Make it compelling

**Example:**
❌ "Some Tips About SEO"
✅ "SEO Tips: 10 Strategies to Boost Rankings in 2024"

### URL Structure
- Use short, descriptive URLs
- Include primary keyword
- Avoid numbers (they date content)

**Example:**
❌ /blog/post-12345-seo-tips-for-businesses
✅ /blog/seo-tips-businesses

### Headings (H1, H2, H3)
- Use one H1 (your title)
- Include keywords in H2s
- Create logical hierarchy

### Content Optimization
- Use keyword in first paragraph
- Maintain 1-2% keyword density
- Include semantic variations
- Write 1500+ words for competitive terms

### Images
- Use descriptive filenames
- Add alt text with keywords
- Compress for fast loading

## Meta Tags

### Title Tag
Appears in search results:
- 50-60 characters
- Include primary keyword
- Make it clickable

### Meta Description
The snippet below your title:
- 150-160 characters
- Include keyword naturally
- Add call to action

## Internal Linking

- Link to related posts
- Use descriptive anchor text
- Create topic clusters

## Technical SEO

Handled automatically:
- Mobile responsiveness
- Page speed optimization
- Schema markup
- XML sitemap

## Measuring Success

After publishing:
1. Add keyword to SEO Hub
2. Check ranking after 2-4 weeks
3. Monitor traffic in Analytics
4. Update content if needed`,
    tags: ['seo', 'blog', 'optimization', 'keywords'],
    related_feature: 'blog',
  },

  // Account & Settings
  {
    category: 'account-settings',
    title: 'Managing Your Profile',
    slug: 'managing-your-profile',
    content: `# Managing Your Profile

Learn how to update your account settings and preferences.

## Accessing Your Profile

Your profile info appears at the bottom of the sidebar:
- Your name
- Your role (Admin, Editor, etc.)
- Last login time

## Account Information

### Name
Displayed throughout the admin panel.

### Email
Used for login and notifications. Contact a super admin to change.

### Role
Determines your permissions:
- **Super Admin**: Full access
- **Admin**: Most features except user management
- **Editor**: Content creation and media
- **Viewer**: Read-only access

## Changing Your Password

1. Click **Forgot Password** on login screen
2. Enter your email
3. Check inbox for reset link
4. Create a new secure password

### Password Requirements
- Minimum 8 characters
- Mix of letters and numbers
- Avoid common words

## Session Security

Your session will automatically log out after extended inactivity. This keeps your account secure.

### Best Practices
- Log out when using shared computers
- Don't share login credentials
- Use a unique password
- Enable two-factor auth when available

## Getting Help

If you're locked out or need account changes:
1. Contact your site administrator
2. Email hello@pacificwavedigital.com
3. Use the Help Center for guidance`,
    tags: ['account', 'profile', 'settings', 'security'],
    related_feature: 'settings',
  },
  {
    category: 'account-settings',
    title: 'User Roles Explained',
    slug: 'user-roles-explained',
    content: `# User Roles Explained

Understanding different user roles and their permissions.

## Role Hierarchy

### Super Admin 👑
The highest level with full access to:
- All content management
- SEO tools and analytics
- User management
- Site settings
- Billing and subscriptions

**Who should have this:**
Business owners, agency principals

### Admin 🔧
Broad access excluding user management:
- All content features
- SEO Hub and analytics
- Media library
- Site settings

**Who should have this:**
Marketing managers, senior team members

### Editor ✍️
Content-focused access:
- Blog posts (create, edit, publish)
- Media library
- View dashboard

**Who should have this:**
Content writers, marketing assistants

### Viewer 👁️
Read-only access:
- View dashboard
- View published content
- No editing capabilities

**Who should have this:**
Clients reviewing work, stakeholders

## Permission Matrix

| Feature | Super Admin | Admin | Editor | Viewer |
|---------|-------------|-------|--------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Blog Posts | ✅ | ✅ | ✅ | ❌ |
| SEO Hub | ✅ | ✅ | ❌ | ❌ |
| Analytics | ✅ | ✅ | ❌ | ❌ |
| Media | ✅ | ✅ | ✅ | ❌ |
| Users | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ✅ | ❌ | ❌ |

## Managing Users

Only Super Admins can:
1. Go to **User Management**
2. Click **+ Add User**
3. Enter email and select role
4. User receives invite email

### Changing Roles
1. Find user in list
2. Click **Edit**
3. Select new role
4. Save changes

### Deactivating Users
1. Find user in list
2. Toggle **Active** status
3. User loses access immediately

## Best Practices

- Follow principle of least privilege
- Review user access quarterly
- Remove unused accounts promptly
- Document who has what access`,
    tags: ['users', 'roles', 'permissions', 'access'],
    related_feature: 'users',
  },
];

async function seedArticles() {
  console.log('Seeding help articles...\n');
  
  let created = 0;
  let skipped = 0;
  
  for (const article of articles) {
    const { data: existing } = await supabase
      .from('help_articles')
      .select('id')
      .eq('slug', article.slug)
      .eq('site_id', 'pwd')
      .single();
    
    if (existing) {
      console.log(`⏭️  Skipping: ${article.title} (already exists)`);
      skipped++;
      continue;
    }
    
    const { error } = await supabase
      .from('help_articles')
      .insert({
        site_id: 'pwd',
        ...article,
      });
    
    if (error) {
      console.log(`❌ Error creating: ${article.title}`);
      console.log(`   ${error.message}`);
    } else {
      console.log(`✅ Created: ${article.title}`);
      created++;
    }
  }
  
  console.log(`\n✅ Done! Created: ${created}, Skipped: ${skipped}`);
}

seedArticles().catch(console.error);
