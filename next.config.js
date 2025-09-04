/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    GOOGLE_VISION_API_KEY: process.env.GOOGLE_VISION_API_KEY,
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
