import { CMS_API_BASE } from './config';
import { cmsFetch, type CMSFetchOptions } from './client';
import type {
  WagtailPageItem,
  WagtailPageListResponse,
  WagtailImage,
} from './types';

/**
 * Options for listing pages
 */
export interface ListPagesOptions {
  /**
   * Filter by page type (e.g., 'conditions.ConditionPage')
   */
  type?: string;
  /**
   * Maximum number of results to return
   */
  limit?: number;
  /**
   * Number of results to skip
   */
  offset?: number;
  /**
   * Additional query parameters
   */
  [key: string]: any;
}

/**
 * Normalize a pathname for comparison
 * - Removes leading/trailing slashes
 * - Handles empty paths (homepage)
 * - Normalizes to consistent format
 */
function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '';
  }
  return pathname.replace(/^\/+|\/+$/g, '');
}

/**
 * Extract path from Wagtail html_url
 * Removes the base URL and returns just the path
 */
function extractPathFromHtmlUrl(htmlUrl: string, baseUrl: string): string {
  try {
    const url = new URL(htmlUrl);
    const base = new URL(baseUrl);
    if (url.origin === base.origin) {
      return normalizePath(url.pathname);
    }
  } catch {
    // Invalid URL, return as-is
  }
  return normalizePath(htmlUrl);
}

/**
 * Fetch a page by path from Wagtail CMS
 * 
 * This is the preferred method for resolving pages as it uses Wagtail's
 * url_path or html_url, which are more reliable than slugs for nested paths.
 * 
 * @param pathname - Full pathname (e.g., '/en/my-page' or 'my-page/nested')
 * @param locale - Optional locale to filter by
 * @param options - Additional fetch options
 * @returns Promise<WagtailPageItem | null>
 * 
 * @example
 * ```ts
 * const page = await getPageByPath('/en/about/team');
 * const page2 = await getPageByPath('about/team', 'en');
 * ```
 */
export async function getPageByPath(
  pathname: string,
  locale?: string,
  options: CMSFetchOptions = {}
): Promise<WagtailPageItem | null> {
  try {
    // Normalize the path
    const normalizedPath = normalizePath(pathname);
    
    // Fetch all pages and match by url_path or html_url
    // We use a broader search and filter client-side for accuracy
    const url = new URL(`${CMS_API_BASE}/pages/`);
    url.searchParams.set('fields', '*');
    url.searchParams.set('limit', '100'); // Reasonable limit for path matching
    
    if (locale) {
      // Wagtail API may support locale filtering
      url.searchParams.set('locale', locale);
    }

    const response = await cmsFetch(url.pathname + url.search, {
      ...options,
      next: options.next || { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`CMS API error: ${response.status} ${response.statusText}`);
    }

    const data: WagtailPageListResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    // Import CMS_BASE_URL for path extraction
    const { CMS_BASE_URL } = await import('./config');

    // Match by url_path first (most reliable)
    for (const item of data.items) {
      if (item.url_path) {
        const itemPath = normalizePath(item.url_path);
        if (itemPath === normalizedPath) {
          return item;
        }
      }
    }

    // Fallback to html_url matching
    for (const item of data.items) {
      if (item.meta?.html_url) {
        const itemPath = extractPathFromHtmlUrl(item.meta.html_url, CMS_BASE_URL);
        if (itemPath === normalizedPath) {
          return item;
        }
      }
    }

    // If normalized path is empty (homepage), try to find homepage
    if (normalizedPath === '') {
      // Homepage typically has empty or root url_path
      for (const item of data.items) {
        const itemPath = item.url_path ? normalizePath(item.url_path) : '';
        if (itemPath === '' || itemPath === '/') {
          return item;
        }
      }
    }

    return null;
  } catch (error) {
    if (error instanceof Error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[CMS] Error fetching page by path:', error.message);
      }
    }
    return null;
  }
}

/**
 * Fetch a page by slug from Wagtail CMS
 * 
 * Note: For nested paths, prefer getPageByPath() which is more reliable.
 * 
 * @param slug - Page slug
 * @param type - Optional page type filter (e.g., 'conditions.ConditionPage')
 * @param options - Additional fetch options
 * @returns Promise<WagtailPageItem | null>
 * 
 * @example
 * ```ts
 * const page = await getPageBySlug('my-page');
 * const condition = await getPageBySlug('depression', 'conditions.ConditionPage');
 * ```
 */
export async function getPageBySlug(
  slug: string,
  type?: string,
  options: CMSFetchOptions = {}
): Promise<WagtailPageItem | null> {
  try {
    const url = new URL(`${CMS_API_BASE}/pages/`);
    url.searchParams.set('slug', slug);
    
    if (type) {
      url.searchParams.set('type', type);
    }
    
    // Request all fields
    url.searchParams.set('fields', '*');

    const response = await cmsFetch(url.pathname + url.search, {
      ...options,
      next: options.next || { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`CMS API error: ${response.status} ${response.statusText}`);
    }

    const data: WagtailPageListResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    // Return first matching page
    return data.items[0];
  } catch (error) {
    if (error instanceof Error) {
      // Log in development, silent in production
      if (process.env.NODE_ENV === 'development') {
        console.error('[CMS] Error fetching page by slug:', error.message);
      }
    }
    return null;
  }
}

/**
 * Fetch a page by ID from Wagtail CMS
 * 
 * @param id - Page ID
 * @param options - Additional fetch options
 * @returns Promise<WagtailPageItem | null>
 * 
 * @example
 * ```ts
 * const page = await getPageById(123);
 * ```
 */
export async function getPageById(
  id: number,
  options: CMSFetchOptions = {}
): Promise<WagtailPageItem | null> {
  try {
    const response = await cmsFetch(`/pages/${id}/`, {
      ...options,
      next: options.next || { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`CMS API error: ${response.status} ${response.statusText}`);
    }

    const data: WagtailPageItem = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[CMS] Error fetching page by ID:', error.message);
      }
    }
    return null;
  }
}

/**
 * List pages from Wagtail CMS with optional filters
 * 
 * @param options - List options (type, limit, offset, etc.)
 * @param fetchOptions - Additional fetch options
 * @returns Promise<WagtailPageItem[]>
 * 
 * @example
 * ```ts
 * const conditions = await listPages({ type: 'conditions.ConditionPage', limit: 10 });
 * const allPages = await listPages({ limit: 100 });
 * ```
 */
export async function listPages(
  options: ListPagesOptions = {},
  fetchOptions: CMSFetchOptions = {}
): Promise<WagtailPageItem[]> {
  try {
    const url = new URL(`${CMS_API_BASE}/pages/`);
    
    // Add standard options
    if (options.type) {
      url.searchParams.set('type', options.type);
    }
    if (options.limit) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.offset) {
      url.searchParams.set('offset', options.offset.toString());
    }
    
    // Add any additional query parameters
    Object.keys(options).forEach((key) => {
      if (!['type', 'limit', 'offset'].includes(key)) {
        url.searchParams.set(key, String(options[key]));
      }
    });

    const response = await cmsFetch(url.pathname + url.search, {
      ...fetchOptions,
      next: fetchOptions.next || { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`CMS API error: ${response.status} ${response.statusText}`);
    }

    const data: WagtailPageListResponse = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items;
  } catch (error) {
    if (error instanceof Error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[CMS] Error listing pages:', error.message);
      }
    }
    return [];
  }
}

/**
 * Fetch an image by ID from Wagtail CMS
 * 
 * @param id - Image ID
 * @param options - Additional fetch options
 * @returns Promise<WagtailImage | null>
 * 
 * @example
 * ```ts
 * const image = await getImage(123);
 * ```
 */
export async function getImage(
  id: number,
  options: CMSFetchOptions = {}
): Promise<WagtailImage | null> {
  try {
    const response = await cmsFetch(`/images/${id}/`, {
      ...options,
      next: options.next || { revalidate: 3600 }, // Cache images longer
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`CMS API error: ${response.status} ${response.statusText}`);
    }

    const data: WagtailImage = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[CMS] Error fetching image:', error.message);
      }
    }
    return null;
  }
}

