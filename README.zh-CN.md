# Artistic Genius

Artistic Genius 是一个本地 Wails 桌面应用，底层是 Go agent 内核，前端是 React。

## 开发预览

```powershell
cd C:\Users\jinhu\Documents\my_agent\artistic-genius\desktop
wails dev
```

桌面窗口会自动打开，前端支持热重载。

## 源码构建

```sh
make build
make test
```

桌面打包可在安装 Wails 后使用 `scripts/` 下的脚本，从 `desktop` module 构建。

## 配置与状态

- 项目配置：`artistic-genius.toml`
- 用户配置：Linux 为 `~/.config/artistic-genius/config.toml`，macOS 为 `~/Library/Application Support/artistic-genius/config.toml`，Windows 为 `%AppData%\artistic-genius\config.toml`
- 项目状态：`.artistic-genius/`
- 项目记忆：`ARTISTIC_GENIUS.md`

## 发布状态

官网、npm、Homebrew、自动更新发布链路已经在本地重置中移除。等确认你的目标 GitHub 仓库和签名方案后，再接第二层 release/updater。
