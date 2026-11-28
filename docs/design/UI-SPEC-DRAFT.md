# Zhihu Doc Reader 视觉规范草案

2026-11-27（UTC+08:00） · PDT V1.2 §20–22 · DOM-only · M00-UI-B-R

这份历史矩阵汇总负责人已接受的 UIB-DOM-01 至 UIB-DOM-07，并保留当时的候选目标。现行阅读器采用左侧产品导航、居中正文和右侧阅读辅助区。2026-11-28 的补测覆盖同一视口的三档页宽、标准档的窄窗口、目录位置与真实指针悬停。 [现行视觉规范](UI-SPEC.md) · [飞书补测报告](FEISHU-VISUAL-REVIEW.md) · [脱敏测量原记录](../../validation/m00-ui/evidence/editor-dom-precheck.json) · [机器可读历史矩阵](../../validation/m00-ui/evidence/visual-review-matrix.json)

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

Reference Value 写入 2026-11-27 真实测量或观察，Target Value 是当时的候选设计值。Evidence 使用原样本编号。Rationale 说明目标的选择与调整依据。下列状态及待补列为该日期的快照。2026-11-28 的计算样式、几何、目录键鼠观察和截图状态见补测报告。 [M00-UI-FINAL 补测](FEISHU-VISUAL-REVIEW.md)

| 证据状态 | 项数 | 含义 |
| --- | ---: | --- |
| `DOM_CAPTURED` | 12 | 对应字段已有接受的编辑器 DOM 读数，正式复核待补。 |
| `PARTIAL` | 7 | 已有部分字段或交互状态，仍有明确缺项。 |
| `UNVERIFIED` | 12 | 缺少可复核的真实参考样本。 |

### 布局

| 参数 | Reference Value | Target Value（候选） | Evidence | 证据类型 | Rationale | Verification Status | 待补 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `header-bar` 顶部栏高度、上下内距和分隔线 | 64 px；上下内距 0；底线 1 px 实线 `#DEE0E3` | 56 px；上下内距 0、左右 20 px；1 px 分隔线 | `UIB-DOM-04`、`UIB-DOM-05` | DOM 读数 | 为阅读区留出垂直空间，同时容纳搜索、设置与原文入口。 | `DOM_CAPTURED` | 等待个人测试文档 F12 复核。 |
| `left-navigation` 左侧导航宽度 | 同一 885 px 视口分别观察到 300 px、268 px | 展开 224 px；收起 52 px；内距 12 px | `UIB-DOM-04`、`UIB-DOM-05` | DOM 读数 | 导航信息层级较短，收窄后为正文保留行宽。 | `DOM_CAPTURED` | 等待个人测试文档 F12 复核。 |
| `outline-placement` 目录实际位置、宽度与对齐 | 主区左缘 x=268 px；展开约 210.08 px；条目逐级缩进 14 px | 正文右侧 200 px；内距 12 px；逐级缩进 12 px | `UIB-DOM-07` | DOM 读数＋A 级观察 | 保留左侧用于产品导航，章节定位放在正文右侧。 | `DOM_CAPTURED` | 等待个人测试文档复核布局与固定状态。 |
| `right-auxiliary` 右侧辅助区与可用空间 | 右侧辅助区未独立观测 | 共用 200 px 右侧区；常驻或覆盖由视口决定 | 待采 | 待采 | 遵循 PDT 的右侧信息层级，避免添加额外常驻列。 | `UNVERIFIED` | 记录右侧区域的存在、类型、打开和关闭后的文宽。 |
| `content-default` 默认正文区宽度 | 1440 × 731 CSS px 下为 820 px | 上限 768 px；受可用空间约束 | `UIB-DOM-01` | DOM 读数 | 缩短连续中文行长，为问答和专栏提供稳定的默认阅读宽度。 | `DOM_CAPTURED` | 等待个人测试文档 F12 复核。 |
| `content-wide` 较宽正文区宽度 | 1440 × 731 CSS px 下为 1008 px | 上限 960 px；受可用空间约束 | `UIB-DOM-02` | DOM 读数 | 给宽图、表格及长代码更大的容纳空间。 | `DOM_CAPTURED` | 等待个人测试文档 F12 复核。 |
| `content-full` 全宽正文区宽度 | 1440 × 731 CSS px 下为 1008 px | 占正文可用区 100%；保留两侧内距 | `UIB-DOM-03` | DOM 读数 | 满宽跟随阅读区尺寸，保留内侧易读留白。 | `DOM_CAPTURED` | 等待个人测试文档 F12 复核。 |
| `content-padding` 正文内外间距与有效行宽 | 外框内距均 0；438 px 外框与 450 px 编辑块边界已记录，有效文本内线待测 | 横向 24 px；窄屏 16 px；纵向 32 px | `UIB-DOM-04`、`UIB-DOM-05` | DOM 读数 | 清楚区分外壳留白和正文有效宽度。 | `PARTIAL` | 同一页宽模式测外框、文字列及外距。 |
| `responsive-layout` 窄视口布局 | 1440 px 默认列宽 820；885 px 两次为 438 / 470，窄视口页宽档未确认 | 1200 px 起允许双侧栏；900–1199 px 右侧覆盖；低于 900 px 双侧栏按需打开 | `UIB-DOM-01`、`UIB-DOM-04`、`UIB-DOM-05` | DOM 读数 | 以正文剩余宽度为先，在窄窗仍能找到导航和目录。 | `PARTIAL` | 固定同一档和面板状态，跨 900 / 1200 px 做真实窗口验证。 |

### 排版与富文本

| 参数 | Reference Value | Target Value（候选） | Evidence | 证据类型 | Rationale | Verification Status | 待补 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `document-title` 文档主标题 | 34 px / 600 / 55.25 px | 32 px / 700 / 1.25（40 px） | `UIB-DOM-04`、`UIB-DOM-05` | DOM 读数 | 提高主标题字重，在多行题名下控制首屏占用。 | `DOM_CAPTURED` | 等待个人测试文档 F12 复核。 |
| `heading-1` H1 | 26 px / 600 / 36.4 px | 24 px / 600 / 1.4（33.6 px） | `UIB-DOM-06` | DOM 读数 | 正文一级标题与主标题保有明显层级。 | `DOM_CAPTURED` | 等待个人测试文档 F12 复核。 |
| `heading-2` H2 | 22 px / 600 / 30.8 px | 20 px / 600 / 1.45（29 px） | `UIB-DOM-06` | DOM 读数 | 两个相邻章节层级可通过字号直接辨别。 | `DOM_CAPTURED` | 等待个人测试文档 F12 复核。 |
| `heading-3` H3 | 20 px / 600 / 28 px | 18 px / 600 / 1.5（27 px） | `UIB-DOM-06` | DOM 读数 | 三级标题紧邻正文，保持同色和清晰字重。 | `DOM_CAPTURED` | 等待个人测试文档 F12 复核。 |
| `paragraph` 正文字体、字号、字重和行高 | 16 px / 400 / 26 px；字体候选栈见测量记录 | 系统字体栈；17 px / 400 / 1.7（28.9 px） | `UIB-DOM-04` | DOM 读数 | 增大正文一档并增加行高，兼顾问答长段和中英混排。 | `DOM_CAPTURED` | 等待个人测试文档 F12 复核。 |
| `paragraph-gap` 段落实际间距 | 相邻正文块实测 8 px | 12 px | `UIB-DOM-04` | DOM 读数 | 加强长文的段落边界与扫读节奏。 | `DOM_CAPTURED` | 等待个人测试文档 F12 复核。 |
| `blockquote` 引用 | 未测 | 左线 3 px；左右 16 px、上下 10 px；独立浅底 | 待采 | 待采 | 通过线条和留白识别引文，不压缩字阶。 | `UNVERIFIED` | 补引文样本、几何、计算样式和可公开截图。 |
| `ordered-list` 有序列表 | 未测 | 每级缩进 24 px；项间距 4 px | 待采 | 待采 | 让多行列表项清楚收束，保持正文排版节奏。 | `UNVERIFIED` | 补两级嵌套样本与标记、缩进、行高。 |
| `unordered-list` 无序列表 | 未测 | 每级缩进 24 px；项间距 4 px | 待采 | 待采 | 让多行列表项清楚收束，保持正文排版节奏。 | `UNVERIFIED` | 补两级嵌套样本与标记、缩进、行高。 |
| `inline-code` 行内代码 | 未测 | 14 px 等宽；上下 2 px、左右 4 px；4 px 圆角 | 待采 | 待采 | 区分技术标记并降低字号突变。 | `UNVERIFIED` | 补行内代码样本及字形、盒子取证。 |
| `code-block` 代码块 | 未测 | 14 px / 1.55；内距 16 px；8 px 圆角 | 待采 | 待采 | 保留缩进并避免长代码撑破整页。 | `UNVERIFIED` | 补多行长代码样本、容器样式和溢出观察。 |
| `image` 图片 | 未测 | 最大宽度 100%；比例自适应；圆角 8 px | 待采 | 待采 | 宽图服从正文列尺寸，避免水平溢出。 | `UNVERIFIED` | 补授权样本中的宽图与图片外框证据。 |
| `caption` 图注 | 未测 | 13 px / 1.5；图下 8 px；居中 | 待采 | 待采 | 图注随图阅读，弱于正文且保持可辨识。 | `UNVERIFIED` | 补带图注的实际样本及间距、颜色。 |
| `link` 超链接 | 未测 | 使用主题主色，常驻下划线偏移 3 px | 待采 | 待采 | 下划线让链接在颜色以外仍可辨识。 | `UNVERIFIED` | 补正常、悬停和焦点的真实链接样本。 |

### 颜色与交互

| 参数 | Reference Value | Target Value（候选） | Evidence | 证据类型 | Rationale | Verification Status | 待补 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `surface-colors` 页面、顶栏、侧栏、正文和目录背景 | 页面、顶栏 `#FFFFFF`；左栏 `#F5F6F7`；正文容器透明 | 浅色阅读面 `#FFFFFF`，外壳 `#F7F8FA`，左栏 `#EFF2F6`；深色按语义覆盖 | `UIB-DOM-04`、`UIB-DOM-05` | DOM 读数 | 用轻微面色差异识别正文区和导航。 | `PARTIAL` | 测目录承托背景及深色实际样本。 |
| `text-colors` 正文、辅助文字与强调色 | 正文与标题文字 `#1F2329`；辅助、强调色待测 | 浅色正文 `#1F2937`、辅助 `#526071`、主色 `#284B97`；深色同组覆盖 | `UIB-DOM-04`、`UIB-DOM-06` | DOM 读数 | 以阅读对比度为先，采用独立的深蓝强调色。 | `PARTIAL` | 测辅助、强调色、暗色文字及相邻背景。 |
| `borders-radius-shadow` 边框、圆角和阴影 | 顶栏底线 1 px `#DEE0E3`，左栏右线 1 px `rgba(31,35,41,0.04)`；顶栏圆角 0、阴影无 | 分隔线 1 px；控件圆角 8 px；阴影限覆盖面板 | `UIB-DOM-04`、`UIB-DOM-05` | DOM 读数 | 常驻框架视觉安静，覆盖面板拥有可见层级。 | `PARTIAL` | 补控件、浮层实际圆角与阴影。 |
| `item-hover` 导航及目录项悬停 | 未测 | 浅色填充 `#E8EEF6`；圆角 8 px | 待采 | 待采 | 让点选范围易见且保持布局尺寸稳定。 | `UNVERIFIED` | 同一导航项和目录项比较默认及悬停的计算样式。 |
| `item-selected` 导航及目录项选中 | 未测 | 浅色填充 `#DDE8FB`、文字 `#203F77`、标记宽 3 px | 待采 | 待采 | 用形状、状态语义和颜色共同说明当前项。 | `UNVERIFIED` | 测当前导航项、当前目录项和滚动时的选中变化。 |
| `keyboard-focus` 键盘焦点 | 未测 | 主题焦点色，轮廓 2 px、外偏移 2 px | 待采 | 待采 | 使焦点在浅／深背景、悬停和选中状态中可辨识。 | `UNVERIFIED` | 在个人文档用 Tab 实测可达性、可见性和环线。 |
| `navigation-collapse` 导航及目录固定与折叠 | 目录悬停从 4 px 展开至约 210.08 px；固定与折叠开关未测 | 左栏 224 / 52 px；右侧展开 200 px，收起释放列宽 | `UIB-DOM-07` | DOM 读数＋A 级观察 | 提供可预期的操作入口，适配窄视口。 | `PARTIAL` | 验证左右栏固定、取消固定、折叠、恢复及持续性。 |
| `outline-navigation` 目录锚点、当前项与滚动 | 列出 H1–H3；点击 H3 后标题从 y=748.45 移至 302.95 px，进入视口 | 按 H1–H3 建目录；锚点顶部留 68 px；当前章节有选中标记 | `UIB-DOM-07` | A 级观察 | 便于跳到段落并在长篇阅读中重新定位。 | `PARTIAL` | 现有跳转无需重测；补当前项跟随滚动及复位。 |

## 2026-11-27 复核与冻结条件

1. 补完整浏览器、系统与缩放环境，运行 F12 脚本并取实际输出。固定档位与面板状态，再验证窄窗及目标断点。 [本地采集步骤](../../validation/m00-ui/README.md)
2. 在个人测试文档补齐富文本、目录固定／折叠、当前项、单项悬停及键盘焦点，取得三张可公开的截图。 [缺项与截图状态](../../validation/m00-ui/evidence/visual-review-matrix.json)
3. 负责人确认目标值及视觉取证结果后，冻结候选规范和 CSS Tokens。Gate 01 由负责人按 PDT 单独确认。

2026-11-28 已补标准档的窄窗口、三档页宽、真实悬停和目录状态。当前缺项及待评审的最小 CSS 方案见补测报告。 [当前补测范围](FEISHU-VISUAL-REVIEW.md)
