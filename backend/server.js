// server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

// Add comic
app.post('/comics', (req, res) => {
  const { title, folder_path, cover_image, total_pages } = req.body;
  db.run(
    `INSERT INTO comics (title, folder_path, cover_image, total_pages)
     VALUES (?, ?, ?, ?)`,
    [title, folder_path, cover_image, total_pages],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.send({ id: this.lastID });
    }
  );
});

// Get comics
app.get('/comics', (req, res) => {
  db.all(`SELECT * FROM comics`, (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.send(rows);
  });
});

// Add reading progress
app.post('/progress', (req, res) => {
  const { comic_id, current_page } = req.body;
  db.run(
    `INSERT OR REPLACE INTO reading_progress (comic_id, current_page, last_read)
     VALUES (?, ?, datetime('now'))`,
    [comic_id, current_page],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.send({ status: 'ok' });
    }
  );
});

// Get progress
app.get('/progress/:comic_id', (req, res) => {
  db.get(
    `SELECT * FROM reading_progress WHERE comic_id = ?`,
    [req.params.comic_id],
    (err, row) => {
      if (err) return res.status(500).send(err.message);
      res.send(row);
    }
  );
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
