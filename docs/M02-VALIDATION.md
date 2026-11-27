# M02 文档式阅读验收

PDT V1.3 · DOM-only · `dev` · 正式用户脚本开发版本 `0.0.2`。

负责人已接受 M01-L 的安装与合成回归证据并授权 M02。M01-L-R 及 M01-L 整体保留 `BLOCKED`。本阶段基线取自 [分层验收政策提交](https://github.com/kurikiwoods-coder/zhihu-doc-reader/commit/60b2e7ff6a20767acce59b78635adf3ec6d119dd)。 [M01 验收](M01-VALIDATION.md) · [视觉规范](design/UI-SPEC.md)

## 实施范围

| 路由 | 当前实现 | 实站状态 |
| --- | --- | --- |
| 首页推荐、关注、热榜、搜索 | 从当前已加载卡片提取一条标题、可得作者、原文链接及最多 240 字摘要，并明确显示为预览。 | 联验待执行 |
| 问答 | 在原生已加载且完整可见的回答中读取一条全文。直达回答路由要求 DOM 中存在对应回答。 | 联验待执行 |
| 专栏 | 读取原生标题、可取得的作者和发布时间、完整正文及原文。 | 联验待执行 |

阅读器包含独立顶部工具栏、左导航、正文和右目录。标题目录按可见正文生成，支持跳转、选中反馈和折叠。正文宽度有默认、较宽、全宽，浅色／深色及当前排版设置在本次打开期间有效。导航的后续功能已标注待接入。原生页面和状态恢复仍由 M01 生命周期负责。

富文本适配器从可见 DOM 建立白名单数据树，渲染器创建新的安全节点。标题、段落、列表、引用、代码、粗斜体和图注保留结构。安全链接仅允许 HTTP(S)，打开时省略 Referer，截断、登录墙及内容为空时保留原页。已解码图片仅绘制到 Canvas，未加载图片显示替代文本。正文从属的数据、样式、脚本及表单不会被原样注入，读取器无后台预取及主动知乎 API 请求。

## 合成回归和视觉取证

Node 构建、Metadata 和安全检查、M01／M02 DOM 用例及 M00-B 历史探针由 `Userscript CI` 执行。浏览器任务用 GitHub 托管机上的 Chrome 和 Edge 打开本地合成 Fixture，覆盖 885、900、1200、1440 CSS px、三档正文宽度、浅／深色、长标题、长代码、目录、Escape、焦点、滚动、模拟路由和异常降级。

已通过单元及静态检查 **10/10**、正式产物 DOM 回归 **24/24**（M01 相关用例 16 项和 M02 新增 8 项）、M00-B 历史探针 **21/21**。构建产物 `dist/bundle.user.js` 的 SHA-256 为 `4e75e78505dc7771d100f33aaca2a688dcc2295895a5713baa787519221f18c5`，两浏览器报告与编译任务一致。 [固定产物](https://github.com/kurikiwoods-coder/zhihu-doc-reader/blob/5458614fb56ac1ba1f98e2834e35a1151e475b1d/dist/bundle.user.js) · [回归运行](https://github.com/kurikiwoods-coder/zhihu-doc-reader/actions/runs/45961509670)

| GitHub 托管合成环境 | CSS 视口 | 截图及报告 |
| --- | --- | --- |
| Chrome `158.0.8127.36`，Linux | 885、900、1200、1440 均通过 | 3 张 PNG 和 `report.json`。 [下载](https://github.com/kurikiwoods-coder/zhihu-doc-reader/actions/runs/45961509670/artifacts/15180972809) |
| Edge `158.0.4370.33`，Linux | 885、900、1200、1440 均通过 | 3 张 PNG 和 `report.json`。 [下载](https://github.com/kurikiwoods-coder/zhihu-doc-reader/actions/runs/45961509670/artifacts/15180853379) |

| 视口 CSS px | 默认列宽 | 较宽列宽 | 全宽列宽 |
| ---: | ---: | ---: | ---: |
| 885 | 768 | 823 | 823 |
| 900 | 598 | 598 | 598 |
| 1200 | 698 | 698 | 698 |
| 1440 | 768 | 938 | 938 |

实际列宽计入原生视口和阅读区滚动条。每端的 `reader-layout.png`、`reader-typography.png` 与 `reader-interaction.png` 取自已渲染的合成文章。截图已核验 PNG 头、尺寸与 SHA-256。浏览器回归覆盖原生 Escape 事件、焦点归位、滚动位置、五轮进出、模拟路由和异常降级。真实知乎与 Tampermonkey 联验独立记录。 [合成源文件](../validation/m02/fixtures/rich-article.html)

## M01／M02 真实知乎联合验收

| 验收项 | Chrome | Edge |
| --- | --- | --- |
| 两端在独立配置安装并核对 `0.0.2` | NOT RUN | NOT RUN |
| 六类原生路径、问答及专栏完整正文与富文本 | BLOCKED | BLOCKED |
| SPA 路由、连续进出、滚动恢复、键盘及焦点 | NOT RUN | NOT RUN |
| 登录限制、缺失正文、访问异常及原页恢复 | 未完成 | 未完成 |
| 停用脚本后的同环境控制对照 | NOT RUN | NOT RUN |

既有本地报告记录首页跳转登录，指定问答及专栏出现 HTTP 403。另有「请求参数异常」报告。正式脚本没有主动站点请求、凭证读取或请求改写路径。原生页面的请求由浏览器和知乎页面继续发出。工程检查未发现脚本主动发出请求或改写请求参数的路径，合成页面资源记录的 HTTP(S) 请求数也为 0。网页版仅检测到一个未核验配置的 Chrome，无 Edge 连接和打开的知乎或 Tampermonkey 管理页。本轮未取得停用脚本后的原生对照，异常归因仍未完成。

在同一台个人电脑上沿用正常浏览器配置及网络，先停用本项目脚本，做一次原生访问对照。记录浏览器及 Tampermonkey 版本、脚本版本与启停状态、时间、去敏后的路径类别、HTTP 状态及页面提示。遇到 403、验证码、登录或网站安全限制即停止。本机原生访问恢复后，在独立 Chrome 和 Edge 配置安装锁定的 `0.0.2`，对可正常访问的样本继续，并按 [M01 实机用例](M01-VALIDATION.md#原生访问对照与未完成实站用例) 联合验收。

M01-L-R 及联合实机验收保持 `BLOCKED`。Gate 01-V 待负责人确认。双端实站通过、访问异常和其他阻断问题解决、Gate 01-V 确认后方可申请 M03。M03–M05 保持锁定。
