/**
 * TypeScript types for Wagtail CMS API v2 responses
 */

/**
 * Wagtail page metadata
 */
export interface WagtailPageMeta {
  type: string;
  detail_url: string;
  html_url: string;
  slug: string;
  first_published_at: string | null;
  last_published_at: string | null;
  locale?: string;
  [key: string]: any;
}

/**
 * Wagtail page item from API
 */
export interface WagtailPageItem {
  id: number;
  meta: WagtailPageMeta;
  title: string;
  slug?: string;
  url_path?: string;
  seo_title?: string;
  search_description?: string;
  first_published_at?: string | null;
  last_published_at?: string | null;
  [key: string]: any; // Allow additional fields from Wagtail
}

/**
 * Wagtail pages list response metadata
 */
export interface WagtailPagesMeta {
  total_count: number;
  [key: string]: any;
}

/**
 * Wagtail pages list response
 */
export interface WagtailPageListResponse {
  meta: WagtailPagesMeta;
  items: WagtailPageItem[];
}

/**
 * Wagtail image item (for future use)
 */
export interface WagtailImage {
  id: number;
  meta: {
    type: string;
    detail_url: string;
    download_url: string;
    tags: string[];
  };
  title: string;
  width: number;
  height: number;
  file: {
    url: string;
    size: number;
    content_type: string;
  };
  [key: string]: any;
}

