import type { NextConfig } from "next";

// next.config.js
const nextConfig = {
  webpackDevMiddleware: (config:any) => {
    config.watchOptions = {
      poll: 1000,        // Check for changes every second
      aggregateTimeout: 300, // Debounce
    };
    return config;
  }
};

export default nextConfig;
