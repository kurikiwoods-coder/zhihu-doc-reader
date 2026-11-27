# Zhihu Doc Reader V1.0 初始视觉规范

**负责人已确认初始视觉目标，Gate 01-V 待验收。** 2026-11-27（UTC+08:00） · PDT V1.3 · DOM-only

适用于知乎文档式阅读体验。产品使用自有名称、系统字体与语义色，阅读数据沿用原生知乎 DOM。本文件记录可调整的 V1.0 初始视觉目标。 [PDT](../PDT-V1.3.md) · [31 项视觉矩阵](UI-SPEC-DRAFT.md#视觉测量矩阵) · [脱敏证据](../../validation/m00-ui/evidence/editor-dom-precheck.json) · [初始 Tokens](../../src/styles/tokens.css)

## 参考与初始目标

Reference Value 使用 UIB-DOM-01 至 UIB-DOM-07 已取得的读数。Target Value 是负责人确认的初始设计基线。所有宽度、高度和字体像素均为 CSS px，百分比以正文可用区为基准。

| 参数 | Reference Value | Target Value（初始基线） | Evidence |
| --- | --- | --- | --- |
| 顶部栏高度、上下内距和分隔线 | 64 px；上下内距 0；底线 1 px 实线 `#DEE0E3` | 56 px；上下内距 0、左右 20 px；1 px 分隔线 | `UIB-DOM-04`、`UIB-DOM-05` |
| 左侧导航宽度 | 同一 885 px 视口分别观察到 300 px、268 px | 展开 224 px；收起 52 px；内距 12 px | `UIB-DOM-04`、`UIB-DOM-05` |
| 目录实际位置、宽度与对齐 | 主区左缘 x=268 px；展开约 210.08 px；条目逐级缩进 14 px | 正文右侧 200 px；内距 12 px；逐级缩进 12 px | `UIB-DOM-07` |
| 默认正文区宽度 | 1440 × 731 CSS px 下为 820 px | 上限 768 px；受可用空间约束 | `UIB-DOM-01` |
| 较宽正文区宽度 | 1440 × 731 CSS px 下为 1008 px | 上限 960 px；受可用空间约束 | `UIB-DOM-02` |
| 全宽正文区宽度 | 1440 × 731 CSS px 下为 1008 px | 占正文可用区 100%；保留两侧内距 | `UIB-DOM-03` |
| 文档主标题 | 34 px / 600 / 55.25 px | 32 px / 700 / 1.25（40 px） | `UIB-DOM-04`、`UIB-DOM-05` |
| H1 | 26 px / 600 / 36.4 px | 24 px / 600 / 1.4（33.6 px） | `UIB-DOM-06` |
| H2 | 22 px / 600 / 30.8 px | 20 px / 600 / 1.45（29 px） | `UIB-DOM-06` |
| H3 | 20 px / 600 / 28 px | 18 px / 600 / 1.5（27 px） | `UIB-DOM-06` |
| 正文字体、字号、字重和行高 | 16 px / 400 / 26 px；字体候选栈见测量记录 | 系统字体栈；17 px / 400 / 1.7（28.9 px） | `UIB-DOM-04` |
| 段落实际间距 | 相邻正文块实测 8 px | 12 px | `UIB-DOM-04` |
| 页面、顶栏、侧栏、正文和目录背景 | 页面、顶栏 `#FFFFFF`；左栏 `#F5F6F7`；正文容器透明 | 浅色阅读面 `#FFFFFF`，外壳 `#F7F8FA`，左栏 `#EFF2F6`；深色按语义覆盖 | `UIB-DOM-04`、`UIB-DOM-05` |

状态汇总为已有 DOM 读数 12 项、部分取证 7 项、待实测 12 项。逐项理由与补证范围见草案矩阵。 [机器可读记录](../../validation/m00-ui/evidence/visual-review-matrix.json)

## 页面与视口

- 顶栏承载产品标识、搜索、阅读设置、模式切换和打开原文。左导航承载 PDT 的产品入口和阅读队列。中间是标题、作者与时间、正文及阅读操作。
- 右侧区承载目录与阅读进度，问答场景可显示当前问题的回答列表。主标题独立于 H1–H3。目录项按实际章节结构生成。
- 正文列在可用空间内居中，标题、作者信息和正文共享同一列。默认、较宽和全宽同时服从内距约束。

| CSS 视口宽度 | 面板规则 |
| --- | --- |
| 至少 1200 px | 左导航 224 px，右辅助区 200 px，均可常驻或收起。 |
| 900–1199 px | 左导航可收起；右侧通过明确入口打开覆盖面板。 |
| 小于 900 px | 两侧为按需打开的面板。打开一侧时收起另一侧，正文留横向内距 16 px。 |

下面按常驻面板处于展开状态计算列宽。宽度预算扣除视口内两侧内距，覆盖面板占用的列宽记为 0。该表用于候选几何核对。

| 视口 | 常驻左栏 | 常驻右栏 | 正文可用区 | 默认列宽 | 较宽列宽 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 885 | 0 | 0 | 853 | 768 | 853 |
| 900 | 224 | 0 | 628 | 628 | 628 |
| 1200 | 224 | 200 | 728 | 728 | 728 |
| 1440 | 224 | 200 | 968 | 768 | 960 |

## 富文本与交互

- 正文排版按 17 px、行高 1.7，段间距 12 px。标题靠字号和字重区分，章节标题上方留 28 px、下方留 8 px。
- 引用保留段落结构，使用左侧边线和背景。有序和无序列表保留原标记及嵌套。代码块在自身容器内横向滚动，行内代码与行文一起排布。
- 图片在可用宽度内等比显示，图注随图排布。链接采用持续下划线，原文入口有可辨识文本。
- 悬停和选中使用不同填充。目录当前项与产品导航当前项使用明确的可见标记与对应语义状态。选中状态跟随阅读章节。
- Tab 焦点使用 2 px 可见轮廓，偏移 2 px。面板关闭后焦点归触发入口。定位锚点预留 56 px 顶栏与额外 12 px 留白。面板显隐保留当前阅读位置。
- 知乎原页的「进入阅读模式」入口位于左下角，沿用紧凑留白 Token，右下角留给原生浮层。

## CSS Tokens 初始基线

默认浅色，深色通过阅读器自身主题状态覆盖语义色。尺寸与字阶在两主题共用。

| Token | 通用或浅色 | 深色覆盖 |
| --- | --- | --- |
| `--zdr-header-height` | `56px` | 同左 |
| `--zdr-header-padding-block` | `0px` | 同左 |
| `--zdr-header-padding-inline` | `20px` | 同左 |
| `--zdr-sidebar-width` | `224px` | 同左 |
| `--zdr-sidebar-collapsed-width` | `52px` | 同左 |
| `--zdr-sidebar-padding` | `12px` | 同左 |
| `--zdr-outline-width` | `200px` | 同左 |
| `--zdr-outline-padding` | `12px` | 同左 |
| `--zdr-outline-indent` | `12px` | 同左 |
| `--zdr-content-width` | `768px` | 同左 |
| `--zdr-content-width-wide` | `960px` | 同左 |
| `--zdr-content-width-full` | `100%` | 同左 |
| `--zdr-content-padding-inline` | `24px` | 同左 |
| `--zdr-content-padding-inline-compact` | `16px` | 同左 |
| `--zdr-content-padding-block` | `32px` | 同左 |
| `--zdr-nav-row-height` | `36px` | 同左 |
| `--zdr-selected-marker-width` | `3px` | 同左 |
| `--zdr-anchor-offset` | `calc(var(--zdr-header-height) + 12px)` | 同左 |
| `--zdr-font-family` | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif` | 同左 |
| `--zdr-font-size` | `17px` | 同左 |
| `--zdr-line-height` | `1.7` | 同左 |
| `--zdr-text-weight` | `400` | 同左 |
| `--zdr-title-size` | `32px` | 同左 |
| `--zdr-title-line-height` | `1.25` | 同左 |
| `--zdr-title-weight` | `700` | 同左 |
| `--zdr-h1-size` | `24px` | 同左 |
| `--zdr-h1-line-height` | `1.4` | 同左 |
| `--zdr-h2-size` | `20px` | 同左 |
| `--zdr-h2-line-height` | `1.45` | 同左 |
| `--zdr-h3-size` | `18px` | 同左 |
| `--zdr-h3-line-height` | `1.5` | 同左 |
| `--zdr-heading-weight` | `600` | 同左 |
| `--zdr-heading-letter-spacing` | `normal` | 同左 |
| `--zdr-heading-gap-before` | `28px` | 同左 |
| `--zdr-heading-gap-after` | `8px` | 同左 |
| `--zdr-paragraph-gap` | `12px` | 同左 |
| `--zdr-block-gap` | `16px` | 同左 |
| `--zdr-quote-padding-block` | `10px` | 同左 |
| `--zdr-quote-padding-inline` | `16px` | 同左 |
| `--zdr-quote-rule-width` | `3px` | 同左 |
| `--zdr-list-indent` | `24px` | 同左 |
| `--zdr-list-item-gap` | `4px` | 同左 |
| `--zdr-code-font-family` | `ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace` | 同左 |
| `--zdr-code-font-size` | `14px` | 同左 |
| `--zdr-code-line-height` | `1.55` | 同左 |
| `--zdr-inline-code-padding-block` | `2px` | 同左 |
| `--zdr-inline-code-padding-inline` | `4px` | 同左 |
| `--zdr-inline-code-radius` | `4px` | 同左 |
| `--zdr-code-block-padding` | `16px` | 同左 |
| `--zdr-image-max-width` | `100%` | 同左 |
| `--zdr-image-radius` | `8px` | 同左 |
| `--zdr-caption-gap` | `8px` | 同左 |
| `--zdr-caption-font-size` | `13px` | 同左 |
| `--zdr-caption-line-height` | `1.5` | 同左 |
| `--zdr-link-underline-offset` | `3px` | 同左 |
| `--zdr-border-width` | `1px` | 同左 |
| `--zdr-radius` | `8px` | 同左 |
| `--zdr-focus-ring-width` | `2px` | 同左 |
| `--zdr-focus-ring-offset` | `2px` | 同左 |
| `--zdr-background` | `#F7F8FA` | `#111821` |
| `--zdr-surface` | `#FFFFFF` | `#181F2A` |
| `--zdr-navigation-background` | `#EFF2F6` | `#141C29` |
| `--zdr-outline-background` | `#F7F8FA` | `#111821` |
| `--zdr-text` | `#1F2937` | `#E8ECF4` |
| `--zdr-text-secondary` | `#526071` | `#B1BBCB` |
| `--zdr-primary` | `#284B97` | `#ADC5FF` |
| `--zdr-border` | `#D9E0E9` | `#3B4658` |
| `--zdr-hover` | `#E8EEF6` | `#243248` |
| `--zdr-selected` | `#DDE8FB` | `#29385B` |
| `--zdr-selected-text` | `#203F77` | `#C6D7FF` |
| `--zdr-focus-color` | `#284B97` | `#ADC5FF` |
| `--zdr-quote-background` | `#EEF3FA` | `#202B3D` |
| `--zdr-quote-rule-color` | `#5375A4` | `#8CA8DE` |
| `--zdr-code-background` | `#EEF2F7` | `#202B3D` |
| `--zdr-shadow-overlay` | `0 8px 24px rgba(18, 29, 52, 0.14)` | `0 8px 24px rgba(0, 0, 0, 0.38)` |

## 一致性与放行

- 31 行参数均有候选目标，CSS 声明和值按上表核对。浅色／通用 75 个，深色覆盖 16 个。
- 18 组候选色对的静态计算满足本草案门槛。文字对的最低比值为 5.72:1，焦点对的最低比值为 6.69:1。已核对 7 组视口的列宽预算。
- 当前已接入的本机 Chrome 仅见已知带身份水印的测试文档。正式个人样本、环境完整记录、F12 实跑、剩余富文本与交互、三张可公开截图均待补。
- **M00-UI 原始取证为 BLOCKED，Gate 01-V 待验收。** 按 PDT V1.3 验证独立阅读器的渲染、可读性、响应式、富文本与交互。视觉变化经后续证据审阅后可调整。 [验收记录](../M00-VALIDATION.md#gate-01-t-技术准入与视觉边界)

## 实施分层

视觉数值由 `tokens.css` 提供。`layout.css` 负责布局，`typography.css` 负责排版，`components.css` 负责控件和状态样式。顶部栏、左侧导航、正文和右侧目录保有独立界面区域。渲染组件通过标准化记录接收 DOM 适配器数据，核心路由、状态、事件与恢复逻辑独立于视觉值。视觉更新后执行响应式和视觉回归。

## M02 实现与取证

独立产品界面沿用初始尺寸和主题值。视口断点、面板轨道和紧凑布局变量定义在 Tokens，核心状态与适配器保持独立。正文宽度以实际可用空间为限，验收记录包含原生滚动条占用。样式回归覆盖默认、较宽、全宽及两套主题。 [M02 验收](../M02-VALIDATION.md)
