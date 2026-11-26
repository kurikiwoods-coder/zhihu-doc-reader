# M00-UI 本地样式测量

测量工具在 Chrome 或 Edge 的 DevTools 中运行一次，只检查 Elements 面板中当前选中的可见元素。JSON 包含盒子位置和尺寸、固定清单内的计算样式、视口和 DPR。工具不发网络请求，不更改文档，不读取正文、Cookie、账号信息或页面 HTML。测量无需安装扩展。

## 采集步骤

1. 在个人账号中建立仅含合成内容的飞书测试文档。准备文档标题、H1–H3、相邻的中英混排段落、引用、有序和无序列表、行内代码、代码块、测试链接、本地测试图片及图注。用三个标题层级生成目录。
2. 使用 Chrome 或 Edge 桌面版，浏览器缩放设为 100%。记录日期、时区、系统、浏览器完整版本、显示缩放、界面语言和外观。打开 DevTools，建议将其独立成窗以保持页面视口。用 Elements 的元素选取器选中需要测量的可见元素。
3. 在 DevTools Console 运行 [measure-style.js](measure-style.js) 全文，复制输出的 JSON。也可以在 Sources → Snippets 的 New snippet 新建并保存。每次在 Elements 选中目标后，按 `Ctrl+O`（macOS 为 `Command+O`），输入 `!` 和 Snippet 名称并回车。 [DevTools 的当前选中元素](https://developer.chrome.com/docs/devtools/console/utilities/) · [Snippets 使用说明](https://developer.chrome.com/docs/devtools/javascript/snippets/)
4. 固定视口与辅助面板状态，在右上角页宽菜单切换默认、较宽、全宽，对标题和正文共享的容器各测一次。另测内侧文字列、顶部栏及可见目录，分别记录它们的读数。排版和颜色优先在默认档采集。对照 [草案矩阵](../../docs/design/UI-SPEC-DRAFT.md#视觉测量矩阵) 记录导航折叠、目录跳转、滚动以及悬停、选中和键盘焦点。

## 记录与截图

- 将输出复制到 [measurement-template.json](measurement-template.json) 的工作副本。填写 `session`，再给每条 `captures` 记录加上 `id`、`widthMode`（`default`、`wide` 或 `full`）、`elementRole`（如 `body-column`）、`state` 和 `style`（脚本输出）。同一行需要多次测量时，用多个 ID 保留宽度模式、状态和各自视口。
- 为每条 `captures` 填写 `evidenceLevel`。真实编辑器样式实测记 S，截图和实际操作观察记 A，后两者可用 `fileName` 与 `observation` 记录。若通过 DevTools 的 `:hov` 固定悬停或焦点 CSS，标注 `devtools-forced`。折叠、滚动、跳转与持久选中由实际操作观察。 [DevTools 伪类设置](https://developer.chrome.com/docs/devtools/css/reference)
- 在 `measurements` 的对应行填入 `referenceValue` 和证据编号 `evidence`，并填写实际的 `evidenceLevel` 数组（如 `["S", "A"]`）。有真实证据且确认测量结果后，将对应项标为 `VERIFIED`。缺少数据时继续标记 `UNVERIFIED`。如果某区域在指定视口和状态下明确缺席，记下这次 A 级观察。产品 `targetValue` 由负责人确认后填写。
- 保留三张截图，分别是默认档整体布局、富文本排版、导航／目录交互。公开提交前检查画面，裁掉或遮挡头像、个人资料、账号、工作区标识和文档地址。交付脱敏的 JSON 与截图即可。

`rectCssPx` 是相对视口的边框盒几何值，单位为 CSS 像素。`computedStyle` 保留浏览器原样计算结果，`font-family` 是字体候选栈。比较段落间距时用下段的顶部减去上段的底部，并记录父容器的 `gap`。选中元素应在视口内且可见，执行前确认其没有被遮挡。样式取自当前选中的实际元素。
