const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("users.db", (err) => {
  if (err) {
    console.error("DB connection error:", err.message);
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT,
    password TEXT
  )
`);

module.exports = db;
