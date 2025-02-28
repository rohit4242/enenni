/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["recharts", "lucide-react"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "recharts",
    ],
  },
  // Compress images by default
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  target: "experimental-serverless-trace",
  reactStrictMode: true,

};

export default nextConfig;
