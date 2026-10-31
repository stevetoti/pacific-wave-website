/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  // Preserve Next16.3.5's HTML-limited bot list and include additional share crawlers.
  htmlLimitedBots: /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|TelegramBot|Pinterestbot|Facebot|Viber/i,
  async headers() {
    return [{ source: '/zoom-classroom/:path*', headers: [
      { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Cache-Control', value: 'no-store' },
    ] }];
  },
  outputFileTracingIncludes: {
    "/api/lms-workbook": ["./resources/*-workbook.pdf", "./resources/workbook-font.ttf", "./public/images/training/pwd-logo.png"],
    "/api/lms-workshop-resources": ["./resources/blp-*.pdf"],
    "/api/lms-coach": ["./public/images/training/pwd-logo.png"],
    "/api/lms-coach/sessions": ["./public/images/training/pwd-logo.png"],
    "/api/cron/training-campaigns": ["./public/images/training/pwd-logo.png"],
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
  },
}

module.exports = nextConfig
