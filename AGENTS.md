# AGENTS.md — Pacific Wave Digital Website

## Project Overview

| Field | Value |
|-------|-------|
| **Name** | Pacific Wave Website |
| **Purpose** | Corporate website for Pacific Wave Digital |
| **Company** | Pacific Wave Digital |
| **Status** | Production |
| **Location** | Yumiwork Nambatu, Port Vila, Vanuatu |

## Tech Stack

- **Framework:** Next.js 14 + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (CMS, Help system)
- **Rich Text:** Tiptap editor
- **Animation:** Framer Motion
- **AI:** OpenAI (help/embeddings)
- **Icons:** Lucide React
- **Markdown:** react-markdown + rehype-raw
- **Hosting:** Vercel

## Supabase

- **Project Ref:** `xnlawqlvzzdybivdjgxi` (PWD shared Supabase)
- **Access Token:** `$PWD_SUPABASE_ACCESS_TOKEN`

## Deployment

- **Platform:** Vercel
- **Deploy Token:** `$VERCEL_TOKEN`
- **Deploy:** Push to `main` auto-deploys

## Key Directories

```
src/
├── app/            # Next.js App Router pages
├── components/     # React components
├── lib/            # Utilities
└── styles/         # CSS

supabase/
├── functions/      # Edge Functions
└── migrations/     # Database migrations

scripts/            # Utility scripts
docs/               # Documentation

public/             # Static assets
```

## Key Features

- Corporate homepage
- Services showcase (AI solutions, web development, etc.)
- About/Team pages
- Portfolio/Case studies
- Contact forms
- Blog with CMS
- **AI-Powered Help System** (OpenAI embeddings)
- Responsive design
- Animated sections

## Help System

AI-powered help center using:
- OpenAI embeddings for semantic search
- Supabase vector storage
- Auto-generated help articles

### Related Scripts
| Script | Purpose |
|--------|---------|
| `generate-embeddings.mjs` | Generate OpenAI embeddings |
| `seed-help-articles.mjs` | Seed help content |
| `run-help-migration.mjs` | Run help system migrations |

## Key Files

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js configuration |
| `tailwind.config.js` | Tailwind theme |
| `.env.vercel` | Vercel environment template |

## Brand Colors

- **Deep Blue:** #233C6F
- **Vibrant Orange:** #EF5E33

## Special Instructions

1. **Logo Usage:** Always use logo files, not text-only
2. **Brand Colors:** Deep Blue #233C6F + Vibrant Orange #EF5E33
3. **Help System:** Update embeddings when adding new help articles
4. **SEO:** Optimize meta tags for Vanuatu/Pacific market
5. **Performance:** Use Next.js Image, lazy loading

---

*Last updated: March 2026*
