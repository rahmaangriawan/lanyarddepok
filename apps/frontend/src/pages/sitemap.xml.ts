import type { APIRoute } from 'astro';
import { sitemapIndexResponse } from '../lib/sitemap';

const childSitemaps = [
  '/sitemap-static.xml',
  '/sitemap-posts.xml',
  '/sitemap-products.xml',
  '/sitemap-pages.xml',
];

export const GET: APIRoute = () => sitemapIndexResponse(childSitemaps);
