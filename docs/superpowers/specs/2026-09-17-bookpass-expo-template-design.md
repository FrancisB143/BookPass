# BookPass — Expo Go Template Design

**Date:** 2026-09-17
**Status:** Implemented

## Purpose

Establish the foundation of BookPass, a library book-borrowing app for students.
Students browse a catalogue, borrow a book, and carry a digital pass for pickup
and return. This document covers the first version: a walking skeleton where
every screen exists and is navigable against mock data, but no feature is
finished.

The template must run in **Expo Go** with no development build. Every dependency
chosen works there.

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Language | TypeScript | Default for new Expo apps; catches wrong-shaped `Book`/`Loan` objects at edit time rather than as a red screen on device. |
| Navigation | Expo Router | File-based routing is what `create-expo-app` scaffolds, so Expo's docs match the code. Deep links come free. |
| Styling | `StyleSheet` + theme tokens | No extra dependencies, nothing to break on an SDK upgrade. |
| Data | Local mock data behind a service layer | App runs immediately with no accounts, keys, or network to debug. |
| Scope | Walking skeleton | Every screen navigable; no camera, QR, or persistence yet. |

### Scaffold method

`create-expo-app` **fails on this machine**: it shells out to
`npm pack --dry-run --json` and parses stdout as JSON, but npm 12.0.2 writes
`npm notice` lines to stdout, so the parse throws and nothing is written.

The template was therefore installed the way the CLI would have done it:
`npm pack expo-template-default@latest`, extract, rename `gitignore` →
`.gitignore` and `_vscode` → `.vscode`, then `npm install`. Hand-writing
`package.json` was rejected — pinning SDK 57 dependency versions by hand risks an
install that resolves to a broken tree.

Resulting versions: Expo SDK 57, expo-router 57, React 19.2.3, React Native
0.86.3, TypeScript 6.0.3.

## Structure

Routes live under `src/app/`, which is the SDK 57 template's convention; `@/*`
maps to `./src/*`.

```
src/
├── app/                  routes only, kept thin
│   ├── _layout.tsx         providers + root stack
│   ├── index.tsx           entry gate → /browse or /sign-in
│   ├── (auth)/sign-in.tsx  placeholder sign-in
│   ├── (tabs)/
│   │   ├── _layout.tsx     Browse · My Loans · Profile
│   │   ├── browse.tsx      catalogue + search
│   │   ├── loans.tsx       borrowed books, due dates
│   │   └── profile.tsx     member details, sign out
│   └── book/[id].tsx       detail, borrow and return
├── components/           book-card · loan-card · button · screen · screen-states
│                         · themed-text · themed-view
├── constants/theme.ts    Colors (light + dark) · Spacing · Radius · Fonts
├── context/              session-context · library-context
├── data/books.ts         10 mock books
├── hooks/                use-async · use-debounced-value · use-theme · use-color-scheme
├── services/             books.ts · loans.ts
└── types.ts              Book · Loan · User
```

Route groups `(auth)` and `(tabs)` do not appear in URLs, so the routes are `/`,
`/sign-in`, `/browse`, `/loans`, `/profile` and `/book/:id`. Tab screens are named
for what they are (`browse.tsx`, not `index.tsx`) so every `href` is unambiguous.

## Architecture

**Data flow:** screen → context → service → mock data.

The load-bearing decision is that every service function is `async` and returns a
Promise, even though it reads a local array. Swapping `getBooks()` for a `fetch()`
later changes one file and no screens. Screens never import `src/data/books.ts`
directly; only services do. That single rule is what keeps mock data from leaking
into the UI and becoming impossible to remove.

**Routes stay thin.** Files under `src/app/` compose components and call
contexts. Borrowing rules — `LOAN_PERIOD_DAYS`, `BORROW_LIMIT`, what counts as
overdue — live in `src/services/loans.ts`, so they stay in one place and are
testable without mounting a navigator.

**State.** Two contexts, split by lifetime rather than convenience:
`SessionContext` holds the signed-in user, `LibraryContext` holds loans and is
shared because Browse, Book detail and My Loans must agree on what is borrowed.
Nothing persists across app restarts.

## Error handling

Every screen that loads data renders three states explicitly: loading, empty and
error. `LoadingState`, `ErrorState` and `EmptyState` live together in
`components/screen-states.tsx` because they are one decision — "this screen has
nothing to render yet, and here is why" — and keeping them side by side stops
them drifting apart visually.

Service functions reject rather than returning `null`, so a missing book cannot
silently render as an empty screen. Mutations (borrow, return) rethrow so the
screen can decide how to report failure; both currently use `Alert`.

`useAsync` cancels in-flight work on unmount, so a slow response cannot overwrite
a newer one or set state on an unmounted screen.

## Deviations from the original plan

Three changes were made during implementation, each for a stated reason:

1. **Stable `Tabs` instead of `NativeTabs`.** The stock SDK 57 template uses
   `expo-router/unstable-native-tabs`. An explicitly unstable import is a poor
   foundation for a template that will be built on for months.
2. **`@expo/vector-icons` added explicitly.** It is no longer a transitive
   dependency of `expo` in SDK 57, so it was installed via `npx expo install`
   (15.1.1) rather than assumed present.
3. **`SplashScreen.preventAutoHideAsync()` removed.** The stock template relies
   on a demo component to hide the splash screen. That component was deleted, so
   keeping the call would have left the splash screen up forever.

## Testing

No test suite in this version. A skeleton with no business logic gives tests
nothing to assert beyond "the component renders."

Verification performed instead:

- `npx tsc --noEmit` — passes with no errors.
- `npx expo export --platform android` — bundles successfully (2.8 MB Hermes
  bytecode), confirming every import resolves and the app compiles.
- Dev server starts and serves the Expo Go manifest.

`jest-expo` becomes worthwhile once `services/loans.ts` holds rules worth
protecting — due-date calculation, borrow limits, availability. The service layer
is already shaped to be tested without a navigator.

**Not verified:** the app has not been opened on a physical device. Runtime
behaviour in Expo Go is unconfirmed.

## Out of scope

Real authentication · QR code passes · persistence · a backend · push
notifications · search beyond a title/author substring match.

## Known risk

The repository lives in a OneDrive-synced folder. `node_modules` is roughly
40,000 files, and OneDrive will attempt to sync all of them, which causes slow
installs, Metro file-watcher stalls, and intermittent file-lock errors that
present as random build failures. Mitigation is to exclude the folder from sync
or relocate the project outside OneDrive.
