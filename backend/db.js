// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'comics.db');
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS comics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      folder_path TEXT,
      cover_image TEXT,
      total_pages INTEGER
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comic_id INTEGER,
      file_path TEXT,
      page_number INTEGER,
      FOREIGN KEY(comic_id) REFERENCES comics(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reading_progress (
      comic_id INTEGER,
      current_page INTEGER,
      last_read DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(comic_id)
    );
  `);
});

module.exports = db;
