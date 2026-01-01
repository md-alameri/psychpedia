import { CMS_API_BASE } from './config';

/**
 * Options for cmsFetch
 */
export interface CMSFetchOptions extends RequestInit {
  /**
   * Next.js cache options
   * @see https://nextjs.org/docs/app/api-reference/functions/fetch#nextrevalidate
   */
  cache?: RequestCache;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  /**
   * Request timeout in milliseconds
   * Default: 10000 (10 seconds)
   */
  timeout?: number;
}

/**
 * Default timeout for CMS requests (10 seconds)
 */
const DEFAULT_TIMEOUT = 10000;

/**
 * Create an AbortController with timeout
 */
function createTimeoutController(timeout: number): AbortController {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  // Clear timeout if request completes before timeout
  // Note: This is handled by the fetch implementation
  return controller;
}

/**
 * Format fetch errors with context
 */
function formatFetchError(error: unknown, url: string): string {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return `Network error: Unable to connect to CMS at ${url}. Is the CMS running?`;
  }
  if (error instanceof Error) {
    return `${error.message} (URL: ${url})`;
  }
  return `Unknown error fetching from ${url}`;
}

/**
 * Generic fetch function for Wagtail CMS API
 * 
 * @param path - API path (e.g., '/pages/' or '/images/123/')
 * @param options - Fetch options including Next.js cache options
 * @returns Promise<Response>
 * 
 * @example
 * ```ts
 * const response = await cmsFetch('/pages/?slug=my-page');
 * const data = await response.json();
 * ```
 */
export async function cmsFetch(
  path: string,
  options: CMSFetchOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    cache,
    next,
    headers,
    ...fetchOptions
  } = options;

  // Build full URL
  const baseUrl = CMS_API_BASE.replace(/\/$/, ''); // Remove trailing slash
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${apiPath}`;

  // Set up timeout
  const controller = createTimeoutController(timeout);

  // Prepare headers
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  // Prepare Next.js fetch options
  const nextFetchOptions: RequestInit = {
    ...fetchOptions,
    headers: defaultHeaders,
    signal: controller.signal,
  };

  // Add Next.js cache options if provided
  if (cache !== undefined) {
    (nextFetchOptions as any).cache = cache;
  }
  if (next) {
    (nextFetchOptions as any).next = next;
  }

  try {
    const response = await fetch(url, nextFetchOptions);

    // Handle timeout
    if (controller.signal.aborted) {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    return response;
  } catch (error) {
    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    // Format and rethrow other errors
    const errorMessage = formatFetchError(error, url);
    throw new Error(errorMessage);
  }
}

