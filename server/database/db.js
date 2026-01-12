const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, 'search_cache.db');
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      
      console.log('Connected to SQLite database');
      
      // Create cache table
      db.run(`
        CREATE TABLE IF NOT EXISTS search_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cache_key TEXT UNIQUE NOT NULL,
          data TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
      `, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

const closeDatabase = () => {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase
};