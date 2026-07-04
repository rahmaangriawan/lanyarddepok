const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const GLOBAL_ATTRS = new Set(["class", "id"]);
const TAG_ATTRS = new Map<string, Set<string>>([
  ["a", new Set(["href", "target", "rel", "title", "class"])],
  ["img", new Set(["src", "alt", "title", "width", "height", "class"])],
  ["td", new Set(["colspan", "rowspan", "class"])],
  ["th", new Set(["colspan", "rowspan", "class"])],
]);

const URI_ATTRS = new Set(["href", "src"]);
const SAFE_URI_PATTERN = /^(https?:|mailto:|tel:|\/(?!\/)|#)/i;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function mergeRelValue(value: string) {
  const relValues = new Set(
    value
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean),
  );

  relValues.add("noopener");
  relValues.add("noreferrer");

  return Array.from(relValues).join(" ");
}

function sanitizeAttrs(tag: string, attrs = "") {
  const allowed = TAG_ATTRS.get(tag) || GLOBAL_ATTRS;
  const output: string[] = [];
  const attrValues = new Map<string, string>();
  const attrPattern = /([a-zA-Z0-9:-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrPattern.exec(attrs)) !== null) {
    const name = match[1].toLowerCase();
    if (name.startsWith("on") || (!allowed.has(name) && !GLOBAL_ATTRS.has(name))) {
      continue;
    }

    const rawValue = match[3] ?? match[4] ?? match[5] ?? "";
    const value = rawValue.replace(/[\u0000-\u001f\u007f]/g, "").trim();
    if (URI_ATTRS.has(name) && value && !SAFE_URI_PATTERN.test(value)) {
      continue;
    }

    attrValues.set(name, value);
    output.push(`${name}="${escapeHtml(value)}"`);
  }

  if (tag === "a") {
    const relIndex = output.findIndex((attr) => attr.startsWith("rel="));
    if (relIndex === -1) {
      output.push('rel="noopener noreferrer"');
    } else {
      output[relIndex] = `rel="${escapeHtml(mergeRelValue(attrValues.get("rel") || ""))}"`;
    }
  }

  return output.length ? ` ${output.join(" ")}` : "";
}

export function sanitizeCmsHtml(html: string) {
  if (!html) return "";

  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|svg|math)[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|svg|math)\b[^>]*\/?>/gi, "")
    .replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, rawTag: string, attrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        return "";
      }

      if (match.startsWith("</")) {
        return `</${tag}>`;
      }

      const isSelfClosing = /\/\s*>$/.test(match) || tag === "br" || tag === "hr" || tag === "img";
      return `<${tag}${sanitizeAttrs(tag, attrs)}${isSelfClosing ? " />" : ">"}`;
    });
}

export function normalizeCmsHtml(html: string) {
  return sanitizeCmsHtml(html)
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\xa0/g, " ");
}
