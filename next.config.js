/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // No wildcard remotePatterns (avoids GHSA-9g9p-9gw9-jx7f image-optimizer DoS).
    // Add explicit, trusted hostnames here when remote images are introduced.
    remotePatterns: [],
  },
};

module.exports = nextConfig;
