const BACKEND_BASE = (import.meta.env.PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const primaryApiBase = import.meta.env.PUBLIC_API_BASE_URL || 'http://127.0.0.1:3000/api';
const API_BASES = Array.from(new Set([
  primaryApiBase,
  'http://127.0.0.1:3000/api',
  'http://localhost:3000/api',
  `${BACKEND_BASE}/api`,
])).map((url) => url.replace(/\/$/, ''));
export const PUBLIC_API_BASES = API_BASES;
const REQUEST_CACHE_TTL_MS = Number(import.meta.env.PUBLIC_API_CACHE_TTL_MS || import.meta.env.API_CACHE_TTL_MS || 60_000);
const REQUEST_TIMEOUT_MS = Number(import.meta.env.PUBLIC_API_TIMEOUT_MS || import.meta.env.API_TIMEOUT_MS || 2_500);
const requestCache = new Map<string, { expiresAt: number; value: unknown }>();
const ASTRO_PUBLIC_UPLOADS = new Set([
  'cta-footer-lanyard-custom-mobile.webp',
  'featured-lanyard-polyester-main.webp',
  'featured-products-showcase-lanyarddepok-v2.webp',
  'hero-lanyard-slider-01.webp',
  'hero-lanyard-slider-02.webp',
  'hero-lanyard-slider-03.webp',
  'lanyarddepok-favicon.webp',
  'lanyarddepok-logo-header.webp',
  'lanyarddepok-logo-mobile.webp',
  'pengiriman-packaging-lanyarddepok.webp',
]);

export type Product = {
  id: number | null;
  sku: string;
  name: string | null;
  slug: string | null;
  specs?: string | null;
  accessories?: string | null;
  shortDescription?: string | null;
  shortDesc?: string | null;
  longDesc?: string | null;
  description?: string | null;
  featuredImage?: string | null;
  basePrice?: string | null;
  minOrder?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  category?: { id: number; name: string; slug: string } | null;
};

export type ProductPagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  content?: string;
  featuredImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt?: string;
  updatedAt?: string;
  category?: { id: number; name: string; slug: string } | null;
  author?: Author | null;
  comments?: Comment[];
};

export type Author = {
  id: number;
  name: string;
  slug: string;
  bio?: string | null;
  avatar?: string | null;
  updatedAt?: string | null;
};

export type Comment = {
  id: number;
  postId?: number;
  name: string;
  content: string;
  approved?: boolean;
  createdAt?: string;
};

export type PaginatedPosts = {
  data?: Post[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
};

export type CmsPage = {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type SitemapItem = {
  slug: string;
  updatedAt?: string | null;
};

export type PublicSitemap = {
  posts: SitemapItem[];
  products: SitemapItem[];
  pages: SitemapItem[];
  cityPages: SitemapItem[];
  authors: SitemapItem[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type PublicSettings = {
  seo_auto_links?: string;
  seo_auto_links_limit?: string;
  site_title?: string;
  site_description?: string;
  site_logo?: string;
  site_favicon?: string;
  og_image?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  contact_email?: string;
  contact_address?: string;
  seo_meta_title?: string;
  seo_meta_description?: string;
  bing_site_verification?: string;
  google_site_verification?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_tiktok?: string;
};

type RequestOptions = {
  cacheTtlMs?: number;
};

async function request<T>(path: string, fallback: T, options: RequestOptions = {}): Promise<T> {
  const cached = requestCache.get(path);
  const now = Date.now();
  const cacheTtlMs = options.cacheTtlMs ?? REQUEST_CACHE_TTL_MS;

  if (cacheTtlMs > 0 && cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  for (const apiBase of API_BASES) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${apiBase}${path}`, {
        headers: {
          Accept: 'application/json',
          ...(cacheTtlMs === 0 ? { 'Cache-Control': 'no-cache' } : {}),
        },
        signal: controller.signal,
      });

      if (!response.ok) continue;

      const value = await response.json();
      if (cacheTtlMs > 0) {
        requestCache.set(path, {
          expiresAt: now + cacheTtlMs,
          value,
        });
      }

      return value;
    } catch {
      continue;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return fallback;
}

export const api = {
  products: (options?: number | { limit?: number; page?: number; q?: string }) => {
    const normalized = typeof options === 'number' ? { limit: options } : options;
    const params = new URLSearchParams();
    if (normalized?.limit) params.set('limit', String(normalized.limit));
    if (normalized?.page && normalized.page > 1) params.set('page', String(normalized.page));
    if (normalized?.q?.trim()) params.set('q', normalized.q.trim());
    const query = params.toString();

    return request<{ success: boolean; products: Product[]; pagination: ProductPagination }>(`/products${query ? `?${query}` : ''}`, {
      success: false,
      products: [],
      pagination: { current_page: 1, last_page: 1, per_page: normalized?.limit || 12, total: 0 },
    }, { cacheTtlMs: 0 });
  },
  categories: (type?: string) =>
    request<{ success: boolean; categories: Category[] }>(`/categories${type ? `?type=${encodeURIComponent(type)}` : ''}`, {
      success: false,
      categories: [],
    }),
  product: (slug: string) =>
    request<{ success: boolean; product: Product | null }>(`/products/${slug}`, {
      success: false,
      product: null,
    }, { cacheTtlMs: 0 }),
  posts: (options?: { limit?: number; page?: number }) => {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.page && options.page > 1) params.set('page', String(options.page));
    const query = params.toString();

    return request<{ success: boolean; posts: PaginatedPosts | Post[] }>(`/posts${query ? `?${query}` : ''}`, {
      success: false,
      posts: [],
    }, { cacheTtlMs: 0 });
  },
  post: (slug: string, options?: { preview?: string; expires?: string; signature?: string }) => {
    const params = new URLSearchParams();
    if (options?.preview) params.set('preview', options.preview);
    if (options?.expires) params.set('expires', options.expires);
    if (options?.signature) params.set('signature', options.signature);
    const query = params.toString();
    return request<{ success: boolean; post: Post | null }>(`/posts/${slug}${query ? `?${query}` : ''}`, {
      success: false,
      post: null,
    }, { cacheTtlMs: 0 });
  },
  author: (slug: string, options?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (options?.page && options.page > 1) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));
    const query = params.toString();

    return request<{ success: boolean; author: Author | null; posts: PaginatedPosts | Post[]; redirectTo?: string }>(`/authors/${encodeURIComponent(slug)}${query ? `?${query}` : ''}`, {
      success: false,
      author: null,
      posts: [],
    }, { cacheTtlMs: 0 });
  },
  publicSettings: () =>
    request<{ success: boolean; settings: PublicSettings }>('/public-settings', {
      success: false,
      settings: {},
    }, { cacheTtlMs: 0 }),
  sitemap: () =>
    request<{ success: boolean; sitemap: PublicSitemap }>('/sitemap', {
      success: false,
      sitemap: { posts: [], products: [], pages: [], cityPages: [], authors: [] },
    }, { cacheTtlMs: 0 }),
  page: (slug: string) =>
    request<{ success: boolean; page: CmsPage | null }>(`/pages/${slug}`, {
      success: false,
      page: null,
    }, { cacheTtlMs: 0 }),
  cityPage: (slug: string) =>
    request<{ success: boolean; cityPage: CmsPage | null }>(`/city-pages/${slug}`, {
      success: false,
      cityPage: null,
    }, { cacheTtlMs: 0 }),
};

export function mediaUrl(path?: string | null) {
  const value = path || '/uploads/featured-products-showcase-lanyarddepok-v2.webp';

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  if (value.startsWith('/uploads/') && ASTRO_PUBLIC_UPLOADS.has(value.split('/').pop() || '')) {
    return value;
  }

  if (
    value.startsWith('/uploads/') ||
    value.startsWith('/storage/') ||
    value.startsWith('/media/') ||
    value.startsWith('/images/')
  ) {
    return `${BACKEND_BASE}${value}`;
  }

  return value.startsWith('/') ? value : `/${value}`;
}
