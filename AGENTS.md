# AGENTS.md — Artistic Genius project guide for coding agents

## Build & test

```sh
make build        # → bin/artistic-genius(.exe) + bin/artistic-genius-plugin-example(.exe)
make vet          # go vet ./...
make test         # go test ./...
make cross        # → dist/ (darwin|linux|windows × amd64|arm64)
make hooks        # install .githooks pre-push (runs go vet)
```

- **Go 1.25.0** (toolchain go1.26.4); module `artistic-genius`.
- `CGO_ENABLED=0` for the CLI; the **desktop** (Wails) is a **separate `artistic-genius/desktop` module** that uses CGO/WebKit and imports `internal/*` without polluting the CLI's zero-CGO guarantee.
- `make e2e-codegraph` fetches the **CodeGraph** binary (`v0.9.7`) and runs the gated MCP end-to-end test; requires `gh`.

## Architecture

Artistic Genius is a **config- and plugin-driven coding agent** — a single Go binary. All models and tools are resolved by name from registries; nothing is hardcoded.

```
cmd/artistic-genius/main.go          → cli.Run()  (entry; blank-imports built-in providers & tools)
cmd/artistic-genius-plugin-example/  → reference MCP stdio plugin
desktop/                      → Wails desktop shell (separate go.mod, imports internal/*)
internal/
  cli/          → subcommand routing, flags, TUI (Bubble Tea), exit codes
  config/       → TOML loading: flag > ./artistic-genius.toml > user config > built-in defaults
  control/      → transport-agnostic Controller: turn lifecycle, approval, plan mode
  agent/        → Session + run loop + compaction + coordinator (two-model)
  provider/     → Provider interface + kind→factory registry; openai/ anthropic/ subpackages
  tool/         → Tool interface + Registry
    builtin/    → bash, read_file, write_file, edit_file, multi_edit, glob, grep, ls, …
  permission/   → per-call Policy: allow/ask/deny rules → Decision
  command/      → slash commands: built-in actions + custom .md from .artistic-genius/commands/
  plugin/       → MCP client (stdio JSON-RPC subprocesses + streamable HTTP + SSE)
  serve/        → HTTP/SSE frontend (control.Controller over HTTP)
  skill/        → skill loading, installation, slash-command integration
  memory/       → auto-memory store (frontmatter + MEMORY.md index)
  history/      → BM25 search over saved session JSONL
  checkpoint/   → snapshot-based edit safety net (rewind)
  codegraph/    → code-intelligence MCP server integration
  sandbox/      → confinement: workspace_root + allow_write; macOS Seatbelt for bash
  hook/         → external notification hooks on tool events
  lsp/          → language-server client for diagnostics
  i18n/         → UI localisation (en/zh)
  …             → billing, bot, event, diff, evidence, fileref, fileutil, frontmatter, …
```

**Dependency direction (acyclic):** `cli → {agent, plugin, config} → {tool, provider}`.
Built-in subpackages (`provider/openai`, `tool/builtin`) import their parent to **self-register via `init()`**; parents never import children.

### Key design invariants

1. **One Controller, many frontends.** `control.Controller` drives every frontend (TUI, HTTP/SSE serve, Wails desktop). Add behaviour to the controller, not a frontend — all three inherit it.
2. **Cache-first.** The system-prompt prefix (base prompt + tools + memory) must stay byte-stable across turns so DeepSeek's automatic prefix cache stays warm. Never mutate it mid-session. Compaction is the only deliberate cache-reset point.
3. **Config-driven models.** DeepSeek and MiMo are **not code** — they are config instances of `kind = "openai"`, differing only in `base_url`/`model`/`api_key_env`.
4. **Two extension tiers.** Compile-time built-ins (`init()` self-registration) and runtime MCP plugins (stdio/HTTP subprocesses).
5. **Interface-first.** `Provider`, `Tool`, `Asker`, `Renderer`, `Approver` are all interfaces.

### Core abstractions

- **`provider.Provider`** — `Stream(ctx, Request) (<-chan Chunk, error)`. Factory registered by `kind`.
- **`tool.Tool`** — `Name() / Description() / Schema() / Execute(ctx, args) (string, error) / ReadOnly()`. Optional `Previewer` for file-change preview before execution.
- **`control.Controller`** — session driver: `Send/Cancel/Approve/SetPlanMode/Compact/NewSession` → emits typed `event.*` to an `event.Sink`.
- **`agent.Agent`** — run loop: build Request → provider.Stream → collect tool calls → execute → repeat. Two-model mode uses `Coordinator` (separate sessions for planner & executor).
- **`permission.Policy`** — static `allow/ask/deny` rules; `Approver` interface for interactive prompts.

### Two-model collaboration (Coordinator)

When `agent.planner_model` is set, a `Coordinator` runs two models in **separate sessions**:
- **Planner** (low-frequency): read-only research tools, produces a plan.
- **Executor**: full tool set, carries out the plan.
Sessions never mix — both grow prepend-only, keeping prefix caches warm.

### Compaction

When prompt tokens reach `compact_ratio` (default 0.8) of `context_window`, the executor compacts once before the next turn: user turns + prior digests stay verbatim; assistant/tool work is summarized. Originals archived to `<user-config>/artistic-genius/archive/<timestamp>.jsonl`.

## Configuration

- **Resolution:** flag > `./artistic-genius.toml` > user config (`~/.config/artistic-genius/config.toml` on Linux, `~/Library/Application Support/artistic-genius/` on macOS, `%AppData%\artistic-genius\` on Windows) > built-in defaults.
- **Secrets:** `api_key_env` references environment variables; never in config files. `.env` loaded if present.
- **MCP servers:** also loadable from project `.mcp.json` (Claude Code schema); on name clash `artistic-genius.toml` wins.
- Reference: `artistic-genius.example.toml` (commented, exhaustive).

## Code conventions

- **Go kernel under `internal/`.** Each package owns one concern and documents it in a package comment. Match surrounding comment density and idiom.
- **`gofmt` + `go vet`** must be clean. Package names lowercase. Exported identifiers documented. Comments explain *why*, not *what*.
- **No premature generalization.** Prefer clear and direct.
- **Errors:** library code wraps with `fmt.Errorf("...: %w", err)` and returns; only `cli`/`main` decide exit codes. Tool execution errors are fed back to the model, not fatal.
- **Language:** English for all code, comments, tool descriptions, system prompts. README is bilingual (EN + zh-CN).

## Project files

| File | Role |
|------|------|
| `ARTISTIC_GENIUS.md` | Project memory loaded into every session's system prompt prefix — keep concise & cache-stable |
| `ARTISTIC_GENIUS.local.md` | Personal memory (git-ignored), same format |
| `AGENTS.md` | This file — human+agent project guide (fallback when ARTISTIC_GENIUS.md missing) |
| `artistic-genius.toml` | Project config (shared); often git-ignored for secrets |
| `artistic-genius.example.toml` | Annotated reference config |
| `.artistic-genius/commands/*.md` | Custom slash commands (project scope) |
| `.artistic-genius/skills/` | Project-scoped skills |
| `.artistic-genius/output-styles/` | Custom output style/tone templates |
| `.mcp.json` | MCP servers in Claude Code format |
| `docs/SPEC.md` | Engineering contract — the authoritative spec |
| `docs/GUIDE.md` | User guide |

## Desktop app

- **Separate module:** `desktop/go.mod` (module `artistic-genius/desktop`), uses Wails v2 + CGO.
- Frontend at `desktop/frontend/`; built via `pnpm build`, embedded via `//go:embed`.
- Imports the same `internal/*` kernel as the CLI; binds `control.Controller` directly (no HTTP hop).
- Version injected via `-ldflags "-X main.version=..."`; auto-updater uses a published manifest.

## Slash commands

- **Built-in:** `/compact`, `/new`, `/clear`, `/effort`, `/mcp`, `/help`, `/rewind`, `/resume`, `/memory`, `/review`, `/goal`.
- **Custom:** `.artistic-genius/commands/*.md` (project) and `<user-config>/artistic-genius/commands/` (user). Project wins on name clash. MCP prompts also surface as `/mcp__<server>__<prompt>`.
- Format: optional YAML-free frontmatter (`description`, `argument-hint`), body with `$ARGUMENTS`, `$1`…`$N`, `$$`.

## Built-in tools

Files: `read_file`, `write_file`, `edit_file`, `multi_edit`, `move_file`, `delete_range`, `delete_symbol`, `notebook_edit`
Shell: `bash` (with `run_in_background`, `bash_output`, `wait`, `kill_shell`)
Search: `glob`, `grep`, `ls`
Web: `web_fetch`
Tasks: `todo_write`, `complete_step`, `task` (sub-agent spawn)
Memory: `remember`, `forget`, `memory`
History: `history`
Skills: `run_skill`, `read_skill`, `install_skill`, `install_source`
Interaction: `ask`
Code: `lsp_diagnostics`, `lsp_definition`, `lsp_hover`, `lsp_references`
CodeGraph MCP tools: `mcp__codegraph__*` (context, search, callers, callees, trace, impact, explore, node, files, status)
