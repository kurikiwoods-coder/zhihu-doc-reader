# Zhihu Doc Reader 视觉规范草案

2026-11-27（UTC+08:00） · PDT V1.2 §20–22 · DOM-only · M00-UI-A

公开参考研究与测量准备已完成。真实编辑器取证与产品目标值确认在 M00-UI-B 进行。知乎阅读器按 PDT 采用左侧产品导航与右侧阅读目录，重点参考文档排版节奏与状态反馈，自主确定布局和视觉样式。 [PDT V1.2](../PDT-V1.2.md#20-视觉设计参考规范v12)

## 公开参考研究

| 来源 | 级别 | 可用于设计的发现 |
| --- | --- | --- |
| 飞书文档公开产品页 | C | 公开展示文档与块式富文本，包括图片和代码块。以此确认需要准备的富文本样本。 [公开入口](https://docs.feishu.cn/docs) · [飞书官网产品页](https://www.feishu.cn/product/docs) |
| 飞书页面宽度帮助 | B | 网页版和桌面端提供默认、较宽、全宽三档。正文区包含文档标题和下方内容，目录及评论另计。宽度档位也会影响辅助区。测量时固定视口和可见面板，再比较同一正文容器。 [页面宽度](https://www.feishu.cn/hc/zh-CN/articles/909135942944) |
| 飞书排版与目录教程 | B | 文档标题层级可自动生成左侧目录，点击条目跳转。独立记录飞书目录与知乎阅读器右侧目录的布置和行为。 [排版教程 §3.4.2](https://www.feishu.cn/content/article/7572026952902230020) · [标题与目录帮助](https://www.feishu.cn/hc/en-US/articles/178968744708-use-headings-and-table-of-contents-in-docs?slug=true) |
| Semi Design 官方设计规范 | B（辅助） | 全局 Design Tokens 包括语义色、字体层级、尺寸、间距、圆角、边框和阴影，组件 Tokens 细化控件状态。阅读器视觉变量可沿用这种组织方式，突出正文、辅助文字和操作状态。 [全局规范](https://semi.design/dsm_manual/zh-CN/web/globalToken) · [组件规范](https://semi.design/dsm_manual/zh-CN/web/componentToken) |
| Semi Design 飞书主题 | B（辅助） | 官网分别展示 Semi Design Default 和 Feishu Universe Design Theme。主题展示可辅助理解同一组件体系的视觉变化。 [主题展示](https://semi.design/en-US) · [主题库](https://semi.design/dsm/) |
| Semi Design 开源 Design Tokens | B（辅助，已核对默认主题源码） | `v2.72.0` 默认主题定义 `--semi-color-bg-0`、`--semi-color-text-0` 和悬停色角色。该版本常规字体定义为 14 px，对应样式的行高为 20 px。这些是 Semi 默认主题的源码参数，仅用于核对变量组织。 [官方 Token 表](https://semi.design/zh-CN/basic/tokens) · [语义色源码](https://github.com/DouyinFE/semi-design/blob/v2.72.0/packages/semi-theme-default/scss/global.scss#L79-L98) · [字号定义](https://github.com/DouyinFE/semi-design/blob/v2.72.0/packages/semi-theme-default/scss/variables.scss#L54-L64) · [行高定义](https://github.com/DouyinFE/semi-design/blob/v2.72.0/packages/semi-theme-default/scss/_font.scss#L8-L12) |

以上资料的核对日期为 2026-11-27。Semi 仅作视觉参考，运行产物不需要 Semi 组件、主题包或品牌资源。

## 视觉测量矩阵

Reference Value 填真实个人编辑器的测量值或行为观察，Target Value 填负责人确认的阅读器目标值。Evidence 填可回溯的样本编号，Evidence Level 填实际证据等级，Rationale 记录测量目的及目标值调整理由。下表的计划等级说明如何取证，当前各行均无真实编辑器数据，状态为 `UNVERIFIED`。PDT §20.5 的 800 px 等初始建议属于 D 级探索。

| Evidence Level | 适用范围 |
| --- | --- |
| S | 真实个人飞书编辑器的 F12 计算样式及元素尺寸，供精确参数核验。 |
| A | 真实个人飞书编辑器的截图和交互观察，供位置与行为核验。 |
| B | 公开官方帮助、教程和设计系统文档，供规则参考。 |
| C | 公开产品宣传页，供视觉方向与样本准备参考。 |
| D | 草图和建议值，供探索。 |

### 布局

| 参数 | Reference Value | Target Value | Evidence | Evidence Level | Rationale | Verification Status |
| --- | --- | --- | --- | --- | --- | --- |
| `header-bar` · 顶部栏高度、上下内距和分隔线 | 待测 | 待定 | 待采 | 计划 S | 记录主顶栏盒子在阅读视口占用的高度，排除浮动编辑工具。 | UNVERIFIED |
| `left-navigation` · 左侧导航宽度（如果出现） | 待测 | 待定 | 待采 | 计划 S＋A | 识别独立的应用导航再测宽度，缺席时记录观察和视口。 | UNVERIFIED |
| `outline-placement` · 目录实际位置、宽度与对齐 | 待测 | 待定 | 待采 | 计划 S＋A | 测目录容器的横向坐标与宽度并与正文比对，确认目录相对位置。 | UNVERIFIED |
| `right-auxiliary` · 右侧辅助区（如果出现） | 待测 | 待定 | 待采 | 计划 S＋A | 记录区域类型、开关状态与宽度，供正文可用空间比较。 | UNVERIFIED |
| `content-default` · 默认正文区宽度 | 待测 | 待定 | 待采 | 计划 S | 固定视口取标题与正文共享的容器，优先为阅读行长提供参照。 | UNVERIFIED |
| `content-wide` · 较宽正文区宽度 | 待测 | 待定 | 待采 | 计划 S | 同一视口与区域口径复测，衡量对长代码、宽图的帮助。 | UNVERIFIED |
| `content-full` · 全宽正文区宽度 | 待测 | 待定 | 待采 | 计划 S | 同一视口与区域口径复测，记录左右保留空间和辅助区的变化。 | UNVERIFIED |
| `content-padding` · 正文内边距、外边距与有效行宽 | 待测 | 待定 | 待采 | 计划 S | 分别测正文外框和文字列，区分盒子宽度、横向留白与实际文字区域。 | UNVERIFIED |
| `responsive-layout` · 窄视口下的布局 | 待测 | 待定 | 待采 | 计划 S＋A | 逐步缩窄窗口，记录正文、导航与目录的实际变化和相应视口。 | UNVERIFIED |

### 排版与富文本

| 参数 | Reference Value | Target Value | Evidence | Evidence Level | Rationale | Verification Status |
| --- | --- | --- | --- | --- | --- | --- |
| `document-title` · 文档主标题 | 待测 | 待定 | 待采 | 计划 S | 采集字号、字重、行高、字体族和间距，区分文档标题与章节标题。 | UNVERIFIED |
| `heading-1` · H1 | 待测 | 待定 | 待采 | 计划 S | 测一级章节标题并对照前后正文留白。 | UNVERIFIED |
| `heading-2` · H2 | 待测 | 待定 | 待采 | 计划 S | 测二级章节标题的字阶和上下间距。 | UNVERIFIED |
| `heading-3` · H3 | 待测 | 待定 | 待采 | 计划 S | 测三级章节标题是否有清楚的层级和可读字号。 | UNVERIFIED |
| `paragraph` · 正文字体族、字号、字重和行高 | 待测 | 待定 | 待采 | 计划 S | 测中英混排段落，用同一层级核对字号、字重、行高和字间距。 | UNVERIFIED |
| `paragraph-gap` · 段落实际间距 | 待测 | 待定 | 待采 | 计划 S | 采相邻段落、外层块及其父级 gap，结合两段的几何边缘确认实际间距。 | UNVERIFIED |
| `blockquote` · 引用 | 待测 | 待定 | 待采 | 计划 S＋A | 测引文缩进、分隔边框、背景和上下间距。 | UNVERIFIED |
| `ordered-list` · 有序列表 | 待测 | 待定 | 待采 | 计划 S＋A | 测列表项行高、编号位置、层级缩进和间距。 | UNVERIFIED |
| `unordered-list` · 无序列表 | 待测 | 待定 | 待采 | 计划 S＋A | 测列表项行高、项目符号位置、层级缩进和间距。 | UNVERIFIED |
| `inline-code` · 行内代码 | 待测 | 待定 | 待采 | 计划 S | 采实际代码元素的字体族、盒子、颜色与圆角，检查它在正文行内的占位。 | UNVERIFIED |
| `code-block` · 代码块 | 待测 | 待定 | 待采 | 计划 S＋A | 分别测容器和内部代码字体，观察长行如何呈现。 | UNVERIFIED |
| `image` · 图片 | 待测 | 待定 | 待采 | 计划 S＋A | 测可见图片和外框的宽度约束、对齐与留白，并查看宽图的显示。 | UNVERIFIED |
| `caption` · 图注 | 待测 | 待定 | 待采 | 计划 S＋A | 单独测图注字体、颜色、对齐及与图片的间隔。 | UNVERIFIED |
| `link` · 超链接 | 待测 | 待定 | 待采 | 计划 S＋A | 记录正文链接的颜色、下划线和悬停反馈，比较与正文的区分度。 | UNVERIFIED |

### 颜色、状态与交互

| 参数 | Reference Value | Target Value | Evidence | Evidence Level | Rationale | Verification Status |
| --- | --- | --- | --- | --- | --- | --- |
| `surface-colors` · 页面、顶栏、侧栏、正文和目录背景 | 待测 | 待定 | 待采 | 计划 S | 逐区取背景颜色，透明层同时记录实际承托背景。 | UNVERIFIED |
| `text-colors` · 正文、辅助文字与强调色 | 待测 | 待定 | 待采 | 计划 S | 记录可见实例的 color，结合相邻背景确认层级。 | UNVERIFIED |
| `borders-radius-shadow` · 边框、圆角和阴影 | 待测 | 待定 | 待采 | 计划 S | 测分隔线、容器和浮层的可见样式并记录具体区域。 | UNVERIFIED |
| `item-hover` · 导航及目录 Hover | 待测 | 待定 | 待采 | 计划 S＋A | 同一元素比较默认与悬停，分别记背景、文字、边框及触发方式。 | UNVERIFIED |
| `item-selected` · 导航及目录选中状态 | 待测 | 待定 | 待采 | 计划 S＋A | 通过页面实际选中，记录当前项的背景、字重和标记并与 Hover 区分。 | UNVERIFIED |
| `keyboard-focus` · 键盘焦点 | 待测 | 待定 | 待采 | 计划 S＋A | 使用 Tab 观察焦点可见性，检查轮廓、偏移和阴影。 | UNVERIFIED |
| `navigation-collapse` · 导航及目录区域折叠 | 待测 | 待定 | 待采 | 计划 S＋A | 观察入口和展开／收起后的空间变化，记录仍可见容器的宽度。 | UNVERIFIED |
| `outline-navigation` · 目录锚点跳转、当前项及滚动 | 待测 | 待定 | 待采 | 计划 A | 观察点击定位、滚动时当前项反馈及复位行为，记录是否实际出现。 | UNVERIFIED |

## M00-UI-B 接续条件

1. 负责人授权接续，在 Chrome 或 Edge 的个人测试文档实测。记录系统、浏览器完整版本、界面语言、日期、浏览器缩放、系统显示缩放、视口和 DPR。收集默认、较宽、全宽及关键排版、颜色和交互。 [本地采集步骤](../../validation/m00-ui/README.md)
2. 提交三张真实且可公开的参考截图。按 PDT 记录整体布局 `references/01-document-layout.png`、正文排版 `references/02-typography.png`、导航与目录交互 `references/03-interaction.png`。保留样本编号与观察环境的对应关系。
3. 补全实际证据，决定默认正文宽度与产品视觉目标并记录调整理由。负责人确认后冻结 `UI-SPEC.md` 和 `src/styles/tokens.css`，后者只填已确认的产品目标值。M00-UI 与 Gate 01 均待验收。
