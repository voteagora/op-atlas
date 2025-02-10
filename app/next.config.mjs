/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => {
    return [
      {
        source: "/api/tag-contacts",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.charmverse.io",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
