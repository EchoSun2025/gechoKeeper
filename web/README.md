# Geko Keeper web

React + TypeScript + Vite implementation of the Geko Keeper Preview.

## Commands

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run preview
```

`npm.cmd run build` produces `dist/`, which can be deployed as static files. Focus sessions, tags and checklist state are persisted locally with IndexedDB. A future server login/sync layer can consume the same entity structure.
