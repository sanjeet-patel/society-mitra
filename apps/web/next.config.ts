import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@society-mitra/shared", "threejs-components"],
  turbopack: {
    root: "../..",
  },
};

export default nextConfig;
