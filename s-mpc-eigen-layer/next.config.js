/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        // Optional: Add custom Turbopack rules if needed
      }
    }
  }
};

module.exports = nextConfig; 