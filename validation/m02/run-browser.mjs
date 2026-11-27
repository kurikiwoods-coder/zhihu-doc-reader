// Test-only WebDriver run against a file URL with a synthetic Zhihu-shaped document.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { release, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

const profiles = {
  chrome: { name: 'chrome', options: 'goog:chromeOptions', driver: 'chromedriver', driverHome: 'CHROMEWEBDRIVER' },
  edge: { name: 'MicrosoftEdge', options: 'ms:edgeOptions', driver: 'msedgedriver', driverHome: 'EDGEWEBDRIVER' },
};
const browser = process.argv[2];
const profile = profiles[browser];
assert.ok(profile, 'Pass chrome or edge and the output directory');
const output = resolve(process.argv[3] || 'browser-evidence');
const read = path => readFile(new URL('../../' + path, import.meta.url), 'utf8');
const bundle = await read('dist/bundle.user.js');
const fixtureMarkup = (await read('validation/m02/fixtures/rich-article.html')).replace(/<script type="application\/fixture">[\s\S]*?<\/script>/, '');
const hash = data => createHash('sha256').update(data).digest('hex');
const fixtureDir = await mkdtemp(join(tmpdir(), 'zdr-m02-'));
const fixturePath = join(fixtureDir, 'synthetic.html');

function prepareSyntheticView() {
  const decodedImage = document.querySelector('[data-fixture-image="loaded"]');
  const drawing = document.createElement('canvas');
  drawing.width = 600;
  drawing.height = 220;
  const context = drawing.getContext('2d');
  const sky = context.createLinearGradient(0, 0, 0, 220);
  sky.addColorStop(0, '#a8bfd4');
  sky.addColorStop(1, '#f0e5ce');
  context.fillStyle = sky;
  context.fillRect(0, 0, 600, 220);
  context.fillStyle = '#586e81';
  context.beginPath();
  context.moveTo(0, 173);
  context.lineTo(139, 77);
  context.lineTo(211, 133);
  context.lineTo(320, 62);
  context.lineTo(445, 155);
  context.lineTo(535, 108);
  context.lineTo(600, 161);
  context.lineTo(600, 220);
  context.lineTo(0, 220);
  context.fill();
  context.fillStyle = '#a9bfcb';
  context.fillRect(0, 165, 600, 55);
  decodedImage.src = drawing.toDataURL('image/png');

  const code = document.querySelector('pre code');
  code.textContent += '\nconst longIdentifier = "' + 'full-width-synthetic-code-'.repeat(20) + '";';
  const spacer = document.createElement('div');
  spacer.className = 'native-spacer';
  document.body.append(spacer);
  const widget = document.createElement('button');
  widget.id = 'native-floating-widget';
  widget.type = 'button';
  widget.textContent = '原生浮窗';
  document.body.append(widget);

  const sticky = document.createElement('div');
  sticky.className = 'Sticky RichContent-actions';
  const actions = document.createElement('div');
  actions.className = 'ContentItem-actions';
  const vote = document.createElement('button');
  vote.className = 'Button VoteButton';
  vote.type = 'button';
  vote.textContent = '赞同';
  actions.append(vote);
  sticky.append(actions);
  document.querySelector('.Post-Main').append(sticky);

  const view = {
    location: { href: 'https://zhuanlan.zhihu.com/p/990041' },
    navigation: new EventTarget(),
    MutationObserver: window.MutationObserver,
    getComputedStyle: window.getComputedStyle.bind(window),
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
    get innerWidth() { return window.innerWidth; },
    get innerHeight() { return window.innerHeight; },
    addEventListener: window.addEventListener.bind(window),
    removeEventListener: window.removeEventListener.bind(window),
  };
  view.top = view;
  window.setSyntheticRoute = (href, event) => {
    view.location.href = href;
    if (event === 'popstate') window.dispatchEvent(new PopStateEvent('popstate'));
    else view.navigation.dispatchEvent(new Event('currententrychange'));
  };
  return view;
}

const page = [
  '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">',
  "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; img-src data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; base-uri 'none'; form-action 'none'\">",
  '<meta name="viewport" content="width=device-width,initial-scale=1"><title>M02 · 合成验证页</title>',
  `<style>
    body { margin: 0; }
    .Post-Main { max-width: 720px; margin: 4em auto; padding: 1em; }
    .native-spacer { height: 1100px; }
    #native-floating-widget { position: fixed; right: 28px; bottom: 28px; width: 64px; height: 64px; z-index: 100; }
    .Post-Main .Sticky.RichContent-actions { display: none; }
    .Post-Main .Sticky.RichContent-actions.is-fixed.is-bottom {
      display: block;
      position: fixed;
      left: max(16px, calc(50% - 437px));
      bottom: 10px;
      width: min(694px, calc(100% - 32px));
      height: 44px;
      z-index: 2;
    }
    .Post-Main .ContentItem-actions { height: 54px; }
    .Post-Main .VoteButton {
      position: absolute;
      left: 16px;
      top: 10px;
      box-sizing: border-box;
      width: 116px;
      height: 34px;
    }
  </style></head><body>`,
  fixtureMarkup,
  '<script>',
  'const fixtureView = (' + prepareSyntheticView.toString() + ')();',
  'window.runSyntheticReader = () => ((window, document) => {',
  bundle,
  '})(fixtureView, document);',
  'window.runSyntheticReader();',
  '</script></body></html>',
].join('\n');
await writeFile(fixturePath, page, 'utf8');
await mkdir(output, { recursive: true });

const driverHome = process.env[profile.driverHome];
const installedDriver = driverHome ? join(driverHome, profile.driver) : profile.driver;
const command = existsSync(installedDriver) ? installedDriver : profile.driver;
const port = 9515;
const driver = spawn(command, ['--port=' + port, '--allowed-ips=127.0.0.1'], { stdio: ['ignore', 'pipe', 'pipe'] });
let driverOutput = '';
let driverError;
driver.on('error', error => { driverError = error; });
for (const stream of [driver.stdout, driver.stderr]) {
  stream.on('data', data => { driverOutput = (driverOutput + data).slice(-4000); });
}

async function request(method, endpoint, data) {
  let response;
  try {
    response = await fetch('http://127.0.0.1:' + port + endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data),
      signal: AbortSignal.timeout(endpoint === '/session' ? 42000 : 15000),
    });
  } catch (error) {
    throw new Error(method + ' ' + endpoint + ' ' + error.message, { cause: error });
  }
  const reply = await response.json();
  if (!response.ok || reply.value?.error) {
    throw new Error(method + ' ' + endpoint + ' ' + (reply.value?.message ?? response.status));
  }
  return reply.value;
}

async function until(check, label) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (await check()) return;
    await delay(100);
  }
  throw new Error('Timed out: ' + label);
}

let session;
const scenarios = [];
const screenshots = [];
let browserInfo;

function commandFor(method, path, data) {
  return request(method, '/session/' + session + path, data);
}

function evaluate(action, ...args) {
  return commandFor('POST', '/execute/sync', { script: 'return (' + action.toString() + ')(...arguments);', args });
}

async function setViewport(width) {
  await commandFor('POST', '/window/rect', { width, height: 920 });
  const actual = await evaluate(() => ({ width: innerWidth, outer: outerWidth }));
  if (actual.width !== width) {
    await commandFor('POST', '/window/rect', { width: width + actual.outer - actual.width, height: 920 });
  }
  await until(() => evaluate(w => innerWidth === w, width), width + ' CSS px viewport');
}

async function openReader() {
  await evaluate(() => document.querySelector('#zdr-launcher-root').shadowRoot.querySelector('button').click());
  await until(() => evaluate(() => Boolean(document.querySelector('#zdr-reader-root')?.shadowRoot.querySelector('dialog[open]'))),
    'opening the rendered reader');
}

function measureLauncher() {
  return evaluate(() => {
    const host = document.querySelector('#zdr-launcher-root');
    const button = host.shadowRoot.querySelector('button');
    const widget = document.querySelector('#native-floating-widget');
    const launcherRect = button.getBoundingClientRect();
    const widgetRect = widget.getBoundingClientRect();
    const center = rect => [Math.floor(rect.x + rect.width / 2), Math.floor(rect.y + rect.height / 2)];
    const [x, y] = center(launcherRect);
    return {
      x, y,
      inViewport: launcherRect.left >= 0 && launcherRect.top >= 0 &&
        launcherRect.right <= document.documentElement.clientWidth && launcherRect.bottom <= innerHeight,
      separate: launcherRect.right <= widgetRect.left || widgetRect.right <= launcherRect.left ||
        launcherRect.bottom <= widgetRect.top || widgetRect.bottom <= launcherRect.top,
      launcherHit: document.elementFromPoint(x, y) === host && host.shadowRoot.elementFromPoint(x, y) === button,
      widgetHit: document.elementFromPoint(...center(widgetRect)) === widget,
    };
  });
}

async function clickLauncher(x, y) {
  await commandFor('POST', '/actions', {
    actions: [{
      type: 'pointer', id: 'launcher-mouse', parameters: { pointerType: 'mouse' },
      actions: [
        { type: 'pointerMove', origin: 'viewport', duration: 0, x, y },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerUp', button: 0 },
      ],
    }],
  });
  await commandFor('DELETE', '/actions');
  await until(() => evaluate(() => Boolean(document.querySelector('#zdr-reader-root')?.shadowRoot.querySelector('dialog[open]'))),
    'opening the reader with a pointer');
}

async function verifyLauncherAndOpen() {
  const { x, y, ...checks } = await measureLauncher();
  assert.deepEqual(checks, { inViewport: true, separate: true, launcherHit: true, widgetHit: true });
  await clickLauncher(x, y);
}

function setFixedArticleActions(fixed) {
  return evaluate(value => {
    const sticky = document.querySelector('.Post-Main .Sticky.RichContent-actions');
    sticky.classList.toggle('is-fixed', value);
    sticky.classList.toggle('is-bottom', value);
  }, fixed);
}

function measureArticleActions() {
  return evaluate(() => {
    const host = document.querySelector('#zdr-launcher-root');
    const button = host.shadowRoot.querySelector('button');
    const sticky = document.querySelector('.Post-Main .Sticky.RichContent-actions');
    const vote = sticky.querySelector('.VoteButton');
    const launcher = button.getBoundingClientRect();
    const actions = sticky.querySelector('.ContentItem-actions').getBoundingClientRect();
    const voteRect = vote.getBoundingClientRect();
    const center = rect => [Math.floor(rect.x + rect.width / 2), Math.floor(rect.y + rect.height / 2)];
    const [x, y] = center(launcher);
    const originalY = Math.floor(innerHeight - 16 - launcher.height / 2);
    return {
      x, y,
      left: launcher.left,
      bottomInset: innerHeight - launcher.bottom,
      actionsLeft: actions.left,
      actionsHeight: actions.height,
      stickyHeight: sticky.getBoundingClientRect().height,
      gap: actions.top - launcher.bottom,
      launcherHit: document.elementFromPoint(x, y) === host && host.shadowRoot.elementFromPoint(x, y) === button,
      voteHit: document.elementFromPoint(...center(voteRect)) === vote,
      voteCoversOriginalCenter: document.elementFromPoint(x, originalY) === vote,
    };
  });
}

async function verifyFixedArticleActions() {
  await setViewport(906);
  await commandFor('POST', '/url', { url: pathToFileURL(fixturePath).href });
  await until(() => evaluate(() => Boolean(document.querySelector('#zdr-launcher-root'))), 'article launcher mounting');
  const initial = await measureArticleActions();
  within(initial.left, 16, 'article launcher left inset');
  within(initial.bottomInset, 16, 'article launcher default bottom inset');
  assert.equal(initial.launcherHit, true);

  await setFixedArticleActions(true);
  await until(async () => (await measureArticleActions()).bottomInset > initial.bottomInset, 'fixed article actions lift the launcher');
  const lifted = await measureArticleActions();
  within(lifted.left, initial.left, 'lifted article launcher left inset');
  within(lifted.bottomInset - initial.bottomInset, 54, 'article launcher lift');
  within(lifted.actionsLeft, 16, 'native article actions left edge');
  within(lifted.stickyHeight, 44, 'native sticky wrapper height');
  within(lifted.actionsHeight, 54, 'native article actions height');
  within(lifted.gap, 16, 'gap above native article actions');
  assert.equal(lifted.launcherHit, true);
  assert.equal(lifted.voteHit, true);
  assert.equal(lifted.voteCoversOriginalCenter, true);

  await setViewport(1200);
  await until(async () => (await measureArticleActions()).bottomInset === initial.bottomInset, 'wide viewport restores the launcher inset');
  const wide = await measureArticleActions();
  assert.ok(wide.launcherHit && wide.voteHit);
  await setViewport(906);
  await until(async () => (await measureArticleActions()).bottomInset === lifted.bottomInset, 'narrow viewport lifts the launcher again');
  const narrow = await measureArticleActions();
  await clickLauncher(narrow.x, narrow.y);
  await escapeReader();
  await until(async () => (await measureArticleActions()).bottomInset === lifted.bottomInset, 'returning from the reader restores the lift');

  await setFixedArticleActions(false);
  await until(async () => (await measureArticleActions()).bottomInset === initial.bottomInset, 'removing fixed article actions restores the launcher');
  assert.equal((await measureArticleActions()).launcherHit, true);
  return { viewport: 906, lift: lifted.bottomInset - initial.bottomInset, gap: lifted.gap, pointer: 'PASS', restored: 'PASS' };
}

function pressAction(action) {
  return evaluate(name => {
    const host = document.querySelector('#zdr-reader-root');
    host.shadowRoot.querySelector('[data-zdr-action="' + name + '"]').click();
  }, action);
}

function measure() {
  return evaluate(() => {
    const root = document.querySelector('#zdr-reader-root').shadowRoot;
    const target = name => root.querySelector('[data-zdr-region="' + name + '"]');
    const reading = target('document');
    const column = reading.querySelector('.zdr-document-column');
    const style = getComputedStyle(reading);
    const padding = parseFloat(style.paddingInlineStart) + parseFloat(style.paddingInlineEnd);
    const pre = reading.querySelector('pre');
    const nav = target('left-navigation').getBoundingClientRect();
    const outline = target('outline').getBoundingClientRect();
    const article = reading.querySelector('.zdr-richtext');
    return {
      viewport: innerWidth,
      workspaceWidth: root.querySelector('dialog').clientWidth,
      nativeClientWidth: document.documentElement.clientWidth,
      topbar: target('topbar').getBoundingClientRect().height,
      nav: nav.width, outline: outline.width,
      bodyWidth: reading.getBoundingClientRect().width,
      available: reading.clientWidth - padding,
      column: column.getBoundingClientRect().width,
      titleSize: getComputedStyle(column.querySelector('h1')).fontSize,
      bodySize: getComputedStyle(article).fontSize,
      bodyLineHeight: getComputedStyle(article).lineHeight,
      canvasWidth: article.querySelector('canvas')?.width ?? 0,
      fontColor: getComputedStyle(article).color,
      codeOverflowsLocally: pre.scrollWidth > pre.clientWidth,
      bodyFits: reading.scrollWidth <= reading.clientWidth,
      fullBody: article.textContent.includes('SYNTHETIC_ARTICLE_END'),
      unsupportedMarkup: Boolean(article.querySelector('form, iframe, img, script, [onfocus]')),
      titleFits: column.querySelector('h1').scrollWidth <= column.querySelector('h1').clientWidth,
    };
  });
}

function within(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) <= 1.1, label + ' expected ' + expected + ', got ' + actual);
}

async function saveScreenshot(name, mode) {
  const buffer = Buffer.from(await commandFor('GET', '/screenshot'), 'base64');
  assert.ok(buffer.length > 24 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
  assert.equal(buffer.toString('ascii', 12, 16), 'IHDR');
  const viewport = await evaluate(() => [innerWidth, innerHeight]);
  const dimensions = [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
  assert.ok(dimensions.every(value => value > 0));
  await writeFile(join(output, name), buffer);
  screenshots.push({ file: name, viewport, dimensions, mode, bytes: buffer.length, sha256: hash(buffer) });
}

async function escapeReader() {
  const key = '\uE00C';
  await commandFor('POST', '/actions', {
    actions: [{ type: 'key', id: 'reader-keyboard', actions: [{ type: 'keyDown', value: key }, { type: 'keyUp', value: key }] }],
  });
  await commandFor('DELETE', '/actions');
  await until(() => evaluate(() => !document.querySelector('#zdr-reader-root')), 'Escape removes the reader root');
}

try {
  await until(async () => {
    if (driverError || driver.exitCode !== null) throw driverError ?? new Error(driverOutput);
    try { return (await request('GET', '/status')).ready; } catch { return false; }
  }, 'local WebDriver readiness');

  const opened = await request('POST', '/session', {
    capabilities: {
      alwaysMatch: {
        browserName: profile.name,
        pageLoadStrategy: 'eager',
        [profile.options]: {
          args: [
            '--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
            '--disable-extensions', '--disable-dev-shm-usage', '--disable-gpu', '--no-proxy-server', '--no-sandbox',
          ],
        },
      },
    },
  });
  session = opened.sessionId;
  browserInfo = { name: opened.capabilities.browserName, version: opened.capabilities.browserVersion, platform: opened.capabilities.platformName };

  for (const [width, expectedNav, expectedOutline] of [[1440, 224, 200], [1200, 224, 200], [900, 224, 0], [885, 0, 0]]) {
    await setViewport(width);
    await commandFor('POST', '/url', { url: pathToFileURL(fixturePath).href });
    await until(() => evaluate(() => document.querySelector('[data-fixture-image="loaded"]').naturalWidth > 0),
      'decoded synthetic native image');
    const nativeScroll = await evaluate(stress => {
      if (stress) document.querySelector('.Post-Title').textContent = '测试长标题与中文换行'.repeat(25);
      window.scrollTo(0, 400);
      return window.scrollY;
    }, width === 885);
    assert.ok(nativeScroll > 0);
    assert.equal(await evaluate(() => document.querySelectorAll('#zdr-launcher-root').length), 1);
    await verifyLauncherAndOpen();

    const geometry = await measure();
    assert.equal(geometry.viewport, width);
    within(geometry.topbar, 56, 'topbar height');
    within(geometry.nav, expectedNav, 'left navigation width');
    within(geometry.outline, expectedOutline, 'right outline width');
    within(geometry.workspaceWidth, geometry.nativeClientWidth, 'workspace fits the native client area');
    within(geometry.bodyWidth, geometry.workspaceWidth - expectedNav - expectedOutline, 'native grid width');
    within(geometry.column, Math.min(768, geometry.available), 'default reading width');
    assert.equal(geometry.titleSize, '32px');
    assert.equal(geometry.bodySize, '17px');
    within(parseFloat(geometry.bodyLineHeight), 28.9, 'body line height');
    assert.equal(geometry.canvasWidth, 600);
    assert.ok(geometry.bodyFits && geometry.codeOverflowsLocally && geometry.titleFits && geometry.fullBody);
    assert.equal(geometry.unsupportedMarkup, false);
    if (width === 1440) {
      await saveScreenshot('reader-layout.png', 'default light');
      await pressAction('nav');
      within((await measure()).nav, 52, 'collapsed left navigation width');
      await pressAction('width-wide');
      within((await measure()).column, 960, 'wide cap with extra reading space');
      await pressAction('width-default');
      await pressAction('nav');
    }

    await pressAction('width-wide');
    const wide = await measure();
    within(wide.column, Math.min(960, wide.available), 'wide reading width');
    await pressAction('width-full');
    const full = await measure();
    within(full.column, full.available, 'full reading width');
    await pressAction('width-default');

    if (width < 1200) await pressAction('outline');
    assert.ok(await evaluate(() => document.querySelector('#zdr-reader-root').shadowRoot.querySelectorAll('[data-zdr-action="section"]').length === 5));
    await evaluate(() => document.querySelector('#zdr-reader-root').shadowRoot.querySelector('[data-zdr-section="1"]').click());
    const anchored = await evaluate(() => {
      const root = document.querySelector('#zdr-reader-root').shadowRoot;
      return { focused: root.activeElement?.id, active: root.querySelector('[aria-current="location"]')?.dataset.zdrSection };
    });
    assert.deepEqual(anchored, { focused: 'zdr-section-2', active: '1' });
    if (width === 1200) await saveScreenshot('reader-typography.png', 'light, section anchor');

    await pressAction('theme-dark');
    assert.notEqual((await measure()).fontColor, geometry.fontColor);
    if (width === 900) {
      await pressAction('outline');
      await saveScreenshot('reader-interaction.png', 'dark, active section and outline overlay');
    }
    if (width === 885) {
      await pressAction('nav');
      await pressAction('outline');
      assert.deepEqual(await evaluate(() => {
        const root = document.querySelector('#zdr-reader-root').shadowRoot;
        return [...root.querySelectorAll('[data-zdr-action="nav"], [data-zdr-action="outline"]')].map(x => x.getAttribute('aria-expanded'));
      }), ['false', 'true']);
    }

    await escapeReader();
    const restored = await evaluate(() => {
      const host = document.querySelector('#zdr-launcher-root');
      return { scroll: window.scrollY, focused: host?.shadowRoot.activeElement?.textContent, count: document.querySelectorAll('#zdr-launcher-root').length };
    });
    assert.deepEqual(restored, { scroll: nativeScroll, focused: '进入阅读模式', count: 1 });
    scenarios.push({ width, geometry, wide: wide.column, full: full.column, anchor: anchored.active, nativeScroll, restore: 'PASS' });
  }

  const fixedArticleActions = await verifyFixedArticleActions();
  await setViewport(600);
  await verifyLauncherAndOpen();
  await escapeReader();

  for (let cycle = 0; cycle < 5; cycle += 1) {
    await openReader();
    await evaluate(() => window.runSyntheticReader());
    assert.equal(await evaluate(() => document.querySelectorAll('#zdr-reader-root').length), 1);
    await escapeReader();
  }
  await openReader();
  await evaluate(() => window.setSyntheticRoute('https://www.zhihu.com/hot', 'currententrychange'));
  assert.equal(await evaluate(() => document.querySelector('#zdr-reader-root') === null), true);
  await evaluate(() => window.setSyntheticRoute('https://zhuanlan.zhihu.com/p/990041', 'popstate'));
  await openReader();
  await evaluate(() => {
    const blocked = document.createElement('div');
    blocked.className = 'SignFlowModal';
    blocked.textContent = '合成访问限制';
    document.querySelector('.Post-Main').append(blocked);
  });
  await until(() => evaluate(() => document.querySelector('#zdr-reader-root') === null), 'restriction closes the reader');
  await evaluate(() => document.querySelector('#zdr-launcher-root').shadowRoot.querySelector('button').click());
  assert.match(await evaluate(() => document.querySelector('#zdr-launcher-root').shadowRoot.querySelector('[role="status"]').textContent), /访问限制/);
  assert.equal(await evaluate(() => performance.getEntriesByType('resource').filter(entry => /^https?:/.test(entry.name)).length), 0);

  const report = {
    evidence: 'synthetic browser rendering, local file fixture and simulated route; no live Zhihu or Tampermonkey',
    browser: browserInfo, systemRelease: release(), bundleSha256: hash(bundle), scenarios, screenshots,
    launcher: { pointerWithNativeWidget: 'PASS', widths: [600, 885, 900, 1200, 1440], fixedArticleActions },
    lifecycle: { fiveCycles: 'PASS', escapeAndFocus: 'PASS', syntheticRouteAndBack: 'PASS', restrictedFallback: 'PASS' },
  };
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
} catch (error) {
  console.error(driverOutput);
  throw error;
} finally {
  if (session) await commandFor('DELETE', '').catch(() => {});
  driver.kill();
  await rm(fixtureDir, { recursive: true, force: true });
}
