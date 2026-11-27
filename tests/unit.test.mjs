import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { Script } from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const { identifyRoute, createReaderState } = new Script([
  read('src/adapters/route.js'),
  read('src/core/state.js'),
  '({ identifyRoute, createReaderState });',
].join('\n')).runInNewContext({ URL });

const routes = [
  ['https://www.zhihu.com/', 'home'],
  ['https://www.zhihu.com/follow/', 'follow'],
  ['https://www.zhihu.com/hot', 'hot'],
  ['https://www.zhihu.com/search?type=content&q=fixture', 'search'],
  ['https://www.zhihu.com/question/990050', 'question'],
  ['https://zhuanlan.zhihu.com/p/990041', 'article'],
];

for (const [url, kind] of routes) {
  test('route recognizes ' + kind, () => assert.equal(identifyRoute(url)?.kind, kind));
}

test('exact origins, HTTPS, canonical question and article paths, and route keys', () => {
  for (const url of [
    'malformed', 'http://www.zhihu.com/hot', 'https://zhihu.com/',
    'https://www.zhihu.com.example/hot', 'https://www.zhihu.com:444/hot',
    'https://u:p@www.zhihu.com/hot', 'https://www.zhihu.com/hottest',
    'https://www.zhihu.com/question/42/edit', 'https://zhuanlan.zhihu.com/p/foo',
    'https://zhuanlan.zhihu.com/follow', 'https://www.zhihu.com/signin',
  ]) assert.equal(identifyRoute(url), null, url);
  const direct = identifyRoute('https://www.zhihu.com/question/1/answer/2/#fragment');
  assert.equal(direct.contentType, 'answer');
  assert.equal(direct.contentId, '2');
  assert.equal(direct.sourceUrl, 'https://www.zhihu.com/question/1/answer/2');
  assert.equal(direct.key, identifyRoute(direct.sourceUrl + '#anchor').key);
  assert.notEqual(identifyRoute(routes[3][0]).key, identifyRoute('https://www.zhihu.com/search?q=next').key);
});

test('reader state starts closed, prevents double entry and resets across routes', () => {
  const state = createReaderState();
  assert.equal(state.isOpen, false);
  assert.equal(state.enter(), false);
  const home = identifyRoute(routes[0][0]);
  assert.equal(state.setRoute(home), true);
  assert.equal(state.enter(), true);
  assert.equal(state.enter(), false);
  assert.equal(state.setRoute(home), false);
  assert.equal(state.isOpen, true);
  assert.equal(state.setRoute(identifyRoute(routes[2][0])), true);
  assert.equal(state.isOpen, false);
  state.enter();
  state.exit();
  assert.equal(state.isOpen, false);
});

test('build is deterministic, self-contained, syntactically valid, and matches the checked-in bundle', () => {
  const prior = read('dist/bundle.user.js');
  execFileSync(process.execPath, ['build.js'], { cwd: root });
  const script = read('dist/bundle.user.js');
  assert.equal(script, prior);
  assert.equal((script.match(/^\/\/ ==UserScript==$/gm) ?? []).length, 1);
  assert.equal((script.match(/^\/\/ ==\/UserScript==$/gm) ?? []).length, 1);
  assert.ok(script.includes(read('LICENSE').trimEnd()));
  for (const css of ['tokens', 'layout', 'typography', 'components']) {
    assert.ok(script.includes(JSON.stringify(read('src/styles/' + css + '.css').trimEnd()).slice(1, -1)), css);
  }
  new Script(script);
});

test('production metadata and static security boundaries', () => {
  const body = read('dist/bundle.user.js');
  const fields = (name) => [...body.matchAll(new RegExp('^// @' + name + '\\s+(.+)$', 'gm'))].map(x => x[1].trim());
  assert.deepEqual(fields('match'), ['https://www.zhihu.com/*', 'https://zhuanlan.zhihu.com/p/*']);
  assert.deepEqual(fields('grant'), ['none']);
  assert.deepEqual(fields('updateURL'), ['none']);
  assert.deepEqual(fields('downloadURL'), ['none']);
  assert.match(body, /^\/\/ @noframes$/m);
  assert.doesNotMatch(body, /^\/\/ @(?:include|connect|require|resource)\b/m);
  assert.doesNotMatch(body, /\b(?:fetch|XMLHttpRequest|GM_xmlhttpRequest|WebSocket|EventSource|sendBeacon|cookie|indexedDB|localStorage|sessionStorage|eval|Function|importScripts)\b/);
  assert.doesNotMatch(body, /\/api\/v\d|openai|embedding|api.?key|bearer|\b(?:innerHTML|outerHTML|insertAdjacentHTML|srcdoc)\b/i);
  for (const sheet of ['tokens', 'layout', 'typography', 'components']) {
    assert.doesNotMatch(read('src/styles/' + sheet + '.css'), /@import|\burl\s*\(/i, sheet);
  }
});
