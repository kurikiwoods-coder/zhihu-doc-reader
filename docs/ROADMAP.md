# 开发路线与验收

[PDT v1.3](PDT-V1.3.md) · [历史 PDT v1.2](PDT-V1.2.md) · [中文 README](../README_CN.md) · [English README](../README.md)

PDT V1.3 是产品与验收基线。M00-A 与 M00-B 已验收，Gate 01-T 已通过。M01-A／B 已完成基础工程及离线核验，正式产物的 Chrome／Edge 实机测试待执行。真实 Feed 请求为 0。M00-UI 原始取证为 BLOCKED，Gate 01-V 待验收，M02–M05 保持锁定。 [M00 验证](M00-VALIDATION.md) · [M01 验证](M01-VALIDATION.md)

## 模块与版本

| 模块 | 交付结果 | 版本节点 | 预计工作量 |
| --- | --- | --- | --- |
| M00 开发前验证 | 上游构建、知乎实机与视觉测量证据 | Gate 01-T 技术准入；Gate 01-V 独立视觉验收 | 20% |
| M01 基础工程与底库精简 | 可构建、可安装、可进入和退出阅读模式的基础脚本 | — | 15% |
| M02 文档式界面 | 顶栏、左侧导航、正文、目录及问答与专栏的安全渲染 | — | 25% |
| M03 核心浏览 | 热榜、推荐、搜索、阅读队列与回答切换 | Gate 02 通过后交付 V0.1 内测版 | 20% |
| M04 个人阅读功能 | 收藏、历史、主题与排版设置、快捷键和关注动态 | V0.2 功能完整候选版 | 10% |
| M05 测试与发布 | 回归、实机、视觉、CI 和单文件发布 | Gate 03 通过后发布 V1.0 | 10% |

工作量为初步估算。M00 发现底库兼容性问题时重新评估。

## 实施任务

| 任务 | 内容 | 交付或核对项 | 当前状态 |
| --- | --- | --- | --- |
| M00-A | 锁定上游源码，审计许可、权限、依赖、网络和构建 | [M00-VALIDATION.md](M00-VALIDATION.md) · [UPSTREAM-LOCK.md](UPSTREAM-LOCK.md) | PASS（审计与构建） |
| M00-B | 在 Chrome 和 Edge 验证知乎页面、登录状态、数据源及降级 | [执行记录](M00-VALIDATION.md#m00-b-真实页面与数据源验证) · [分层取证与验收例外](M00-VALIDATION.md#m00-b-r-分层取证与验收例外) | PASS（已结项） |
| M00-UI | 飞书历史参考与独立产品初始设计基线 | [31 项测量矩阵](design/UI-SPEC-DRAFT.md) · [初始规范](design/UI-SPEC.md) · [初始 Tokens](../src/styles/tokens.css) | 历史取证 BLOCKED；初始设计目标已确认 |
| M01-A | 初始化工程、锁定依赖，剥离 AI、Wiki 和 Embedding | AT23、AT24、AT26 | PASS（基础工程与构建） |
| M01-B | 实现路由、生命周期、模式切换和原生页面恢复 | AT02、AT11、AT12、AT19 | PASS（离线），Chrome／Edge 实机 NOT RUN |
| M02-A | 实现顶部栏、左侧导航、正文、右侧目录和响应式布局 | UI-SPEC 初始基线及独立产品的实际渲染 | LOCKED |
| M02-B | 提取问答与专栏内容，清洗并渲染富文本 | AT07、AT09、AT10、AT25 | LOCKED |
| M03-A | 接入原生推荐和热榜 | AT03、AT04 | LOCKED |
| M03-B | 提交关键词并展示搜索结果或空状态 | AT05、AT06，复测知乎原生空结果和搜索降级 | LOCKED |
| M03-C | 构建 DOM-only 阅读队列，支持上一篇、下一篇和回答切换 | AT08、AT20–AT22，覆盖正文缺失、图片失败、网络异常、动态页面重载、登录及访问限制。按 DOM-only 启用路径记录 Feed 用例适用性 | LOCKED |
| M04-A | 实现 GM Storage、收藏、历史与跨域一致性 | AT13–AT15，回归 Chrome 专栏首次删除测试标记后主站仍读到旧值的问题，并复测存储不可用和损坏时的降级 | LOCKED |
| M04-B | 实现字号、行距、宽度、主题、快捷键和关注动态 | AT16–AT18 | LOCKED |
| M05-A | 执行全量回归、视觉、安全与浏览器兼容性测试 | AT01–AT28、UI-SPEC、`docs/ACCEPTANCE.md`，在 Chrome／Edge 回归空搜索、正文缺失、图片失败、网络异常、动态页面重载、登录及访问限制 | LOCKED |
| M05-B | 核验 CI、构建及安装，完成双语文档、许可和变更记录 | `dist/bundle.user.js`、GitHub Release、AT26–AT28 | LOCKED |

## 计划代码路径

| 模块 | 主要路径 |
| --- | --- |
| M00 | `docs/M00-VALIDATION.md`、`docs/design/UI-SPEC.md`、`docs/design/references/`、`src/styles/tokens.css` |
| M01 | `src/core/` 的状态与生命周期，`src/adapters/` 的路由与 DOM，`src/renderer/reader-shell.js` 的验证界面，`src/styles/` 的视觉分层 |
| M02 | `src/renderer/` 的文档、侧栏、目录和工具栏，以及问答、专栏适配器和 `src/styles/` |
| M03 | `src/adapters/` 的热榜、推荐和搜索适配器，以及 `src/navigation/reading-queue.js`、`src/navigation/navigation-manager.js` |
| M04 | `src/storage/`、`src/settings/`、`src/adapters/follow-adapter.js` |
| M05 | `tests/`、`docs/ACCEPTANCE.md`、`.github/workflows/ci.yml`、`dist/bundle.user.js` |

## 验收节点

| 节点 | 放行条件 | 结果 |
| --- | --- | --- |
| Gate 01-T · 技术准入 | 核对锁定上游、MIT、M00-A／B 的证据和负责人授权。 | PASS，允许 M01-A／M01-B |
| Gate 01-V · 视觉准入 | 按初始规范核对独立阅读器的实际渲染、富文本、响应式和交互。 | 待验收，M02–M05 等待负责人授权 |
| Gate 02 · P0 核心功能 | 核对 M01–M03 对应的 PDT 用例，验证 Chrome 和 Edge 安装及阅读流程，覆盖原生恢复和降级。 | V0.1 内测交付 |
| Gate 03 · 正式发布 | P0、P1 与 PDT 全部 28 项验收用例完成复测，记录用例适用性和结果。通过 Chrome 和 Edge 实机、视觉对照、安全回归与 GitHub CI。 | V1.0 GitHub Release |

测试包括单元测试、Playwright 页面测试和 Chrome／Edge 实机端到端测试。验收记录沿用 PDT §14，保留浏览器与脚本版本、登录状态、预期、实际结果和必要证据。真实页面和视觉验证在实机执行。

## 数据链路与存储

热榜、推荐及搜索沿用知乎原生入口。内容适配器提取并标准化已加载内容，去重后交给临时阅读队列。文档渲染器展示可访问正文，用户按队列切换上一篇或下一篇。问答由知乎原生页面加载更多回答，阅读队列通过重新读取 DOM 纳入已渲染的新条目。

| 数据 | 上限 |
| --- | --- |
| 临时阅读队列 | 100 条 |
| 阅读历史 | 500 条 |
| 本地收藏 | 1,000 条 |
| 阅读设置 | 1 份 |

## M00-A 开工清单

1. 锁定 `connectedGraph/zhihu-immersive-reader` 的 `v5.1.6`，核对完整提交 `942e8e5422e1861da3c9315a2552312a94a97552` 和上游 MIT 许可。 [上游固定版本](https://github.com/connectedGraph/zhihu-immersive-reader/tree/942e8e5422e1861da3c9315a2552312a94a97552)
2. 检查 userscript 的 `@match`、`@grant`、`@connect`、`@require` 和主动网络请求，标记 AI、Wiki、Embedding 的入口及 M01 的剥离范围。
3. 查明上游构建入口和 Node.js 要求，审阅构建文件后在隔离目录运行 `node build.js`，记录环境、结果和 `dist/bundle.user.js` 的生成情况。
4. 在 `docs/M00-VALIDATION.md` 登记可复用模块、依赖审计结果、证据和未解决项。审计 DOMPurify 与 Playwright，Lucide 按需评估，Semi Design 仅作为视觉参考。

M00-UI-B 的飞书参考证据按原状态保存，正式飞书截图为 0 / 3。后续视觉验收依据独立阅读器的真实运行表现。M01–M02 采用 Tokens 与布局、排版、组件样式分层；顶部栏、左侧导航、正文与右侧目录分区，适配器与渲染隔离。 [初始视觉规范](design/UI-SPEC.md)

## 分支与提交

| 分支 | 用途 |
| --- | --- |
| `main` | 维护已确认的项目文档与通过验收的版本 |
| `dev` | 按模块开发和积累验证证据 |

每个子任务完成后提交一次，每个主模块完成后执行对应回归。按主模块或里程碑汇总并合并到 `main`。
