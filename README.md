# Artistic Genius

Artistic Genius is a local Wails desktop app built on a Go agent kernel and a React frontend.

## Development

```powershell
cd C:\Users\jinhu\Documents\my_agent\artistic-genius\desktop
wails dev
```

The desktop window opens automatically and the frontend hot-reloads.

## Build From Source

```sh
make build
make test
```

For desktop packaging, use the scripts under `scripts/` from the `desktop` module after Wails is installed.

## Configuration

- Project config: `artistic-genius.toml`
- User config: `~/.config/artistic-genius/config.toml` on Linux, `~/Library/Application Support/artistic-genius/config.toml` on macOS, `%AppData%\artistic-genius\config.toml` on Windows
- Project state: `.artistic-genius/`
- Project memory: `ARTISTIC_GENIUS.md`

## Release Status

Website, npm, Homebrew, and automatic update publishing have been removed for the local reset. GitHub release/updater wiring can be added back once the target repository and signing choices are confirmed.
