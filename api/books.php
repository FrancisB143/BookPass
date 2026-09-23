<?php
/**
 * Books — the full CRUD endpoint.
 *
 *   GET    books.php              list every book, newest first
 *   GET    books.php?search=dune  filter by title or author
 *   GET    books.php?status=available
 *   GET    books.php?id=3         one book
 *   POST   books.php              create        (JSON body)
 *   PUT    books.php?id=3         update        (JSON body)
 *   DELETE books.php?id=3         delete
 *
 * One file rather than rewritten routes: free hosting does not always honour
 * .htaccess, and a query string works everywhere.
 */

declare(strict_types=1);

require __DIR__ . '/db.php';

const STATUSES = ['available', 'borrowed', 'reserved'];

/** Columns the client may write. Anything else in the body is ignored. */
const WRITABLE = ['title', 'author', 'genre', 'isbn', 'published_year', 'description', 'status', 'cover_url'];

/**
 * MySQL returns every column as a string. The app expects a number for the id
 * and the year, so each row is normalised on the way out.
 */
function shapeBook(array $row): array
{
    return [
        'id'             => (int) $row['id'],
        'title'          => $row['title'],
        'author'         => $row['author'],
        'genre'          => $row['genre'],
        'isbn'           => $row['isbn'],
        'published_year' => $row['published_year'] === null ? null : (int) $row['published_year'],
        'description'    => $row['description'],
        'status'         => $row['status'],
        'cover_url'      => $row['cover_url'],
        'created_at'     => $row['created_at'],
        'updated_at'     => $row['updated_at'],
    ];
}

/**
 * Checks a payload and returns the columns to write.
 *
 * On create every required field must be present. On update only the fields
 * that were actually sent are touched, so an edit form cannot blank a column
 * it never showed.
 */
function validate(array $body, bool $creating): array
{
    $errors = [];
    $values = [];

    foreach (WRITABLE as $field) {
        if (!array_key_exists($field, $body)) {
            continue;
        }
        $value = $body[$field];
        $values[$field] = is_string($value) ? trim($value) : $value;
    }

    if ($creating) {
        foreach (['title', 'author'] as $required) {
            if (($values[$required] ?? '') === '') {
                $errors[$required] = ucfirst($required) . ' is required.';
            }
        }
    } else {
        foreach (['title', 'author'] as $required) {
            if (array_key_exists($required, $values) && $values[$required] === '') {
                $errors[$required] = ucfirst($required) . ' cannot be empty.';
            }
        }
    }

    if (isset($values['title']) && mb_strlen((string) $values['title']) > 255) {
        $errors['title'] = 'Title is too long (255 characters maximum).';
    }

    if (array_key_exists('published_year', $values)) {
        $year = $values['published_year'];
        if ($year === null || $year === '') {
            $values['published_year'] = null;
        } else {
            $parsed = filter_var($year, FILTER_VALIDATE_INT);
            if ($parsed === false || $parsed < 1000 || $parsed > (int) date('Y') + 1) {
                $errors['published_year'] = 'Enter a four-digit year.';
            } else {
                $values['published_year'] = $parsed;
            }
        }
    }

    if (isset($values['status']) && !in_array($values['status'], STATUSES, true)) {
        $errors['status'] = 'Status must be one of: ' . implode(', ', STATUSES) . '.';
    }

    if ($errors !== []) {
        respond(422, ['error' => 'Some fields need fixing.', 'fields' => $errors]);
    }

    // An empty optional string is stored as NULL, so "no ISBN" has one
    // representation in the database instead of two.
    foreach (['genre', 'isbn', 'description', 'cover_url'] as $optional) {
        if (array_key_exists($optional, $values) && $values[$optional] === '') {
            $values[$optional] = null;
        }
    }

    return $values;
}

function findBook(int $id): ?array
{
    $statement = db()->prepare('SELECT * FROM books WHERE id = ?');
    $statement->execute([$id]);
    $row = $statement->fetch();

    return $row === false ? null : $row;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = null;

if (isset($_GET['id'])) {
    $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
    if ($id === false) {
        fail(400, 'The id must be a number.');
    }
}

switch ($method) {
    case 'GET':
        if ($id !== null) {
            $row = findBook($id);
            if ($row === null) {
                fail(404, 'No book found with that id.');
            }
            respond(200, shapeBook($row));
        }

        $sql = 'SELECT * FROM books';
        $where = [];
        $params = [];

        $search = trim((string) ($_GET['search'] ?? ''));
        if ($search !== '') {
            $where[] = '(title LIKE ? OR author LIKE ?)';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
        }

        $status = trim((string) ($_GET['status'] ?? ''));
        if ($status !== '' && in_array($status, STATUSES, true)) {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        if ($where !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY created_at DESC, id DESC';

        $statement = db()->prepare($sql);
        $statement->execute($params);
        respond(200, array_map('shapeBook', $statement->fetchAll()));

    case 'POST':
        $values = validate(jsonBody(), true);

        $columns = array_keys($values);
        $placeholders = implode(', ', array_fill(0, count($columns), '?'));
        $sql = 'INSERT INTO books (' . implode(', ', $columns) . ') VALUES (' . $placeholders . ')';

        $statement = db()->prepare($sql);
        $statement->execute(array_values($values));

        $created = findBook((int) db()->lastInsertId());
        respond(201, shapeBook($created));

    case 'PUT':
        if ($id === null) {
            fail(400, 'Which book? Add ?id= to the URL.');
        }
        if (findBook($id) === null) {
            fail(404, 'No book found with that id.');
        }

        $values = validate(jsonBody(), false);
        if ($values === []) {
            fail(400, 'Nothing to update.');
        }

        $assignments = [];
        foreach (array_keys($values) as $column) {
            $assignments[] = $column . ' = ?';
        }

        $sql = 'UPDATE books SET ' . implode(', ', $assignments) . ' WHERE id = ?';
        $statement = db()->prepare($sql);
        $statement->execute(array_merge(array_values($values), [$id]));

        respond(200, shapeBook(findBook($id)));

    case 'DELETE':
        if ($id === null) {
            fail(400, 'Which book? Add ?id= to the URL.');
        }
        if (findBook($id) === null) {
            fail(404, 'No book found with that id.');
        }

        db()->prepare('DELETE FROM books WHERE id = ?')->execute([$id]);
        respond(200, ['deleted' => $id]);

    default:
        fail(405, $method . ' is not supported on this endpoint.');
}
