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
  // Turbopack configuration
  // Set root to this project directory to resolve workspace lockfile warnings
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
  // Disable Next.js automatic trailing slash redirects
  // This allows our route handler to process /api/ requests directly
  skipTrailingSlashRedirect: true,
  // Help with full URL normalization control in middleware/handlers
  skipMiddlewareUrlNormalize: true,
};

export default withNextIntl(withMDX(nextConfig));
