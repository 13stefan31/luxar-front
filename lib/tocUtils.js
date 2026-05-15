export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function parseTocFromHtml(html) {
  if (!html) return [];
  const toc = [];
  const regex = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const rawText = match[2].replace(/<[^>]+>/g, "").trim();
    if (!rawText) continue;
    const id = slugify(rawText);
    if (level === 2) {
      toc.push({ id, label: rawText, children: [] });
    } else {
      if (toc.length > 0) {
        toc[toc.length - 1].children.push({ id, label: rawText });
      } else {
        toc.push({ id, label: rawText, children: [] });
      }
    }
  }
  return toc;
}

export function injectHeadingIds(html) {
  if (!html) return html;
  const counts = {};
  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, content) => {
    if (/\bid=/.test(attrs)) return match;
    const rawText = content.replace(/<[^>]+>/g, "").trim();
    if (!rawText) return match;
    let id = slugify(rawText);
    if (counts[id] !== undefined) {
      counts[id]++;
      id = `${id}-${counts[id]}`;
    } else {
      counts[id] = 0;
    }
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });
}
