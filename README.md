# Geko Keeper

Geko Keeper is now **Web-first**. The production frontend lives in `web/` and preserves the approved Preview landscape design while using React, TypeScript, and IndexedDB for offline-first focus sessions and checklists.

## Run locally

```powershell
cd web
npm.cmd run dev
```

Open the localhost link printed by Vite. The app works on desktop and mobile browsers. Browser data is stored locally in IndexedDB.

## Build for a server

```powershell
cd web
npm.cmd run build
```

Upload the contents of `web/dist/` to a static web server. The future login and sync API can be added without replacing the client data model.

## Projects

- `web/` — current React web application
- `preview/` — original design reference
- `app/` — retained Expo prototype; no longer the primary delivery path
