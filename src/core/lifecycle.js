const readerInstance = Symbol.for('zhihu-doc-reader:controller');

function installReader(view, document) {
  if (view[readerInstance] || !document.body) return;

  const state = createReaderState();
  const navigation = view.navigation;
  let href;
  let launcher = null;
  let panel = null;

  function removePanel() {
    const current = panel;
    panel = null;
    state.exit();
    current?.dispose();
  }

  function removeLauncher() {
    const current = launcher;
    launcher = null;
    current?.dispose();
  }

  function sync() {
    if (view.location.href !== href) {
      href = view.location.href;
      if (state.setRoute(identifyRoute(href))) {
        removePanel();
        removeLauncher();
      }
    }
    if (!state.route || !document.body) return;
    if (panel) {
      if (panel.host.parentNode === document.body && !accessLimited(document, view)) return;
      removePanel();
    }
    if (launcher?.host.parentNode === document.body) {
      launcher.schedulePlacement();
      return;
    }
    removeLauncher();
    launcher = createReaderLauncher(document, view, state.route, enter);
    document.body.append(launcher.host);
    launcher.schedulePlacement();
  }

  function enter() {
    const pressed = launcher;
    try {
      sync();
      if (!pressed || pressed !== launcher || state.isOpen) return;
      const { status, record } = readNativePage(document, view, state.route);
      if (!record) {
        pressed.report(status === 'restricted' ? '请在知乎原生页面处理访问限制。' : '当前页面暂无可读取的已加载内容。');
        return;
      }
      if (!state.enter()) return;
      panel = createReadingPanel(document, view, state.route, record, exit);
      panel.show(document.body);
      removeLauncher();
    } catch {
      removePanel();
      onChange();
      launcher?.report('阅读模式暂不可用，请继续使用知乎原生页面。');
    }
  }

  function exit() {
    removePanel();
    onChange();
    launcher?.focus();
  }

  function onChange() {
    try {
      sync();
    } catch {
      stop();
    }
  }

  const observer = new view.MutationObserver(onChange);

  function stop() {
    observer.disconnect();
    navigation?.removeEventListener('currententrychange', onChange);
    view.removeEventListener('popstate', onChange);
    view.removeEventListener('hashchange', onChange);
    view.removeEventListener('pagehide', onPageHide);
    removePanel();
    removeLauncher();
    delete view[readerInstance];
  }

  function onPageHide(event) {
    stop();
    if (event.persisted) {
      view.addEventListener('pageshow', () => installReader(view, document), { once: true });
    }
  }

  view[readerInstance] = true;
  try {
    navigation?.addEventListener('currententrychange', onChange);
    view.addEventListener('popstate', onChange);
    view.addEventListener('hashchange', onChange);
    view.addEventListener('pagehide', onPageHide);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    sync();
  } catch {
    stop();
  }
}
