// Run in DevTools after selecting one visible element in the Elements panel.
(() => {
  const element = typeof $0 === "undefined" ? null : $0;
  if (!(element instanceof Element) || !element.isConnected || element.ownerDocument !== document) {
    console.warn("请在当前页面的 Elements 面板选中要测量的元素。");
    return;
  }

  if (typeof element.checkVisibility !== "function") {
    console.warn("请使用支持 Element.checkVisibility 的 Chrome 或 Edge。");
    return;
  }
  if (!element.checkVisibility({
    contentVisibilityAuto: true,
    opacityProperty: true,
    visibilityProperty: true,
  })) {
    console.warn("请先让选中的元素可见，再运行测量。");
    return;
  }

  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0 || rect.right <= 0 || rect.bottom <= 0 ||
      rect.left >= viewport.width || rect.top >= viewport.height) {
    console.warn("请将有实际尺寸的选中元素移到视口内，再运行测量。");
    return;
  }

  const properties = [
    "box-sizing", "width", "height", "min-width", "max-width", "display", "position", "gap",
    "font-family", "font-size", "font-weight", "line-height", "letter-spacing",
    "text-align", "text-decoration-line",
    "padding-top", "padding-right", "padding-bottom", "padding-left",
    "margin-top", "margin-right", "margin-bottom", "margin-left",
    "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
    "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
    "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
    "border-top-left-radius", "border-top-right-radius",
    "border-bottom-right-radius", "border-bottom-left-radius",
    "outline-width", "outline-style", "outline-color", "outline-offset",
    "background-color", "color", "box-shadow",
  ];
  const style = window.getComputedStyle(element);
  const computedStyle = {};
  for (const property of properties) {
    computedStyle[property] = style.getPropertyValue(property);
  }

  console.log(JSON.stringify({
    schemaVersion: 1,
    rectCssPx: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    computedStyle,
    viewportCssPx: viewport,
    devicePixelRatio: window.devicePixelRatio,
  }, null, 2));
})();
