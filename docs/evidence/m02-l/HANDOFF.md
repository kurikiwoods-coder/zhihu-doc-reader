# Zhihu Doc Reader 0.0.3 交接

2026-11-27，PDT V1.3。入口修复提交为 `c26e3aaf8f616da1f291db9019bbceff82ee89bb`。[正式安装文件](../../../dist/bundle.user.js)的 SHA-256 为 `dabe299440412d6591c0a5555775711f985139fd4d034e33a1b9fa362a382693`。

| 证据 | 文件 |
| --- | --- |
| 实站旧版遮挡 | [Edge 0.0.2 脱敏截图](edge-0.0.2-launcher-overlap.png) |
| 两端安装与实站访问 | [正式安装核验](0.0.3-installation.json) · [访问限制](0.0.3-live-first-pass.json) |
| Chrome 合成回归 | [报告](webdriver-chrome/report.json) |
| Edge 合成回归 | [报告](webdriver-edge/report.json) |
| 自动检查 | [单元及静态](0.0.3-unit.txt) · [DOM](0.0.3-dom.txt) · [历史探针](0.0.3-probe.txt) |

本地十张合成 PNG 在交接核验中缺少完整图像数据。仓库保留两端数值报告、入口数据和可读的 Edge 实站脱敏截图。

## 个人电脑接手

1. 在平时使用的浏览器停用知乎阅读脚本，原生访问一次，记录页面类型、主文档 HTTP 状态和提示。遇到登录或安全验证时遵循知乎正常流程。
2. 在独立 Edge 和 Chrome 配置安装上面的 0.0.3，每端只启用一份。
3. Edge 沿用已通过的 0.0.2 实站项目，补测左下角入口、完整阅读器与富文本截图、目录和工具栏、窄窗口及缺正文回退。Chrome 补六类页面及生命周期矩阵。
4. 两端真实页面及视觉证据齐备后再提交 Gate 01-V。研究分支 research/m03-r 保存五份选型文档、复现脚本和原始结果。

[M01 验收](../../M01-VALIDATION.md) · [M02 验收](../../M02-VALIDATION.md) · [路线图](../../ROADMAP.md)
