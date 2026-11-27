const readerPageLabels = {
  home: '推荐', hot: '热榜', follow: '关注', search: '搜索', question: '问答', article: '专栏',
};

function createReaderAction(document, label, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'zdr-action';
  button.textContent = label;
  button.dataset.zdrAction = action;
  return button;
}

function createReaderLink(document, href, label) {
  const link = document.createElement('a');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.referrerPolicy = 'no-referrer';
  link.textContent = label;
  return link;
}

function createReaderSettings(document) {
  const settings = document.createElement('details');
  settings.className = 'zdr-settings';
  const summary = document.createElement('summary');
  summary.className = 'zdr-action';
  summary.textContent = '阅读设置';
  const menu = document.createElement('div');
  menu.className = 'zdr-settings-menu';

  for (const [name, options] of [
    ['正文宽度', [['默认', 'width-default'], ['较宽', 'width-wide'], ['全宽', 'width-full']]],
    ['外观', [['浅色', 'theme-light'], ['深色', 'theme-dark']]],
  ]) {
    const group = document.createElement('div');
    group.className = 'zdr-settings-group';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', name);
    const label = document.createElement('span');
    label.textContent = name;
    group.append(label);
    for (const [label, action] of options) {
      const option = createReaderAction(document, label, action);
      option.setAttribute('aria-pressed', String(action === 'width-default' || action === 'theme-light'));
      group.append(option);
    }
    menu.append(group);
  }
  settings.append(summary, menu);
  return settings;
}

function createTopbar(document, route, record) {
  const header = document.createElement('header');
  header.dataset.zdrRegion = 'topbar';

  const identity = document.createElement('div');
  identity.className = 'zdr-brand';
  const nav = createReaderAction(document, '导航', 'nav');
  nav.setAttribute('aria-controls', 'zdr-navigation');
  const mark = document.createElement('span');
  mark.className = 'zdr-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '文';
  const name = document.createElement('span');
  name.className = 'zdr-name';
  name.id = 'zdr-reader-label';
  name.textContent = '知乎文档阅读器';
  const pageType = document.createElement('span');
  pageType.className = 'zdr-page-type';
  pageType.textContent = readerPageLabels[route.kind];
  identity.append(nav, mark, name, pageType);

  const tools = document.createElement('div');
  tools.className = 'zdr-tools';
  const outline = createReaderAction(document, '目录', 'outline');
  outline.setAttribute('aria-controls', 'zdr-outline');
  tools.append(outline, createReaderSettings(document));
  if (record.sourceUrl) {
    const source = createReaderLink(document, record.sourceUrl, '打开原文');
    source.className = 'zdr-action zdr-source-button';
    tools.append(source);
  }
  const exit = createReaderAction(document, '退出阅读模式', 'exit');
  exit.autofocus = true;
  exit.setAttribute('autofocus', '');
  tools.append(exit);
  header.append(identity, tools);
  return { header, nav, outline };
}

function createLeftNavigation(document, kind) {
  const nav = document.createElement('nav');
  nav.dataset.zdrRegion = 'left-navigation';
  nav.id = 'zdr-navigation';
  nav.setAttribute('aria-label', '阅读器导航');
  const list = document.createElement('ul');
  list.className = 'zdr-nav-list';

  for (const [key, icon, label] of [
    ['home', '荐', '推荐'], ['hot', '榜', '热榜'], ['follow', '关', '关注'],
    ['search', '搜', '搜索'], ['saved', '藏', '收藏'], ['history', '史', '历史'],
  ]) {
    const row = document.createElement('li');
    row.className = 'zdr-nav-item';
    row.setAttribute('aria-disabled', 'true');
    row.setAttribute('aria-label', label + '，' + (key === kind ? '当前原生页面' : '待接入'));
    if (key === kind) row.setAttribute('aria-current', 'page');
    const symbol = document.createElement('span');
    symbol.className = 'zdr-nav-icon';
    symbol.textContent = icon;
    symbol.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.className = 'zdr-nav-label';
    text.textContent = label;
    const status = document.createElement('span');
    status.className = 'zdr-nav-status';
    status.textContent = key === kind ? '当前页' : '待接入';
    row.append(symbol, text, status);
    list.append(row);
  }
  nav.append(list);
  return nav;
}

function createDocumentRegion(document, record) {
  const region = document.createElement('main');
  region.dataset.zdrRegion = 'document';
  const column = document.createElement('article');
  column.className = 'zdr-document-column';
  const heading = document.createElement('h1');
  heading.className = 'zdr-document-title';
  heading.textContent = record.title;
  column.append(heading);
  if (record.author) {
    const author = document.createElement('p');
    author.className = 'zdr-byline';
    author.textContent = record.author;
    column.append(author);
  }

  const notice = document.createElement('p');
  notice.className = 'zdr-reading-note';
  notice.textContent = '当前页面预览';
  column.append(notice);
  if (record.excerpt) {
    const preview = document.createElement('p');
    preview.className = 'zdr-preview';
    preview.textContent = record.excerpt;
    column.append(preview);
  }
  if (record.sourceUrl) {
    const footer = document.createElement('footer');
    footer.className = 'zdr-document-source';
    footer.append(createReaderLink(document, record.sourceUrl, '来源 · 知乎原文'));
    column.append(footer);
  }
  region.append(column);
  return region;
}

function createRightOutline(document) {
  const outline = document.createElement('aside');
  outline.dataset.zdrRegion = 'outline';
  outline.id = 'zdr-outline';
  outline.setAttribute('aria-label', '本文目录');
  const heading = document.createElement('h2');
  heading.className = 'zdr-outline-title';
  heading.textContent = '本文目录';
  const empty = document.createElement('p');
  empty.className = 'zdr-reading-note';
  empty.textContent = '此处没有可用的章节目录。';
  outline.append(heading, empty);
  return outline;
}
