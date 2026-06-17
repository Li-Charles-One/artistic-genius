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

Automatic updates read signed GitHub Release artifacts from `Li-Charles-One/artistic-genius`.

- Tag `desktop-vX.Y.Z` to publish a stable desktop release.
- The `desktop-latest` release stores the stable `latest.json` updater pointer.
- The `desktop-canary` release stores the canary artifacts and manifest.
- Configure `MINISIGN_PRIVATE_KEY` and `MINISIGN_PASSWORD` repository secrets before publishing updater-safe builds.

## Files

- `main.go`: Wails options, window setup, embedded frontend.
- `app.go`: bound command surface and event sink.
- `wire.go`: event-to-JSON wire contract.
- `frontend/src/lib/bridge.ts`: Wails bridge plus browser dev mock.
- `frontend/src/`: React UI.
