import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {hostname: 'snapcast-jsm.b-cdn.net', protocol: 'https', port: '', pathname: '/**'}
    ]
  }
};

export default nextConfig;
