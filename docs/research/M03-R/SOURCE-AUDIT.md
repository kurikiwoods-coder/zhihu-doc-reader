# M03-R 源码审计

## 当前产品

- 路由识别区分列表与专栏／问答，并以问题和回答的路径 ID 约束正文来源。渲染只消费已可见、未裁切的正文。结构化节点只保留指定标签和必要属性，图片仅使用原生已加载图片，目录基于实际渲染标题。[路由](../../../src/adapters/route.js) · [页面与正文](../../../src/adapters/dom.js) · [富文本边界](../../../src/adapters/rich-content.js) · [目录](../../../src/renderer/rich-content.js)
- 路由与销毁复用已有浏览器事件、观察器和挂载状态。观察器目前覆盖文档子树，列表持续更新的成本需要真实数据验证。正式构建以内置 Node 模块拼装单文件，CI 记录固定测试依赖、构建与浏览器结果。[生命周期](../../../src/core/lifecycle.js) · [CI](../../../.github/workflows/ci.yml)

## 候选实现与边界

| 资源 | 核对到的实现与历史 | 决策约束 |
| --- | --- | --- |
| connectedGraph 5.1.6 | 推荐页已有 DOM 收集、条目键、分组及待阅读操作。主流程混合推荐 API，设置模块有 GM 值监听和本地存储兼容路径。有本项目早期固定版本及构建记录。 | 局部复用已审计的纯 DOM 选择器和记录字段，保留 MIT 声明。分组、队列、问题切换独立实现。整包、网络层、存储双写排除。[推荐](https://github.com/connectedGraph/zhihu-immersive-reader/blob/0b43ea676beacc93f1c12ec1f025f9fb1da05611/src/page-home.js) · [问答](https://github.com/connectedGraph/zhihu-immersive-reader/blob/0b43ea676beacc93f1c12ec1f025f9fb1da05611/src/page-question.js) · [设置](https://github.com/connectedGraph/zhihu-immersive-reader/blob/0b43ea676beacc93f1c12ec1f025f9fb1da05611/src/state.js) |
| XIU2 2.3.32 | 按功能设置多个观察器，并为 URL 切换提供兼容实现。增强版带网络 grant，GPL-3.0 覆盖整包。 | 直接复用否决。观察器回归用例可独立描述为路由切换、增量节点与重复初始化，现有生命周期已经覆盖基本信号。[实现](https://github.com/XIU2/UserScript/blob/8ef9d3eb59974a9341ebf1b76a5f655ad266ec23/Zhihu-Enhanced.user.js) · [许可证](https://github.com/XIU2/UserScript/blob/8ef9d3eb59974a9341ebf1b76a5f655ad266ec23/LICENSE) |
| Mozilla Readability 0.6.0 | 全页候选内容评分、清理和懒加载图片处理。变更记录涵盖图片列表丢失与懒加载属性识别。实验发现通用评分会选择更长的另一个回答，也会返回折叠或受限夹具文本。 | 通用替换否决。仅保留测试思路。抽取结果受现有页面访问与完整性门控约束。[源码](https://github.com/mozilla/readability/blob/ab4027a8b37669745016869a37a504727992b2ba/Readability.js) · [变更](https://github.com/mozilla/readability/blob/ab4027a8b37669745016869a37a504727992b2ba/CHANGELOG.md) |
| Defuddle 0.19.13 | 同步提取可重试隐藏节点和列表并使用结构化数据，异步路径可引入站点提取器。变更记录包含克隆页处理、图组丢失、输出边界修复和安全通告。 | 图片测试思路可独立复现。版本的纯本地入口、依赖闭包及真实效果为 UNVERIFIED，默认集成暂缓。[源码](https://github.com/kepano/defuddle/blob/aabdc3156a69a45a14fce20b9e4d6c6f571dfb0d/src/defuddle.ts) · [变更](https://github.com/kepano/defuddle/blob/aabdc3156a69a45a14fce20b9e4d6c6f571dfb0d/CHANGELOG.md) · [图片回归](https://github.com/kepano/defuddle/blob/aabdc3156a69a45a14fce20b9e4d6c6f571dfb0d/tests/ad-selectors.test.ts) |
| DOMPurify 3.5.0 | 标签和属性策略、命名空间和可信类型配置。仓库有浏览器、fuzz、DOM 实现兼容测试。实测默认规则保留表单，指定白名单会过滤表单和表格。 | M02 的节点模型已满足现边界。未来若有明确 HTML 字符串入口，评估固定 Apache-2.0 构建及安全维护，单独限定配置和引入成本。[实现](https://github.com/cure53/DOMPurify/blob/ae76059e4c91285e297567b898d73a0e246498d8/src/purify.ts) · [测试配置](https://github.com/cure53/DOMPurify/blob/ae76059e4c91285e297567b898d73a0e246498d8/package.json) · [安全政策](https://github.com/cure53/DOMPurify/blob/ae76059e4c91285e297567b898d73a0e246498d8/SECURITY.md) |
| Obsidian 0.1.7 | 会话代数防止旧加载结果改写当前状态。设置读取可逐字段恢复。宿主与网关、登录和媒体下载耦合。 | 只采用代数和字段恢复策略，独立实现。宿主、网关及身份相关代码整体排除。[会话](https://github.com/iamzay/obsidian-zhihu-reader/blob/bec98ff3f69e5295e95e8cd701524cafe46f36e0/src/reader/ReaderSession.ts) · [存储](https://github.com/iamzay/obsidian-zhihu-reader/blob/bec98ff3f69e5295e95e8cd701524cafe46f36e0/src/settings/PluginDataRepository.ts) · [设置测试](https://github.com/iamzay/obsidian-zhihu-reader/blob/bec98ff3f69e5295e95e8cd701524cafe46f36e0/tests/plugin-data-repository.test.ts) |
| Reader View 0.9.0 | MV3 权限和自动导览由扩展运行时管理，IndexedDB 暂存正文并清理。 | 运行架构与产品边界冲突。独立记录下一页不可用状态、退出和清理的测试要求。[清单](https://github.com/rNeomy/reader-view/blob/321687ac321942b16a25ba1ee1654b90f893190f/v3/manifest.json) · [导览](https://github.com/rNeomy/reader-view/blob/321687ac321942b16a25ba1ee1654b90f893190f/v3/navigate.js) · [存储](https://github.com/rNeomy/reader-view/blob/321687ac321942b16a25ba1ee1654b90f893190f/v3/storage.js) |

本次审计覆盖表列路径，完整上游安全审计与线上兼容性为 UNVERIFIED。有关历史安全问题只记录已公开的维护证据链接。
