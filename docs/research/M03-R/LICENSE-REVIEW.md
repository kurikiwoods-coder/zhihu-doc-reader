# M03-R 许可证审核

产品基线 `50599c0ff57922839d3d6c16c051067f8af05775`，研究快照 `5e3f123b681d2abac597b429542bef180b93f5d8`。已核对以下固定提交中的许可证原文。现有 userscript 在构建时携带上游 MIT 许可证，项目锁文件没有运行时依赖。批准新增正式运行时依赖 **0 项**。 [项目许可证](../../../LICENSE) · [构建脚本](../../../build.js) · [锁文件](../../../package-lock.json)

| 候选 | 固定快照与许可证证据 | 采用条件 |
| --- | --- | --- |
| connectedGraph/zhihu-immersive-reader | `0b43ea6` 研究快照及 `942e8e5` 产品锁定版均为 MIT。 [研究快照](https://github.com/connectedGraph/zhihu-immersive-reader/blob/0b43ea676beacc93f1c12ec1f025f9fb1da05611/LICENSE) · [产品锁定版](https://github.com/connectedGraph/zhihu-immersive-reader/blob/942e8e5422e1861da3c9315a2552312a94a97552/LICENSE) | **PARTIAL**。只复用经审计的纯 DOM 选择器及必要字段。记录实际来源提交与路径，随分发物保留 MIT 版权和许可声明。新增片段的具体来源和权限边界到实施阶段核实。 |
| XIU2/UserScript | `8ef9d3e`，GPL-3.0。 [LICENSE](https://github.com/XIU2/UserScript/blob/8ef9d3eb59974a9341ebf1b76a5f655ad266ec23/LICENSE) | **REJECT**。整包引入超出本次批准的许可证及运行权限范围。仅将公开行为转化为独立回归描述。 |
| mozilla/readability | `ab4027a`，Apache-2.0，附 NOTICE。 [LICENSE](https://github.com/mozilla/readability/blob/ab4027a8b37669745016869a37a504727992b2ba/LICENSE.md) · [NOTICE](https://github.com/mozilla/readability/blob/ab4027a8b37669745016869a37a504727992b2ba/NOTICE) | **REJECT**。替换正文提取会破坏目标回答及可访问正文的边界。许可证仅用于隔离实验的来源追溯。 |
| kepano/defuddle | `aabdc31`，MIT。 [LICENSE](https://github.com/kepano/defuddle/blob/aabdc3156a69a45a14fce20b9e4d6c6f571dfb0d/LICENSE) | **DEFER**。固定快照的运行依赖闭包及其许可证为 UNVERIFIED。保留图片结构相关回归候选。 |
| cure53/DOMPurify | `ae76059`，Apache-2.0 或 MPL-2.0。 [Apache-2.0](https://github.com/cure53/DOMPurify/blob/ae76059e4c91285e297567b898d73a0e246498d8/LICENSE) · [MPL-2.0](https://github.com/cure53/DOMPurify/blob/ae76059e4c91285e297567b898d73a0e246498d8/LICENSE-MPL) | **DEFER**。若未来出现经批准的 HTML 字符串入口，再锁定具体构建和许可证选项。若选 Apache-2.0，在分发时保留适用的版权、许可与通知，并记录修改。 |
| iamzay/obsidian-zhihu-reader | `bec98ff`，MIT。 [LICENSE](https://github.com/iamzay/obsidian-zhihu-reader/blob/bec98ff3f69e5295e95e8cd701524cafe46f36e0/LICENSE) | **REIMPLEMENT**。依据会话代数与逐字段恢复行为独立实现。将设计出处保留在工程记录。 |
| rNeomy/reader-view | `321687a`，MPL-2.0。 [LICENSE](https://github.com/rNeomy/reader-view/blob/321687ac321942b16a25ba1ee1654b90f893190f/LICENSE) | **REJECT**。扩展权限、后台流程与数据存放方式超出当前架构。下一页不可用与退出清理仅登记为行为级回归。 |

隔离基准通过本地路径读取固定候选源码。归档包含复现脚本和结果 JSON。现有 LinkeDOM 0.18.12 为以 ISC 许可证分发的离线测试夹具，来源提交和校验值在锁文件中。npm 或扩展商店发布包与研究快照的对应关系仍为 UNVERIFIED。 [复现脚本](benchmark.cjs) · [原始结果](benchmark.json) · [测试夹具锁](../../../tests/browser-fixture.lock.json) · [资源清单](RESOURCE-INVENTORY.md)
