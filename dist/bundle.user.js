// ==UserScript==
// @name         Zhihu Doc Reader
// @namespace    https://github.com/kurikiwoods-coder/zhihu-doc-reader
// @version      0.0.4
// @description  DOM-only document reading for Zhihu
// @match        https://www.zhihu.com/*
// @match        https://zhuanlan.zhihu.com/p/*
// @run-at       document-idle
// @noframes
// @grant        none
// @updateURL    none
// @downloadURL  none
// ==/UserScript==

/*
MIT License

Copyright (c) 2026 connectedGraph

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(() => {
  'use strict';
const READER_CSS = "/* Owner-approved V1.0 initial design baseline. Visual revisions follow PDT V1.3. */\n.zdr-reader {\n  --zdr-header-height: 56px;\n  --zdr-header-padding-block: 0px;\n  --zdr-header-padding-inline: 20px;\n  --zdr-sidebar-width: 224px;\n  --zdr-sidebar-collapsed-width: 52px;\n  --zdr-sidebar-padding: 12px;\n  --zdr-outline-width: 200px;\n  --zdr-outline-padding: 12px;\n  --zdr-outline-indent: 12px;\n  --zdr-content-width: 768px;\n  --zdr-content-width-wide: 960px;\n  --zdr-content-width-full: 100%;\n  --zdr-content-padding-inline: 24px;\n  --zdr-content-padding-inline-compact: 16px;\n  --zdr-content-padding-block: 32px;\n  --zdr-nav-row-height: 36px;\n  --zdr-selected-marker-width: 3px;\n  --zdr-anchor-offset: calc(var(--zdr-header-height) + 12px);\n  --zdr-font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif;\n  --zdr-font-size: 17px;\n  --zdr-line-height: 1.7;\n  --zdr-text-weight: 400;\n  --zdr-title-size: 32px;\n  --zdr-title-line-height: 1.25;\n  --zdr-title-weight: 700;\n  --zdr-h1-size: 24px;\n  --zdr-h1-line-height: 1.4;\n  --zdr-h2-size: 20px;\n  --zdr-h2-line-height: 1.45;\n  --zdr-h3-size: 18px;\n  --zdr-h3-line-height: 1.5;\n  --zdr-heading-weight: 600;\n  --zdr-heading-letter-spacing: normal;\n  --zdr-heading-gap-before: 28px;\n  --zdr-heading-gap-after: 8px;\n  --zdr-paragraph-gap: 12px;\n  --zdr-block-gap: 16px;\n  --zdr-quote-padding-block: 10px;\n  --zdr-quote-padding-inline: 16px;\n  --zdr-quote-rule-width: 3px;\n  --zdr-list-indent: 24px;\n  --zdr-list-item-gap: 4px;\n  --zdr-code-font-family: ui-monospace, SFMono-Regular, Consolas, \"Liberation Mono\", monospace;\n  --zdr-code-font-size: 14px;\n  --zdr-code-line-height: 1.55;\n  --zdr-inline-code-padding-block: 2px;\n  --zdr-inline-code-padding-inline: 4px;\n  --zdr-inline-code-radius: 4px;\n  --zdr-code-block-padding: 16px;\n  --zdr-image-max-width: 100%;\n  --zdr-image-radius: 8px;\n  --zdr-caption-gap: 8px;\n  --zdr-caption-font-size: 13px;\n  --zdr-caption-line-height: 1.5;\n  --zdr-link-underline-offset: 3px;\n  --zdr-border-width: 1px;\n  --zdr-radius: 8px;\n  --zdr-focus-ring-width: 2px;\n  --zdr-focus-ring-offset: 2px;\n  --zdr-background: #F7F8FA;\n  --zdr-surface: #FFFFFF;\n  --zdr-navigation-background: #EFF2F6;\n  --zdr-outline-background: #F7F8FA;\n  --zdr-text: #1F2937;\n  --zdr-text-secondary: #526071;\n  --zdr-primary: #284B97;\n  --zdr-border: #D9E0E9;\n  --zdr-hover: #E8EEF6;\n  --zdr-selected: #DDE8FB;\n  --zdr-selected-text: #203F77;\n  --zdr-focus-color: #284B97;\n  --zdr-quote-background: #EEF3FA;\n  --zdr-quote-rule-color: #5375A4;\n  --zdr-code-background: #EEF2F7;\n  --zdr-shadow-overlay: 0 8px 24px rgba(18, 29, 52, 0.14);\n}\n\n.zdr-reader[data-zdr-theme=\"dark\"] {\n  --zdr-background: #111821;\n  --zdr-surface: #181F2A;\n  --zdr-navigation-background: #141C29;\n  --zdr-outline-background: #111821;\n  --zdr-text: #E8ECF4;\n  --zdr-text-secondary: #B1BBCB;\n  --zdr-primary: #ADC5FF;\n  --zdr-border: #3B4658;\n  --zdr-hover: #243248;\n  --zdr-selected: #29385B;\n  --zdr-selected-text: #C6D7FF;\n  --zdr-focus-color: #ADC5FF;\n  --zdr-quote-background: #202B3D;\n  --zdr-quote-rule-color: #8CA8DE;\n  --zdr-code-background: #202B3D;\n  --zdr-shadow-overlay: 0 8px 24px rgba(0, 0, 0, 0.38);\n}\n\n\n.zdr-reader {\n  --zdr-control-gap: 8px;\n  --zdr-brand-gap: 10px;\n  --zdr-mark-size: 30px;\n  --zdr-nav-icon-size: 20px;\n  --zdr-status-max-width: 320px;\n  --zdr-panel-min-gutter: 32px;\n  --zdr-nav-overlay: 0;\n  --zdr-outline-overlay: 0;\n  --zdr-nav-track-open: var(--zdr-sidebar-width);\n  --zdr-nav-track-closed: var(--zdr-sidebar-collapsed-width);\n  --zdr-outline-track-open: var(--zdr-outline-width);\n  --zdr-nav-position: relative;\n  --zdr-outline-position: relative;\n  --zdr-nav-panel-size: auto;\n  --zdr-outline-panel-size: auto;\n  --zdr-nav-closed-display: block;\n  --zdr-nav-shadow: none;\n  --zdr-outline-shadow: none;\n  --zdr-reading-gutter: var(--zdr-content-padding-inline);\n}\n\n@media (width < 1200px) {\n  .zdr-reader {\n    --zdr-outline-overlay: 1;\n    --zdr-outline-track-open: 0px;\n    --zdr-outline-position: absolute;\n    --zdr-outline-panel-size: min(var(--zdr-outline-width), calc(100vw - var(--zdr-panel-min-gutter)));\n    --zdr-outline-shadow: var(--zdr-shadow-overlay);\n  }\n}\n\n@media (width < 900px) {\n  .zdr-reader {\n    --zdr-nav-overlay: 1;\n    --zdr-nav-track-open: 0px;\n    --zdr-nav-track-closed: 0px;\n    --zdr-nav-position: absolute;\n    --zdr-nav-panel-size: min(var(--zdr-sidebar-width), calc(100vw - var(--zdr-panel-min-gutter)));\n    --zdr-nav-closed-display: none;\n    --zdr-nav-shadow: var(--zdr-shadow-overlay);\n    --zdr-reading-gutter: var(--zdr-content-padding-inline-compact);\n  }\n}\n\n.zdr-reader.zdr-launcher {\n  position: fixed;\n  /* The native floating widget occupies the opposite corner. */\n  inset-inline-start: var(--zdr-content-padding-inline-compact);\n  inset-block-end: var(--zdr-content-padding-inline-compact);\n  z-index: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: var(--zdr-list-item-gap);\n}\n\n.zdr-launcher [role=\"status\"] {\n  max-inline-size: min(var(--zdr-status-max-width), calc(100vw - var(--zdr-panel-min-gutter)));\n}\n\n.zdr-reader.zdr-workspace {\n  --zdr-column-limit: var(--zdr-content-width);\n  --zdr-nav-track: var(--zdr-nav-track-closed);\n  --zdr-outline-track: 0px;\n  position: fixed;\n  inset: 0;\n  inline-size: 100%;\n  block-size: 100%;\n  max-inline-size: none;\n  max-block-size: none;\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n  overflow: hidden;\n}\n\n.zdr-workspace[open] {\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr);\n}\n\n.zdr-workspace[data-zdr-width=\"wide\"] {\n  --zdr-column-limit: var(--zdr-content-width-wide);\n}\n\n.zdr-workspace[data-zdr-width=\"full\"] {\n  --zdr-column-limit: var(--zdr-content-width-full);\n}\n\n.zdr-workspace[data-zdr-nav-open=\"true\"] {\n  --zdr-nav-track: var(--zdr-nav-track-open);\n}\n\n.zdr-workspace[data-zdr-outline-open=\"true\"] {\n  --zdr-outline-track: var(--zdr-outline-track-open);\n}\n\n.zdr-workspace [data-zdr-region=\"topbar\"] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-wrap: wrap;\n  gap: var(--zdr-control-gap);\n  min-block-size: var(--zdr-header-height);\n  box-sizing: border-box;\n  padding-block: var(--zdr-header-padding-block);\n  padding-inline: var(--zdr-header-padding-inline);\n  z-index: 2;\n}\n\n.zdr-brand, .zdr-tools {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: var(--zdr-brand-gap);\n}\n\n.zdr-layout {\n  display: grid;\n  position: relative;\n  min-block-size: 0;\n  grid-template-columns: var(--zdr-nav-track) minmax(0, 1fr) var(--zdr-outline-track);\n  grid-template-rows: minmax(0, 1fr);\n}\n\n.zdr-workspace [data-zdr-region=\"left-navigation\"],\n.zdr-workspace [data-zdr-region=\"outline\"] {\n  grid-row: 1;\n  inset-block: 0;\n  min-inline-size: 0;\n  box-sizing: border-box;\n  overflow: auto;\n  padding-block: var(--zdr-content-padding-block);\n  z-index: 1;\n}\n\n.zdr-workspace [data-zdr-region=\"left-navigation\"] {\n  grid-column: 1;\n  display: var(--zdr-nav-closed-display);\n  position: var(--zdr-nav-position);\n  inset-inline-start: 0;\n  inline-size: var(--zdr-nav-panel-size);\n  padding-inline: var(--zdr-sidebar-padding);\n}\n\n.zdr-workspace[data-zdr-nav-open=\"true\"] [data-zdr-region=\"left-navigation\"] {\n  display: block;\n}\n\n.zdr-workspace:not([data-zdr-nav-open=\"true\"]) .zdr-nav-label,\n.zdr-workspace:not([data-zdr-nav-open=\"true\"]) .zdr-nav-status {\n  display: none;\n}\n\n.zdr-workspace [data-zdr-region=\"outline\"] {\n  grid-column: 3;\n  display: none;\n  position: var(--zdr-outline-position);\n  inset-inline-end: 0;\n  inline-size: var(--zdr-outline-panel-size);\n  padding-inline: var(--zdr-outline-padding);\n}\n\n.zdr-workspace[data-zdr-outline-open=\"true\"] [data-zdr-region=\"outline\"] {\n  display: block;\n}\n\n.zdr-workspace [data-zdr-region=\"document\"] {\n  grid-column: 2;\n  grid-row: 1;\n  min-inline-size: 0;\n  min-block-size: 0;\n  overflow: auto;\n  padding-block: var(--zdr-content-padding-block);\n  padding-inline: var(--zdr-reading-gutter);\n}\n\n.zdr-document-column {\n  inline-size: min(100%, var(--zdr-column-limit));\n  margin-inline: auto;\n  overflow-wrap: anywhere;\n}\n\n.zdr-reader {\n  font-family: var(--zdr-font-family);\n  font-size: var(--zdr-font-size);\n  font-weight: var(--zdr-text-weight);\n  line-height: var(--zdr-line-height);\n  color: var(--zdr-text);\n}\n\n.zdr-document-title {\n  margin-block: 0 var(--zdr-block-gap);\n  font-size: var(--zdr-title-size);\n  font-weight: var(--zdr-title-weight);\n  line-height: var(--zdr-title-line-height);\n}\n\n.zdr-outline-title {\n  margin-block: 0 var(--zdr-heading-gap-after);\n  font-size: var(--zdr-caption-font-size);\n  font-weight: var(--zdr-heading-weight);\n  line-height: var(--zdr-caption-line-height);\n}\n\n.zdr-byline,\n.zdr-reading-note,\n.zdr-nav-status,\n.zdr-page-type,\n.zdr-document-source,\n.zdr-launcher [role=\"status\"] {\n  color: var(--zdr-text-secondary);\n  font-size: var(--zdr-caption-font-size);\n  line-height: var(--zdr-caption-line-height);\n}\n\n.zdr-byline,\n.zdr-reading-note,\n.zdr-preview {\n  margin-block: var(--zdr-paragraph-gap);\n}\n\n.zdr-name {\n  font-weight: var(--zdr-heading-weight);\n}\n\n.zdr-reader a {\n  color: var(--zdr-primary);\n  text-decoration: underline;\n  text-underline-offset: var(--zdr-link-underline-offset);\n}\n\n\n.zdr-byline {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--zdr-brand-gap);\n}\n\n.zdr-richtext {\n  margin-block-start: var(--zdr-content-padding-block);\n}\n\n.zdr-richtext :is(p, ul, ol, pre, blockquote, figure) {\n  margin-block: var(--zdr-paragraph-gap);\n}\n\n.zdr-richtext :is(h1, h2, h3, h4, h5, h6) {\n  margin-block: var(--zdr-heading-gap-before) var(--zdr-heading-gap-after);\n  font-weight: var(--zdr-heading-weight);\n  letter-spacing: var(--zdr-heading-letter-spacing);\n  scroll-margin-block-start: calc(var(--zdr-anchor-offset) - var(--zdr-header-height));\n}\n\n.zdr-richtext h1 {\n  font-size: var(--zdr-h1-size);\n  line-height: var(--zdr-h1-line-height);\n}\n\n.zdr-richtext h2 {\n  font-size: var(--zdr-h2-size);\n  line-height: var(--zdr-h2-line-height);\n}\n\n.zdr-richtext :is(h3, h4, h5, h6) {\n  font-size: var(--zdr-h3-size);\n  line-height: var(--zdr-h3-line-height);\n}\n\n.zdr-richtext :is(ul, ol) {\n  padding-inline-start: var(--zdr-list-indent);\n}\n\n.zdr-richtext li + li {\n  margin-block-start: var(--zdr-list-item-gap);\n}\n\n.zdr-richtext blockquote {\n  margin-inline: 0;\n  padding: var(--zdr-quote-padding-block) var(--zdr-quote-padding-inline);\n  border-inline-start: var(--zdr-quote-rule-width) solid var(--zdr-quote-rule-color);\n  background: var(--zdr-quote-background);\n}\n\n.zdr-richtext :is(code, pre, kbd) {\n  font-family: var(--zdr-code-font-family);\n  font-size: var(--zdr-code-font-size);\n  line-height: var(--zdr-code-line-height);\n}\n\n.zdr-richtext :not(pre) > code {\n  padding: var(--zdr-inline-code-padding-block) var(--zdr-inline-code-padding-inline);\n  border-radius: var(--zdr-inline-code-radius);\n  background: var(--zdr-code-background);\n}\n\n.zdr-richtext pre {\n  max-inline-size: 100%;\n  overflow: auto;\n  padding: var(--zdr-code-block-padding);\n  border-radius: var(--zdr-radius);\n  background: var(--zdr-code-background);\n  white-space: pre;\n  overflow-wrap: normal;\n}\n\n.zdr-richtext figure {\n  margin-inline: 0;\n}\n\n.zdr-richtext canvas {\n  display: block;\n  max-inline-size: var(--zdr-image-max-width);\n  block-size: auto;\n  border-radius: var(--zdr-image-radius);\n}\n\n.zdr-richtext figcaption {\n  margin-block-start: var(--zdr-caption-gap);\n}\n\n.zdr-richtext figcaption,\n.zdr-image-fallback {\n  color: var(--zdr-text-secondary);\n  font-size: var(--zdr-caption-font-size);\n  line-height: var(--zdr-caption-line-height);\n}\n\n.zdr-richtext hr {\n  margin-block: var(--zdr-block-gap);\n  border: 0;\n  border-block-start: var(--zdr-border-width) solid var(--zdr-border);\n}\n\n.zdr-workspace {\n  border: 0;\n  background: var(--zdr-background);\n}\n\n.zdr-workspace [data-zdr-region=\"topbar\"],\n.zdr-workspace [data-zdr-region=\"document\"] {\n  background: var(--zdr-surface);\n}\n\n.zdr-workspace [data-zdr-region=\"topbar\"] {\n  border-block-end: var(--zdr-border-width) solid var(--zdr-border);\n}\n\n.zdr-workspace [data-zdr-region=\"left-navigation\"] {\n  background: var(--zdr-navigation-background);\n  border-inline-end: var(--zdr-border-width) solid var(--zdr-border);\n  box-shadow: var(--zdr-nav-shadow);\n}\n\n.zdr-workspace [data-zdr-region=\"outline\"] {\n  background: var(--zdr-outline-background);\n  border-inline-start: var(--zdr-border-width) solid var(--zdr-border);\n  box-shadow: var(--zdr-outline-shadow);\n}\n\n.zdr-mark {\n  display: grid;\n  place-items: center;\n  inline-size: var(--zdr-mark-size);\n  block-size: var(--zdr-mark-size);\n  border-radius: var(--zdr-radius);\n  background: var(--zdr-primary);\n  color: var(--zdr-surface);\n  font-weight: var(--zdr-heading-weight);\n}\n\n.zdr-action,\n.zdr-launcher button,\n.zdr-launcher [role=\"status\"] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-block-size: var(--zdr-nav-row-height);\n  box-sizing: border-box;\n  padding-inline: var(--zdr-sidebar-padding);\n  color: var(--zdr-text);\n  background: var(--zdr-surface);\n  border: var(--zdr-border-width) solid var(--zdr-border);\n  border-radius: var(--zdr-radius);\n  font: inherit;\n  font-size: var(--zdr-caption-font-size);\n}\n\n.zdr-reader a.zdr-action {\n  color: var(--zdr-primary);\n  text-decoration: none;\n}\n\n.zdr-action,\n.zdr-launcher button {\n  cursor: pointer;\n}\n\n.zdr-action:hover,\n.zdr-launcher button:hover {\n  background: var(--zdr-hover);\n}\n\n.zdr-action[aria-pressed=\"true\"] {\n  background: var(--zdr-selected);\n  color: var(--zdr-selected-text);\n}\n\n.zdr-reader :is(button, a, summary):focus-visible {\n  outline: var(--zdr-focus-ring-width) solid var(--zdr-focus-color);\n  outline-offset: var(--zdr-focus-ring-offset);\n}\n\n.zdr-launcher [role=\"status\"] {\n  padding-block: var(--zdr-control-gap);\n}\n\n.zdr-launcher [role=\"status\"]:empty {\n  display: none;\n}\n\n.zdr-nav-list {\n  display: grid;\n  gap: var(--zdr-list-item-gap);\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.zdr-nav-item {\n  display: flex;\n  align-items: center;\n  gap: var(--zdr-control-gap);\n  min-block-size: var(--zdr-nav-row-height);\n  border-radius: var(--zdr-radius);\n  color: var(--zdr-text-secondary);\n  font-size: var(--zdr-caption-font-size);\n}\n\n.zdr-nav-item[aria-current=\"page\"] {\n  background: var(--zdr-selected);\n  color: var(--zdr-selected-text);\n}\n\n.zdr-nav-icon {\n  flex: 0 0 var(--zdr-nav-icon-size);\n  text-align: center;\n}\n\n.zdr-nav-status {\n  margin-inline-start: auto;\n  padding-inline-end: var(--zdr-control-gap);\n  white-space: nowrap;\n}\n\n.zdr-settings {\n  position: relative;\n}\n\n.zdr-settings summary::-webkit-details-marker {\n  display: none;\n}\n\n.zdr-settings-menu {\n  position: absolute;\n  inset-inline-end: 0;\n  inset-block-start: calc(100% + var(--zdr-control-gap));\n  min-inline-size: max-content;\n  display: grid;\n  gap: var(--zdr-control-gap);\n  padding: var(--zdr-sidebar-padding);\n  border: var(--zdr-border-width) solid var(--zdr-border);\n  border-radius: var(--zdr-radius);\n  background: var(--zdr-surface);\n  box-shadow: var(--zdr-shadow-overlay);\n}\n\n.zdr-settings-group {\n  display: flex;\n  align-items: center;\n  gap: var(--zdr-control-gap);\n  color: var(--zdr-text-secondary);\n  font-size: var(--zdr-caption-font-size);\n}\n\n.zdr-document-source {\n  margin-block-start: var(--zdr-content-padding-block);\n  padding-block-start: var(--zdr-paragraph-gap);\n  border-block-start: var(--zdr-border-width) solid var(--zdr-border);\n}\n\n\n.zdr-outline-list {\n  display: grid;\n  gap: var(--zdr-list-item-gap);\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.zdr-outline-list [data-zdr-level=\"2\"] { padding-inline-start: var(--zdr-outline-indent); }\n.zdr-outline-list [data-zdr-level=\"3\"] { padding-inline-start: calc(var(--zdr-outline-indent) * 2); }\n.zdr-outline-list [data-zdr-level=\"4\"] { padding-inline-start: calc(var(--zdr-outline-indent) * 3); }\n.zdr-outline-list [data-zdr-level=\"5\"] { padding-inline-start: calc(var(--zdr-outline-indent) * 4); }\n.zdr-outline-list [data-zdr-level=\"6\"] { padding-inline-start: calc(var(--zdr-outline-indent) * 5); }\n\n.zdr-outline-list .zdr-action {\n  inline-size: 100%;\n  justify-content: flex-start;\n  overflow-wrap: anywhere;\n  text-align: start;\n  background: transparent;\n  border-color: transparent;\n}\n\n.zdr-outline-list .zdr-action:hover {\n  background: var(--zdr-hover);\n}\n\n.zdr-outline-list .zdr-action[aria-current=\"location\"] {\n  border-inline-start: var(--zdr-selected-marker-width) solid var(--zdr-primary);\n  color: var(--zdr-selected-text);\n  background: var(--zdr-selected);\n}";

// src/adapters/route.js
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

// src/adapters/rich-content.js
const richTextTags = new Set([
  'p', 'div', 'span', 'section', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i',
  'blockquote', 'ol', 'ul', 'li', 'pre', 'code', 'figure', 'figcaption', 'a', 'br', 'hr',
  'sup', 'sub', 's', 'del', 'u', 'mark', 'kbd',
]);
const discardedRichTags = new Set([
  'script', 'style', 'template', 'noscript', 'iframe', 'object', 'embed', 'video', 'audio',
  'source', 'svg', 'math', 'canvas', 'form', 'input', 'select', 'textarea', 'button',
  'details', 'dialog',
]);

function safeRichLink(address, base) {
  if (!address?.trim()) return null;
  try {
    let target = new URL(address, base);
    if (target.origin === 'https://link.zhihu.com') {
      const direct = target.searchParams.get('target');
      if (!direct) return null;
      target = new URL(direct);
      if (target.hostname === 'link.zhihu.com') return null;
    }
    return ['https:', 'http:'].includes(target.protocol) && !target.username && !target.password ? target.href : null;
  } catch {
    return null;
  }
}

function wholeNumberAttribute(element, name) {
  const raw = element.getAttribute(name);
  if (!raw || !/^-?\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
}

function richElementVisible(element, view) {
  if (element.matches('[hidden], [aria-hidden="true"], [inert]')) return false;
  const style = view.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.visibility !== 'collapse' &&
    style.contentVisibility !== 'hidden' && style.opacity !== '0';
}

function captureRichChildren(root, view, base) {
  const result = [];

  for (const child of root.childNodes) {
    if (child.nodeType === 3) {
      result.push(child.textContent);
      continue;
    }
    if (child.nodeType !== 1 || child.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;
    const tag = child.localName;
    if (discardedRichTags.has(tag) || !richElementVisible(child, view)) continue;
    if (tag === 'img') {
      const alt = child.getAttribute('alt')?.trim() || '原文图片';
      const image = child.complete && child.naturalWidth > 0 && child.naturalHeight > 0 ? child : null;
      result.push({ tag, alt, image });
      continue;
    }

    const children = captureRichChildren(child, view, base);
    if (!richTextTags.has(tag)) {
      result.push(...children);
      continue;
    }
    const record = { tag, children };
    if (tag === 'a') {
      record.href = safeRichLink(child.getAttribute('href'), base);
      if (!record.href) {
        result.push(...children);
        continue;
      }
    }
    if (tag === 'ol') {
      record.start = wholeNumberAttribute(child, 'start');
      record.reversed = child.hasAttribute('reversed');
    }
    if (tag === 'li') record.value = wholeNumberAttribute(child, 'value');
    result.push(record);
  }
  return result;
}

function hasReadableContent(nodes) {
  return nodes.some(node => {
    if (typeof node === 'string') return Boolean(node.trim());
    if (node.tag === 'img') return Boolean(node.image);
    return hasReadableContent(node.children);
  });
}

function isUnclippedBody(element, card, view, isQuestionAnswer) {
  if (element.closest('.RichContent--collapsed, .RichContent-inner--collapsed, [data-collapsed="true"]')) return false;
  if (firstRendered(card, '.ContentItem-expandButton, .RichContent-expandButton', view)) return false;
  const unescapable = element.closest('.RichContent--unescapable');
  if (unescapable) {
    const inner = element.closest('.RichContent-inner');
    // Zhihu also uses this wrapper on fully rendered answers. Require a measurable inner container.
    if (!isQuestionAnswer || !inner || inner.closest('.RichContent') !== unescapable ||
        unescapable.closest('.AnswerItem') !== card ||
        unescapable.parentElement?.closest('.RichContent--unescapable') || element.closest('[inert]') ||
        view.getComputedStyle(inner).overflowY !== 'hidden' ||
        !(inner.clientHeight > 0 && inner.clientHeight === inner.scrollHeight)) return false;
  }
  for (let node = element; node && card.contains(node); node = node.parentElement) {
    if (unescapable && !richElementVisible(node, view)) return false;
    const style = view.getComputedStyle(node);
    const lineClamped = Number.parseInt(style.webkitLineClamp, 10) > 0;
    const clips = style.overflowY === 'hidden' || style.overflowY === 'clip' || lineClamped;
    if (!clips) continue;
    if (unescapable) {
      if (lineClamped || !(node.clientHeight > 0 && node.clientHeight === node.scrollHeight)) return false;
    } else if (node.clientHeight > 0 && node.scrollHeight > node.clientHeight + 1) {
      return false;
    }
  }
  return true;
}

// src/adapters/dom.js
// Keep the audited upstream article container and the native shapes verified in M00-B.
const listTitle = '.ContentItem-title, h2, h3';
const listExcerpt = '.ContentItem-excerpt, .RichContent-inner';
const profiles = {
  home: { cards: '#TopstoryContent .TopstoryItem', title: listTitle, excerpt: listExcerpt },
  follow: {
    cards: '.FollowFeed .ContentItem, .Moments .ContentItem, .Topstory-follow .TopstoryItem-isFollow .ContentItem',
    title: listTitle, excerpt: listExcerpt,
  },
  hot: { cards: '.HotList .HotItem, .HotItem', title: '.HotItem-title', excerpt: '.HotItem-excerpt' },
  search: {
    cards: '.SearchMain .SearchResult-Card, .SearchMain .List-item .ContentItem',
    title: listTitle, excerpt: listExcerpt,
  },
  question: {
    cards: '.QuestionAnswers-answers .AnswerItem, .QuestionAnswer-content .AnswerItem, .AnswerItem',
    title: '.QuestionHeader-title',
    body: '.RichContent-inner .RichText, .RichContent-inner.RichText',
  },
  article: { cards: '.Post-Main', title: '.Post-Title', body: '.Post-RichText' },
};

function isRendered(element, view) {
  return Boolean(element &&
    !element.closest('[hidden], [aria-hidden="true"]') &&
    element.getClientRects().length &&
    view.getComputedStyle(element).visibility === 'visible');
}

function firstRendered(root, selector, view) {
  return Array.from(root.querySelectorAll(selector)).find(element => isRendered(element, view));
}

function accessLimited(document, view) {
  return /安全验证|人机验证|请求参数异常/.test(document.title) ||
    Boolean(firstRendered(document, '#captcha, .Captcha, .SignFlowModal, .Paywall', view));
}

function boundedText(node, length) {
  return node?.innerText?.replace(/\s+/g, ' ').trim().slice(0, length) || null;
}

function contentAddress(address, base) {
  if (!address) return null;
  try {
    const url = new URL(address, base);
    const route = identifyRoute(url.href);
    if (route?.contentId) return route;
    const pin = /^\/pin\/(\d+)\/?$/.exec(url.pathname);
    if (pin && url.origin === 'https://www.zhihu.com' && !url.username && !url.password) {
      return { contentId: pin[1], contentType: 'pin', sourceUrl: url.origin + '/pin/' + pin[1] };
    }
  } catch {
    // Malformed or missing links stay absent in the record.
  }
  return null;
}

function answerAddress(card, route) {
  const meta = card.querySelector('meta[itemprop="url"][content]');
  const link = card.querySelector('.ContentItem-time a[href]');
  const address = contentAddress(meta?.getAttribute('content') || link?.getAttribute('href'), route.sourceUrl);
  const questionUrl = route.sourceUrl.split('/answer/')[0];
  return address?.contentType === 'answer' && address.sourceUrl.startsWith(questionUrl + '/answer/')
    ? address
    : null;
}

function cardAddress(card, heading, view, route) {
  const link = heading.closest('a[href]') || firstRendered(heading, 'a[href]', view);
  if (!link || !card.contains(link)) return null;
  return contentAddress(link.getAttribute('href'), route.sourceUrl);
}

function publishedText(card, view) {
  const published = card.querySelector('[itemprop="datePublished"]');
  const value = published?.getAttribute('datetime') ?? published?.getAttribute('content');
  if (value && /^\d{4}-\d{2}-\d{2}(?:T[\d:.+Z-]+)?$/.test(value) && Number.isFinite(Date.parse(value))) return value;
  const label = boundedText(firstRendered(card, '.Post-Time, .ContentItem-time', view), 80);
  return label?.startsWith('发布于') ? label.slice(3).trim() || null : null;
}

function readFullBody(card, selector, view, sourceUrl, isQuestionAnswer) {
  const element = firstRendered(card, selector, view);
  if (!element || !isUnclippedBody(element, card, view, isQuestionAnswer)) return null;
  const content = captureRichChildren(element, view, sourceUrl);
  return hasReadableContent(content) ? content : null;
}

// List routes return a bounded preview. Detail routes require a loaded, readable body.
function readNativePage(document, view, route) {
  if (!route) return { status: 'unsupported', record: null };
  if (accessLimited(document, view)) return { status: 'restricted', record: null };
  const profile = profiles[route.kind];
  for (const card of document.querySelectorAll(profile.cards)) {
    if (!isRendered(card, view)) continue;
    const answer = route.kind === 'question' ? answerAddress(card, route) : null;
    if (route.contentType === 'answer' && answer?.sourceUrl !== route.sourceUrl) continue;
    const heading = firstRendered(route.kind === 'question' ? document : card, profile.title, view);
    const title = profile.body ? heading?.innerText?.trim() : boundedText(heading, 160);
    if (!title) continue;
    const source = answer || (route.contentId ? route : cardAddress(card, heading, view, route));
    const content = profile.body ? readFullBody(card, profile.body, view, source.sourceUrl, route.kind === 'question') : null;
    if (profile.body && !content) continue;
    return {
      status: 'ready',
      record: {
        contentId: source?.contentId ?? null,
        contentType: source?.contentType ?? null,
        title,
        author: boundedText(firstRendered(card, '.AuthorInfo-name, .ContentItem-author', view), 80),
        sourceUrl: source?.sourceUrl ?? null,
        excerpt: profile.excerpt ? boundedText(firstRendered(card, profile.excerpt, view), 240) : null,
        content,
        contentHtml: null,
        publishedAt: profile.body ? publishedText(card, view) : null,
        fetchedAt: new Date().toISOString(),
      },
    };
  }
  return { status: 'unavailable', record: null };
}

// src/core/state.js
function createReaderState() {
  let route = null;
  let open = false;
  return {
    get route() { return route; },
    get isOpen() { return open; },
    setRoute(next) {
      if (route?.key === next?.key) return false;
      route = next;
      open = false;
      return true;
    },
    enter() {
      if (!route || open) return false;
      open = true;
      return true;
    },
    exit() {
      open = false;
    },
  };
}

// src/renderer/rich-content.js
function createReadingImage(document, { image, alt }) {
  if (image) {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, Math.sqrt(16000000 / (image.naturalWidth * image.naturalHeight)));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', alt);
    try {
      const context = canvas.getContext('2d');
      if (context) {
        // Draw the decoded resource without assigning another image address or reading its pixels.
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas;
      }
    } catch {
      // A native image can become unavailable before it is drawn.
    }
  }
  const fallback = document.createElement('span');
  fallback.className = 'zdr-image-fallback';
  fallback.textContent = '图片未加载 · ' + alt;
  return fallback;
}

function appendRichContent(document, parent, nodes) {
  for (const record of nodes) {
    if (typeof record === 'string') {
      parent.append(document.createTextNode(record));
      continue;
    }
    if (record.tag === 'img') {
      parent.append(createReadingImage(document, record));
      continue;
    }
    if (!richTextTags.has(record.tag)) continue;

    const element = record.tag === 'a' ? createReaderLink(document, record.href, '') : document.createElement(record.tag);
    if (record.tag === 'ol') {
      if (record.start !== null) element.setAttribute('start', String(record.start));
      if (record.reversed) element.setAttribute('reversed', '');
    }
    if (record.tag === 'li' && record.value !== null) element.setAttribute('value', String(record.value));
    appendRichContent(document, element, record.children);
    parent.append(element);
  }
}

// src/renderer/reader-regions.js
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

  if (record.author || record.publishedAt) {
    const byline = document.createElement('p');
    byline.className = 'zdr-byline';
    if (record.author) {
      const author = document.createElement('span');
      author.textContent = record.author;
      byline.append(author);
    }
    if (record.publishedAt) {
      const published = document.createElement('time');
      published.textContent = '发布于 ' + record.publishedAt;
      byline.append(published);
    }
    column.append(byline);
  }

  if (record.content) {
    const content = document.createElement('div');
    content.className = 'zdr-richtext';
    appendRichContent(document, content, record.content);
    column.append(content);
  } else {
    const notice = document.createElement('p');
    notice.className = 'zdr-reading-note';
    notice.textContent = '当前原生列表预览';
    column.append(notice);
    if (record.excerpt) {
      const preview = document.createElement('p');
      preview.className = 'zdr-preview';
      preview.textContent = record.excerpt;
      column.append(preview);
    }
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

function createRightOutline(document, region) {
  const outline = document.createElement('aside');
  outline.dataset.zdrRegion = 'outline';
  outline.id = 'zdr-outline';
  outline.setAttribute('aria-label', '本文目录');
  const title = document.createElement('h2');
  title.className = 'zdr-outline-title';
  title.textContent = '本文目录';
  outline.append(title);
  const content = region.querySelector('.zdr-richtext');
  const sections = [];
  const list = document.createElement('ol');
  list.className = 'zdr-outline-list';

  for (const heading of content?.querySelectorAll('h1, h2, h3, h4, h5, h6') ?? []) {
    const label = heading.textContent.replace(/\s+/g, ' ').trim();
    if (!label) continue;
    const index = sections.length;
    heading.id = 'zdr-section-' + (index + 1);
    heading.setAttribute('tabindex', '-1');
    const item = document.createElement('li');
    item.dataset.zdrLevel = heading.localName.slice(1);
    const button = createReaderAction(document, label, 'section');
    button.dataset.zdrSection = String(index);
    item.append(button);
    list.append(item);
    sections.push({ heading, button });
  }

  if (sections.length) {
    outline.append(list);
  } else {
    const empty = document.createElement('p');
    empty.className = 'zdr-reading-note';
    empty.textContent = '此处没有可用的章节目录。';
    outline.append(empty);
  }
  return { outline, sections };
}

// src/renderer/reader-shell.js
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

// src/core/lifecycle.js
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
    if (launcher?.host.parentNode === document.body) return;
    removeLauncher();
    launcher = createReaderLauncher(document, enter);
    document.body.append(launcher.host);
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

// src/core/start.js
if (window.top === window) installReader(window, document);
})();
