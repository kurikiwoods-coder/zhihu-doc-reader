const richTextTags = new Set([
  'p', 'div', 'span', 'section', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i',
  'blockquote', 'ol', 'ul', 'li', 'pre', 'code', 'figure', 'figcaption', 'a', 'br', 'hr',
  'sup', 'sub', 's', 'del', 'u', 'mark', 'kbd',
]);
const discardedRichTags = new Set([
  'script', 'style', 'template', 'noscript', 'iframe', 'object', 'embed', 'video', 'audio',
  'source', 'svg', 'math', 'canvas', 'form', 'input', 'select', 'textarea', 'button',
  'details', 'dialog',
]);

function safeRichLink(address, base) {
  if (!address?.trim()) return null;
  try {
    let target = new URL(address, base);
    if (target.origin === 'https://link.zhihu.com') {
      const direct = target.searchParams.get('target');
      if (!direct) return null;
      target = new URL(direct);
      if (target.hostname === 'link.zhihu.com') return null;
    }
    return ['https:', 'http:'].includes(target.protocol) && !target.username && !target.password ? target.href : null;
  } catch {
    return null;
  }
}

function wholeNumberAttribute(element, name) {
  const raw = element.getAttribute(name);
  if (!raw || !/^-?\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
}

function richElementVisible(element, view) {
  if (element.matches('[hidden], [aria-hidden="true"], [inert]')) return false;
  const style = view.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.visibility !== 'collapse' &&
    style.contentVisibility !== 'hidden' && style.opacity !== '0';
}

function captureRichChildren(root, view, base) {
  const result = [];

  for (const child of root.childNodes) {
    if (child.nodeType === 3) {
      result.push(child.textContent);
      continue;
    }
    if (child.nodeType !== 1 || child.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;
    const tag = child.localName;
    if (discardedRichTags.has(tag) || !richElementVisible(child, view)) continue;
    if (tag === 'img') {
      const alt = child.getAttribute('alt')?.trim() || '原文图片';
      const image = child.complete && child.naturalWidth > 0 && child.naturalHeight > 0 ? child : null;
      result.push({ tag, alt, image });
      continue;
    }

    const children = captureRichChildren(child, view, base);
    if (!richTextTags.has(tag)) {
      result.push(...children);
      continue;
    }
    const record = { tag, children };
    if (tag === 'a') {
      record.href = safeRichLink(child.getAttribute('href'), base);
      if (!record.href) {
        result.push(...children);
        continue;
      }
    }
    if (tag === 'ol') {
      record.start = wholeNumberAttribute(child, 'start');
      record.reversed = child.hasAttribute('reversed');
    }
    if (tag === 'li') record.value = wholeNumberAttribute(child, 'value');
    result.push(record);
  }
  return result;
}

function hasReadableContent(nodes) {
  return nodes.some(node => {
    if (typeof node === 'string') return Boolean(node.trim());
    if (node.tag === 'img') return Boolean(node.image);
    return hasReadableContent(node.children);
  });
}

function isUnclippedBody(element, card, view) {
  if (element.closest('.RichContent--collapsed, .RichContent--unescapable, [data-collapsed="true"]')) return false;
  if (firstRendered(card, '.ContentItem-expandButton, .RichContent-expandButton', view)) return false;
  for (let node = element; node && card.contains(node); node = node.parentElement) {
    const style = view.getComputedStyle(node);
    const clips = style.overflowY === 'hidden' || style.overflowY === 'clip' ||
      Number.parseInt(style.webkitLineClamp, 10) > 0;
    if (clips && node.clientHeight > 0 && node.scrollHeight > node.clientHeight + 1) return false;
  }
  return true;
}
