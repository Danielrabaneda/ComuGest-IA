import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pdf-parse', 'tesseract.js', 'pdfjs-dist', '@napi-rs/canvas', 'mupdf'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jcuawejqnjbncaczxmtt.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
};

export default nextConfig;
