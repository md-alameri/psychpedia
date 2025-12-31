import { buildSearchIndex } from '@/lib/search/index';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Build search index at build time
 * Generates public/search-index.json from all published content
 */
async function main() {
  try {
    console.log('Building search index...');
    
    const index = await buildSearchIndex();
    
    // Ensure public directory exists
    const publicDir = join(process.cwd(), 'public');
    mkdirSync(publicDir, { recursive: true });
    
    // Write index to public/search-index.json
    const outputPath = join(publicDir, 'search-index.json');
    writeFileSync(outputPath, JSON.stringify(index, null, 2), 'utf-8');
    
    console.log(`✓ Search index built: ${index.length} entries`);
    console.log(`  Output: ${outputPath}`);
  } catch (error) {
    console.error('Error building search index:', error);
    process.exit(1);
  }
}

main();

