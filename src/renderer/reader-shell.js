function createShell(document, id) {
  const host = document.createElement('div');
  host.id = id;
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = READER_CSS;
  shadow.append(style);
  return { host, shadow };
}

function createButton(document, text) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  return button;
}

function createReaderLauncher(document, onEnter) {
  const { host, shadow } = createShell(document, 'zdr-launcher-root');
  const launcher = document.createElement('div');
  launcher.className = 'zdr-reader zdr-launcher';
  const button = createButton(document, '进入阅读模式');
  button.setAttribute('aria-haspopup', 'dialog');
  const status = document.createElement('span');
  status.setAttribute('role', 'status');
  launcher.append(button, status);
  shadow.append(launcher);
  button.addEventListener('click', onEnter);
  return {
    host,
    report(message) { status.textContent = message; },
    focus() { button.focus({ preventScroll: true }); },
    dispose() {
      button.removeEventListener('click', onEnter);
      host.remove();
    },
  };
}

function createTopbar(document, exitButton) {
  const topbar = document.createElement('header');
  topbar.dataset.zdrRegion = 'topbar';
  const label = document.createElement('span');
  label.id = 'zdr-reader-label';
  label.textContent = '文档阅读';
  topbar.append(label, exitButton);
  return topbar;
}

function createLeftNavigation(document) {
  const navigation = document.createElement('nav');
  navigation.dataset.zdrRegion = 'left-navigation';
  navigation.hidden = true;
  return navigation;
}

function createDocumentRegion(document, record) {
  const region = document.createElement('main');
  region.dataset.zdrRegion = 'document';
  const heading = document.createElement('h2');
  heading.textContent = record.title;
  region.append(heading);
  if (record.author) {
    const author = document.createElement('p');
    author.className = 'zdr-byline';
    author.textContent = record.author;
    region.append(author);
  }
  if (record.excerpt) {
    const excerpt = document.createElement('p');
    excerpt.textContent = record.excerpt;
    region.append(excerpt);
  }
  return region;
}

function createRightOutline(document) {
  const outline = document.createElement('aside');
  outline.dataset.zdrRegion = 'outline';
  outline.hidden = true;
  return outline;
}

function createReadingPanel(document, record, onExit) {
  const { host, shadow } = createShell(document, 'zdr-reader-root');
  const dialog = document.createElement('dialog');
  dialog.className = 'zdr-reader zdr-verification';
  dialog.setAttribute('aria-labelledby', 'zdr-reader-label');
  const exitButton = createButton(document, '退出阅读模式');
  exitButton.setAttribute('autofocus', '');
  dialog.append(
    createTopbar(document, exitButton),
    createLeftNavigation(document),
    createDocumentRegion(document, record),
    createRightOutline(document),
  );
  shadow.append(dialog);

  function onCancel(event) {
    event.preventDefault();
    onExit();
  }
  exitButton.addEventListener('click', onExit);
  dialog.addEventListener('cancel', onCancel);
  dialog.addEventListener('close', onExit);
  return {
    host,
    show(body) {
      body.append(host);
      dialog.showModal();
    },
    dispose() {
      exitButton.removeEventListener('click', onExit);
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('close', onExit);
      try {
        if (dialog.open) dialog.close();
      } catch {
        // Removing the host also removes a disconnected dialog from the top layer.
      } finally {
        host.remove();
      }
    },
  };
}
