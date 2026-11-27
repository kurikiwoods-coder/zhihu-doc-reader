# M03-R 开源资源清单

2026-11-27，产品基线 `c26e3aaf8f616da1f291db9019bbceff82ee89bb`，userscript 0.0.3。提交 SHA 固定研究内容。版本取各源码元数据，npm 和商店发布的对应关系为 UNVERIFIED。

| 资源 | 版本 | 许可证 | 首筛范围 |
| --- | --- | --- | --- |
| connectedGraph/zhihu-immersive-reader | 5.1.6（本次快照） | MIT | DOM 卡片、连续阅读、设置同步。[固定源码](https://github.com/connectedGraph/zhihu-immersive-reader/blob/0b43ea676beacc93f1c12ec1f025f9fb1da05611/src/page-home.js) |
| XIU2/UserScript | Zhihu-Enhanced 2.3.32 | GPL-3.0 | 路由和观察器。[固定源码](https://github.com/XIU2/UserScript/blob/8ef9d3eb59974a9341ebf1b76a5f655ad266ec23/Zhihu-Enhanced.user.js) |
| mozilla/readability | 0.6.0（源码声明） | Apache-2.0 | 通用文章抽取。[固定源码](https://github.com/mozilla/readability/blob/ab4027a8b37669745016869a37a504727992b2ba/Readability.js) |
| kepano/defuddle | 0.19.13（源码声明） | MIT | 文章清理、图片与回归。[固定源码](https://github.com/kepano/defuddle/blob/aabdc3156a69a45a14fce20b9e4d6c6f571dfb0d/src/defuddle.ts) |
| cure53/DOMPurify | 3.5.0（源码和构建声明） | Apache-2.0 或 MPL-2.0 | HTML 白名单。[固定源码](https://github.com/cure53/DOMPurify/blob/ae76059e4c91285e297567b898d73a0e246498d8/src/purify.ts) |
| iamzay/obsidian-zhihu-reader | 0.1.7 | MIT | 连续阅读状态和恢复。[固定源码](https://github.com/iamzay/obsidian-zhihu-reader/blob/bec98ff3f69e5295e95e8cd701524cafe46f36e0/src/reader/ReaderSession.ts) |
| rNeomy/reader-view | MV3 0.9.0 | MPL-2.0 | 阅读界面与导览。[固定源码](https://github.com/rNeomy/reader-view/blob/321687ac321942b16a25ba1ee1654b90f893190f/v3/manifest.json) |

项目原有上游锁定仍使用 `942e8e5422e1861da3c9315a2552312a94a97552`。本次快照的 SHA 单独记录，以便追踪差异。[项目上游版本锁](../../UPSTREAM-LOCK.md)

Tampermonkey 官方文档补充核对 GM 值存储和远端变更监听。Greasy Fork `573678` 固定修订 `1897786` 沿用既有核验，商店内其他独立候选未进入实验。[Tampermonkey 文档](https://www.tampermonkey.net/documentation.php#api:GM_addValueChangeListener) · [既有发行核验](../../UPSTREAM-LOCK.md)
