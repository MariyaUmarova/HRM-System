import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Recruit UI reads approved wording directly from the read-only standalone
  // HTML reference. Keep the source available in Vercel/server output tracing.
  outputFileTracingIncludes: {
    "/*": ["./docs/references/v7_4/ivideon-recruit-standalone-v7_4.html"],
  },
};

export default nextConfig;
