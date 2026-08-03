# Geko Keeper mobile app

The production app lives in this folder. It is an Expo + React Native landscape app for Android and iOS.

## Implemented MVP

- Offline SQLite database with migrations and seed data
- Focus sessions with start, elapsed timer, finish, and persisted history
- Solid TimeTag-style tags
- Daily checklist persistence
- Daily and weekly focus summaries
- Account/settings surface reserved for future sign-in and sync

## Run on Android

1. Install Expo Go on your phone, or connect an Android emulator.
2. Run `npm start` in this directory.
3. Scan the QR code, then choose the Android target.

Use `npm run android` to open an attached Android device/emulator directly.

## Architecture

- `src/domain`: stable domain types
- `src/data`: SQLite schema and repository functions
- `src/state`: application state and use cases
- `App.tsx`: landscape UI composition

The current app is offline-first. A future server sync should use the domain/repository boundary rather than directly changing UI components.
