import { MetadataRoute } from 'next';
import { generateSitemap } from '@/lib/content/sitemap';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await generateSitemap();
  
  return entries.map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}

