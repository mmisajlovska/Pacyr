import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "maplibre-gl": "maplibre-gl/dist/maplibre-gl.js",
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "maplibre-gl": "maplibre-gl/dist/maplibre-gl.js"
    }
  }
};

export default nextConfig;
