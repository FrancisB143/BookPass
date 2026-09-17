# BookPass

A library borrowing app for students: browse the catalogue, borrow a book, keep
track of what is due back. Built with [Expo](https://expo.dev) and React Native,
and designed to run in **Expo Go** — no native build required.

This is a walking skeleton. Every screen exists and works against mock data, so
you can see the whole app on your phone today and fill in real behaviour screen
by screen.

## Running it

```bash
npm install
npm start
```

Then open the project on your phone:

1. Install **Expo Go** from the App Store or Play Store.
2. Make sure your phone and computer are on the same Wi-Fi network.
3. Scan the QR code in the terminal — Android from inside Expo Go, iOS with the
   Camera app.

If the two devices cannot see each other (common on university or guest Wi-Fi),
run `npx expo start --tunnel` instead.

Sign in with any valid-looking email address; the password is ignored.

| Command | What it does |
| --- | --- |
| `npm start` | Start the dev server for Expo Go |
| `npm run android` | Open on a connected Android device or emulator |
| `npm run ios` | Open in the iOS simulator (macOS only) |
| `npm run web` | Open in a browser |
| `npm run typecheck` | Check types without building |
| `npm run lint` | Lint |

## How it is put together

```
src/
├── app/                  Routes. Expo Router turns each file into a screen.
│   ├── _layout.tsx         Providers + root stack
│   ├── index.tsx           Entry gate: signed in? → /browse, else → /sign-in
│   ├── (auth)/sign-in.tsx  Placeholder sign-in
│   ├── (tabs)/             Browse · My Loans · Profile
│   └── book/[id].tsx       Book detail, borrow and return
├── components/           Reusable UI (BookCard, LoanCard, Button, states…)
├── constants/theme.ts    Colours, spacing, radii — light and dark
├── context/              SessionContext (who is signed in), LibraryContext (loans)
├── data/books.ts         Mock catalogue
├── hooks/                useAsync, useDebouncedValue, useTheme
├── services/             books.ts, loans.ts — the only files that touch data
└── types.ts              Book, Loan, User
```

Folders in parentheses are [route groups](https://docs.expo.dev/router/basics/layout/#route-groups):
they organise files without appearing in the URL, so `(tabs)/browse.tsx` is just
`/browse`.

### The one rule worth keeping

**Screens never import `src/data/` directly.** They call a service, and the
service reads the data. Every function in `src/services/` is already `async`, so
replacing mock data with a real backend looks like this — and no screen changes:

```ts
// src/services/books.ts
export async function getBooks(): Promise<Book[]> {
-  return resolveLater([...BOOKS]);
+  const response = await fetch(`${API_URL}/books`);
+  if (!response.ok) throw new Error('Could not load the catalogue.');
+  return response.json();
}
```

Borrowing rules (`LOAN_PERIOD_DAYS`, `BORROW_LIMIT`, what counts as overdue) live
in `src/services/loans.ts` rather than in a screen, so they stay in one place and
can be tested without mounting a navigator.

## What is deliberately missing

Loans are held in memory and reset when the app reloads. There is no real
authentication, no QR pass, no backend, and no test suite yet — a skeleton with
no business logic gives tests little to assert. `jest-expo` earns its place once
`services/loans.ts` holds rules worth protecting.

Natural next steps: persist loans with `expo-sqlite` or `AsyncStorage`, render a
scannable pass with `react-native-qrcode-svg`, then swap the mock services for a
real API.

## Notes

- **Adding a screen:** create a file under `src/app/`. The filename is the route.
- **Adding a colour:** add it to *both* `Colors.light` and `Colors.dark` in
  `src/constants/theme.ts`. `ThemeColor` is the intersection of their keys, so a
  one-sided addition is a compile error rather than a dark-mode bug.
- **OneDrive:** if this repository lives in a synced folder, exclude it from
  OneDrive. Syncing `node_modules` causes slow installs and file-lock errors that
  look like random build failures.
