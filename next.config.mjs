import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';

const withNextIntl = createNextIntlPlugin('./lib/i18n/config.ts');

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Explicitly set Turbopack root to avoid warning about multiple lockfiles
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
};

export default withNextIntl(withMDX(nextConfig));
