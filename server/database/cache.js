const { getDatabase } = require('./db');

const cacheResult = (cacheKey, data, ttlSeconds = 3600) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
    const dataString = JSON.stringify(data);
    
    db.run(
      `INSERT OR REPLACE INTO search_cache (cache_key, data, expires_at) VALUES (?, ?, ?)`,
      [cacheKey, dataString, expiresAt],
      function(err) {
        if (err) {
          console.error('Cache write error:', err);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

const getCachedResult = (cacheKey) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    
    db.get(
      `SELECT data FROM search_cache WHERE cache_key = ? AND expires_at > ?`,
      [cacheKey, now],
      (err, row) => {
        if (err) {
          console.error('Cache read error:', err);
          reject(err);
        } else if (row) {
          try {
            const data = JSON.parse(row.data);
            resolve(data);
          } catch (parseErr) {
            console.error('Cache parse error:', parseErr);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      }
    );
  });
};

const clearExpiredCache = () => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    
    db.run(
      `DELETE FROM search_cache WHERE expires_at <= ?`,
      [now],
      function(err) {
        if (err) {
          console.error('Cache cleanup error:', err);
          reject(err);
        } else {
          console.log(`Cleared ${this.changes} expired cache entries`);
          resolve(this.changes);
        }
      }
    );
  });
};

// Run cache cleanup every hour
setInterval(clearExpiredCache, 3600000);

module.exports = {
  cacheResult,
  getCachedResult,
  clearExpiredCache
};