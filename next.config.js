/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  outputFileTracingIncludes: {
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
