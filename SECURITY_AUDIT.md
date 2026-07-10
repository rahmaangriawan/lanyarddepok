# Security, Cache, Database, and Speed Audit

## Critical

- Public CMS content is rendered as HTML in Astro (`set:html`). Mitigation: richtext content is sanitized through `App\Support\HtmlSanitizer` on CMS/API save and again on public read for posts, pages, and city pages.

## High

- Public API cache behavior was inconsistent. Mitigation: public content endpoints now use a shared `public_json()` response helper with `s-maxage` and `stale-while-revalidate`.
- Admin/API list endpoints could return large payloads. Mitigation: high-volume API lists now paginate or cap per-page size.
- Media upload accepted broad files in the CMS path. Mitigation: CMS media uploads are limited to images/PDF; public API upload is limited to image MIME/extensions.

## Medium

- Security headers were missing from app responses. Mitigation: Laravel and Astro now set non-breaking hardening headers, including `X-Content-Type-Options`, `Referrer-Policy`, frame protection, and permissions policy. Astro also sends a minimal CSP compatible with current inline Astro scripts/styles.
- Blog list endpoint included full post content. Mitigation: post list now selects summary fields only.

## Low / Follow-Up

- Product search uses `LIKE "%term%"`; acceptable for current data size, but should be revisited if product volume grows.
- CMS option lists still use full category/post/page lists for form selects; acceptable for small editorial datasets, but candidates for async search if data grows.
- Image optimization should be revisited when adding new assets: keep hero images explicit, lazy-load below-fold images, and prefer WebP.

## Verification Checklist

- Static scan: `set:html`, raw JS, upload handlers, public/admin API routes.
- Syntax/build: PHP lint for changed files and `pnpm --dir apps/frontend build`.
- Manual XSS payload: `<script>`, inline event handlers, `javascript:` URLs, and iframe/object/embed tags should be stripped from CMS HTML.
- Cache policy: public endpoints should return public cache headers; admin/auth routes should return `no-store, private`.
