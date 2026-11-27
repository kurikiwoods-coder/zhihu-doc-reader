# M01 基础工程验收

2026-11-27（UTC+08:00）。PDT V1.3，分支 `dev`。Gate 01-T 已通过。M01-A／B 已完成工程与离线验收。 [Gate 01-T 核验](M00-VALIDATION.md#gate-01-t-技术准入与视觉边界)

## 产物与实现

| 项目 | 结果 |
| --- | --- |
| 运行环境 | 本地 Debian GNU/Linux 13，Node.js `24.22.3`。构建只使用 Node.js 标准库，运行产物无第三方依赖。 |
| 构建 | `node build.js` 生成 [dist/bundle.user.js](../dist/bundle.user.js)，20,552 字节。同一源码的两次构建逐字节一致。 |
| 构建 SHA-256 | `f6172eb5167cdd89db2056e2a9f53549baef4ed7fcbca0041b42744c672e6dee` |
| 上游复用 | `connectedGraph/zhihu-immersive-reader` v5.1.6 的静态拼接方式、路由判定与挂载防重思路，以及专栏原生 `.Post-Main` 容器。保留 `Copyright (c) 2026 connectedGraph` 和原始 MIT 文本，随构建产物一并分发。 [固定上游与许可证](UPSTREAM-LOCK.md) |
| 元数据 | HTTPS 的知乎主站及专栏 `/p/*`，`document-idle`、`@noframes`、`@grant none`、`@updateURL none`、`@downloadURL none`。主站匹配覆盖 SPA 从其他路由进入的情况，只有六类受支持页面可挂载入口。 |
| DOM-only | 适配器读取当前已呈现的知乎内容。最小阅读层显示单条标题及已有作者、纯文本摘要，缺失字段留空。图片、完整富文本和阅读队列按后续阶段实现。 |
| 生命周期 | 首次注入默认关闭。入口手动打开原生模态框。退出按钮、Escape、弹窗关闭及切换路由均移除阅读根节点。原生 DOM 保持原样，手动退出焦点返回入口。页面卸载清理路由监听及 Observer。 |
| 可替换样式 | `tokens.css` 管理视觉值。布局、排版及控件各有独立文件。Shadow DOM 隔离样式，顶部栏、左侧导航、正文和右侧目录拥有独立组件区域。侧栏和目录在 M01 隐藏，适配器通过标准化记录与渲染解耦。 [初始视觉目标](design/UI-SPEC.md) |

## 剥离与权限

| 范围 | 正式产物检查 |
| --- | --- |
| 翻译、划词翻译、AI 笔记、Wiki 和 LLM 结构化 | 未纳入这些上游入口、设置界面和运行路径。 |
| Embedding、向量/Wiki 缓存、模型与 API Key | 未引入依赖、配置、读写或外部请求。`wiki.js` 与 `api.js` 的共享取数函数随两模块一起排除。DOM 适配器直接读取当前页面。 |
| Feed、批量预取、账号写操作、分享与导出 | 正式产物无主动请求、预取或账号操作入口。插件真实 Feed 请求为 0。 |
| Cookie、远程依赖、更新及全局拦截 | 正式产物无凭证读取、跨域网络授权、远程可执行依赖、上游更新地址或原型改写。 |

## 验证结果

| 范围 | 状态 | 验证记录 |
| --- | --- | --- |
| M01-A 构建、安全与状态 | PASS | 正式产物语法、构建重复性、六类路由、Metadata、权限及 AI、外部网络、动态代码和凭证入口检查。单元测试 10/10。覆盖 AT23、AT24、AT26 的工程核验。 |
| M01-B 生命周期与降级 | PASS（离线） | 正式产物测试 16/16。覆盖六路手动打开、指定回答、重复注入、五轮模式切换、退出、焦点恢复调用、SPA 导航、页面卸载、合成访问限制、缺失内容及模态框故障。覆盖 AT02、AT11、AT12、AT19 的离线工程核验。 |
| M00-B 历史探针 | PASS（离线复跑） | 原 `0.0.2` 探针 21/21，保留 Chrome／Edge 实机及替代验收。[M00-B 证据](M00-VALIDATION.md#m00-b-r-分层取证与验收例外) |
| M01-L 正式产物 Chrome／Edge、Tampermonkey | BLOCKED | 已验证候选文件。独立 Chrome 配置无法确认且扩展管理标签不可访问，Edge 未接入。实机用例见下表。 |
| Gate 01-V | 待验收 | 初始目标值已获确认。M02 完成后以阅读器自身的响应式、富文本及交互取证，提交负责人确认。历史 M00-UI 取证状态与 0 / 3 张飞书正式截图记录沿用。 |

## M01-L 双浏览器实机补证

2026-11-27（UTC+08:00）。验收基线为 `d249bf0d4f03c5d2c91009bfcf3ad00ab9e75f6a`，正式用户脚本版本为 `0.0.1`。从固定提交取得的 GitHub 原始文件与本地重建文件逐字节一致，大小为 20,552 字节，SHA-256 为 `f6172eb5167cdd89db2056e2a9f53549baef4ed7fcbca0041b42744c672e6dee`。重新核验构建、语法、最小权限与网络边界。正式脚本单元及静态检查 10/10，正式脚本 DOM 离线用例 16/16，历史 M00-B 探针离线回归 21/21。 [固定产物](https://github.com/kurikiwoods-coder/zhihu-doc-reader/blob/d249bf0d4f03c5d2c91009bfcf3ad00ab9e75f6a/dist/bundle.user.js) · [基线 CI](https://github.com/kurikiwoods-coder/zhihu-doc-reader/actions/runs/45949184291)

| 环境 | 接入结果 | 完整浏览器版本、Tampermonkey 版本、安装及冲突脚本状态 |
| --- | --- | --- |
| 个人独立 Chrome | 检测到 Chrome 连接，未返回配置名称。现有 `chrome://extensions` 标签无法通过连接读取。 | 未核实 |
| 个人独立 Edge | 无 Edge 连接。 | 未核实 |

当前连接无法确认两套个人独立配置，M01-L 为 **BLOCKED**，当前实机执行数为 **0/14（Chrome）与 0/14（Edge）**。本轮实机 OS、浏览器及 Tampermonkey 版本、登录状态、已安装脚本指纹、生命周期和原生恢复证据待取得。M00-B 探针证据按原用途保留。

| ID | 验收事项 | 核对方式 | Chrome | Edge |
| --- | --- | --- | --- | --- |
| L01 | 默认关闭 | 首次打开受支持的原生页面，确认仅有单个阅读入口。 | NOT RUN | NOT RUN |
| L02 | 首页推荐 | 手动进入，对照已加载推荐内容，退出后核对原页。 | NOT RUN | NOT RUN |
| L03 | 关注动态 | 手动进入，对照当前会话可访问的动态，退出后核对原页。 | NOT RUN | NOT RUN |
| L04 | 热榜 | 手动进入，对照已加载热榜内容，退出后核对原页。 | NOT RUN | NOT RUN |
| L05 | 搜索 | 打开 PDT 搜索样本，有可见结果时手动进出。 | NOT RUN | NOT RUN |
| L06 | 问答 | 手动进入已加载的问答页，对照预览后退出。 | NOT RUN | NOT RUN |
| L07 | 专栏 | 手动进入可访问的专栏，对照预览后退出。 | NOT RUN | NOT RUN |
| L08 | Escape | 阅读页按 Escape 后，确认阅读根节点已移除。 | NOT RUN | NOT RUN |
| L09 | 键盘焦点恢复 | 通过键盘进入和退出，确认焦点回到阅读入口，可继续导航。 | NOT RUN | NOT RUN |
| L10 | 原生滚动恢复 | 滚动后打开并退出，记录同页前后的滚动位置及原生锚点。 | NOT RUN | NOT RUN |
| L11 | 五轮进入与退出 | 连续五轮确认打开时单阅读根节点，关闭后恢复单入口。 | NOT RUN | NOT RUN |
| L12 | SPA 前进和后退 | 同标签原生切换路由，再前进和后退，核对挂载和原页。 | NOT RUN | NOT RUN |
| L13 | 刷新及生命周期 | 刷新及往返后核对根节点不重复，核对路由监听及 MutationObserver 的卸载和恢复。 | NOT RUN | NOT RUN |
| L14 | 原生限制及降级 | 记录登录限制、正文缺失及异常样本，检查原生界面可用。 | NOT RUN | NOT RUN |

恢复测试时使用 PDT §13 六个样本。先在各自独立配置记录操作系统、浏览器与 Tampermonkey 完整版本，校验并安装固定文件，停用历史探针及冲突脚本。按环境分别记录登录状态、实际 URL、输出、根节点及证据。无相应可访问样本的用例保留实测缺口。 [实机样本](PDT-V1.3.md#13-实机测试环境) · [固定文件下载](https://raw.githubusercontent.com/kurikiwoods-coder/zhihu-doc-reader/d249bf0d4f03c5d2c91009bfcf3ad00ab9e75f6a/dist/bundle.user.js)

M01-L 两端通过且无阻断性安全或生命周期问题后，按已授权顺序实施 M02-A 和 M02-B。Gate 01-V 在 M02 完成后提交负责人确认。M03–M05 保持锁定。

## 复现

```bash
node build.js
node --check dist/bundle.user.js
npm test
node tests/dom.test.mjs /path/to/linkedom-worker.mjs
node validation/m00-b/offline.test.mjs /path/to/linkedom-worker.mjs
```

两个离线测试先校验本地 LinkeDOM worker 的 SHA-256，再加载它。源地址与哈希见 [测试依赖锁](../tests/browser-fixture.lock.json)。CI 单独下载该固定开发依赖，依次执行构建、语法检查、正式产物测试和历史探针回归。 [Userscript CI](../.github/workflows/ci.yml)
