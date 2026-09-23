<?php
/**
 * Shared database connection and JSON helpers.
 *
 * Everything that talks to MySQL goes through here, so the connection is
 * configured in exactly one place.
 */

declare(strict_types=1);

// The app runs from a different origin (Expo dev server, or the phone), so the
// browser needs permission before it will let JavaScript read the response.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Browsers send a preflight OPTIONS request before PUT and DELETE. It carries
// no body and expects nothing back but the headers above.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/** Sends a JSON response and stops. */
function respond($status, $payload)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/** Sends an error in the same shape every time, so the app can rely on it. */
function fail($status, $message)
{
    respond($status, ['error' => $message]);
}

/** Opens the database connection, or reports why it could not. */
function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $configPath = __DIR__ . '/config.php';
    if (!file_exists($configPath)) {
        fail(500, 'config.php is missing. Copy config.example.php to config.php and fill it in.');
    }

    $config = require $configPath;
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $config['host'],
        $config['database'],
        $config['charset'] ?? 'utf8mb4'
    );

    try {
        $pdo = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // Real prepared statements, so a quote in a book title cannot
            // change what the query means.
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        fail(500, 'Could not connect to the database: ' . $e->getMessage());
    }

    return $pdo;
}

/**
 * Reads the request body as JSON.
 *
 * PHP only populates $_POST for form encoding, and never for PUT or DELETE,
 * so the raw stream is read directly.
 */
function jsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        fail(400, 'The request body was not valid JSON.');
    }

    return $decoded;
}
