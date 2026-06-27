/**
 * SEO Utility Functions for Lanyard Jakarta Blog Content
 */

interface LinkMapping {
  keyword: string;
  url: string;
}

/**
 * Automatically injects internal links into HTML content based on keyword-to-URL mappings.
 * It skips existing <a> tags and HTML tag attributes, and limits replacements per keyword.
 */
export function injectAutoLinks(
  htmlContent: string,
  links: LinkMapping[],
  maxLimit = 2,
): string {
  if (!htmlContent || !links || links.length === 0) return htmlContent;

  // Track the replacement count for each keyword to prevent keyword stuffing (max maxLimit per keyword)
  const keywordCounts = new Map<string, number>();
  links.forEach((l) => keywordCounts.set(l.keyword.toLowerCase(), 0));

  // Split HTML content by HTML tags to isolate text nodes
  const parts = htmlContent.split(/(<[^>]+>)/);
  let inLink = false;

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      // This is an HTML tag
      const tag = parts[i].toLowerCase();
      if (tag.startsWith("<a ") || tag === "<a>") {
        inLink = true;
      } else if (tag === "</a>") {
        inLink = false;
      }
    } else {
      // This is a plain text node outside tags
      if (!inLink && parts[i].trim().length > 0) {
        let text = parts[i];

        for (const item of links) {
          const keyword = item.keyword.trim();
          if (!keyword) continue;

          const currentCount = keywordCounts.get(keyword.toLowerCase()) || 0;
          if (currentCount >= maxLimit) continue; // Limit to max maxLimit links per keyword per article

          // Escape special regex characters in the keyword
          const escapedKeyword = keyword.replace(
            /[-\/\\^$*+?.()|[\]{}]/g,
            "\\$&",
          );
          // Match keyword as a whole word case-insensitively
          const regex = new RegExp(`\\b(${escapedKeyword})\\b`, "gi");

          let match;
          let replacedText = "";
          let lastIndex = 0;
          let replacedCount = currentCount;

          while (
            (match = regex.exec(text)) !== null &&
            replacedCount < maxLimit
          ) {
            replacedText += text.substring(lastIndex, match.index);
            replacedText += `<a href="${item.url}" class="text-brand-red font-bold hover:underline">${match[1]}</a>`;
            lastIndex = regex.lastIndex;
            replacedCount++;
          }

          if (replacedCount > currentCount) {
            replacedText += text.substring(lastIndex);
            text = replacedText;
            keywordCounts.set(keyword.toLowerCase(), replacedCount);
          }
        }
        parts[i] = text;
      }
    }
  }

  return parts.join("");
}

/**
 * Scans HTML content for FAQs. It automatically detects headings (H2, H3, H4) ending
 * with a question mark "?" and registers the subsequent paragraph <p> as the answer.
 */
export function parseFaqs(
  htmlContent: string,
): { question: string; answer: string }[] {
  if (!htmlContent) return [];
  const faqs: { question: string; answer: string }[] = [];

  // Match headings (h2/h3/h4) containing "?" followed by a paragraph
  const regex =
    /<(h[234])[^>]*>([^<]*\?[^<]*)<\/h[234]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;

  while ((match = regex.exec(htmlContent)) !== null) {
    const question = match[2]
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/\u00a0/g, " ")
      .replace(/\xa0/g, " ")
      .trim();
    const answer = match[3]
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/\u00a0/g, " ")
      .replace(/\xa0/g, " ")
      .trim();
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}

/**
 * Injects "Baca Juga" (Type 2 Auto Internal Links) blocks between paragraphs of the content.
 * It inserts after paragraph 2 (index 1) and is limited to exactly 1 related link.
 */
export function injectRelatedReading(
  htmlContent: string,
  relatedPosts: { title: string; slug: string }[],
): string {
  if (!htmlContent || !relatedPosts || relatedPosts.length === 0)
    return htmlContent;

  const paragraphs = htmlContent.split("</p>");
  // If there are less than 2 paragraphs, we don't insert any
  if (paragraphs.length <= 1) return htmlContent;

  let insertedCount = 0;
  const result: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    let paragraphContent = paragraphs[i];
    // Re-add </p> if it's not the last element
    if (i < paragraphs.length - 1) {
      paragraphContent += "</p>";
    }
    result.push(paragraphContent);

    // Insert only 1 related reading after paragraph 2 (index 1)
    const isParagraph2 = i === 1;

    if (
      isParagraph2 &&
      insertedCount < 1 &&
      insertedCount < relatedPosts.length
    ) {
      const post = relatedPosts[insertedCount];
      const relatedBlock = `
<div class="my-6 p-5 bg-brand-light-50 border-l-4 border-brand-red rounded-r-2xl">
  <span class="text-[10px] font-extrabold text-brand-red uppercase tracking-wider block mb-1">Baca Juga</span>
  <a href="/blog/${post.slug}" class="text-sm sm:text-base font-bold text-[#373f50] hover:text-brand-red hover:underline transition-colors block">
    ${post.title}
  </a>
</div>`;
      result.push(relatedBlock);
      insertedCount++;
    }
  }

  return result.join("");
}

/**
 * Parses H2 and H3 heading elements, injects unique IDs into them for anchor-linking,
 * generates a styled Table of Contents (TOC) HTML block, and inserts it before the first H2.
 */
export function injectTableOfContents(htmlContent: string): string {
  if (!htmlContent) return htmlContent;

  interface TocHeading {
    id: string;
    text: string;
    tag: string;
    subheadings: { id: string; text: string; tag: string }[];
  }

  const headingRegex = /<(h[23])([^>]*)>([\s\S]*?)<\/h[23]>/gi;
  const toc: TocHeading[] = [];
  const usedIds = new Set<string>();
  const headingsToUpdate: {
    tag: string;
    originalAttrs: string;
    originalContent: string;
    id: string;
  }[] = [];

  let lastH2: TocHeading | null = null;
  let match;

  // 1. First pass: Collect headings and group H3s under their preceding H2s
  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const originalContent = match[3];
    const cleanText = originalContent.replace(/<[^>]*>/g, "").trim();

    if (!cleanText) continue;

    // Remove leading numbers/letters like "1. ", "A. ", "01. " from the text for TOC display
    const displayDocText = cleanText
      .replace(/^(?:\d+\.|[A-Za-z]\.)\s*/, "")
      .trim();

    // Generate unique slug ID
    let slug = displayDocText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) slug = `heading-${usedIds.size}`;

    let uniqueId = slug;
    let counter = 1;
    while (usedIds.has(uniqueId)) {
      uniqueId = `${slug}-${counter}`;
      counter++;
    }
    usedIds.add(uniqueId);

    const headingItem = { id: uniqueId, text: displayDocText, tag };

    if (tag === "h2") {
      lastH2 = { ...headingItem, subheadings: [] };
      toc.push(lastH2);
    } else if (tag === "h3") {
      if (lastH2) {
        lastH2.subheadings.push(headingItem);
      } else {
        const mockH2 = { ...headingItem, subheadings: [] };
        toc.push(mockH2);
      }
    }

    headingsToUpdate.push({
      tag,
      originalAttrs: attrs,
      originalContent,
      id: uniqueId,
    });
  }

  if (toc.length === 0) return htmlContent;

  // 2. Add IDs to the headings in the HTML content
  let headingIndex = 0;
  const htmlWithIds = htmlContent.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/h[23]>/gi,
    (match, tag, attrs, content) => {
      const update = headingsToUpdate[headingIndex++];
      if (!update) return match;
      if (/id=/i.test(attrs)) return match;
      return `<${tag}${attrs} id="${update.id}">${content}</${tag}>`;
    },
  );

  // Helper function to render H3 subheadings exactly like the screenshot
  const renderH3Subheadings = (
    subheadings: { id: string; text: string }[],
  ): string => {
    let subHtml = `<div class="mt-3 ml-12 space-y-2">`;
    subheadings.forEach((sub, idx) => {
      const letter = String.fromCharCode(65 + idx); // A, B, C...
      subHtml += `
      <a href="#${sub.id}" class="flex items-center justify-between p-3.5 bg-brand-light-50 hover:bg-brand-light-100 rounded-xl transition-all duration-200 group/sub">
        <div class="flex items-center space-x-3.5">
          <span class="text-brand-red font-bold text-xs sm:text-sm shrink-0">${letter}.</span>
          <span class="text-[#4a5568] group-hover/sub:text-brand-red font-medium text-xs sm:text-sm transition-colors duration-200">${sub.text}</span>
        </div>
        <svg class="h-3.5 w-3.5 text-gray-400 group-hover/sub:text-brand-red transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </a>`;
    });
    subHtml += `</div>`;
    return subHtml;
  };

  // 3. Build Table of Contents HTML block with the card layout
  let tocHtml = `
<details class="toc-container my-8 p-6 sm:p-7 bg-white border border-gray-100 rounded-3xl shadow-xs max-w-2xl select-none group" open>
  <summary class="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none">
    <div class="flex items-center space-x-3.5">
      <div class="h-10 w-10 rounded-xl bg-brand-light-50 flex items-center justify-center text-brand-red shrink-0 border border-brand-light-100">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.25">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <span class="text-base sm:text-lg font-bold text-[#1a202c]">Daftar Isi</span>
    </div>
    <div class="h-6 w-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-open:rotate-180 transition-transform duration-200 border border-gray-100">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </summary>

  <div class="border-t border-gray-100 pt-3 mt-4">
    <ul class="divide-y divide-gray-100">`;

  toc.forEach((h2, idx) => {
    const h2Num = String(idx + 1).padStart(2, "0");
    const hasSub = h2.subheadings.length > 0;

    // Chevron Down for elements with children, Chevron Right for flat elements
    const chevronIcon = hasSub
      ? `
      <svg class="h-4 w-4 text-gray-400 group-hover:text-brand-red transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>`
      : `
      <svg class="h-4 w-4 text-gray-400 group-hover:text-brand-red transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>`;

    tocHtml += `
      <li class="py-4">
        <a href="#${h2.id}" class="flex items-center justify-between hover:text-brand-red transition-all duration-200 group">
          <div class="flex items-center space-x-4">
            <span class="text-brand-red font-bold text-sm sm:text-base tracking-wide shrink-0">${h2Num}.</span>
            <span class="text-[#373f50] group-hover:text-brand-red font-semibold text-sm sm:text-base transition-colors duration-200">${h2.text}</span>
          </div>
          ${chevronIcon}
        </a>
        ${hasSub ? renderH3Subheadings(h2.subheadings) : ""}
      </li>`;
  });

  tocHtml += `
    </ul>
  </div>
</details>
`;

  // 4. Insert before the first H2 heading
  const firstH2Match = htmlWithIds.match(/<h2[^>]*>/i);
  if (firstH2Match && firstH2Match.index !== undefined) {
    const insertIndex = firstH2Match.index;
    return (
      htmlWithIds.slice(0, insertIndex) +
      tocHtml +
      htmlWithIds.slice(insertIndex)
    );
  }

  // Fallback to first H3 heading if no H2 exists
  const firstH3Match = htmlWithIds.match(/<h3[^>]*>/i);
  if (firstH3Match && firstH3Match.index !== undefined) {
    const insertIndex = firstH3Match.index;
    return (
      htmlWithIds.slice(0, insertIndex) +
      tocHtml +
      htmlWithIds.slice(insertIndex)
    );
  }

  return htmlWithIds;
}
