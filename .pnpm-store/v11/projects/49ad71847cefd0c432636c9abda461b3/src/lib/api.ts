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
  category?: { id: number; name: string; slug: string } | null;
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
  category?: { id: number; name: string; slug: string } | null;
  comments?: Comment[];
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
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type PublicSettings = {
  seo_auto_links?: string;
  seo_auto_links_limit?: string;
};

async function request<T>(path: string, fallback: T): Promise<T> {
  const cached = requestCache.get(path);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  for (const apiBase of API_BASES) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${apiBase}${path}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!response.ok) continue;

      const value = await response.json();
      requestCache.set(path, {
        expiresAt: now + REQUEST_CACHE_TTL_MS,
        value,
      });

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
  products: (limit?: number) =>
    request<{ success: boolean; products: Product[] }>(`/products${limit ? `?limit=${limit}` : ''}`, {
      success: false,
      products: [],
    }),
  categories: (type?: string) =>
    request<{ success: boolean; categories: Category[] }>(`/categories${type ? `?type=${encodeURIComponent(type)}` : ''}`, {
      success: false,
      categories: [],
    }),
  product: (slug: string) =>
    request<{ success: boolean; product: Product | null }>(`/products/${slug}`, {
      success: false,
      product: null,
    }),
  posts: (options?: { limit?: number; page?: number }) => {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.page && options.page > 1) params.set('page', String(options.page));
    const query = params.toString();

    return request<{ success: boolean; posts: PaginatedPosts | Post[] }>(`/posts${query ? `?${query}` : ''}`, {
      success: false,
      posts: [],
    });
  },
  post: (slug: string, options?: { preview?: string }) => {
    const params = options?.preview ? `?preview=${options.preview}` : '';
    return request<{ success: boolean; post: Post | null }>(`/posts/${slug}${params}`, {
      success: false,
      post: null,
    });
  },
  publicSettings: () =>
    request<{ success: boolean; settings: PublicSettings }>('/public-settings', {
      success: false,
      settings: {},
    }),
  page: (slug: string) =>
    request<{ success: boolean; page: CmsPage | null }>(`/pages/${slug}`, {
      success: false,
      page: null,
    }),
  cityPage: (slug: string) =>
    request<{ success: boolean; cityPage: CmsPage | null }>(`/city-pages/${slug}`, {
      success: false,
      cityPage: null,
    }),
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
