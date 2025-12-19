const express = require("express");
const path = require("path");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== SQLite file =====
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "todos.db");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new sqlite3.Database(DB_PATH);

// tạo bảng nếu chưa có
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== API: list =====
app.get("/api/todos", (req, res) => {
  db.all(
    "SELECT id, title, completed, created_at FROM todos ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const data = rows.map((r) => ({
        id: r.id,
        title: r.title,
        completed: !!r.completed,
        created_at: r.created_at,
      }));
      res.json(data);
    }
  );
});

// ===== API: create =====
app.post("/api/todos", (req, res) => {
  const title = (req.body.title || "").trim();
  if (!title) return res.status(400).json({ error: "Missing title" });

  const createdAt = new Date().toISOString();
  db.run(
    "INSERT INTO todos (title, completed, created_at) VALUES (?, 0, ?)",
    [title, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: this.lastID,
        title,
        completed: false,
        created_at: createdAt,
      });
    }
  );
});

// ===== API: update (title/completed) =====
app.put("/api/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const title = req.body.title;
  const completed = req.body.completed;

  db.get("SELECT * FROM todos WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Not found" });

    const newTitle =
      title !== undefined ? String(title).trim() : row.title;
    const newCompleted =
      completed !== undefined ? (completed ? 1 : 0) : row.completed;

    if (!newTitle) return res.status(400).json({ error: "Missing title" });

    db.run(
      "UPDATE todos SET title = ?, completed = ? WHERE id = ?",
      [newTitle, newCompleted, id],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({
          id,
          title: newTitle,
          completed: !!newCompleted,
          created_at: row.created_at,
        });
      }
    );
  });
});

// ===== API: delete =====
app.delete("/api/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  db.run("DELETE FROM todos WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: 1 });
  });
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => console.log("Server listening on port " + PORT));
