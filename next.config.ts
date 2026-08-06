import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      {
        source: "/en",
        destination: "/",
        permanent: true,
      },
      {
        source: "/en/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/",
          destination: "/en",
        },
        {
          source: "/:path((?!ko(?:/|$)|en(?:/|$)).+)",
          destination: "/en/:path",
        },
      ],
    };
  },
};

export default nextConfig;
