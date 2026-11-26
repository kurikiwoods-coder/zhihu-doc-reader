// ==UserScript==
// @name         Zhihu Doc Reader M00-B DOM Probe
// @namespace    https://github.com/kurikiwoods-coder/zhihu-doc-reader/validation
// @version      0.0.1
// @description  Isolated M00-B read-only DOM and test-marker probe
// @match        https://www.zhihu.com/
// @match        https://www.zhihu.com/follow*
// @match        https://www.zhihu.com/hot*
// @match        https://www.zhihu.com/search*
// @match        https://www.zhihu.com/question/*
// @match        https://zhuanlan.zhihu.com/p/*
// @run-at       document-idle
// @noframes
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @downloadURL  none
// ==/UserScript==

(() => {
  'use strict';

  const panelId = 'zdr-m00-b-probe';
  const storageKey = 'zdr:m00-b:fixture-marker';
  const marker = 'm00-b-synthetic-v1';
  const queueLimit = 100;
  const listFields = {
    title: '.ContentItem-title, h2, h3',
    author: '.AuthorInfo-name, .ContentItem-author',
    excerpt: '.RichContent-inner, .ContentItem-excerpt',
  };
  const sources = {
    home: { ...listFields, cards: '#TopstoryContent .TopstoryItem' },
    follow: { ...listFields, cards: '.FollowFeed .ContentItem, .Moments .ContentItem' },
    hot: {
      cards: '.HotList .HotItem, .HotItem',
      title: '.HotItem-title',
      excerpt: '.HotItem-excerpt',
    },
    search: { ...listFields, cards: '.SearchMain .SearchResult-Card, .SearchMain .List-item .ContentItem' },
    question: {
      cards: '.QuestionAnswers-answers .AnswerItem, .QuestionAnswer-content .AnswerItem, .AnswerItem',
      author: '.AuthorInfo-name',
      body: '.RichContent-inner .RichText, .RichContent-inner.RichText',
    },
    article: {
      cards: 'article.Post-Main',
      title: '.Post-Title',
      author: '.Post-Author .AuthorInfo-name',
      body: '.Post-RichText',
    },
  };

  function pageKind(url) {
    if (url.protocol !== 'https:' || url.port) return '';
    if (url.hostname === 'zhuanlan.zhihu.com') {
      return /^\/p\/\d+\/?$/.test(url.pathname) ? 'article' : '';
    }
    if (url.hostname !== 'www.zhihu.com') return '';
    if (url.pathname === '/') return 'home';
    if (/^\/question\/\d+(?:\/answer\/\d+)?\/?$/.test(url.pathname)) return 'question';
    const route = url.pathname.replace(/\/$/, '');
    return ['/hot', '/follow', '/search'].includes(route) ? route.slice(1) : '';
  }

  function visible(element) {
    return element
      && !element.closest('[hidden], [aria-hidden="true"]')
      && element.getClientRects().length > 0
      && getComputedStyle(element).visibility === 'visible';
  }

  function firstVisible(root, selector) {
    if (!selector) return undefined;
    return Array.from(root.querySelectorAll(selector)).find(visible);
  }

  function visibleText(element) {
    return element?.innerText?.trim() ?? '';
  }

  function contentLink(raw) {
    if (!raw?.trim()) return null;
    let parsed;
    try { parsed = new URL(raw, location.href); } catch { return null; }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port) return null;

    const path = parsed.pathname.replace(/\/$/, '');
    let type;
    if (parsed.hostname === 'www.zhihu.com') {
      if (/^\/question\/\d+\/answer\/\d+$/.test(path)) type = 'answer';
      else if (/^\/question\/\d+$/.test(path)) type = 'question';
      else if (/^\/pin\/\d+$/.test(path)) type = 'pin';
    } else if (parsed.hostname === 'zhuanlan.zhihu.com' && /^\/p\/\d+$/.test(path)) {
      type = 'article';
    }
    return type ? { type, url: parsed.origin + path } : null;
  }

  function cardLink(card, title, kind, cardCount, pageUrl) {
    if (kind === 'article') return contentLink(pageUrl.href);

    const currentQuestion = pageUrl.pathname.match(/^\/question\/\d+/)?.[0];
    const titleLink = title?.closest('a[href]') ?? title?.querySelector('a[href]');
    const sourceNodes = kind === 'question'
      ? 'meta[itemprop="url"][content], .ContentItem-time a[href]'
      : 'meta[itemprop="url"][content]';
    for (const node of [titleLink, ...card.querySelectorAll(sourceNodes)]) {
      if (!node || (node.tagName !== 'META' && !visible(node))) continue;
      const link = contentLink(node.getAttribute('href') ?? node.getAttribute('content'));
      if (!link) continue;
      if (kind !== 'question' || (link.type === 'answer' && new URL(link.url).pathname.startsWith(currentQuestion + '/answer/'))) {
        return link;
      }
    }
    const direct = contentLink(pageUrl.href);
    return kind === 'question' && cardCount === 1 && direct?.type === 'answer' ? direct : null;
  }

  function imageCounts(body) {
    const images = Array.from(body?.querySelectorAll('img') ?? []).filter(visible);
    return {
      total: images.length,
      loaded: images.filter(image => image.complete && image.naturalWidth > 0).length,
      failed: images.filter(image => image.complete && image.naturalWidth === 0).length,
      pending: images.filter(image => !image.complete).length,
    };
  }

  function scan() {
    const pageUrl = new URL(location.href);
    const kind = pageKind(pageUrl);
    if (!kind) return { kind, status: 'unsupported', matches: 0, items: [] };
    if (/安全验证|人机验证/.test(document.title) || firstVisible(document, '#captcha, .Captcha')) {
      return { kind, status: 'restricted', matches: 0, items: [] };
    }

    const loginDialog = firstVisible(document, '[aria-modal="true"], .SignFlowModal');
    if (/登录/.test(visibleText(loginDialog))) {
      return { kind, status: 'login-required', matches: 0, items: [] };
    }

    const rules = sources[kind];
    const cards = Array.from(document.querySelectorAll(rules.cards)).filter(visible);
    const items = new Map();
    for (const card of cards) {
      const title = kind === 'question' ? firstVisible(document, '.QuestionHeader-title') : firstVisible(card, rules.title);
      const label = visibleText(title);
      const link = cardLink(card, title, kind, cards.length, pageUrl);
      if (!label || !link || items.has(link.url)) continue;
      const body = firstVisible(card, rules.body);
      items.set(link.url, {
        ...link,
        title: label,
        author: visibleText(firstVisible(card, rules.author)),
        excerpt: visibleText(firstVisible(card, rules.excerpt)),
        body: visibleText(body),
        images: imageCounts(body),
      });
      if (items.size === queueLimit) break;
    }

    const records = Array.from(items.values());
    if (records.length) {
      const missingBody = rules.body && records.every(item => !item.body);
      return { kind, status: missingBody ? 'body-missing' : 'available', matches: cards.length, items: records };
    }
    const text = visibleText(document.body);
    let status = 'content-missing';
    if (/登录知乎.{0,6}您可以享受以下权益|登录后查看|请先登录/.test(text)) status = 'login-required';
    else if (kind === 'search' && /没有找到|未找到相关|暂无搜索结果/.test(text)) status = 'empty-search';
    return { kind, status, matches: cards.length, items: [] };
  }

  if (!pageKind(new URL(location.href)) || !document.body || document.getElementById(panelId)) return;

  const messages = {
    available: '已读取当前已加载 DOM',
    'body-missing': '已识别原文链接，当前正文缺失',
    'content-missing': '当前没有可读取条目，保留原生页面',
    'empty-search': '原生页面显示空搜索结果',
    'login-required': '原生页面要求登录，停止读取',
    restricted: '原生页面要求安全验证，停止读取',
    unsupported: '当前路径不在验证范围内',
  };
  const panel = document.createElement('aside');
  panel.id = panelId;
  panel.setAttribute('aria-label', 'M00-B 验证');
  Object.assign(panel.style, {
    position: 'fixed', right: '1rem', bottom: '1rem', zIndex: '9999',
    width: 'min(24rem, calc(100vw - 2rem))', maxHeight: '50vh', overflow: 'auto',
    background: '#fff', color: '#222', padding: '0.75rem', border: '1px solid #aaa',
  });

  const metrics = document.createElement('pre');
  const status = document.createElement('output');
  const markerStatus = document.createElement('output');
  markerStatus.dataset.storage = '';
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  const content = document.createElement('pre');
  content.style.whiteSpace = 'pre-wrap';
  const original = document.createElement('a');
  original.textContent = '打开当前原文';
  original.target = '_blank';
  original.rel = 'noopener noreferrer';
  summary.textContent = '本机核对当前条目';
  details.append(summary, original, content);
  panel.append(metrics, status, markerStatus, details);

  const labels = Object.entries({
    scan: '读取当前 DOM', prev: '上一条', next: '下一条',
    write: '写测试标记', read: '读测试标记', clear: '清测试标记', close: '关闭验证面板',
  });
  const buttons = Object.fromEntries(labels.map(([action, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = action;
    button.textContent = label;
    panel.appendChild(button);
    return [action, button];
  }));
  document.body.appendChild(panel);

  let result;
  let pageHref;
  let index;

  function display() {
    const item = result.items[index];
    metrics.textContent = [
      '页面 ' + (result.kind || 'unsupported') + ' · ' + messages[result.status],
      '候选容器 ' + result.matches + ' · 队列 ' + result.items.length + ' · 当前 ' + (item ? index + 1 : 0),
      item ? '类型 ' + item.type + ' · 正文字符 ' + item.body.length + ' · 图片 ' + item.images.total
        + ' / 成功 ' + item.images.loaded + ' / 失败 ' + item.images.failed + ' / 待加载 ' + item.images.pending : '',
    ].filter(Boolean).join('\n');
    Object.assign(panel.dataset, {
      kind: result.kind, status: result.status, count: String(result.items.length), index: String(item ? index : -1),
    });
    details.hidden = !item;
    content.textContent = item ? [item.title, item.author, item.excerpt, item.body].filter(Boolean).join('\n\n') : '';
    if (item) original.href = item.url;
    else original.removeAttribute('href');
    buttons.prev.disabled = !item || index === 0;
    buttons.next.disabled = !item || index >= result.items.length - 1;
  }

  function refresh() {
    result = scan();
    pageHref = location.href;
    index = 0;
    status.textContent = '';
    display();
  }

  function markChanged() {
    if (location.href !== pageHref) {
      pageHref = location.href;
      const kind = pageKind(new URL(pageHref));
      result = { kind, status: kind ? 'content-missing' : 'unsupported', matches: 0, items: [] };
      index = 0;
      display();
    }
    const message = '原生页面已变化，可重新读取 DOM';
    if (status.textContent !== message) status.textContent = message;
  }

  function useMarker(action) {
    if (typeof GM_getValue !== 'function' || typeof GM_setValue !== 'function' || typeof GM_deleteValue !== 'function') {
      markerStatus.textContent = 'GM Storage 不可用';
      return;
    }
    try {
      if (action === 'write') GM_setValue(storageKey, marker);
      if (action === 'clear') GM_deleteValue(storageKey);
      markerStatus.textContent = GM_getValue(storageKey, null) === marker ? '测试标记存在' : '测试标记不存在';
    } catch {
      markerStatus.textContent = 'GM Storage 读写失败';
    }
  }

  function disconnect() {
    observer.disconnect();
    window.removeEventListener('popstate', markChanged);
  }

  const observer = new MutationObserver(records => {
    if (!panel.isConnected) {
      disconnect();
    } else if (records.some(record => !panel.contains(record.target))) {
      markChanged();
    }
  });

  panel.addEventListener('click', event => {
    const action = event.target.closest?.('button[data-action]')?.dataset.action;
    if (action === 'scan') refresh();
    else if (action === 'prev' || action === 'next') {
      if (location.href !== pageHref) { markChanged(); return; }
      const next = index + (action === 'prev' ? -1 : 1);
      if (next < 0 || next >= result.items.length) return;
      index = next;
      display();
    } else if (action === 'close') {
      disconnect();
      panel.remove();
    } else if (['write', 'read', 'clear'].includes(action)) useMarker(action);
  });
  original.addEventListener('click', event => {
    if (location.href === pageHref) return;
    event.preventDefault();
    markChanged();
  });

  refresh();
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener('popstate', markChanged);
})();
