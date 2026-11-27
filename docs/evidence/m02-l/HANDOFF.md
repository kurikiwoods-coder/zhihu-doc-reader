# Zhihu Doc Reader 0.0.3 交接

2026-11-27，PDT V1.3。入口修复提交为 `c26e3aaf8f616da1f291db9019bbceff82ee89bb`。[正式安装文件](../../../dist/bundle.user.js)的 SHA-256 为 `dabe299440412d6591c0a5555775711f985139fd4d034e33a1b9fa362a382693`。

| 证据 | 文件 |
| --- | --- |
| 日常 Chrome 首页对照 | [启停对照记录](../../M02-VALIDATION.md#m02-l-final-实机收尾) · [启用后阅读器截图](chrome-daily-home-reader-0.0.3.jpg)（1905 × 912，标题和摘要已脱敏） |
| 实站旧版遮挡 | [Edge 0.0.2 脱敏截图](edge-0.0.2-launcher-overlap.png) |
| 两端安装与实站访问 | [正式安装核验](0.0.3-installation.json) · [访问限制](0.0.3-live-first-pass.json) |
| Chrome 合成回归 | [报告](webdriver-chrome/report.json) |
| Edge 合成回归 | [报告](webdriver-edge/report.json) |
| 自动检查 | [单元及静态](0.0.3-unit.txt) · [DOM](0.0.3-dom.txt) · [历史探针](0.0.3-probe.txt) |

本地十张合成 PNG 在交接核验中缺少完整图像数据。仓库保留两端数值报告、入口数据和可读的 Edge 实站脱敏截图。

## 个人电脑接手

1. 日常 Chrome 的停用与启用首页对照已完成。启用后的页面读取得到一个阅读入口，预览打开后显示两段文本和一个来源链接。Esc 退出后焦点回到入口，主文档 HTTP 状态未取得。
2. 在独立 Edge 和 Chrome 配置安装上面的 0.0.3，每端只启用一份。
3. Edge 沿用已通过的 0.0.2 实站项目，补测左下角入口、完整阅读器与富文本截图、目录和工具栏、窄窗口及缺正文回退。Chrome 补六类页面及生命周期矩阵。
4. 两端真实页面及视觉证据齐备后再提交 Gate 01-V。研究分支 research/m03-r 保存五份选型文档、复现脚本和原始结果。

[M01 验收](../../M01-VALIDATION.md) · [M02 验收](../../M02-VALIDATION.md) · [路线图](../../ROADMAP.md)


## 2026-11-27 双端补测交接

[实测矩阵与异常结论](../../M02-VALIDATION.md#2026-11-27-双浏览器实站复测)和 [双端 DOM 日志](live-2026-11-27/dom-observations.json)记录已执行用例。当前连接中已验证推荐页入口、出入及焦点与滚动、热榜路由、专栏和窄视口。Edge 专栏用 Enter 成功进入，固定投票栏截获鼠标入口。普通问答两端均复现完整正文被误判折叠，独立修复候选分支为 `fix/m02-visible-question-answers`。

1. 在专用 Chrome 和 Edge 确认可测试配置及各自 Tampermonkey 只启用一份固定产物。记录浏览器、扩展版本、已安装脚本版本和指纹。
2. 用同一问答样本复测候选版。确认跳过确实折叠的首条，读取后续完整回答，保持直达回答身份、原页回退、Esc 和滚动。
3. 在同一配置、同一正常可访问样本上用浏览器 Network 分别记录脚本停用和启用下的主文档、相关请求状态和 Initiator。留存主机、路径类别和发起类型，去除 Cookie、授权头、查询标识和账户信息。历史异常若无法复现，继续记录 `NOT REPRODUCED` 与 `UNKNOWN` 归因。遇到 403 或安全验证时依照网站正常流程暂停该样本。
4. 补有章节标题的专栏和目录跳转、Edge 专栏指针入口、其余待验证路由与生命周期用例。双端实机闭合及阻断解除后再申请 Gate 01-V。
