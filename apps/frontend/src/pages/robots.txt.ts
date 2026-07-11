import type { APIRoute } from 'astro';
import { resolveSiteUrl } from '../lib/seo';

export const GET: APIRoute = () => {
  const siteUrl = resolveSiteUrl();
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /kawruh',
    'Disallow: /api/',
    'Disallow: /login',
    'Disallow: /register',
    'Disallow: /forgot-password',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
