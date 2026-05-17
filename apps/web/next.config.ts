import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  // Forza il dominio canonico: qualunque richiesta al .vercel.app viene reindirizzata a lensveritas.com.
  // Il dominio *.vercel.app e' assegnato automaticamente da Vercel e non si puo' rimuovere dalla dashboard.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'news-lens-psi.vercel.app' }],
        destination: 'https://lensveritas.com/:path*',
        permanent: true,
      },
    ]
  },
};

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(nextConfig);
