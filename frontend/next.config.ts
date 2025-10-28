import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimización para navegadores modernos
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Optimización de producción
  swcMinify: true,
  
  experimental: {
    // Optimizar imports de paquetes pesados
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-avatar', 
      '@radix-ui/react-dialog',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'framer-motion'
    ],
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;