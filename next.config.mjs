/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'd1xkkyf83uw803.cloudfront.net', 'img.clerk.com'],
  },
  webpack: (config, { isServer }) => {
    // Add canvas to externals
    config.externals = [...config.externals, { canvas: "canvas" }];
    
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
