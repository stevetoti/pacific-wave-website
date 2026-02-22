# HelpWidget API Documentation

The HelpWidget is an embeddable help center component that provides:
- RAG-powered article search
- AI-powered chat assistant
- Contextual help tooltips

## Installation

The component is available within the Pacific Wave Digital admin system. To use it in your pages:

```tsx
import { HelpWidget } from '@/components/help';
```

## Basic Usage

```tsx
<HelpWidget />
```

This renders a floating help button in the bottom-right corner.

## Configuration Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `siteId` | `string` | `'pwd'` | Site identifier for multi-tenant help content |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Widget position on screen |
| `primaryColor` | `string` | `'#233C6F'` | Primary brand color (button, header bg) |
| `accentColor` | `string` | `'#EF5E33'` | Accent color (send button, badges) |
| `baseUrl` | `string` | `''` | API base URL (for cross-origin embedding) |
| `defaultCategory` | `string` | `undefined` | Filter articles to a specific category |
| `allowAskAI` | `boolean` | `true` | Enable/disable AI chat tab |
| `showSearch` | `boolean` | `true` | Enable/disable search input |
| `title` | `string` | `'Help Center'` | Widget header title |
| `subtitle` | `string` | `'How can we help you?'` | Widget header subtitle |
| `className` | `string` | `''` | Additional CSS classes |

## Examples

### Custom Branding

```tsx
<HelpWidget
  primaryColor="#1a1a2e"
  accentColor="#16c79a"
  title="Support"
  subtitle="We're here to help!"
/>
```

### Category-Specific Help

```tsx
<HelpWidget
  defaultCategory="seo-hub"
  title="SEO Hub Help"
/>
```

### Search-Only (No AI Chat)

```tsx
<HelpWidget
  allowAskAI={false}
  title="Documentation"
/>
```

### Cross-Origin Embedding

```tsx
<HelpWidget
  baseUrl="https://pacificwavedigital.com"
  siteId="client-site-id"
/>
```

### Different Positions

```tsx
// Bottom-left
<HelpWidget position="bottom-left" />

// Top-right
<HelpWidget position="top-right" />
```

## API Endpoints

The widget uses these API endpoints:

### GET `/api/help/articles`
Fetches articles list.

Query params:
- `siteId` - Site identifier
- `category` - Filter by category
- `limit` - Max results

### POST `/api/help/search`
RAG-powered search.

Body:
```json
{
  "query": "how to track keywords",
  "siteId": "pwd",
  "useRAG": true
}
```

### POST `/api/help/ask-ai`
AI chat endpoint.

Body:
```json
{
  "question": "How do I improve my citability score?",
  "siteId": "pwd"
}
```

## HelpTooltip Component

For inline contextual help icons:

```tsx
import { HelpTooltip } from '@/components/help';

<h2>
  Citability Score
  <HelpTooltip feature="citability" position="right" />
</h2>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `feature` | `string` | required | Feature identifier (e.g., 'citability', 'llms-txt') |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Tooltip position |
| `size` | `'sm' \| 'md'` | `'sm'` | Icon size |

### Available Features

The following feature identifiers have pre-configured help content:

- `citability` - AI Citability Analyzer
- `brand-authority` - Brand Authority tracking
- `llms-txt` - llms.txt file generation
- `ai-platforms` - AI platform overview
- `chatgpt` - ChatGPT optimization
- `perplexity` - Perplexity optimization
- `google-ai` - Google AI Overview optimization
- `gemini` - Google Gemini optimization
- `seo-hub` - SEO Hub features
- `keywords` - Keyword tracking
- `content-opportunities` - Content gap analysis

## Styling

The widget uses CSS custom properties for theming:

```css
:root {
  --help-primary: #233C6F;
  --help-accent: #EF5E33;
}
```

Override via props or CSS variables.

## Multi-Tenant Setup

For white-label deployments, create articles with a different `site_id`:

```sql
INSERT INTO help_articles (site_id, title, slug, content, category)
VALUES ('client-site', 'Getting Started', 'getting-started', '...', 'basics');
```

Then use:

```tsx
<HelpWidget siteId="client-site" />
```

---

*Generated: February 2026*
*Version: 1.0.0*
