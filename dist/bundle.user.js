// ==UserScript==
// @name         Zhihu Doc Reader
// @namespace    https://github.com/kurikiwoods-coder/zhihu-doc-reader
// @version      0.0.1
// @description  DOM-only foundation for the Zhihu document reader
// @match        https://www.zhihu.com/*
// @match        https://zhuanlan.zhihu.com/p/*
// @run-at       document-idle
// @noframes
// @grant        none
// @updateURL    none
// @downloadURL  none
// ==/UserScript==

/*
MIT License

Copyright (c) 2026 connectedGraph

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(() => {
  'use strict';
const READER_CSS = "/* Owner-approved V1.0 initial design baseline. Visual revisions follow PDT V1.3. */\n.zdr-reader {\n  --zdr-header-height: 56px;\n  --zdr-header-padding-block: 0px;\n  --zdr-header-padding-inline: 20px;\n  --zdr-sidebar-width: 224px;\n  --zdr-sidebar-collapsed-width: 52px;\n  --zdr-sidebar-padding: 12px;\n  --zdr-outline-width: 200px;\n  --zdr-outline-padding: 12px;\n  --zdr-outline-indent: 12px;\n  --zdr-content-width: 768px;\n  --zdr-content-width-wide: 960px;\n  --zdr-content-width-full: 100%;\n  --zdr-content-padding-inline: 24px;\n  --zdr-content-padding-inline-compact: 16px;\n  --zdr-content-padding-block: 32px;\n  --zdr-nav-row-height: 36px;\n  --zdr-selected-marker-width: 3px;\n  --zdr-anchor-offset: calc(var(--zdr-header-height) + 12px);\n  --zdr-font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif;\n  --zdr-font-size: 17px;\n  --zdr-line-height: 1.7;\n  --zdr-text-weight: 400;\n  --zdr-title-size: 32px;\n  --zdr-title-line-height: 1.25;\n  --zdr-title-weight: 700;\n  --zdr-h1-size: 24px;\n  --zdr-h1-line-height: 1.4;\n  --zdr-h2-size: 20px;\n  --zdr-h2-line-height: 1.45;\n  --zdr-h3-size: 18px;\n  --zdr-h3-line-height: 1.5;\n  --zdr-heading-weight: 600;\n  --zdr-heading-letter-spacing: normal;\n  --zdr-heading-gap-before: 28px;\n  --zdr-heading-gap-after: 8px;\n  --zdr-paragraph-gap: 12px;\n  --zdr-block-gap: 16px;\n  --zdr-quote-padding-block: 10px;\n  --zdr-quote-padding-inline: 16px;\n  --zdr-quote-rule-width: 3px;\n  --zdr-list-indent: 24px;\n  --zdr-list-item-gap: 4px;\n  --zdr-code-font-family: ui-monospace, SFMono-Regular, Consolas, \"Liberation Mono\", monospace;\n  --zdr-code-font-size: 14px;\n  --zdr-code-line-height: 1.55;\n  --zdr-inline-code-padding-block: 2px;\n  --zdr-inline-code-padding-inline: 4px;\n  --zdr-inline-code-radius: 4px;\n  --zdr-code-block-padding: 16px;\n  --zdr-image-max-width: 100%;\n  --zdr-image-radius: 8px;\n  --zdr-caption-gap: 8px;\n  --zdr-caption-font-size: 13px;\n  --zdr-caption-line-height: 1.5;\n  --zdr-link-underline-offset: 3px;\n  --zdr-border-width: 1px;\n  --zdr-radius: 8px;\n  --zdr-focus-ring-width: 2px;\n  --zdr-focus-ring-offset: 2px;\n  --zdr-background: #F7F8FA;\n  --zdr-surface: #FFFFFF;\n  --zdr-navigation-background: #EFF2F6;\n  --zdr-outline-background: #F7F8FA;\n  --zdr-text: #1F2937;\n  --zdr-text-secondary: #526071;\n  --zdr-primary: #284B97;\n  --zdr-border: #D9E0E9;\n  --zdr-hover: #E8EEF6;\n  --zdr-selected: #DDE8FB;\n  --zdr-selected-text: #203F77;\n  --zdr-focus-color: #284B97;\n  --zdr-quote-background: #EEF3FA;\n  --zdr-quote-rule-color: #5375A4;\n  --zdr-code-background: #EEF2F7;\n  --zdr-shadow-overlay: 0 8px 24px rgba(18, 29, 52, 0.14);\n}\n\n.zdr-reader[data-zdr-theme=\"dark\"] {\n  --zdr-background: #111821;\n  --zdr-surface: #181F2A;\n  --zdr-navigation-background: #141C29;\n  --zdr-outline-background: #111821;\n  --zdr-text: #E8ECF4;\n  --zdr-text-secondary: #B1BBCB;\n  --zdr-primary: #ADC5FF;\n  --zdr-border: #3B4658;\n  --zdr-hover: #243248;\n  --zdr-selected: #29385B;\n  --zdr-selected-text: #C6D7FF;\n  --zdr-focus-color: #ADC5FF;\n  --zdr-quote-background: #202B3D;\n  --zdr-quote-rule-color: #8CA8DE;\n  --zdr-code-background: #202B3D;\n  --zdr-shadow-overlay: 0 8px 24px rgba(0, 0, 0, 0.38);\n}\n\n.zdr-reader.zdr-launcher {\n  position: fixed;\n  inset-inline-end: var(--zdr-content-padding-inline-compact);\n  inset-block-end: var(--zdr-content-padding-inline-compact);\n  z-index: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  gap: var(--zdr-list-item-gap);\n}\n\n.zdr-reader.zdr-verification {\n  box-sizing: border-box;\n  inline-size: min(var(--zdr-content-width), calc(100% - 2 * var(--zdr-content-padding-inline-compact)));\n  max-block-size: calc(100dvh - 2 * var(--zdr-content-padding-inline-compact));\n  padding: var(--zdr-content-padding-inline-compact);\n  overflow: auto;\n}\n\n.zdr-reader [data-zdr-region=\"topbar\"] {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  align-items: center;\n  gap: var(--zdr-sidebar-padding);\n}\n\n.zdr-reader [data-zdr-region=\"document\"] {\n  padding-block-start: var(--zdr-block-gap);\n  overflow-wrap: anywhere;\n}\n\n.zdr-reader {\n  font-family: var(--zdr-font-family);\n  font-size: var(--zdr-font-size);\n  font-weight: var(--zdr-text-weight);\n  line-height: var(--zdr-line-height);\n  color: var(--zdr-text);\n}\n\n.zdr-reader h2 {\n  font-size: var(--zdr-h2-size);\n  font-weight: var(--zdr-heading-weight);\n  line-height: var(--zdr-h2-line-height);\n}\n\n.zdr-reader button {\n  font: inherit;\n}\n\n.zdr-reader [role=\"status\"] {\n  color: var(--zdr-text-secondary);\n  font-size: var(--zdr-caption-font-size);\n  line-height: var(--zdr-caption-line-height);\n}\n\n.zdr-reader.zdr-verification,\n.zdr-reader button,\n.zdr-reader.zdr-launcher [role=\"status\"] {\n  color: var(--zdr-text);\n  background: var(--zdr-surface);\n  border: var(--zdr-border-width) solid var(--zdr-border);\n  border-radius: var(--zdr-radius);\n}\n\n.zdr-reader button {\n  min-block-size: var(--zdr-nav-row-height);\n  padding-inline: var(--zdr-sidebar-padding);\n  cursor: pointer;\n}\n\n.zdr-reader button:hover {\n  background: var(--zdr-hover);\n}\n\n.zdr-reader button:focus-visible {\n  outline: var(--zdr-focus-ring-width) solid var(--zdr-focus-color);\n  outline-offset: var(--zdr-focus-ring-offset);\n}\n\n.zdr-reader.zdr-launcher [role=\"status\"] {\n  padding: var(--zdr-list-item-gap);\n}\n\n.zdr-reader.zdr-launcher [role=\"status\"]:empty {\n  display: none;\n}";

// src/adapters/route.js
// URL routing is adapted from the audited upstream helpers and M00-B DOM probe.
const indexRoutes = new Map([
  ['/', 'home'],
  ['/follow', 'follow'],
  ['/hot', 'hot'],
  ['/search', 'search'],
]);

function identifyRoute(href) {
  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.port || url.username || url.password) return null;

  const pathname = url.pathname.replace(/\/$/, '') || '/';
  const key = url.origin + pathname + url.search;
  if (url.hostname === 'zhuanlan.zhihu.com') {
    const article = /^\/p\/(\d+)$/.exec(pathname);
    return article && {
      kind: 'article', key, sourceUrl: url.origin + pathname, contentId: article[1], contentType: 'article',
    };
  }
  if (url.hostname !== 'www.zhihu.com') return null;

  const kind = indexRoutes.get(pathname);
  if (kind) {
    return { kind, key, sourceUrl: kind === 'search' ? key : url.origin + pathname, contentId: null, contentType: null };
  }
  const question = /^\/question\/(\d+)(?:\/answer\/(\d+))?$/.exec(pathname);
  return question && {
    kind: 'question', key, sourceUrl: url.origin + pathname,
    contentId: question[2] ?? question[1], contentType: question[2] ? 'answer' : 'question',
  };
}

// src/adapters/dom.js
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

// src/core/state.js
function createReaderState() {
  let route = null;
  let open = false;
  return {
    get route() { return route; },
    get isOpen() { return open; },
    setRoute(next) {
      if (route?.key === next?.key) return false;
      route = next;
      open = false;
      return true;
    },
    enter() {
      if (!route || open) return false;
      open = true;
      return true;
    },
    exit() {
      open = false;
    },
  };
}
})();
