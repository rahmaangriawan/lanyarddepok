export type AutoLinkRule = {
  keyword: string;
  url: string;
};

const SKIP_TEXT_TAGS = new Set(['a', 'script', 'style', 'code', 'pre', 'button', 'textarea', 'select', 'option', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeAttr(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizeUrl(url: string) {
  const value = url.trim();
  if (!value) return '';
  if (value.startsWith('/') || /^https?:\/\//i.test(value)) return value;
  return `/${value.replace(/^\/+/, '')}`;
}

function parseTagName(tag: string) {
  const match = tag.match(/^<\/?\s*([a-z0-9:-]+)/i);
  return match?.[1]?.toLowerCase() || '';
}

function isClosingTag(tag: string) {
  return /^<\//.test(tag);
}

function isSelfClosingTag(tag: string) {
  return /\/\s*>$/.test(tag) || /^<\s*(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i.test(tag);
}

export function parseAutoLinks(raw: string | null | undefined): AutoLinkRule[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        keyword: String(item?.keyword || '').trim(),
        url: normalizeUrl(String(item?.url || '')),
      }))
      .filter((item) => item.keyword && item.url)
      .sort((a, b) => b.keyword.length - a.keyword.length);
  } catch {
    return [];
  }
}

export function parseAutoLinkLimit(raw: string | null | undefined) {
  const value = Number.parseInt(String(raw || ''), 10);
  return Number.isFinite(value) && value > 0 ? value : 2;
}

export function injectAutoLinks(html: string, links: AutoLinkRule[], limit = 2) {
  if (!html || links.length === 0) return html;

  const maxPerKeyword = Math.max(1, limit);
  const counts = new Map(links.map((link) => [link.keyword.toLowerCase(), 0]));
  const parts = html.split(/(<[^>]+>)/g);
  const skipStack: string[] = [];

  return parts
    .map((part, index) => {
      if (index % 2 === 1) {
        const tagName = parseTagName(part);

        if (tagName && SKIP_TEXT_TAGS.has(tagName)) {
          if (isClosingTag(part)) {
            const lastIndex = skipStack.lastIndexOf(tagName);
            if (lastIndex !== -1) skipStack.splice(lastIndex, 1);
          } else if (!isSelfClosingTag(part)) {
            skipStack.push(tagName);
          }
        }

        return part;
      }

      if (!part || skipStack.length > 0) return part;

      let text = part;

      for (const link of links) {
        const key = link.keyword.toLowerCase();
        const currentCount = counts.get(key) || 0;
        if (currentCount >= maxPerKeyword) continue;

        const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])(${escapeRegex(link.keyword)})(?=$|[^\\p{L}\\p{N}_])`, 'giu');
        let replacedCount = currentCount;

        text = text.replace(regex, (match, prefix, keyword) => {
          if (replacedCount >= maxPerKeyword) return match;
          replacedCount += 1;
          return `${prefix}<a class="blog-auto-link" href="${escapeAttr(link.url)}">${keyword}</a>`;
        });

        counts.set(key, replacedCount);
      }

      return text;
    })
    .join('');
}
