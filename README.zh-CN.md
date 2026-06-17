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

GitHub Releases 是 `Li-Charles-One/artistic-genius` 的桌面更新源。

- 稳定桌面版本使用 `desktop-vX.Y.Z` tag。
- updater 从 `desktop-latest` release 指针读取 `latest.json`。
- Canary 构建使用 `desktop-canary` release 指针。
- 官网、npm、Homebrew、R2、崩溃上报发布链路仍保持删除。
