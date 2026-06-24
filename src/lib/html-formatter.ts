export function formatHtml(html: string): string {
  if (typeof window === "undefined") return html;
  
  // Clean up literal &nbsp; and raw non-breaking spaces
  const cleanHtml = html
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\xa0/g, " ");

  const div = document.createElement("div");
  div.innerHTML = cleanHtml.trim();
  
  return formatNode(div, 0).trim();
}

function formatNode(node: Node, level: number): string {
  const indent = "  ".repeat(level);
  let result = "";
  
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tagName = el.tagName.toLowerCase();
      
      const isBlock = [
        "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", 
        "ul", "ol", "li", "blockquote", "pre", 
        "table", "thead", "tbody", "tr", "td", "th", 
        "section", "article"
      ].includes(tagName);
      
      // Get outer HTML attributes representation
      let attrs = "";
      for (let j = 0; j < el.attributes.length; j++) {
        const attr = el.attributes[j];
        attrs += ` ${attr.name}="${attr.value}"`;
      }
      
      // Self-closing elements
      const isSelfClosing = ["img", "br", "hr", "input"].includes(tagName);
      if (isSelfClosing) {
        result += `\n${indent}<${tagName}${attrs} />`;
      } else {
        const childrenContent = formatNode(el, level + 1);
        const hasBlockChildren = Array.from(el.childNodes).some(
          (c) =>
            c.nodeType === Node.ELEMENT_NODE &&
            [
              "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", 
              "ul", "ol", "li", "blockquote", "pre", 
              "table", "thead", "tbody", "tr", "td", "th", 
              "section", "article"
            ].includes(c.nodeName.toLowerCase())
        );
        
        if (hasBlockChildren || childrenContent.includes("\n")) {
          let formattedChildren = childrenContent;
          if (!formattedChildren.startsWith("\n")) {
            formattedChildren = "\n" + formattedChildren;
          }
          if (!formattedChildren.endsWith("\n" + indent)) {
            formattedChildren = formattedChildren.replace(/\n+$/, "") + "\n" + indent;
          }
          result += `\n${indent}<${tagName}${attrs}>${formattedChildren}</${tagName}>`;
        } else {
          const inlineText = childrenContent.trim();
          if (isBlock) {
            result += `\n${indent}<${tagName}${attrs}>${inlineText}</${tagName}>`;
          } else {
            result += `<${tagName}${attrs}>${inlineText}</${tagName}>`;
          }
        }
      }
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || "";
      if (text.trim() !== "") {
        result += text;
      }
    }
  }
  
  return result;
}

export function getAltFromFilename(urlOrPath: string | null | undefined): string {
  if (!urlOrPath) return "";
  
  const filename = urlOrPath.substring(urlOrPath.lastIndexOf("/") + 1);
  const dotIndex = filename.lastIndexOf(".");
  const baseName = dotIndex !== -1 ? filename.substring(0, dotIndex) : filename;
  const cleanName = baseName.replace(/-\d+$/, "");
  const altText = cleanName.replace(/[-_]+/g, " ").trim();
  
  return altText;
}
