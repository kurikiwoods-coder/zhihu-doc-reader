import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { getEventListeners } from 'node:events';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { createContext, Script } from 'node:vm';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const helper = process.argv[2];
assert.ok(helper, 'Pass the pinned LinkeDOM worker.mjs path as the first argument');
const lock = JSON.parse(await read('tests/browser-fixture.lock.json'));
assert.equal(createHash('sha256').update(await readFile(helper)).digest('hex'), lock.sha256);
const { parseHTML } = await import(pathToFileURL(resolve(helper)).href);
const fixtures = parseHTML(await read('validation/m00-b/fixtures/native-shapes.html')).document;
const bundle = new Script(await read('dist/bundle.user.js'), { filename: 'bundle.user.js' });
const adapter = new Script([
  await read('src/adapters/route.js'),
  await read('src/adapters/rich-content.js'),
  await read('src/adapters/dom.js'),
  'readNativePage(document, window, identifyRoute(window.location.href));',
].join('\n'));

const launcherID = '#zdr-launcher-root';
const readerID = '#zdr-reader-root';
const instance = Symbol.for('zhihu-doc-reader:controller');
const zhihu = 'https://www.zhihu.com';
const question = zhihu + '/question/990050';
const article = 'https://zhuanlan.zhihu.com/p/990041';
const search = zhihu + '/search?type=content&q=fixture';
const richFixture = await read('validation/m02/fixtures/rich-article.html');
const sample = name => name === 'rich-article' ? richFixture : fixtures.getElementById(name).innerHTML;

function load(name, href, { modalError = false, navigation = true, frame = false } = {}) {
  const { document, Event, Element } = parseHTML(
    '<!doctype html><html><head><title>合成样本</title></head><body><div id="native">' +
    sample(name) + '</div></body></html>',
  );
  if (!Element.prototype.getClientRects) {
    Object.defineProperty(Element.prototype, 'getClientRects', { value() { return [{}]; } });
  }
  if (!Element.prototype.getBoundingClientRect) {
    Object.defineProperty(Element.prototype, 'getBoundingClientRect', { value() { return { top: 0 }; } });
  }
  const native = document.getElementById('native');
  const loadedImage = native.querySelector('[data-fixture-image="loaded"]');
  if (loadedImage) {
    Object.defineProperties(loadedImage, {
      complete: { value: true },
      naturalWidth: { value: 360 },
      naturalHeight: { value: 120 },
    });
  }
  const original = native.outerHTML;
  const forbidden = [];
  const window = new EventTarget();
  window.top = frame ? new EventTarget() : window;
  window.location = { href };
  if (navigation) window.navigation = new EventTarget();
  let viewport = 1440;
  const frames = new Map();
  let frameId = 0;
  window.requestAnimationFrame = callback => {
    frames.set(++frameId, callback);
    return frameId;
  };
  window.cancelAnimationFrame = id => frames.delete(id);
  window.getComputedStyle = element => ({
    visibility: 'visible',
    position: element.style.position,
    overflowY: element.style.overflowY,
    webkitLineClamp: element.style.getPropertyValue('-webkit-line-clamp'),
    getPropertyValue(property) {
      if (property === '--zdr-nav-overlay') return viewport < 900 ? '1' : '0';
      if (property === '--zdr-outline-overlay') return viewport < 1200 ? '1' : '0';
      return '';
    },
  });
  for (const key of ['fetch', 'XMLHttpRequest', 'WebSocket', 'localStorage']) {
    Object.defineProperty(window, key, {
      get() { forbidden.push(key); throw new Error('Production fixture accessed ' + key); },
    });
  }
  Object.defineProperty(document, 'cookie', {
    get() { forbidden.push('credential'); throw new Error('Production fixture accessed a credential'); },
  });
  const observers = [];
  window.MutationObserver = class {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }
    observe(target, options) { this.target = target; this.options = options; }
    disconnect() { this.target = null; }
  };
  const mutations = () => observers.filter(observer => observer.target).forEach(observer => observer.callback());
  let focused;
  const drawnImages = [];
  const create = document.createElement.bind(document);
  document.createElement = (tag) => {
    const node = create(tag);
    if (tag === 'button' || /^h[1-6]$/.test(tag)) node.focus = options => { focused = { node, options }; };
    if (tag === 'main') node.scrollTop = 0;
    if (/^h[1-6]$/.test(tag)) {
      Object.defineProperty(node, 'getBoundingClientRect', {
        value() {
          const ordinal = Number(node.id.split('-').at(-1));
          return { top: 64 + ordinal * 100 - (node.closest('main')?.scrollTop || 0) };
        },
      });
    }
    if (tag === 'canvas') {
      node.getContext = () => ({ drawImage(image) { drawnImages.push(image); } });
    }
    if (tag === 'dialog') {
      node.showModal = () => {
        if (modalError) throw new Error('Synthetic modal fault');
        node.open = true;
        node.setAttribute('open', '');
      };
      node.close = () => {
        node.open = false;
        node.removeAttribute('open');
        node.dispatchEvent(new Event('close'));
      };
    }
    return node;
  };
  const context = createContext({ window, document, URL }, { codeGeneration: { strings: false, wasm: false } });
  const run = () => bundle.runInContext(context, { timeout: 1000 });
  const host = selector => document.querySelector(selector);
  const inShell = (selector, child) => host(selector)?.shadowRoot.querySelector(child);
  const press = selector => {
    const button = inShell(selector, selector === readerID ? '[data-zdr-action="exit"]' : 'button');
    assert.ok(button, selector);
    button.dispatchEvent(new Event('click', { bubbles: true }));
  };
  run();
  return {
    adapter: () => adapter.runInContext(context, { timeout: 1000 }),
    document, window, native, original, forbidden, observers, mutations, run, host, inShell, press, drawnImages,
    frames,
    paint() {
      const scheduled = [...frames.values()];
      frames.clear();
      for (const callback of scheduled) callback();
    },
    resize(width) {
      viewport = width;
      window.dispatchEvent(new globalThis.Event('resize'));
    },
    focus: () => focused,
    goto(next, event = 'currententrychange') {
      window.location.href = next;
      if (event === 'mutation') mutations();
      else (event === 'currententrychange' ? window.navigation : window).dispatchEvent(new globalThis.Event(event));
    },
  };
}

const positive = [
  ['home', zhihu + '/', '模拟推荐条目', 'answer', zhihu + '/question/990001/answer/990011'],
  ['follow', zhihu + '/follow', '模拟关注动态', 'pin', zhihu + '/pin/990021'],
  ['hot', zhihu + '/hot', '模拟热榜第一项', 'question', zhihu + '/question/990031'],
  ['search', search, '模拟专栏结果', 'article', 'https://zhuanlan.zhihu.com/p/990041'],
  ['question', question, '模拟问题', 'answer', question + '/answer/990051'],
  ['article', article, '模拟专栏题名', 'article', article],
];

for (const [name, href, title, type, sourceUrl] of positive) {
  test(name + ' reads a rendered record and enters only on demand', () => {
    const page = load(name, href);
    const { record } = page.adapter();
    assert.equal(record.title, title);
    assert.equal(record.contentType, type);
    assert.equal(record.sourceUrl, sourceUrl);
    assert.equal(record.contentHtml, null);
    assert.equal(page.host(readerID), null);
    page.press(launcherID);
    assert.equal(page.host(launcherID), null);
    assert.equal(page.inShell(readerID, '[data-zdr-region="document"] .zdr-document-title').textContent, title);
    const regions = [...page.host(readerID).shadowRoot.querySelectorAll('[data-zdr-region]')];
    assert.deepEqual(regions.map(region => region.dataset.zdrRegion), ['topbar', 'left-navigation', 'document', 'outline']);
    assert.equal(regions[1].querySelectorAll('[aria-disabled="true"]').length, 6);
    assert.equal(regions[3].getAttribute('aria-label'), '本文目录');
    assert.equal(page.host(readerID).shadowRoot.querySelector('img, template, script, b'), null);
    assert.equal(page.native.outerHTML, page.original);
    assert.deepEqual(page.forbidden, []);
  });
}

test('a direct-answer route uses exactly the rendered answer named in its URL', () => {
  const page = load('question', question + '/answer/990052?from=fixture');
  assert.equal(page.adapter().record.contentId, '990052');
  page.press(launcherID);
  assert.match(page.inShell(readerID, 'main').textContent, /第二条已经渲染/);
  const missing = load('question', question + '/answer/990099');
  assert.equal(missing.adapter().status, 'unavailable');
  missing.press(launcherID);
  assert.equal(missing.host(readerID), null);
});

test('duplicate injection and five enter/exit cycles keep one root and restore native DOM and focus', () => {
  const page = load('article', article);
  const source = page.document.querySelector('.Post-Main');
  let nativeClick = 0;
  source.addEventListener('click', () => { nativeClick += 1; });
  page.run();
  assert.equal(page.observers.filter(observer => observer.target === page.document.documentElement).length, 1);
  assert.equal(page.document.querySelectorAll(launcherID).length, 1);

  for (let cycle = 0; cycle < 5; cycle += 1) {
    page.press(launcherID);
    page.run();
    page.mutations();
    assert.equal(page.document.querySelectorAll(readerID).length, 1);
    assert.equal(page.host(launcherID), null);
    const detachedButton = page.inShell(readerID, '[data-zdr-action="exit"]');
    page.press(readerID);
    assert.equal(page.host(readerID), null);
    assert.equal(page.document.querySelectorAll(launcherID).length, 1);
    assert.equal(page.focus().node, page.inShell(launcherID, 'button'));
    assert.equal(page.focus().options.preventScroll, true);
    detachedButton.click();
    assert.equal(page.document.querySelectorAll(launcherID).length, 1);
    assert.equal(page.document.querySelector('.Post-Main'), source);
    assert.equal(page.native.outerHTML, page.original);
    source.click();
  }
  assert.equal(nativeClick, 5);
  assert.deepEqual(page.forbidden, []);
});

test('article launcher clears a fixed bottom action bar and returns to its corner', () => {
  const page = load('article', article);
  const launcher = page.inShell(launcherID, '.zdr-launcher');
  const offset = () => launcher.style.getPropertyValue('--zdr-launcher-avoidance');
  Object.defineProperty(page.document.documentElement, 'clientHeight', { value: 913 });
  Object.defineProperty(launcher, 'getBoundingClientRect', {
    value() {
      const lift = Number.parseInt(offset(), 10) || 0;
      return { left: 16, right: 120, top: 861 - lift, bottom: 897 - lift };
    },
  });
  const actions = page.document.createElement('div');
  actions.className = 'Sticky RichContent-actions';
  actions.style.position = 'fixed';
  const inner = page.document.createElement('div');
  inner.className = 'ContentItem-actions';
  actions.append(inner);
  let left = 16;
  Object.defineProperty(actions, 'getBoundingClientRect', {
    value: () => ({ left, right: 710, top: 859, bottom: 903 }),
  });
  Object.defineProperty(inner, 'getBoundingClientRect', {
    value: () => ({ left, right: 710, top: 859, bottom: 913 }),
  });
  page.document.querySelector('.Post-Main').append(actions);
  page.mutations();
  page.paint();
  assert.equal(offset(), undefined);

  actions.classList.add('is-fixed', 'is-bottom');
  const observer = page.observers.find(candidate => candidate.target === actions);
  assert.deepEqual([...observer.options.attributeFilter], ['class', 'style']);
  observer.callback();
  page.mutations();
  page.window.dispatchEvent(new globalThis.Event('scroll'));
  assert.equal(page.frames.size, 1);
  page.paint();
  assert.equal(offset(), '54px');

  page.resize(906);
  page.paint();
  assert.equal(offset(), '54px');
  left = 130;
  page.resize(900);
  page.paint();
  assert.equal(offset(), '0px');
  left = 16;
  page.resize(906);
  page.paint();
  assert.equal(offset(), '54px');

  actions.classList.remove('is-bottom');
  observer.callback();
  page.paint();
  assert.equal(offset(), '0px');
  actions.remove();
  page.mutations();
  page.paint();
  assert.equal(observer.target, null);

  page.mutations();
  assert.equal(page.frames.size, 1);
  page.press(launcherID);
  assert.equal(page.frames.size, 0);
  assert.equal(getEventListeners(page.window, 'scroll').length, 0);
  assert.ok(page.host(readerID));
});

test('modal cancel and close each clear the reader', () => {
  const page = load('question', question);
  page.press(launcherID);
  const dialog = page.inShell(readerID, 'dialog');
  dialog.dispatchEvent(new dialog.ownerDocument.defaultView.Event('cancel', { cancelable: true }));
  assert.equal(page.host(readerID), null);
  page.press(launcherID);
  page.inShell(readerID, 'dialog').close();
  assert.equal(page.host(readerID), null);
  assert.ok(page.host(launcherID));
});

test('navigation to a new route closes the panel, skips unsupported pages and re-enters closed', () => {
  const page = load('home', zhihu + '/');
  page.press(launcherID);
  page.goto(zhihu + '/#native-anchor', 'hashchange');
  assert.ok(page.host(readerID));
  page.native.innerHTML = sample('hot');
  page.goto(zhihu + '/hot');
  assert.equal(page.host(readerID), null);
  page.press(launcherID);
  assert.match(page.inShell(readerID, 'main').textContent, /模拟热榜/);
  page.goto(zhihu + '/messages');
  assert.equal(page.host(readerID), null);
  assert.equal(page.host(launcherID), null);
  page.native.innerHTML = sample('home');
  page.goto(zhihu + '/', 'popstate');
  assert.ok(page.host(launcherID));
  assert.equal(page.host(readerID), null);
});

test('observer fallback catches DOM-driven SPA updates and body replacement', () => {
  const page = load('home', zhihu + '/', { navigation: false });
  page.press(launcherID);
  page.native.innerHTML = sample('hot');
  page.goto(zhihu + '/hot', 'mutation');
  assert.equal(page.host(readerID), null);
  page.press(launcherID);
  assert.match(page.inShell(readerID, 'main').textContent, /模拟热榜/);
  const replacement = page.document.createElement('body');
  page.document.body.replaceWith(replacement);
  page.mutations();
  assert.equal(page.host(readerID), null);
  assert.equal(page.host(launcherID).parentNode, replacement);
});

test('pagehide clears observers, listeners and roots; a restored page starts closed', () => {
  const page = load('home', zhihu + '/');
  page.press(launcherID);
  const hide = new globalThis.Event('pagehide');
  Object.defineProperty(hide, 'persisted', { value: true });
  page.window.dispatchEvent(hide);
  assert.equal(page.observers.some(observer => observer.target), false);
  assert.equal(page.host(readerID), null);
  assert.equal(page.host(launcherID), null);
  assert.equal(page.window[instance], undefined);
  for (const type of ['popstate', 'hashchange', 'pagehide']) {
    assert.equal(getEventListeners(page.window, type).length, 0, type);
  }
  assert.equal(getEventListeners(page.window.navigation, 'currententrychange').length, 0);
  page.window.dispatchEvent(new globalThis.Event('pageshow'));
  assert.ok(page.host(launcherID));
  assert.equal(page.host(readerID), null);
  assert.equal(page.observers.filter(observer => observer.target).length, 1);
  assert.equal(getEventListeners(page.window, 'pageshow').length, 0);
});

test('no content, missing body, changed selectors, and access limits preserve the native document', () => {
  for (const [name, href, message] of [
    ['login', search, /暂无可读取/],
    ['empty', search, /暂无可读取/],
    ['missing', article, /暂无可读取/],
    ['dom-changed', search, /暂无可读取/],
    ['restriction', search, /访问限制/],
  ]) {
    const page = load(name, href);
    page.press(launcherID);
    assert.equal(page.host(readerID), null, name);
    assert.match(page.inShell(launcherID, '[role="status"]').textContent, message, name);
    assert.equal(page.native.outerHTML, page.original, name);
    assert.deepEqual(page.forbidden, []);
  }
});

test('a newly visible native access restriction closes the reader', () => {
  const page = load('search', search);
  page.press(launcherID);
  const limit = page.document.createElement('section');
  limit.className = 'SignFlowModal';
  page.native.append(limit);
  page.mutations();
  assert.equal(page.host(readerID), null);
  assert.ok(limit.isConnected);
  page.press(launcherID);
  assert.match(page.inShell(launcherID, '[role="status"]').textContent, /访问限制/);
});

test('modal failure cleans up and leaves native controls usable', () => {
  const page = load('article', article, { modalError: true });
  page.press(launcherID);
  assert.equal(page.host(readerID), null);
  assert.match(page.inShell(launcherID, '[role="status"]').textContent, /暂不可用/);
  assert.equal(page.native.outerHTML, page.original);
  assert.deepEqual(page.forbidden, []);
});

test('unsupported routes and framed documents are left untouched', () => {
  const frame = load('home', zhihu + '/', { frame: true });
  const unsupported = load('home', zhihu + '/settings');
  for (const page of [frame, unsupported]) {
    assert.equal(page.host(launcherID), null);
    assert.equal(page.host(readerID), null);
    assert.equal(page.native.outerHTML, page.original);
  }
  assert.equal(frame.observers.length, 0);
});

test('M02 shows the complete loaded article, byline, published date and original link', () => {
  const page = load('rich-article', article);
  const { record } = page.adapter();
  assert.equal(record.excerpt, null);
  assert.equal(record.contentHtml, null);
  assert.equal(record.publishedAt, '2026-11-27');
  page.press(launcherID);
  const reading = page.inShell(readerID, '.zdr-richtext');
  assert.ok(reading.textContent.length > 240);
  assert.match(reading.textContent, /SYNTHETIC_ARTICLE_END/);
  assert.equal(reading.querySelector('strong').textContent, '需要记住的结论');
  assert.equal(reading.querySelector('em').textContent, '值得慢慢读的细节');
  assert.equal(page.inShell(readerID, 'time').textContent, '发布于 2026-11-27');
  assert.equal(page.inShell(readerID, '.zdr-source-button').getAttribute('href'), article);
  assert.equal(page.native.outerHTML, page.original);
});

test('M02 full question body does not reuse the 240-character list excerpt', () => {
  const page = load('question', question);
  const content = page.native.querySelector('.RichText');
  const tail = page.document.createElement('p');
  tail.textContent = '合成问答正文内容。'.repeat(80) + 'QUESTION_END_MARKER';
  content.append(tail);
  page.press(launcherID);
  assert.match(page.inShell(readerID, '.zdr-richtext').textContent, /QUESTION_END_MARKER/);
  assert.equal(page.adapter().record.excerpt, null);
  const list = load('home', zhihu + '/');
  list.native.querySelector('.RichContent-inner').textContent = '预览内容。'.repeat(80);
  list.press(launcherID);
  assert.equal(list.inShell(readerID, '.zdr-preview').textContent.length, 240);
  assert.equal(list.inShell(readerID, '.zdr-richtext'), null);
});

function loadWrappedQuestion(href = question) {
  const page = load('question-unescapable', href);
  const [collapsed, expanded] = page.native.querySelectorAll('.RichContent-inner');
  Object.defineProperties(collapsed, {
    clientHeight: { value: 297, configurable: true },
    scrollHeight: { value: 298, configurable: true },
  });
  Object.defineProperties(expanded, {
    clientHeight: { value: 3510, configurable: true },
    scrollHeight: { value: 3510, configurable: true },
  });
  return { page, collapsed, expanded };
}

test('M02 skips the collapsed answer and renders the fully visible wrapped answer on a question page', () => {
  const { page } = loadWrappedQuestion();
  assert.equal(page.adapter().record.contentId, '990052');
  page.press(launcherID);
  const body = page.inShell(readerID, '.zdr-richtext');
  assert.match(body.textContent, /第二条完整回答起始。.*第二条完整回答结束。/s);
  assert.doesNotMatch(body.textContent, /折叠回答|隐藏片段/);
  assert.equal(page.native.outerHTML, page.original);
});

test('M02 preserves the native question page when its only wrapped answer is collapsed', () => {
  const { page, expanded } = loadWrappedQuestion();
  expanded.closest('.AnswerItem').remove();
  const original = page.native.outerHTML;
  assert.equal(page.adapter().status, 'unavailable');
  page.press(launcherID);
  assert.equal(page.host(readerID), null);
  assert.equal(page.native.outerHTML, original);
});

test('M02 applies the same boundary to the requested answer alone on direct links', () => {
  const { page: collapsed } = loadWrappedQuestion(question + '/answer/990051');
  assert.equal(collapsed.adapter().status, 'unavailable');
  const { page: expanded } = loadWrappedQuestion(question + '/answer/990052');
  assert.equal(expanded.adapter().record.contentId, '990052');
});

test('M02 requires proof of full layout for an otherwise unescapable answer', () => {
  for (const failure of ['collapsed marker', 'clipped height', 'unmeasurable', 'other shape', 'expand control',
    'inert content', 'clipping ancestor', 'line clamp']) {
    const { page, expanded } = loadWrappedQuestion();
    if (failure === 'collapsed marker') expanded.classList.add('RichContent-inner--collapsed');
    if (failure === 'clipped height') Object.defineProperty(expanded, 'scrollHeight', { value: 3511 });
    if (failure === 'unmeasurable') Object.defineProperty(expanded, 'clientHeight', { value: 0 });
    if (failure === 'other shape') expanded.parentElement.classList.remove('RichContent');
    if (failure === 'inert content') expanded.setAttribute('inert', '');
    if (failure === 'clipping ancestor') {
      expanded.parentElement.style.overflowY = 'hidden';
      Object.defineProperties(expanded.parentElement, {
        clientHeight: { value: 0 },
        scrollHeight: { value: 3510 },
      });
    }
    if (failure === 'line clamp') expanded.style.setProperty('-webkit-line-clamp', '3');
    if (failure === 'expand control') {
      const expand = page.document.createElement('button');
      expand.className = 'ContentItem-expandButton';
      expanded.parentElement.append(expand);
    }
    assert.equal(page.adapter().status, 'unavailable', failure);
  }
});

test('M02 retains unescapable protection on other routes', () => {
  const page = load('rich-article', article);
  page.native.querySelector('.Post-RichText').classList.add('RichContent--unescapable');
  assert.equal(page.adapter().status, 'unavailable');
});

test('M02 keeps numbering, lists, quote, code and uses hardening on safe links', () => {
  const page = load('rich-article', article);
  page.press(launcherID);
  const body = page.inShell(readerID, '.zdr-richtext');
  assert.equal(body.querySelector('ol').getAttribute('start'), '3');
  assert.equal(body.querySelector('li[value]').getAttribute('value'), '7');
  assert.ok(body.querySelector('ol li ul li'));
  assert.match(body.querySelector('blockquote p').textContent, /顺着作者/);
  assert.match(body.querySelector('pre code').textContent, /\nconst source/);
  const links = [...body.querySelectorAll('a')];
  assert.deepEqual(links.map(link => link.getAttribute('href')), [
    'https://example.invalid/reading-source', 'https://example.invalid/second',
    'https://zhuanlan.zhihu.com/p/990045',
  ]);
  assert.ok(links.every(link => link.getAttribute('rel') === 'noopener noreferrer' && link.getAttribute('target') === '_blank'));
  assert.match(body.textContent, /受限链接标签/);
});

test('M02 discards active markup, unsafe attributes and hidden source content', () => {
  const page = load('rich-article', article);
  page.press(launcherID);
  const body = page.inShell(readerID, '.zdr-richtext');
  assert.equal(body.querySelector('script, iframe, embed, form, input, [onfocus], [hidden]'), null);
  assert.doesNotMatch(body.textContent, /DISCARDED_|HIDDEN_FIXTURE_MARKER/);
  assert.deepEqual(page.forbidden, []);
});

test('M02 draws only an already decoded image and preserves its caption', () => {
  const page = load('rich-article', article);
  page.press(launcherID);
  const body = page.inShell(readerID, '.zdr-richtext');
  assert.equal(body.querySelector('img'), null);
  assert.equal(body.querySelector('canvas').getAttribute('aria-label'), '合成图示：远山和湖面');
  assert.equal(page.drawnImages.length, 1);
  assert.equal(page.drawnImages[0], page.native.querySelector('[data-fixture-image="loaded"]'));
  assert.match(body.querySelector('figcaption').textContent, /仅用于阅读器测试/);
  assert.match(body.querySelector('.zdr-image-fallback').textContent, /未加载样图/);
});

test('M02 avoids presenting clipped, empty and restricted bodies as full text', () => {
  for (const failure of ['clipped', 'empty', 'restricted']) {
    const page = load('rich-article', article);
    const body = page.native.querySelector('.Post-RichText');
    if (failure === 'clipped') body.setAttribute('data-collapsed', 'true');
    if (failure === 'empty') body.textContent = ' ';
    if (failure === 'restricted') page.document.title = '请求参数异常';
    page.press(launcherID);
    assert.equal(page.host(readerID), null, failure);
    assert.match(page.inShell(launcherID, '[role="status"]').textContent, /暂无可读取|访问限制/);
  }
});

test('M02 outline uses real headings and focuses the selected section', () => {
  const page = load('rich-article', article);
  page.press(launcherID);
  const outline = page.inShell(readerID, '.zdr-outline-list');
  const buttons = [...outline.querySelectorAll('button')];
  assert.deepEqual(buttons.map(button => button.textContent),
    ['从一页长文开始', '排版与阅读节奏', '图像与图注', '链接与访问边界', '回到原文']);
  assert.equal(buttons[0].getAttribute('aria-current'), 'location');
  buttons[2].click();
  assert.equal(buttons[2].getAttribute('aria-current'), 'location');
  assert.equal(page.focus().node, page.inShell(readerID, '#zdr-section-3'));
  page.press(readerID);
  assert.equal(page.native.outerHTML, page.original);
});

test('M02 panels on narrow viewports are exclusive and view settings are scoped to the modal', () => {
  const page = load('rich-article', article);
  page.resize(885);
  page.press(launcherID);
  const dialog = page.inShell(readerID, 'dialog');
  const nav = page.inShell(readerID, '[data-zdr-action="nav"]');
  const outline = page.inShell(readerID, '[data-zdr-action="outline"]');
  assert.equal(nav.getAttribute('aria-expanded'), 'false');
  nav.click();
  assert.equal(nav.getAttribute('aria-expanded'), 'true');
  outline.click();
  assert.equal(nav.getAttribute('aria-expanded'), 'false');
  assert.equal(outline.getAttribute('aria-expanded'), 'true');
  page.inShell(readerID, '[data-zdr-action="width-wide"]').click();
  page.inShell(readerID, '[data-zdr-action="theme-dark"]').click();
  assert.equal(dialog.dataset.zdrWidth, 'wide');
  assert.equal(dialog.dataset.zdrTheme, 'dark');
  page.press(readerID);
  assert.equal(getEventListeners(page.window, 'resize').length, 1);
  page.press(launcherID);
  assert.equal(page.inShell(readerID, 'dialog').dataset.zdrWidth, 'default');
  assert.equal(page.inShell(readerID, 'dialog').dataset.zdrTheme, 'light');
});
