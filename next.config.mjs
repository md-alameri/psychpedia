import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Disable Next.js automatic trailing slash redirects
  // This allows our route handler to process /api/ requests directly
  skipTrailingSlashRedirect: true,
  // Help with full URL normalization control in proxy/handlers
  skipProxyUrlNormalize: true,
  // Configure remote image patterns for Wagtail CMS
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.psychpedia.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(withMDX(nextConfig));
