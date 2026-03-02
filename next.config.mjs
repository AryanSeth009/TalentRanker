/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    "canvas",
    "pdf-parse",
    "mammoth",
    "mongodb",
    "jspdf",
    "@langchain/community",
    "@langchain/google-genai",
    "@langchain/core",
  ],
}

export default nextConfig
