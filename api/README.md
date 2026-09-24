# BookPass REST API

The custom backend the mobile app talks to. PHP + MySQL, hosted on Freehostia
alongside the existing `student.php` endpoint and written to match it — same
`connection.php` class, same `auth.php` guard, same `switch` on
`REQUEST_METHOD`.

## Files

| File | What it is |
| --- | --- |
| `books.php` | The CRUD endpoint. Upload this. |
| `.htaccess` | Rewrite rules, including the existing students and kpop_dancers ones |
| `schema.sql` | Creates the `books` table and inserts five sample rows |
| `connection.example.php` | Copy of the server's `connection.php`, with the credentials blanked |

`connection.php` and `auth.php` already live on the server and are **not** in
this repository — `connection.php` because it holds a live password.

## Setting it up

### 1. Create the table

Freehostia control panel → MySQL Databases → phpMyAdmin. Select your database
in the left sidebar, open the **SQL** tab, paste in `schema.sql`, press **Go**.

This only adds `books`. It does not touch `students`.

### 2. Upload the files

Put `books.php` in the same folder as `student.php`, `connection.php` and
`auth.php` — they are included by relative path, so they have to be siblings.

Replace `.htaccess` with the one here. It keeps the existing rules and adds the
books routes.

> **The existing `.htaccess` had a bug.** Its rules pointed at `students.php`,
> but the file on the server is `student.php` (singular), so `/students/`
> returned 404 and only the direct `student.php` URL worked. The version here
> fixes that.

### 3. Check it

Open this in a browser:

```
http://yoursite.freehostia.com/books.php
```

- A **JSON array of five books** means it works.
- **`401`** means the auth guard rejected the browser, which is expected — the
  endpoint is working, it just wants credentials. The app sends them.
- **A PHP error** usually means `books.php` is not sitting next to
  `connection.php`, or the `books` table was not created.

## Endpoints

| Method | URL | Does |
| --- | --- | --- |
| `GET` | `books.php` | Every book, newest first |
| `GET` | `books.php?search=dune` | Filter by title or author |
| `GET` | `books.php?status=available` | Filter by status |
| `GET` | `books.php?id=3` | One book |
| `POST` | `books.php` | Create — JSON body |
| `PUT` | `books.php?id=3` | Update — JSON body, only the fields you send |
| `DELETE` | `books.php?id=3` | Delete |

With the rewrites in place, `/books/` and `/books/3` work too.

### The book shape

```json
{
  "id": 1,
  "title": "Atomic Habits",
  "author": "James Clear",
  "genre": "Self-help",
  "isbn": "9780735211292",
  "published_year": 2018,
  "description": "Behaviour change framed as a systems problem…",
  "status": "available",
  "cover_url": null,
  "created_at": "2026-09-24 10:15:00",
  "updated_at": "2026-09-24 10:15:00"
}
```

`title` and `author` are required. `status` is one of `available`, `borrowed`,
`reserved`. Everything else may be null.

### Errors

Every failure returns the same shape, so the app can rely on it:

```json
{ "error": "Some fields need fixing.", "fields": { "title": "Title is required." } }
```

| Status | Means |
| --- | --- |
| `400` | Malformed request — bad JSON, or a missing `id` |
| `401` | The auth guard rejected the request |
| `404` | No book with that id |
| `405` | Method not supported |
| `422` | Validation failed; `fields` says which |
| `500` | Database problem |

## Notes

- Queries use `mysqli` prepared statements with bound parameters, so a quote in
  a book title cannot change what a query means.
- `PUT` writes only the fields present in the body, so an edit form cannot
  blank a column it never displayed.
- The `SetEnvIf Authorization` line in `.htaccess` matters: Apache strips the
  `Authorization` header otherwise and `auth.php` would never see credentials.
- CORS is open (`Access-Control-Allow-Origin: *`) because the app runs from a
  different origin.
