import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config for Next.js 16
  turbopack: {},
  // Webpack fallback if built with --webpack flag
  // pdfjs-dist worker: in production (webpack), resolve the worker from node_modules.
  // In dev (Turbopack), the component uses /pdf.worker.min.mjs from public/ instead.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "pdfjs-dist/build/pdf.worker.min.mjs":
        require.resolve("pdfjs-dist/build/pdf.worker.min.mjs"),
    };
    return config;
  },
};

export default nextConfig;
