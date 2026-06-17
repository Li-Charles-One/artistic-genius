# Artistic Genius Desktop

Native Wails desktop shell around the Artistic Genius Go kernel.

## Develop

```sh
cd desktop
wails dev
```

Frontend-only iteration:

```sh
cd desktop/frontend
pnpm install
pnpm dev
```

When native bindings are absent, `src/lib/bridge.ts` uses the browser dev mock.

## Build

```sh
cd desktop
wails build
```

Linux distributions that only ship WebKitGTK 4.1 need:

```sh
wails build -tags webkit2_41
wails dev -tags webkit2_41
```

## Release Status

Automatic update publishing is intentionally disabled during the local product reset. Re-enable it after choosing the target GitHub repository, signing keys, and update channel.

## Files

- `main.go`: Wails options, window setup, embedded frontend.
- `app.go`: bound command surface and event sink.
- `wire.go`: event-to-JSON wire contract.
- `frontend/src/lib/bridge.ts`: Wails bridge plus browser dev mock.
- `frontend/src/`: React UI.
