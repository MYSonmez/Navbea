import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Keep browser/CDN assets tied to the exact Vercel release. This prevents
  // client-side navigation from mixing a previous deployment's CSS with the
  // current deployment's React payload.
  deploymentId: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12),
};

export default nextConfig;
