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

function createReaderLauncher(document, view, route, onEnter) {
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

  const actionsObserver = route.kind === 'article' ? new view.MutationObserver(schedulePlacement) : null;
  let actions = null;
  let frame = null;
  let lift = 0;

  function placeLauncher() {
    frame = null;
    const current = document.querySelector('.Post-Main .Sticky.RichContent-actions');
    if (current !== actions) {
      actionsObserver.disconnect();
      actions = current;
      if (actions) actionsObserver.observe(actions, { attributes: true, attributeFilter: ['class', 'style'] });
    }

    let nextLift = 0;
    if (actions?.matches('.is-fixed.is-bottom')) {
      const style = view.getComputedStyle(actions);
      if (style.position === 'fixed' && style.visibility === 'visible') {
        const fixed = actions.getBoundingClientRect();
        const inner = actions.querySelector('.ContentItem-actions')?.getBoundingClientRect() ?? fixed;
        const rect = launcher.getBoundingClientRect();
        // Measure against the original position so lifting cannot repeatedly reset the offset.
        const top = rect.top + lift;
        const bottom = rect.bottom + lift;
        const barTop = Math.min(fixed.top, inner.top);
        const barBottom = Math.max(fixed.bottom, inner.bottom);
        const barLeft = Math.min(fixed.left, inner.left);
        const barRight = Math.max(fixed.right, inner.right);
        if (rect.left < barRight && rect.right > barLeft && top < barBottom && bottom > barTop) {
          const clearance = Math.ceil(document.documentElement.clientHeight - barTop);
          nextLift = Math.max(0, Math.min(Math.floor(top), clearance));
        }
      }
    }
    if (nextLift === lift) return;
    lift = nextLift;
    launcher.style.setProperty('--zdr-launcher-avoidance', lift + 'px');
  }

  function schedulePlacement() {
    if (actionsObserver && frame === null) frame = view.requestAnimationFrame(placeLauncher);
  }

  if (actionsObserver) {
    view.addEventListener('resize', schedulePlacement);
    view.addEventListener('scroll', schedulePlacement, { capture: true, passive: true });
  }

  return {
    host,
    schedulePlacement,
    report(message) {
      status.textContent = message;
      schedulePlacement();
    },
    focus() { button.focus({ preventScroll: true }); },
    dispose() {
      if (actionsObserver) {
        actionsObserver.disconnect();
        view.removeEventListener('resize', schedulePlacement);
        view.removeEventListener('scroll', schedulePlacement, { capture: true });
        if (frame !== null) view.cancelAnimationFrame(frame);
      }
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
