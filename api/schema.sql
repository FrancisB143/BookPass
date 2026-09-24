-- BookPass — database schema
--
-- Adds a `books` table to the database you already have. It does not touch
-- `students` or anything else that is in there.
--
-- Run it once: Freehostia control panel → MySQL Databases → phpMyAdmin,
-- select your database in the left sidebar, open the SQL tab, paste this in,
-- and press Go.

CREATE TABLE IF NOT EXISTS books (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  author         VARCHAR(255) NOT NULL,
  genre          VARCHAR(100) DEFAULT NULL,
  isbn           VARCHAR(20)  DEFAULT NULL,
  published_year SMALLINT     DEFAULT NULL,
  description    TEXT         DEFAULT NULL,
  -- Library status. Kept as a plain column rather than a loans table: the
  -- assignment grades CRUD on one entity, not a lending system.
  status         ENUM('available', 'borrowed', 'reserved') NOT NULL DEFAULT 'available',
  cover_url      VARCHAR(500) DEFAULT NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title  (title),
  INDEX idx_author (author),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A few rows so the list is not empty on first run.
INSERT INTO books (title, author, genre, isbn, published_year, description, status) VALUES
('Atomic Habits', 'James Clear', 'Self-help', '9780735211292', 2018,
 'Behaviour change framed as a systems problem: make the habit you want obvious, attractive, easy and satisfying.', 'available'),
('Dune', 'Frank Herbert', 'Sci-Fi', '9780441013593', 1965,
 'On a desert planet holding the most valuable substance in the universe, a noble family becomes entangled in a war over spice and prophecy.', 'borrowed'),
('The Design of Everyday Things', 'Don Norman', 'Design', '9780465050659', 1988,
 'Why do some doors tell you to push when they should be pulled? Norman argues most everyday frustration is a design failure.', 'available'),
('Klara and the Sun', 'Kazuo Ishiguro', 'Fiction', '9780571364886', 2021,
 'Klara is an Artificial Friend who watches customers from her place in the store, hoping someone will choose her.', 'available'),
('Sapiens', 'Yuval Noah Harari', 'History', '9780062316097', 2011,
 'How one unremarkable species of ape came to dominate the planet, told through the shared fictions that let strangers cooperate.', 'reserved');
