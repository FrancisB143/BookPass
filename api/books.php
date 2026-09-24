<?php
/**
 * Books — the BookPass CRUD endpoint.
 *
 * Written to match student.php: same CORS headers, same connection.php class,
 * same auth.php guard, same switch on REQUEST_METHOD.
 *
 *   GET    books.php              every book, newest first
 *   GET    books.php?id=3         one book
 *   GET    books.php?search=dune  filter by title or author
 *   POST   books.php              create   (JSON body)
 *   PUT    books.php?id=3         update   (JSON body)
 *   DELETE books.php?id=3         delete
 *
 * With the .htaccess rewrites in place these also work:
 *   /books/        /books/3
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include("connection.php");
include("auth.php");

//Auth Start
$auth = new authObj();
$isAuthorized = $auth->authenticate();
if (!$isAuthorized)
{
    header("HTTP/1.0 401");
    echo json_encode(array("error" => "Not authorized."));
    exit;
}
//Auth End

$db = new dbObj();
$connection = $db->getConnstring();

/** Sends a JSON response and stops. */
function respond($status, $payload)
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

/** Sends an error in the same shape every time, so the app can rely on it. */
function fail($status, $message, $fields = array())
{
    $body = array("error" => $message);
    if (!empty($fields)) {
        $body["fields"] = $fields;
    }
    respond($status, $body);
}

/**
 * Reads the request body as JSON.
 *
 * PHP fills $_POST only for form encoding, and never for PUT, so the raw
 * stream is read directly.
 */
function json_body()
{
    $raw = file_get_contents("php://input");
    if ($raw === false || trim($raw) === "") {
        return array();
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        fail(400, "The request body was not valid JSON.");
    }
    return $decoded;
}

/**
 * MySQL returns every column as a string. The app expects numbers for the id
 * and the year, so each row is normalised on the way out.
 */
function shape_book($row)
{
    return array(
        "id"             => intval($row["id"]),
        "title"          => $row["title"],
        "author"         => $row["author"],
        "genre"          => $row["genre"],
        "isbn"           => $row["isbn"],
        "published_year" => $row["published_year"] === null ? null : intval($row["published_year"]),
        "description"    => $row["description"],
        "status"         => $row["status"],
        "cover_url"      => $row["cover_url"],
        "created_at"     => $row["created_at"],
        "updated_at"     => $row["updated_at"]
    );
}

function find_book($connection, $id)
{
    $statement = mysqli_prepare($connection, "SELECT * FROM books WHERE id = ?");
    mysqli_stmt_bind_param($statement, "i", $id);
    mysqli_stmt_execute($statement);
    $result = mysqli_stmt_get_result($statement);
    $row = mysqli_fetch_assoc($result);
    mysqli_stmt_close($statement);

    return $row ? $row : null;
}

/**
 * Checks a payload and returns the values to write.
 *
 * On create every required field must be present. On update only the fields
 * actually sent are touched, so an edit form cannot blank a column it never
 * displayed.
 */
function validate($body, $creating)
{
    $allowed = array("title", "author", "genre", "isbn", "published_year", "description", "status", "cover_url");
    $statuses = array("available", "borrowed", "reserved");

    $errors = array();
    $values = array();

    foreach ($allowed as $field) {
        if (!array_key_exists($field, $body)) {
            continue;
        }
        $value = $body[$field];
        $values[$field] = is_string($value) ? trim($value) : $value;
    }

    foreach (array("title", "author") as $required) {
        if ($creating) {
            if (!isset($values[$required]) || $values[$required] === "") {
                $errors[$required] = ucfirst($required) . " is required.";
            }
        } else {
            if (array_key_exists($required, $values) && $values[$required] === "") {
                $errors[$required] = ucfirst($required) . " cannot be empty.";
            }
        }
    }

    if (isset($values["title"]) && strlen($values["title"]) > 255) {
        $errors["title"] = "Title is too long (255 characters maximum).";
    }

    if (array_key_exists("published_year", $values)) {
        $year = $values["published_year"];
        if ($year === null || $year === "") {
            $values["published_year"] = null;
        } else {
            $parsed = filter_var($year, FILTER_VALIDATE_INT);
            if ($parsed === false || $parsed < 1000 || $parsed > intval(date("Y")) + 1) {
                $errors["published_year"] = "Enter a four-digit year.";
            } else {
                $values["published_year"] = $parsed;
            }
        }
    }

    if (isset($values["status"]) && !in_array($values["status"], $statuses)) {
        $errors["status"] = "Status must be one of: " . implode(", ", $statuses) . ".";
    }

    if (!empty($errors)) {
        fail(422, "Some fields need fixing.", $errors);
    }

    // An empty optional string is stored as NULL, so "no ISBN" has one
    // representation in the database instead of two.
    foreach (array("genre", "isbn", "description", "cover_url") as $optional) {
        if (array_key_exists($optional, $values) && $values[$optional] === "") {
            $values[$optional] = null;
        }
    }

    return $values;
}

/** Builds the bind-type string mysqli needs: "i" for the year, "s" for the rest. */
function bind_types($columns)
{
    $types = "";
    foreach ($columns as $column) {
        $types .= ($column === "published_year") ? "i" : "s";
    }
    return $types;
}

$request_method = $_SERVER["REQUEST_METHOD"];
$id = null;

if (isset($_GET["id"])) {
    $id = filter_var($_GET["id"], FILTER_VALIDATE_INT);
    if ($id === false) {
        fail(400, "The id must be a number.");
    }
}

switch ($request_method)
{
    case 'GET':
        if ($id !== null) {
            $row = find_book($connection, $id);
            if ($row === null) {
                fail(404, "No book found with that id.");
            }
            respond(200, shape_book($row));
        }

        $search = isset($_GET["search"]) ? trim($_GET["search"]) : "";
        $status = isset($_GET["status"]) ? trim($_GET["status"]) : "";

        $clauses = array();
        $params = array();
        $types = "";

        if ($search !== "") {
            $clauses[] = "(title LIKE ? OR author LIKE ?)";
            $params[] = "%" . $search . "%";
            $params[] = "%" . $search . "%";
            $types .= "ss";
        }

        if ($status !== "" && in_array($status, array("available", "borrowed", "reserved"))) {
            $clauses[] = "status = ?";
            $params[] = $status;
            $types .= "s";
        }

        $sql = "SELECT * FROM books";
        if (!empty($clauses)) {
            $sql .= " WHERE " . implode(" AND ", $clauses);
        }
        $sql .= " ORDER BY created_at DESC, id DESC";

        $statement = mysqli_prepare($connection, $sql);
        if (!empty($params)) {
            mysqli_stmt_bind_param($statement, $types, ...$params);
        }
        mysqli_stmt_execute($statement);
        $result = mysqli_stmt_get_result($statement);

        $books = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $books[] = shape_book($row);
        }
        mysqli_stmt_close($statement);

        respond(200, $books);
        break;

    case 'POST':
        $values = validate(json_body(), true);

        $columns = array_keys($values);
        $placeholders = implode(", ", array_fill(0, count($columns), "?"));
        $sql = "INSERT INTO books (" . implode(", ", $columns) . ") VALUES (" . $placeholders . ")";

        $statement = mysqli_prepare($connection, $sql);
        $bound = array_values($values);
        mysqli_stmt_bind_param($statement, bind_types($columns), ...$bound);

        if (!mysqli_stmt_execute($statement)) {
            fail(500, "Could not save that book: " . mysqli_error($connection));
        }

        $newId = mysqli_insert_id($connection);
        mysqli_stmt_close($statement);

        respond(201, shape_book(find_book($connection, $newId)));
        break;

    case 'PUT':
        if ($id === null) {
            fail(400, "Which book? Add ?id= to the URL.");
        }
        if (find_book($connection, $id) === null) {
            fail(404, "No book found with that id.");
        }

        $values = validate(json_body(), false);
        if (empty($values)) {
            fail(400, "Nothing to update.");
        }

        $columns = array_keys($values);
        $assignments = array();
        foreach ($columns as $column) {
            $assignments[] = $column . " = ?";
        }

        $sql = "UPDATE books SET " . implode(", ", $assignments) . " WHERE id = ?";
        $statement = mysqli_prepare($connection, $sql);

        $bound = array_values($values);
        $bound[] = $id;
        mysqli_stmt_bind_param($statement, bind_types($columns) . "i", ...$bound);

        if (!mysqli_stmt_execute($statement)) {
            fail(500, "Could not update that book: " . mysqli_error($connection));
        }
        mysqli_stmt_close($statement);

        respond(200, shape_book(find_book($connection, $id)));
        break;

    case 'DELETE':
        if ($id === null) {
            fail(400, "Which book? Add ?id= to the URL.");
        }
        if (find_book($connection, $id) === null) {
            fail(404, "No book found with that id.");
        }

        $statement = mysqli_prepare($connection, "DELETE FROM books WHERE id = ?");
        mysqli_stmt_bind_param($statement, "i", $id);

        if (!mysqli_stmt_execute($statement)) {
            fail(500, "Could not delete that book: " . mysqli_error($connection));
        }
        mysqli_stmt_close($statement);

        respond(200, array("deleted" => $id));
        break;

    default:
        fail(405, $request_method . " is not supported on this endpoint.");
        break;
}
