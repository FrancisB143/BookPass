# BookPass

A peer-to-peer book exchange for a campus community. Members catalogue the
books they own, lend them to each other, and swap titles they have finished for
ones they want. Built with [Expo](https://expo.dev) and React Native, and
designed to run in **Expo Go** — no native build required.

The interface is built from a Figma design; see
[docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) for the tokens and components
every screen is assembled from.

## Running it

```bash
npm install
npm start
```

Then open the project on your phone:

1. Install **Expo Go** from the App Store or Play Store.
2. Put your phone and computer on the same Wi-Fi network.
3. Scan the QR code in the terminal — Android from inside Expo Go, iOS with the
   Camera app.

On university or guest Wi-Fi the two devices often cannot see each other. Use
`npx expo start --tunnel` instead.

Sign in with any valid-looking email; the password is ignored.

| Command | What it does |
| --- | --- |
| `npm start` | Start the dev server for Expo Go |
| `npm run android` | Open on a connected Android device or emulator |
| `npm run ios` | Open in the iOS simulator (macOS only) |
| `npm run web` | Open in a browser |
| `npm run typecheck` | Check types without building |
| `npm run figma:pull` | Re-sync the design source from Figma |

## Screens

| Route | Screen |
| --- | --- |
| `/` | Welcome — taps through to sign-in, skipped once signed in |
| `/sign-in` | Sign in and register, one screen with a segmented toggle |
| `/home` | Dashboard: shelf stats, recent additions, books available nearby |
| `/my-books` | Your catalogue, in list or grid, with status filters |
| `/exchange` | The marketplace, and incoming and outgoing swap requests |
| `/borrowed` | Books you have out from other members, with due dates |
| `/add-book` | Add a book to your shelf — opens from the centre FAB |
| `/book/[id]` | Edit or remove one of your copies |

## How it is put together

```
src/
├── app/                  Routes. Expo Router turns each file into a screen.
├── components/
│   ├── ui/                 Primitives: Text, Button, Card, Pill, Field, …
│   └── <screen>/           Per-screen components, one folder each
├── constants/theme.ts    Colours, type scale, spacing, radii
├── context/              SessionContext (who is signed in), LibraryContext
├── data/seed.ts          Mock members, books, copies, loans and requests
├── hooks/                useAsync, useDebouncedValue
├── services/             catalog · loans · exchange · store
└── types.ts              Book, Copy, Loan, ExchangeRequest, Listing, User
```

### The data model

The one distinction worth understanding:

- A **`Book`** is the work — *Atomic Habits* by James Clear.
- A **`Copy`** is one member's physical copy of it, with its own condition,
  pickup hub and status.

Two members can both own *Atomic Habits* in different conditions, at different
hubs, one on their shelf and one listed for swap. That is impossible if
ownership lives on the book, which is why the marketplace needs the split.

A **`Loan`** therefore has two sides — a lender and a borrower — and an
**`ExchangeRequest`** carries the borrow-or-swap handshake between them.

### The rule worth keeping

**Screens never import `src/data/` directly.** They call a service, or read
`useLibrary()`. Every service function is already `async`, so replacing mock
data with a real backend looks like this, and no screen changes:

```ts
// src/services/catalog.ts
export async function getExchangeListings(filter) {
-  return resolveLater(toListings(filtered));
+  const response = await fetch(`${API_URL}/listings?filter=${filter}`);
+  if (!response.ok) throw new Error('Could not load the exchange.');
+  return response.json();
}
```

Borrowing rules — `LOAN_PERIOD_DAYS`, `BORROW_LIMIT`, what counts as overdue —
live in `src/services/loans.ts` rather than in a screen, so they stay in one
place and can be tested without mounting a navigator.

## Design source

`npm run figma:pull` reads a read-only Figma token from `.env.local` and writes
the document tree, a rendered PNG per frame, and an index into `design/figma/`.
Re-run it whenever the design changes. The raw dump and the PNGs are gitignored
since the script regenerates them.

To set the token up: Figma → Settings → Security → Personal access tokens, scope
`file_content:read`, then put `FIGMA_TOKEN=figd_…` in `.env.local`.

## What is deliberately missing

Everything lives in memory and resets when the app reloads. There is no real
authentication, no backend, no chat, no camera-based ISBN scanning, and no test
suite yet — the service layer is shaped to be testable without a navigator, and
`jest-expo` earns its place once the borrowing rules are worth protecting.

Covers come from the [Open Library](https://openlibrary.org/dev/docs/api/covers)
covers API by ISBN, with a typographic fallback when a cover is missing or the
device is offline.

## Notes

- **Light only.** The design specifies no dark mode, so `app.json` pins
  `userInterfaceStyle` to light rather than half-applying an invented palette.
- **Adding a colour:** add it to `Colors` in `src/constants/theme.ts` and use
  the token. A raw hex in a screen is a bug.
- **OneDrive:** if this repository lives in a synced folder, exclude it.
  Syncing `node_modules` causes slow installs and file-lock errors that look
  like random build failures.
