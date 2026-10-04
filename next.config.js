/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  async headers() {
    return [{ source: '/zoom-classroom/:path*', headers: [
      { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Cache-Control', value: 'no-store' },
    ] }];
  },
  outputFileTracingIncludes: {
    "/api/lms-workbook": ["./resources/october-workbook.pdf", "./resources/workbook-font.ttf", "./public/images/training/pwd-logo.png"],
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
