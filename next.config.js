/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingExcludes: {
    "*": [
      ".git/**/*",
      ".next/cache/**/*",
    ],
  },
};

module.exports = nextConfig;
