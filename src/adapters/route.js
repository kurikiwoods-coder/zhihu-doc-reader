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
