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

function createReadingPanel(document, view, route, record, onExit) {
  const { host, shadow } = createShell(document, 'zdr-reader-root');
  const dialog = document.createElement('dialog');
  dialog.className = 'zdr-reader zdr-workspace';
  dialog.dataset.zdrWidth = 'default';
  dialog.dataset.zdrTheme = 'light';
  dialog.setAttribute('aria-labelledby', 'zdr-reader-label');

  const { header, nav, outline } = createTopbar(document, route, record);
  const reading = createDocumentRegion(document, record);
  const contents = createRightOutline(document, reading);
  const layout = document.createElement('div');
  layout.className = 'zdr-layout';
  layout.append(
    createLeftNavigation(document, route.kind),
    reading,
    contents.outline,
  );
  dialog.append(header, layout);
  shadow.append(dialog);

  const choices = { nav: null, outline: null };
  let preferredPanel = 'nav';
  let currentSection = null;

  function syncPanels() {
    const style = view.getComputedStyle(dialog);
    const navOverlays = style.getPropertyValue?.('--zdr-nav-overlay').trim() === '1';
    const outlineOverlays = style.getPropertyValue?.('--zdr-outline-overlay').trim() === '1';
    let navOpen = choices.nav ?? !navOverlays;
    let outlineOpen = choices.outline ?? !outlineOverlays;
    if (navOverlays && navOpen && outlineOpen) {
      navOpen = preferredPanel === 'nav';
      outlineOpen = !navOpen;
    }
    dialog.dataset.zdrNavOpen = String(navOpen);
    dialog.dataset.zdrOutlineOpen = String(outlineOpen);
    nav.setAttribute('aria-expanded', String(navOpen));
    outline.setAttribute('aria-expanded', String(outlineOpen));
    return navOverlays;
  }

  function setCurrentSection(section) {
    if (section === currentSection) return;
    currentSection?.button.removeAttribute('aria-current');
    currentSection = section;
    section?.button.setAttribute('aria-current', 'location');
  }

  function sectionOffset(heading) {
    const margin = Number.parseFloat(view.getComputedStyle(heading).scrollMarginTop) || 0;
    return heading.getBoundingClientRect().top - reading.getBoundingClientRect().top - margin;
  }

  function onReadingScroll() {
    const { sections } = contents;
    if (!sections.length) return;
    const nearest = sections.findLast(section => sectionOffset(section.heading) <= 1);
    setCurrentSection(nearest || sections[0]);
  }

  function jumpToSection(button) {
    const section = contents.sections[Number(button.dataset.zdrSection)];
    if (!section) return;
    const overlay = view.getComputedStyle(dialog).getPropertyValue?.('--zdr-outline-overlay').trim() === '1';
    if (overlay) {
      choices.outline = false;
      syncPanels();
    }
    reading.scrollTop += sectionOffset(section.heading);
    section.heading.focus({ preventScroll: true });
    setCurrentSection(section);
  }

  function onClick(event) {
    const button = event.target.closest?.('button[data-zdr-action]');
    if (!button || !dialog.contains(button)) return;
    const action = button.dataset.zdrAction;
    if (action === 'exit') {
      onExit();
    } else if (action === 'section') {
      jumpToSection(button);
    } else if (action === 'nav' || action === 'outline') {
      const compact = syncPanels();
      const toggle = action === 'nav' ? nav : outline;
      choices[action] = toggle.getAttribute('aria-expanded') !== 'true';
      if (choices[action]) {
        preferredPanel = action;
        if (compact) choices[action === 'nav' ? 'outline' : 'nav'] = false;
      }
      syncPanels();
    } else if (/^(width-(default|wide|full)|theme-(light|dark))$/.test(action)) {
      const [group, value] = action.split('-');
      if (group === 'width') dialog.dataset.zdrWidth = value;
      else dialog.dataset.zdrTheme = value;
      for (const item of dialog.querySelectorAll('button[data-zdr-action^="' + group + '-"]')) {
        item.setAttribute('aria-pressed', String(item === button));
      }
    }
  }

  function onCancel(event) {
    event.preventDefault();
    onExit();
  }
  dialog.addEventListener('click', onClick);
  dialog.addEventListener('cancel', onCancel);
  dialog.addEventListener('close', onExit);
  return {
    host,
    show(body) {
      body.append(host);
      dialog.showModal();
      syncPanels();
      onReadingScroll();
      reading.addEventListener('scroll', onReadingScroll, { passive: true });
      view.addEventListener('resize', syncPanels);
    },
    dispose() {
      reading.removeEventListener('scroll', onReadingScroll);
      view.removeEventListener('resize', syncPanels);
      dialog.removeEventListener('click', onClick);
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
