# 上游版本锁定

| 字段 | 记录 |
| --- | --- |
| 项目基线 | [PDT V1.2](PDT-V1.2.md)，Git blob `4ad69187638ae507a5143199eee71b5cac31f4f7` |
| 上游版本 | `connectedGraph/zhihu-immersive-reader` · `refs/tags/v5.1.6`（轻量标签） [仓库](https://github.com/connectedGraph/zhihu-immersive-reader) · [标签定义](https://api.github.com/repos/connectedGraph/zhihu-immersive-reader/git/ref/tags/v5.1.6) |
| 固定提交 | `942e8e5422e1861da3c9315a2552312a94a97552`，提交标题 `release v5.1.6`，GitHub 标记未签名 [源码](https://github.com/connectedGraph/zhihu-immersive-reader/tree/942e8e5422e1861da3c9315a2552312a94a97552) |
| 源码树 | `f1a4cd4fc6d9b422fe163793e1419453528fcef8`。35 个 Git blob 按对象 ID 与字节数逐一验算，重算整树一致。 |
| GitHub 发布文件 | 固定提交中的 `dist/bundle.user.js`，Git blob `ec2ace951e88189e638520f22adca14dfcee7aa0`，`@version 5.1.6` [仓内打包文件](https://github.com/connectedGraph/zhihu-immersive-reader/blob/942e8e5422e1861da3c9315a2552312a94a97552/dist/bundle.user.js) |
| GitHub Release | 上游 Release-by-tag 查询返回 404。已核对公开 Release 列表。v5.1.6 的 GitHub 打包文件跟随标签提交。 [上游 Release 列表](https://github.com/connectedGraph/zhihu-immersive-reader/releases) |
| Greasy Fork 发行 | 脚本 `573678`，固定修订 `1897786`，页面版本 `5.1.6`，上游发布日 2026-08-09 [版本页面](https://greasyfork.org/zh-CN/scripts/573678-%E6%B2%89%E6%B5%B8%E5%BC%8F%E7%9F%A5%E4%B9%8E_%E8%AE%A9%E7%9F%A5%E4%B9%8E%E6%88%90%E4%B8%BA%E4%BD%A0%E6%B7%B1%E5%BA%A6%E9%98%85%E8%AF%BB-%E5%A4%96%E8%AF%AD%E5%AD%A6%E4%B9%A0-%E8%AE%A4%E7%9F%A5%E6%8F%90%E5%8D%87%E7%9A%84%E5%B7%A5%E5%85%B7?version=1897786) · [固定发行源码](https://update.greasyfork.org/scripts/573678/1897786/%E6%B2%89%E6%B5%B8%E5%BC%8F%E7%9F%A5%E4%B9%8E_%E8%AE%A9%E7%9F%A5%E4%B9%8E%E6%88%90%E4%B8%BA%E4%BD%A0%E6%B7%B1%E5%BA%A6%E9%98%85%E8%AF%BB%E3%80%81%E5%A4%96%E8%AF%AD%E5%AD%A6%E4%B9%A0%E3%80%81%E8%AE%A4%E7%9F%A5%E6%8F%90%E5%8D%87%E7%9A%84%E5%B7%A5%E5%85%B7.user.js) |
| 许可证 | MIT，`Copyright (c) 2026 connectedGraph`。后续复用时保留原始许可证与版权声明。 [LICENSE](https://github.com/connectedGraph/zhihu-immersive-reader/blob/942e8e5422e1861da3c9315a2552312a94a97552/LICENSE) |
| 获取日期 | 2026-11-26（UTC+08:00）。GitHub 源码与产物经固定 SHA 的文件接口获取，Greasy Fork 经固定修订的源码视图获取。 |
| 构建环境 | Linux x86-64（内核 6.18.57）、Node.js `v24.22.3`。独立网络命名空间、空白进程环境、Node.js 权限限制，文件写入限于一次性构建目录。 |
| 构建入口与输出 | `node build.js` → `dist/bundle.user.js`。仅使用 Node.js 内置 `fs`、`path`。 [构建源码](https://github.com/connectedGraph/zhihu-immersive-reader/blob/942e8e5422e1861da3c9315a2552312a94a97552/build.js#L5-L80) |

## 指纹

| 样本 | 字节 | SHA-256 |
| --- | ---: | --- |
| GitHub 标签内发行文件 | 710,209 | `cfa0f17db5cb14d035f23916101e521291cd831d60837acd629a67fded46e659` |
| 原始源码直构，两次结果一致 | 713,642 | `043c168d7a6a57b18b9b922e12c5f83673b9479c8cf39299a6a0d702548b936d` |
| 仅把隔离副本的 `src/wiki.js` 换行统一为 LF 后构建 | 710,209 | `cfa0f17db5cb14d035f23916101e521291cd831d60837acd629a67fded46e659` |
| Greasy Fork 固定修订源码响应，浏览器文本按 UTF-8 编码 | 709,586 | `9b3b0dd1f030db7a85eb568a6b9e27fbaeb81d4b0ac83f10c1f7bcab922a1acf` |
| 两个发行渠道的 userscript 正文，位于 Metadata 结束行之后 | 708,439 | `2aaf295cb745dd2a896d267d0558bdd95617902ceffdbc64c43e53cbe9e27026` |
| 上游许可证 | 1,071 | `458c297eead3ed25ccfd512b93790c90a710956eb33a2c6ccd881266a7a68fcf` |

原始输出与 GitHub 标签产物相差 3,433 字节，全部来自 `src/wiki.js` 的 CRLF。LF 对照输出通过逐字节比较。两个发行渠道的脚本正文和其余 Metadata 一致。Greasy Fork 固定修订把 GitHub 文件的更新与下载链接改为单条 `@downloadURL none`。在标签文件上复现这项 Metadata 变换后，得到与发行源码视图一致的 UTF-8 指纹。

GitHub 标签内的原始打包文件是本次锁定基线。构建实测和安装风险见 [M00 验证记录](M00-VALIDATION.md)。
