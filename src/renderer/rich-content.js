function createReadingImage(document, { image, alt }) {
  if (image) {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, Math.sqrt(16000000 / (image.naturalWidth * image.naturalHeight)));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', alt);
    try {
      const context = canvas.getContext('2d');
      if (context) {
        // Draw the decoded resource without assigning another image address or reading its pixels.
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas;
      }
    } catch {
      // A native image can become unavailable before it is drawn.
    }
  }
  const fallback = document.createElement('span');
  fallback.className = 'zdr-image-fallback';
  fallback.textContent = '图片未加载 · ' + alt;
  return fallback;
}

function appendRichContent(document, parent, nodes) {
  for (const record of nodes) {
    if (typeof record === 'string') {
      parent.append(document.createTextNode(record));
      continue;
    }
    if (record.tag === 'img') {
      parent.append(createReadingImage(document, record));
      continue;
    }
    if (!richTextTags.has(record.tag)) continue;

    const element = record.tag === 'a' ? createReaderLink(document, record.href, '') : document.createElement(record.tag);
    if (record.tag === 'ol') {
      if (record.start !== null) element.setAttribute('start', String(record.start));
      if (record.reversed) element.setAttribute('reversed', '');
    }
    if (record.tag === 'li' && record.value !== null) element.setAttribute('value', String(record.value));
    appendRichContent(document, element, record.children);
    parent.append(element);
  }
}
