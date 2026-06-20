import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@society-mitra/shared"],
  turbopack: {
    root: "../..",
  },
};

export default nextConfig;
