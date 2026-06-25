/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/*': ['./prisma/dev.db', './prisma/schema.prisma'],
    },
  },
}

module.exports = nextConfig
