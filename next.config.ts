import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-1f13386e-1e81-484d-b465-3c1f2ccf1bc6.space-z.ai",
    ".space-z.ai",
    ".chatglm.site",
  ],
};

export default nextConfig;
