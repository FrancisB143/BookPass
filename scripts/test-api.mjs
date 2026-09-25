#!/usr/bin/env node
/**
 * Exercises every CRUD operation against the live REST API.
 *
 * Run it before recording the demo, and any time the backend changes:
 *
 *   npm run test:api
 *
 * It reads the same URL and token the app uses, straight out of
 * src/config.ts, so a pass here means the app is pointed somewhere that works.
 *
 * It creates a book, reads it, updates it, deletes it, and confirms it is
 * gone — then leaves the database exactly as it found it.
 */

import { readFile } from 'node:fs/promises';

const CONFIG_PATH = 'src/config.ts';

function readConstant(source, name) {
  const match = source.match(new RegExp(`export const ${name}\\s*=\\s*['"]([^'"]*)['"]`));
  return match ? match[1] : null;
}

const config = await readFile(CONFIG_PATH, 'utf8');
const baseUrl = readConstant(config, 'API_BASE_URL');
const token = readConstant(config, 'API_AUTH_TOKEN');

if (!baseUrl) {
  console.error(`Could not find API_BASE_URL in ${CONFIG_PATH}.`);
  process.exit(1);
}
if (!token || token.startsWith('PASTE_')) {
  console.error(
    `API_AUTH_TOKEN in ${CONFIG_PATH} is still a placeholder.\n` +
      `Open auth.php on the server, find the token it accepts, and put it there.`
  );
  process.exit(1);
}

const endpoint = `${baseUrl}/books.php`;

let passed = 0;
let failed = 0;

function ok(label, detail = '') {
  passed += 1;
  console.log(`  PASS  ${label}${detail ? '  ' + detail : ''}`);
}

function bad(label, detail = '') {
  failed += 1;
  console.log(`  FAIL  ${label}${detail ? '  ' + detail : ''}`);
}

/**
 * The host prepends a comment to every response, so the body is scanned for
 * the opening brace rather than parsed from the first character. This mirrors
 * `parseJson` in src/services/books.ts.
 */
function parseJson(text) {
  const start = text.search(/[[{]/);
  if (start === -1) throw new SyntaxError(`No JSON in response: ${text.slice(0, 120)}`);
  return JSON.parse(text.slice(start));
}

async function call(method, path = '', body) {
  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let payload = null;
  if (text.trim() !== '') {
    try {
      payload = parseJson(text);
    } catch (error) {
      return { status: response.status, payload: null, raw: text, parseError: error.message };
    }
  }
  return { status: response.status, payload, raw: text };
}

console.log(`\nTesting ${endpoint}\n`);

// ─── READ (list) ────────────────────────────────────────────────────────────
const list = await call('GET');
if (list.parseError) {
  bad('GET list — response was not JSON', list.parseError);
} else if (list.status !== 200) {
  bad(`GET list — HTTP ${list.status}`, JSON.stringify(list.payload));
} else if (!Array.isArray(list.payload)) {
  bad('GET list — expected an array', JSON.stringify(list.payload).slice(0, 120));
} else {
  ok('GET list', `${list.payload.length} book(s)`);
}

// ─── CREATE ─────────────────────────────────────────────────────────────────
const marker = `Test Book ${Date.now()}`;
const created = await call('POST', '', {
  title: marker,
  author: 'API Test',
  genre: 'Testing',
  isbn: '9780000000001',
  published_year: 2026,
  description: 'Created by npm run test:api. Safe to delete.',
  status: 'available',
});

let newId = null;
if (created.status !== 201) {
  bad(`POST create — HTTP ${created.status}`, JSON.stringify(created.payload ?? created.raw).slice(0, 200));
} else if (!created.payload?.id) {
  bad('POST create — no id returned', JSON.stringify(created.payload));
} else {
  newId = created.payload.id;
  ok('POST create', `id ${newId}`);
}

// ─── VALIDATION (should be rejected) ────────────────────────────────────────
const invalid = await call('POST', '', { title: '', author: '' });
if (invalid.status === 422 && invalid.payload?.fields) {
  ok('POST validation', `422 rejects blank title/author`);
} else {
  bad(`POST validation — expected 422, got ${invalid.status}`, JSON.stringify(invalid.payload));
}

if (newId !== null) {
  // ─── READ (one) ───────────────────────────────────────────────────────────
  const one = await call('GET', `?id=${newId}`);
  if (one.status === 200 && one.payload?.title === marker) {
    ok('GET by id', `“${one.payload.title}”`);
  } else {
    bad(`GET by id — HTTP ${one.status}`, JSON.stringify(one.payload).slice(0, 160));
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  const updated = await call('PUT', `?id=${newId}`, { status: 'borrowed', genre: 'Updated' });
  if (updated.status === 200 && updated.payload?.status === 'borrowed') {
    ok('PUT update', `status → borrowed, genre → ${updated.payload.genre}`);
  } else {
    bad(`PUT update — HTTP ${updated.status}`, JSON.stringify(updated.payload).slice(0, 160));
  }

  // A partial update must not blank the fields it did not send.
  if (updated.payload?.title === marker && updated.payload?.author === 'API Test') {
    ok('PUT is partial', 'untouched fields survived');
  } else {
    bad('PUT is partial — other fields were overwritten', JSON.stringify(updated.payload).slice(0, 160));
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  const removed = await call('DELETE', `?id=${newId}`);
  if (removed.status === 200) {
    ok('DELETE', `id ${newId}`);
  } else {
    bad(`DELETE — HTTP ${removed.status}`, JSON.stringify(removed.payload).slice(0, 160));
  }

  const gone = await call('GET', `?id=${newId}`);
  if (gone.status === 404) {
    ok('DELETE confirmed', '404 after delete');
  } else {
    bad(`DELETE confirmed — expected 404, got ${gone.status}`);
  }
}

// ─── AUTH ───────────────────────────────────────────────────────────────────
const noAuth = await fetch(endpoint);
if (noAuth.status === 400 || noAuth.status === 401) {
  ok('Auth guard', `rejects a request with no token (HTTP ${noAuth.status})`);
} else {
  bad(`Auth guard — expected 400/401 without a token, got ${noAuth.status}`);
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
