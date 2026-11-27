const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { chromium } = require(process.env.M03_PLAYWRIGHT || 'playwright');

const research = __dirname;
const upstream = process.env.M03_UPSTREAM || path.resolve(research, '../../../../upstream');
const project = path.resolve(research, '../../..');
const read = file => fs.readFileSync(file, 'utf8');

const adapters = ['route.js', 'rich-content.js', 'dom.js'].map(name => read(path.join(project, 'src/adapters', name))).join('\n');
const readabilityPath = path.join(upstream, 'readability/Readability.js');
const purifyPath = path.join(upstream, 'DOMPurify/dist/purify.min.js');
const bundles = { current: path.join(project, 'dist/bundle.user.js'), readability: readabilityPath, purify: purifyPath };
const sizes = Object.fromEntries(Object.entries(bundles).map(([name, file]) => {
  const data = Buffer.from(read(file).replace(/\r\n/g, '\n'));
  return [name, {bytes: data.length, gzip: zlib.gzipSync(data).length}];
}));

const zhihu = 'https://www.zhihu.com';
const article = 'https://zhuanlan.zhihu.com/p/100';
const phrase = '这段正文记录了实验条件和观测结果，并为后续比较提供足够多的上下文。';
const detail = '<p>本文正文标记 ' + phrase.repeat(10) + '</p><h2>实验结果</h2><blockquote>引文</blockquote><ul><li>列表</li></ul><pre><code>console.log("ok")</code></pre><a href="/p/100">来源</a>';
const answer = (id, body, extra = '') => '<div class="AnswerItem">' +
  '<meta itemprop="url" content="' + zhihu + '/question/100/answer/' + id + '">' +
  '<div class="RichContent-inner"><div class="RichText">' + body + '</div></div>' + extra + '</div>';

const cases = [
  {name: 'article', url: article, html: '<article class="Post-Main"><h1 class="Post-Title">专栏标题</h1><div class="Post-RichText">' + detail + '</div></article>', expected: 'ready'},
  {name: 'target-answer', url: zhihu + '/question/100/answer/2', html: '<h1 class="QuestionHeader-title">问题标题</h1>' + answer(1, '<p>其他答案 ' + phrase.repeat(20) + '</p>') + answer(2, detail), expected: 'ready'},
  {name: 'clipped-answer', url: zhihu + '/question/100/answer/2', html: '<h1 class="QuestionHeader-title">问题标题</h1>' + answer(2, detail, '<button class="ContentItem-expandButton">继续阅读</button>'), expected: 'unavailable'},
  {name: 'missing-body', url: article, html: '<article class="Post-Main"><h1 class="Post-Title">专栏标题</h1></article>', expected: 'unavailable'},
  {name: 'list-preview', url: zhihu + '/hot', html: '<div class="HotList"><section class="HotItem"><h2 class="HotItem-title"><a href="/question/100">热门问题</a></h2><p class="HotItem-excerpt">' + phrase.repeat(10) + '</p></section></div>', expected: 'ready'},
  {name: 'restricted', url: article, html: '<div class="Captcha">访问验证</div><article class="Post-Main"><h1 class="Post-Title">专栏标题</h1><div class="Post-RichText">' + detail + '</div></article>', expected: 'restricted'},
  {name: 'long-article', url: article, html: '<article class="Post-Main"><h1 class="Post-Title">专栏标题</h1><div class="Post-RichText">' + detail.repeat(75) + '</div></article>', expected: 'ready'},
];

async function runBrowser(channel) {
  const browser = await chromium.launch({channel, headless: true});
  const page = await browser.newPage();
  await page.route('**/*', route => route.abort());
  try {
    const results = [];
    for (const fixture of cases) {
      await page.setContent('<!doctype html><meta charset="utf-8"><body>' + fixture.html + '</body>');
      await page.addScriptTag({content: adapters});
      await page.addScriptTag({path: readabilityPath});
      await page.addScriptTag({path: purifyPath});
      const result = await page.evaluate(({url}) => {
        const size = sample => Math.round(sample * 100) / 100;
        function measure(task) {
          for (let n = 0; n < 8; n++) task();
          const times = [];
          let value;
          for (let n = 0; n < 40; n++) {
            const start = performance.now();
            value = task();
            times.push(performance.now() - start);
          }
          times.sort((a,b) => a-b);
          return {p50: size(times[19]), p95: size(times[37]), value};
        }
        const current = measure(() => readNativePage(document, window, identifyRoute(url)));
        const generic = measure(() => new Readability(document.cloneNode(true), {charThreshold: 100}).parse());
        const clean = DOMPurify.sanitize('<h2>标题</h2><p><strong>正文</strong></p><form><input name="sample"></form><table><tbody><tr><td>表格</td></tr></tbody></table>', {
          ALLOWED_TAGS: ['h2','p','strong'],
          ALLOWED_ATTR: [],
        });
        const defaultClean = DOMPurify.sanitize('<h2>标题</h2><p><strong>正文</strong></p><form><input name="sample"></form><table><tbody><tr><td>表格</td></tr></tbody></table>');
        const report = { current: {status:current.value.status, complete: Boolean(current.value.record?.content), p50:current.p50,p95:current.p95},
          readability:{hasResult:Boolean(generic.value), main:generic.value?.textContent.includes('本文正文标记') ?? false, otherAnswer:generic.value?.textContent.includes('其他答案') ?? false,p50:generic.p50,p95:generic.p95},
          purify:{version:DOMPurify.version, keepsHeading:clean.includes('<h2>'), limitedSet:/<\/?(form|input|table)\b/.test(clean) === false, defaultRetainsForm:/<form\b/.test(defaultClean)}};
        return report;
      }, fixture);
      if (result.current.status !== fixture.expected) throw Error(fixture.name + ' expected ' + fixture.expected);
      if (result.current.complete !== ['article','target-answer','long-article'].includes(fixture.name)) throw Error('body boundary changed');
      if (!result.purify.limitedSet || !result.purify.keepsHeading) throw Error('allowlist regression');
      results.push({name:fixture.name, ...result});
    }
    return {channel, version:browser.version(), results};
  } finally {
    await browser.close();
  }
}

(async () => {
  const results = [];
  for (const channel of ['chrome','msedge']) results.push(await runBrowser(channel));
  console.log(JSON.stringify({sizes, results}, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
