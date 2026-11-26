import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { createContext, Script } from 'node:vm';

const domHelper = process.argv[2];
assert.ok(domHelper, 'Pass the verified LinkeDOM worker.mjs path as the first argument');
const helperBytes = await readFile(domHelper);
assert.equal(createHash('sha256').update(helperBytes).digest('hex'), '196efeb17c260e001979dbc54a3c30e701a881c6e8a3eedaddc5ad83c99ee5ff');
const { parseHTML } = await import(pathToFileURL(resolve(domHelper)).href);
const fixtureFile = await readFile(new URL('./fixtures/native-shapes.html', import.meta.url), 'utf8');
const fixtures = parseHTML(fixtureFile).document;
const source = await readFile(new URL('./dom-probe.user.js', import.meta.url), 'utf8');
const script = new Script(source, { filename: 'dom-probe.user.js' });

const zhihu = 'https://www.zhihu.com';
const column = 'https://zhuanlan.zhihu.com';
const route = {
  home: zhihu + '/', follow: zhihu + '/follow', hot: zhihu + '/hot',
  search: zhihu + '/search?type=content&q=fixture', question: zhihu + '/question/990050',
  article: column + '/p/990041',
};
const panelID = '#zdr-m00-b-probe';

function fixtureBody(name) {
  const template = fixtures.getElementById(name);
  assert.equal(template?.tagName, 'TEMPLATE');
  return template.innerHTML;
}

function load(name, url, storage = 'mock') {
  const dom = parseHTML('<!doctype html><html><body><div id="native">' + fixtureBody(name) + '</div></body></html>');
  const { document, window } = dom;
  const location = { href: url };
  const marker = new Map();
  const requests = [];
  const blockedNetwork = () => { requests.push('unexpected'); throw new Error('Offline fixture network guard'); };
  if (!window.Element.prototype.getClientRects) {
    Object.defineProperty(window.Element.prototype, 'getClientRects', { value() { return [{}]; } });
  }
  for (const image of document.querySelectorAll('img[data-fixture-image]')) {
    Object.defineProperties(image, {
      complete: { value: image.dataset.fixtureImage !== 'pending' },
      naturalWidth: { value: image.dataset.fixtureImage === 'loaded' ? 100 : 0 },
    });
  }
  const gm = storage === 'missing' ? {} : {
    GM_getValue: (key, fallback) => marker.get(key) ?? fallback,
    GM_setValue(key, value) {
      if (storage === 'failure') throw new Error('Synthetic storage fault');
      marker.set(key, value);
    },
    GM_deleteValue: key => marker.delete(key),
  };
  const sandbox = createContext({
    document, window, location, URL, MutationObserver: window.MutationObserver,
    getComputedStyle: () => ({ visibility: 'visible' }), fetch: blockedNetwork,
    XMLHttpRequest: blockedNetwork, WebSocket: blockedNetwork, ...gm,
  }, { codeGeneration: { strings: false, wasm: false } });
  const original = document.body.innerHTML;
  const run = () => script.runInContext(sandbox, { timeout: 1000 });
  run();
  function press(action) {
    const button = document.querySelector(panelID + ' button[data-action="' + action + '"]');
    assert.ok(button, action);
    button.dispatchEvent(new window.Event('click', { bubbles: true }));
  }
  return { document, window, location, marker, requests, original, run, press };
}

test('scope, storage-only grants, and zero network or body-markup execution paths', () => {
  const lines = source.split('\n');
  const matches = lines.filter(line => /^\/\/ @match\s/.test(line)).map(line => line.trim().split(/\s+/).at(-1));
  assert.deepEqual(matches, [
    zhihu + '/', zhihu + '/follow*', zhihu + '/hot*', zhihu + '/search*',
    zhihu + '/question/*', column + '/p/*',
  ]);
  const grants = [...source.matchAll(/^\/\/ @grant\s+(\S+)/gm)].map(match => match[1]);
  assert.deepEqual(grants, ['GM_getValue', 'GM_setValue', 'GM_deleteValue']);
  assert.match(source, /^\/\/ @noframes$/m);
  assert.match(source, /^\/\/ @downloadURL\s+none$/m);
  assert.doesNotMatch(source, /^\/\/ @(?:connect|require|resource|updateURL|include)\b/m);
  assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|unsafeWindow|GM_xmlhttpRequest|GM_cookie|eval|Function)\b|document\.cookie|\.innerHTML\s*=|insertAdjacentHTML|createElement\(['"]script['"]\)/);
});

const positive = [
  ['home', 1, '模拟推荐条目', 'answer', zhihu + '/question/990001/answer/990011'],
  ['follow', 1, '模拟关注动态', 'pin', zhihu + '/pin/990021'],
  ['hot', 2, '模拟热榜第一项', 'question', zhihu + '/question/990031'],
  ['search', 2, '模拟专栏结果', 'article', column + '/p/990041'],
  ['question', 2, '模拟问题', 'answer', zhihu + '/question/990050/answer/990051'],
  ['article', 1, '模拟专栏题名', 'article', column + '/p/990041'],
];

for (const [name, count, heading, type, href] of positive) {
  test(name + ' synthetic DOM, title, type and canonical URL', () => {
    const env = load(name, route[name]);
    const panel = env.document.querySelector(panelID);
    assert.equal(panel.dataset.kind, name);
    assert.equal(panel.dataset.status, 'available');
    assert.equal(Number(panel.dataset.count), count);
    assert.equal(panel.querySelector('a').getAttribute('href'), href);
    assert.ok(panel.querySelector('details pre').textContent.includes(heading));
    assert.ok(panel.querySelector('pre').textContent.includes('类型 ' + type));
    assert.equal(env.marker.size, 0);
    assert.deepEqual(env.requests, []);
  });
}

test('follow reads Topstory activity cards and ignores other content in the follow section', () => {
  const env = load('follow-topstory', route.follow);
  const panel = env.document.querySelector(panelID);
  assert.equal(panel.dataset.kind, 'follow');
  assert.equal(panel.dataset.status, 'available');
  assert.equal(panel.dataset.count, '1');
  assert.match(panel.querySelector('pre').textContent, /候选容器 1/);
  assert.match(panel.querySelector('pre').textContent, /类型 answer/);
  assert.match(panel.querySelector('details pre').textContent, /模拟关注回答/);
  assert.equal(panel.querySelector('a').getAttribute('href'), zhihu + '/question/990022/answer/990023');
  assert.deepEqual(env.requests, []);
});

test('question reads full visible text, reports images, and switches answers without replacing native DOM', () => {
  const env = load('question', route.question);
  const panel = env.document.querySelector(panelID);
  const details = panel.querySelector('details pre');
  assert.match(details.textContent, /第一条已经渲染的回答正文/);
  assert.match(details.textContent, /保留 <b>文字<\/b> 的纯文本/);
  assert.equal(details.querySelector('b,img,script'), null);
  assert.match(panel.querySelector('pre').textContent, /图片 3 \/ 成功 1 \/ 失败 1 \/ 待加载 1/);
  env.press('next');
  assert.match(details.textContent, /第二条已经渲染的回答正文/);
  assert.equal(panel.querySelector('a').getAttribute('href'), zhihu + '/question/990050/answer/990052');
  env.press('prev');
  assert.equal(panel.dataset.index, '0');
  env.press('next');
  env.press('next');
  assert.equal(panel.dataset.index, '1');
  env.press('close');
  assert.equal(env.document.body.innerHTML, env.original);
  assert.deepEqual(env.requests, []);
});

for (const [name, url, expected] of [
  ['login', route.search, 'login-required'],
  ['empty', route.search, 'empty-search'],
  ['missing', route.article, 'body-missing'],
  ['dom-changed', route.search, 'content-missing'],
  ['restriction', route.search, 'restricted'],
]) {
  test(name + ' uses the expected fallback and leaves the native DOM intact', () => {
    const env = load(name, url);
    const panel = env.document.querySelector(panelID);
    assert.equal(panel.dataset.status, expected);
    if (name === 'missing') assert.equal(panel.querySelector('a').getAttribute('href'), route.article);
    else assert.equal(panel.querySelector('a').hasAttribute('href'), false);
    env.press('close');
    assert.equal(env.document.body.innerHTML, env.original);
    assert.deepEqual(env.requests, []);
  });
}

test('a visible sign-in dialog suppresses a populated fixture on the same route', () => {
  const env = load('search', route.search);
  const dialog = env.document.createElement('div');
  dialog.setAttribute('aria-modal', 'true');
  dialog.textContent = '登录后查看';
  env.document.querySelector('#native').appendChild(dialog);
  env.press('scan');
  const panel = env.document.querySelector(panelID);
  assert.equal(panel.dataset.status, 'login-required');
  assert.equal(panel.dataset.count, '0');
  assert.equal(panel.querySelector('details pre').textContent, '');
});

test('duplicate installation, dynamic route and re-mount retain a single panel', async () => {
  const env = load('search', route.search);
  const panel = env.document.querySelector(panelID);
  env.run();
  assert.equal(env.document.querySelectorAll(panelID).length, 1);
  env.location.href = route.hot;
  env.document.querySelector('#native').innerHTML = fixtureBody('hot');
  env.window.dispatchEvent(new env.window.Event('popstate'));
  await Promise.resolve();
  assert.equal(panel.querySelector('a').hasAttribute('href'), false);
  env.press('scan');
  assert.equal(panel.dataset.kind, 'hot');
  assert.equal(panel.dataset.count, '2');
  env.press('close');
  assert.equal(env.document.querySelector(panelID), null);
  assert.equal(env.document.querySelectorAll('.HotItem').length, 2);
  env.run();
  assert.equal(env.document.querySelectorAll(panelID).length, 1);
});

test('a newly rendered answer appears after a manual rescan', async () => {
  const env = load('question', route.question);
  const panel = env.document.querySelector(panelID);
  const clone = env.document.querySelector('.AnswerItem').cloneNode(true);
  clone.querySelector('meta[itemprop="url"]').setAttribute('content', zhihu + '/question/990050/answer/990053');
  env.document.querySelector('.QuestionAnswers-answers').appendChild(clone);
  await Promise.resolve();
  await Promise.resolve();
  assert.match(panel.querySelector('output').textContent, /原生页面已变化/);
  assert.equal(panel.dataset.count, '2');
  env.press('scan');
  assert.equal(panel.dataset.count, '3');
});

test('bounded queue contains unique visible records up to the PDT limit', () => {
  const env = load('hot', route.hot);
  const list = env.document.querySelector('.HotList');
  for (let i = 0; i < 105; i++) {
    const item = list.firstElementChild.cloneNode(true);
    item.querySelector('a').setAttribute('href', '/question/' + (992000 + i));
    list.appendChild(item);
  }
  env.press('scan');
  assert.equal(env.document.querySelector(panelID).dataset.count, '100');
});

test('GM stub round trip stores only the synthetic marker and permits deleting it', () => {
  const env = load('home', route.home);
  const message = env.document.querySelector('[data-storage]');
  assert.equal(env.marker.size, 0);
  env.press('write');
  assert.deepEqual(Array.from(env.marker), [['zdr:m00-b:fixture-marker', 'm00-b-synthetic-v1']]);
  env.press('read');
  assert.equal(message.textContent, '测试标记存在');
  env.press('clear');
  assert.equal(env.marker.size, 0);
  assert.equal(message.textContent, '测试标记不存在');
});

test('absent or failing GM does not change account state or the original page', () => {
  for (const [mode, outcome] of [['missing', 'GM Storage 不可用'], ['failure', 'GM Storage 读写失败']]) {
    const env = load('article', route.article, mode);
    env.press('write');
    assert.equal(env.document.querySelector('[data-storage]').textContent, outcome);
    assert.equal(env.marker.size, 0);
    env.press('close');
    assert.equal(env.document.body.innerHTML, env.original);
    assert.deepEqual(env.requests, []);
  }
});

test('unsupported login, security and non-content paths mount no validation panel', () => {
  for (const pathname of ['/signin', '/account/unhuman', '/question/990050/edit', '/hot-administration']) {
    const env = load('login', zhihu + pathname);
    assert.equal(env.document.querySelector(panelID), null);
    assert.equal(env.marker.size, 0);
    assert.deepEqual(env.requests, []);
  }
});
