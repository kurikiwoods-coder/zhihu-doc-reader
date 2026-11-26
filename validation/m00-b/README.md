# M00-B 隔离验证

适用于 [PDT v1.2 的六个样本](../../docs/PDT-V1.2.md#13-实机测试环境)。本目录的验证脚本版本为 `0.0.1`，文件 SHA-256 为 `fa8a9ebce57943716d1b555bf05dcf8e617d1dbc63a8b9a86f37593ec9a74b4e`。结果与当前缺口见 [M00-B 执行记录](../../docs/M00-VALIDATION.md#m00-b-真实页面与数据源验证)。

## 负责人实机取证

1. 在个人电脑为 Chrome Stable 和 Edge Stable 分别建立临时测试配置文件，保持浏览器同步关闭。记录 OS、浏览器完整版本、Tampermonkey 版本和用户脚本权限。使用官方扩展，按适用浏览器的官方指引启用用户脚本权限。 [官方权限说明](https://www.tampermonkey.net/faq.php?q=Q209)
2. 将 [dom-probe.user.js](dom-probe.user.js) 原始文本粘贴到 Tampermonkey 新脚本并保存。此轮只加载这份验证脚本。其权限限于固定 GM 测试标记，自动检查更新已关闭。 [更新指令说明](https://www.tampermonkey.net/documentation.php?q=update_url)
3. 在每个配置文件内逐一打开六条 PDT 原生 URL。记录登录状态、最终路由类型、是否显示登录或限制、可见条目数、类型、是否有原文链接、正文和图片。登录时只用个人授权的测试会话。遇到安全验证、付费或权限限制时停止该条。若样本失效，登记真实可访问的同类替代 URL 和更换理由。
4. 在能读到多条已加载回答的页面核对上一条／下一条和原文链接。尝试一次知乎原生的继续加载，再点击「读取当前 DOM」确认新条目是否进入队列。切换原生路由后重读，关闭面板并核对原生界面及滚动位置。刷新页面后重复检查是否只挂载一个面板。
5. 在同一 Chrome 配置文件打开仍停留在 `www.zhihu.com` 的受支持页面和可访问专栏。在主站点「写测试标记」，到专栏点「读测试标记」，再清除标记并在主站读回。用同样顺序在 Edge 单独验证。取证后停用验证脚本，并退出测试配置文件。

只回填状态、数字和公开样本地址。避免记录账号标识、验证码、Cookie、凭证、表单或工作资料。实机失效及未执行项目使用 `BLOCKED` 或 `NOT RUN`。

| 浏览器完整版本、OS、扩展版本 | 配置文件和权限 | PDT URL／登录状态 | DOM 与恢复结果 | GM 跨域结果 | 测试日期及状态 |
| --- | --- | --- | --- | --- | --- |
| 待回填 | 待回填 | 待回填 | 待回填 | 待回填 | NOT RUN |

## 离线复现

[合成 HTML](fixtures/native-shapes.html) 使用虚构内容和 ID。测试脚本运行于 Node.js，LinkeDOM 仅供解析样本，GM API 由替身提供，图片加载及可见性为合成状态。原生观察结果与离线结果分别记录。

下载固定提交的 [LinkeDOM v0.18.12 worker.js](https://github.com/WebReflection/linkedom/blob/dfc2fa88969b2d63014e3f6afd49a4e4449996e5/worker.js) 原始文件，在仓库之外保存为 `linkedom-worker.mjs`。测试会验证其 SHA-256，扩展和验证脚本运行时均无需该文件。

```bash
node --check validation/m00-b/dom-probe.user.js
node validation/m00-b/offline.test.mjs /absolute/path/to/linkedom-worker.mjs
```

本轮以 Node.js `v24.22.3` 在独立网络命名空间执行，20 项均通过。
