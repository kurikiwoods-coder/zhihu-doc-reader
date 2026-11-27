// Keep the audited upstream article container and the native shapes verified in M00-B.
const listTitle = '.ContentItem-title, h2, h3';
const listExcerpt = '.ContentItem-excerpt, .RichContent-inner';
const profiles = {
  home: { cards: '#TopstoryContent .TopstoryItem', title: listTitle, excerpt: listExcerpt },
  follow: {
    cards: '.FollowFeed .ContentItem, .Moments .ContentItem, .Topstory-follow .TopstoryItem-isFollow .ContentItem',
    title: listTitle, excerpt: listExcerpt,
  },
  hot: { cards: '.HotList .HotItem, .HotItem', title: '.HotItem-title', excerpt: '.HotItem-excerpt' },
  search: {
    cards: '.SearchMain .SearchResult-Card, .SearchMain .List-item .ContentItem',
    title: listTitle, excerpt: listExcerpt,
  },
  question: {
    cards: '.QuestionAnswers-answers .AnswerItem, .QuestionAnswer-content .AnswerItem, .AnswerItem',
    title: '.QuestionHeader-title',
    body: '.RichContent-inner .RichText, .RichContent-inner.RichText',
  },
  article: { cards: '.Post-Main', title: '.Post-Title', body: '.Post-RichText' },
};

function isRendered(element, view) {
  return Boolean(element &&
    !element.closest('[hidden], [aria-hidden="true"]') &&
    element.getClientRects().length &&
    view.getComputedStyle(element).visibility === 'visible');
}

function firstRendered(root, selector, view) {
  return Array.from(root.querySelectorAll(selector)).find(element => isRendered(element, view));
}

function accessLimited(document, view) {
  return /安全验证|人机验证|请求参数异常/.test(document.title) ||
    Boolean(firstRendered(document, '#captcha, .Captcha, .SignFlowModal, .Paywall', view));
}

function boundedText(node, length) {
  return node?.innerText?.replace(/\s+/g, ' ').trim().slice(0, length) || null;
}

function contentAddress(address, base) {
  if (!address) return null;
  try {
    const url = new URL(address, base);
    const route = identifyRoute(url.href);
    if (route?.contentId) return route;
    const pin = /^\/pin\/(\d+)\/?$/.exec(url.pathname);
    if (pin && url.origin === 'https://www.zhihu.com' && !url.username && !url.password) {
      return { contentId: pin[1], contentType: 'pin', sourceUrl: url.origin + '/pin/' + pin[1] };
    }
  } catch {
    // Malformed or missing links stay absent in the record.
  }
  return null;
}

function answerAddress(card, route) {
  const meta = card.querySelector('meta[itemprop="url"][content]');
  const link = card.querySelector('.ContentItem-time a[href]');
  const address = contentAddress(meta?.getAttribute('content') || link?.getAttribute('href'), route.sourceUrl);
  const questionUrl = route.sourceUrl.split('/answer/')[0];
  return address?.contentType === 'answer' && address.sourceUrl.startsWith(questionUrl + '/answer/')
    ? address
    : null;
}

function cardAddress(card, heading, view, route) {
  const link = heading.closest('a[href]') || firstRendered(heading, 'a[href]', view);
  if (!link || !card.contains(link)) return null;
  return contentAddress(link.getAttribute('href'), route.sourceUrl);
}

function publishedText(card, view) {
  const published = card.querySelector('[itemprop="datePublished"]');
  const value = published?.getAttribute('datetime') ?? published?.getAttribute('content');
  if (value && /^\d{4}-\d{2}-\d{2}(?:T[\d:.+Z-]+)?$/.test(value) && Number.isFinite(Date.parse(value))) return value;
  const label = boundedText(firstRendered(card, '.Post-Time, .ContentItem-time', view), 80);
  return label?.startsWith('发布于') ? label.slice(3).trim() || null : null;
}

function readFullBody(card, selector, view, sourceUrl) {
  const element = firstRendered(card, selector, view);
  if (!element || !isUnclippedBody(element, card, view)) return null;
  const content = captureRichChildren(element, view, sourceUrl);
  return hasReadableContent(content) ? content : null;
}

// List routes return a bounded preview. Detail routes require a loaded, readable body.
function readNativePage(document, view, route) {
  if (!route) return { status: 'unsupported', record: null };
  if (accessLimited(document, view)) return { status: 'restricted', record: null };
  const profile = profiles[route.kind];
  for (const card of document.querySelectorAll(profile.cards)) {
    if (!isRendered(card, view)) continue;
    const answer = route.kind === 'question' ? answerAddress(card, route) : null;
    if (route.contentType === 'answer' && answer?.sourceUrl !== route.sourceUrl) continue;
    const heading = firstRendered(route.kind === 'question' ? document : card, profile.title, view);
    const title = profile.body ? heading?.innerText?.trim() : boundedText(heading, 160);
    if (!title) continue;
    const source = answer || (route.contentId ? route : cardAddress(card, heading, view, route));
    const content = profile.body ? readFullBody(card, profile.body, view, source.sourceUrl) : null;
    if (profile.body && !content) continue;
    return {
      status: 'ready',
      record: {
        contentId: source?.contentId ?? null,
        contentType: source?.contentType ?? null,
        title,
        author: boundedText(firstRendered(card, '.AuthorInfo-name, .ContentItem-author', view), 80),
        sourceUrl: source?.sourceUrl ?? null,
        excerpt: profile.excerpt ? boundedText(firstRendered(card, profile.excerpt, view), 240) : null,
        content,
        contentHtml: null,
        publishedAt: profile.body ? publishedText(card, view) : null,
        fetchedAt: new Date().toISOString(),
      },
    };
  }
  return { status: 'unavailable', record: null };
}
