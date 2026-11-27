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
    excerpt: '.RichContent-inner .RichText, .RichContent-inner.RichText',
  },
  article: { cards: '.Post-Main', title: '.Post-Title', excerpt: '.Post-RichText' },
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
  return /安全验证|人机验证/.test(document.title) ||
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

// Deliberately bounded preview records. M02 owns full and sanitized rich-text rendering.
function readNativePage(document, view, route) {
  if (!route) return { status: 'unsupported', record: null };
  if (accessLimited(document, view)) return { status: 'restricted', record: null };
  const profile = profiles[route.kind];
  for (const card of document.querySelectorAll(profile.cards)) {
    if (!isRendered(card, view)) continue;
    const answer = route.kind === 'question' ? answerAddress(card, route) : null;
    if (route.contentType === 'answer' && answer?.sourceUrl !== route.sourceUrl) continue;
    const heading = firstRendered(route.kind === 'question' ? document : card, profile.title, view);
    const title = boundedText(heading, 160);
    const excerpt = boundedText(firstRendered(card, profile.excerpt, view), 240);
    if (!title || (route.contentId && !excerpt)) continue;

    const source = answer || (route.contentId ? route : cardAddress(card, heading, view, route));
    return {
      status: 'ready',
      record: {
        contentId: source?.contentId ?? null,
        contentType: source?.contentType ?? null,
        title,
        author: boundedText(firstRendered(card, '.AuthorInfo-name, .ContentItem-author', view), 80),
        sourceUrl: source?.sourceUrl ?? null,
        excerpt,
        contentHtml: null,
        publishedAt: null,
        fetchedAt: new Date().toISOString(),
      },
    };
  }
  return { status: 'unavailable', record: null };
}
