import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  // Power Apps Code Apps hosts the compiled frontend as static assets.
  // Relative asset paths keep the Next.js chunks portable inside the player.
  assetPrefix: process.env.NODE_ENV === "production" ? "." : undefined,
};

export default nextConfig;
