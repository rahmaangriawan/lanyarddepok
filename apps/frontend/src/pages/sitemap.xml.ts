import type { APIRoute } from 'astro';
import { sitemapIndexResponse } from '../lib/sitemap';

const childSitemaps = [
  '/sitemap-static.xml',
  '/sitemap-posts.xml',
  '/sitemap-products.xml',
  '/sitemap-pages.xml',
  '/sitemap-authors.xml',
];

export const GET: APIRoute = () => sitemapIndexResponse(childSitemaps);
