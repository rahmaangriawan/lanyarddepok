import type { APIRoute } from 'astro';
import { api } from '../lib/api';
import { contentEntries, urlsetResponse } from '../lib/sitemap';

export const GET: APIRoute = async () => {
  const { sitemap } = await api.sitemap();
  return urlsetResponse(contentEntries('/produk', sitemap.products));
};
