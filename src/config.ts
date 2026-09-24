/**
 * Where the custom REST API lives.
 *
 * ─── Change this one line to point the app somewhere else. ───────────────────
 *
 * Freehostia (or any web host):
 *   'http://yoursite.freehostia.com/api'
 *
 * XAMPP on your own computer, opened in a web browser on that computer:
 *   'http://localhost/api'
 *
 * XAMPP, opened in Expo Go on your PHONE:
 *   'http://192.168.1.5/api'   ← your computer's address, not localhost
 *
 *   "localhost" on a phone means the phone itself, so it will never find your
 *   computer. Run `ipconfig` in a terminal, take the IPv4 Address (it starts
 *   with 192.168 or 10.), and put that here. Phone and computer have to be on
 *   the same Wi-Fi.
 *
 * No trailing slash.
 */
export const API_BASE_URL = 'http://franseas.mooo.com';

/**
 * The bearer token `auth.php` expects.
 *
 * Every request sends `Authorization: Bearer <this>`. Without it the API
 * answers 400 "Authorization header is missing"; with the wrong value, 401.
 *
 * This is the same token the existing student.php endpoint uses — it is in
 * auth.php on the server.
 */
export const API_AUTH_TOKEN = 'PASTE_THE_TOKEN_FROM_auth.php_HERE';

/**
 * The third-party public API: Open Library Search.
 *
 * Free, no account and no API key. Documented at
 * https://openlibrary.org/dev/docs/api/search
 */
export const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json';

/** Open Library's cover images, addressed by ISBN. */
export const OPEN_LIBRARY_COVERS_URL = 'https://covers.openlibrary.org/b/isbn';

/** How long a request may hang before the app gives up and says so. */
export const REQUEST_TIMEOUT_MS = 12000;
