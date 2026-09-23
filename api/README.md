# BookPass REST API

The custom backend the mobile app talks to. PHP + MySQL, no framework and no
Composer, so it drops onto shared hosting without a build step.

## Files

| File | What it is |
| --- | --- |
| `schema.sql` | Creates the `books` table and inserts five sample rows |
| `config.example.php` | Template for your database credentials |
| `config.php` | **You create this.** Gitignored, so your password stays off GitHub |
| `db.php` | PDO connection, CORS headers, JSON helpers |
| `books.php` | The CRUD endpoint |

## Setting it up on Freehostia

1. **Create the database.** Control Panel → MySQL Databases. Note the database
   name, username, password and host — on Freehostia the host is usually
   `mysql.freehostia.com`, not `localhost`, and names are prefixed with your
   account.
2. **Create the table.** Open phpMyAdmin from the same panel, select your
   database, go to the SQL tab, paste in `schema.sql` and run it.
3. **Add your credentials.** Copy `config.example.php` to `config.php` and fill
   in the four values.
4. **Upload.** Put the whole `api/` folder in `public_html` via File Manager or
   FTP. Upload `config.php` too — it is gitignored, not unused.
5. **Check it.** Open `http://yoursite.freehostia.com/api/books.php` in a
   browser. You should see a JSON array of five books.

## Setting it up locally with XAMPP

1. Start Apache and MySQL from the XAMPP control panel.
2. Open `http://localhost/phpmyadmin`, create a database called `bookpass`, and
   run `schema.sql` against it.
3. Copy `config.example.php` to `config.php` and set host `localhost`, user
   `root`, an empty password, database `bookpass`.
4. Copy the `api/` folder into `C:\xampp\htdocs\`.
5. Check `http://localhost/api/books.php`.

**Testing from a phone:** `localhost` on your phone means the phone itself. Use
your computer's LAN address instead — run `ipconfig`, take the IPv4 address
(something like `192.168.1.5`), and point the app at
`http://192.168.1.5/api`. Both devices must be on the same Wi-Fi.

## Endpoints

Base path: `…/api/books.php`

| Method | URL | Does |
| --- | --- | --- |
| `GET` | `books.php` | Every book, newest first |
| `GET` | `books.php?search=dune` | Filter by title or author |
| `GET` | `books.php?status=available` | Filter by status |
| `GET` | `books.php?id=3` | One book |
| `POST` | `books.php` | Create — JSON body |
| `PUT` | `books.php?id=3` | Update — JSON body, only the fields you send |
| `DELETE` | `books.php?id=3` | Delete |

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
| `404` | No book with that id |
| `405` | Method not supported |
| `422` | Validation failed; `fields` says which |
| `500` | Database or configuration problem |

## Notes

- Queries use real prepared statements (`PDO::ATTR_EMULATE_PREPARES => false`),
  so a quote in a book title cannot change what a query means.
- `PUT` updates only the fields present in the body, so an edit form cannot
  blank a column it never displayed.
- CORS is open (`Access-Control-Allow-Origin: *`) because the app runs from a
  different origin. Tighten it if this ever goes near real data.
- Everything is one file per concern with query-string routing rather than
  `.htaccess` rewrites, which free hosts do not always honour.
