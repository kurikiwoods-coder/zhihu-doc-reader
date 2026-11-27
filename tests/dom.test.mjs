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
const sample = name => fixtures.getElementById(name).innerHTML;

function load(name, href, { modalError = false, navigation = true, frame = false } = {}) {
  const { document, Event, Element } = parseHTML(
    '<!doctype html><html><head><title>合成样本</title></head><body><div id="native">' +
    sample(name) + '</div></body></html>',
  );
  if (!Element.prototype.getClientRects) {
    Object.defineProperty(Element.prototype, 'getClientRects', { value() { return [{}]; } });
  }
  const native = document.getElementById('native');
  const original = native.outerHTML;
  const forbidden = [];
  const window = new EventTarget();
  window.top = frame ? new EventTarget() : window;
  window.location = { href };
  if (navigation) window.navigation = new EventTarget();
  window.getComputedStyle = () => ({ visibility: 'visible' });
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
    observe(target) { this.target = target; }
    disconnect() { this.target = null; }
  };
  const mutations = () => observers.filter(observer => observer.target).forEach(observer => observer.callback());
  let focused;
  const create = document.createElement.bind(document);
  document.createElement = (tag) => {
    const node = create(tag);
    if (tag === 'button') node.focus = options => { focused = { node, options }; };
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
    document, window, native, original, forbidden, observers, mutations, run, host, inShell, press,
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
  assert.equal(page.observers.length, 1);
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
