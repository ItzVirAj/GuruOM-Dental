import type { NextConfig } from "next";
import { ALLOWED_IMAGE_HOSTS } from "./src/security/constants";

const nextConfig: NextConfig = {
  /* Performance & Caching */
  cacheComponents: true,
  partialPrefetching: true,

  /* Production Hardening */
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  /* Server Actions Origin Restriction */
  experimental: {
    serverActions: {
      allowedOrigins: [
        "guruomdental.com",
        "*.guruomdental.com",
        "localhost:3000",
        "127.0.0.1:3000",
      ],
    },
  },

  /* Restricted Remote Image Domains & Fixed Device Width Allowlist */
  images: {
    deviceSizes: [640, 960, 1280, 1920, 2400],
    imageSizes: [320],
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((origin) => {
      const url = new URL(origin);
      const pathname =
        url.pathname && url.pathname !== "/"
          ? `${url.pathname.replace(/\/$/, "")}/**`
          : "/**";
      return {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        pathname,
      };
    }),
  },

  /* Bundler Settings */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
