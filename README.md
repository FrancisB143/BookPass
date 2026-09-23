# BookPass

A mobile library management app. Built with React Native and Expo, it manages a
book catalogue through a custom REST API and enriches it with book data from a
public third-party API.

Submitted for the Mobile Application, Custom REST API & External API
Integration midterm.

---

## The two APIs

### 1. Custom REST API (mine)

PHP + MySQL, in [`api/`](api/). Full CRUD over a `books` table.

| Method | Endpoint | Operation |
| --- | --- | --- |
| `GET` | `api/books.php` | **Read** — list all books |
| `GET` | `api/books.php?id=3` | **Read** — one book |
| `POST` | `api/books.php` | **Create** |
| `PUT` | `api/books.php?id=3` | **Update** |
| `DELETE` | `api/books.php?id=3` | **Delete** |

Setup instructions are in [`api/README.md`](api/README.md).

### 2. Third-party public API

**Open Library Search API**

```
https://openlibrary.org/search.json
```

- Documentation: <https://openlibrary.org/dev/docs/api/search>
- Cover images: <https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg>
- No API key and no account required.

Used by the **Discover** tab: search any title or author, see live results
parsed from the JSON response, and add one to your own library with its title,
author, year, subject and ISBN already filled in. Cover art throughout the app
also comes from Open Library, addressed by ISBN.

Client code: [`src/services/open-library.ts`](src/services/open-library.ts).

---

## Running it

### 1. Set up the backend

Follow [`api/README.md`](api/README.md) — create the database, run
`schema.sql`, copy `config.example.php` to `config.php` with your credentials,
and upload the `api/` folder to your host.

Confirm it works by opening `…/api/books.php` in a browser. You should see a
JSON array of books.

### 2. Point the app at it

Edit one line in [`src/config.ts`](src/config.ts):

```ts
export const API_BASE_URL = 'http://yoursite.freehostia.com/api';
```

> **Testing against XAMPP from a phone?** `localhost` on a phone means the
> phone. Run `ipconfig`, take your computer's IPv4 address, and use
> `http://192.168.1.5/api` instead. Both devices must be on the same Wi-Fi.

### 3. Run the app

```bash
npm install
npm start
```

Install **Expo Go** on your phone and scan the QR code. On university Wi-Fi
where the devices cannot see each other, use `npx expo start --tunnel`.

| Command | What it does |
| --- | --- |
| `npm start` | Start the dev server for Expo Go |
| `npm run android` | Open on a connected Android device or emulator |
| `npm run web` | Open in a browser |
| `npm run typecheck` | Check types without building |

---

## Screens

| Route | Screen | Operation |
| --- | --- | --- |
| `/` | Library — list or grid, search, status filters | **Read** |
| `/book/[id]` | Book details | **Read** |
| `/add-book` | Add a book | **Create** |
| `/book/[id]/edit` | Edit, and delete with confirmation | **Update**, **Delete** |
| `/discover` | Open Library search | **Third-party API** |

Delete is confirmed twice over: the button sits in its own boxed-off card, and
pressing it raises a confirmation dialog before anything is sent.

---

## How it is put together

```
api/                      PHP + MySQL REST API
├── books.php               all four CRUD operations
├── db.php                  PDO connection, CORS, JSON helpers
├── schema.sql              table + sample rows
└── config.example.php      credential template

src/
├── app/                  Routes — Expo Router turns each file into a screen
│   ├── (tabs)/             Library · Discover, with an add button between
│   ├── add-book.tsx
│   └── book/[id]/          detail and edit
├── components/
│   ├── ui/                 Text, Button, Card, Field, Pill, Chip…
│   ├── books/              book card, grid tile, status pill, the shared form
│   └── discover/           search result card
├── config.ts             ← the API base URL lives here
├── constants/            design tokens and motion tokens
├── context/              the catalogue, loaded once and shared
├── services/
│   ├── books.ts            custom REST API client
│   └── open-library.ts     third-party API client
└── types.ts              Book, BookDraft, BookStatus
```

### Design decisions worth knowing

**Screens never call `fetch` directly.** They go through `src/services/`, which
is the only place that knows either API's URL shape. The custom API speaks
`snake_case`; the app speaks `camelCase`; `services/books.ts` is the single
place that translates.

**Validation happens on both sides.** The form disables submit until title and
author are filled, and the API re-checks everything and returns HTTP 422 with
per-field messages. Those messages are mapped back onto the right form fields,
so a rejected save says exactly which input is wrong.

**`PUT` only writes the fields it is sent**, so an edit form cannot blank a
column it never displayed.

**Queries use real prepared statements**
(`PDO::ATTR_EMULATE_PREPARES => false`), so a quote in a book title cannot
change what a query means.

---

## Notes

- The app is light-only; `app.json` pins `userInterfaceStyle` so a phone in
  dark mode cannot half-apply a palette that was never designed.
- Fonts are Newsreader and Plus Jakarta Sans, imported per weight so unused
  faces stay out of the bundle.
- Motion respects the phone's Reduce Motion setting.
- **OneDrive:** if this repository lives in a synced folder, exclude it.
  Syncing `node_modules` causes file-lock errors that look like random build
  failures.
