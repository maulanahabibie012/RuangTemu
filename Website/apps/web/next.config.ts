import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Avoid picking up parent lockfiles outside this app
    root: path.join(__dirname),
  },
};

export default nextConfig;
