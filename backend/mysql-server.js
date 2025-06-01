const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "your_mysql_user",
  password: "your_mysql_password",
  database: "comic_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// GET all comics
app.get("/comics", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM comics ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comics" });
  }
});

// POST a new comic
app.post("/comics", async (req, res) => {
  const { title, folder_name, cover_image, total_pages } = req.body;
  if (!title || !folder_name || !total_pages) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO comics (title, folder_name, cover_image, total_pages) VALUES (?, ?, ?, ?)",
      [title, folder_name, cover_image || "", total_pages]
    );
    res.json({ id: result.insertId, message: "Comic saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save comic" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
