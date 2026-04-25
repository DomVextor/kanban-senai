const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(`
    DELETE FROM categories
    WHERE id NOT IN (
        SELECT MIN(id)
        FROM categories
        GROUP BY name
    )
  `, function(err) {
    if (err) {
      console.error("Cleanup error:", err);
    } else {
      console.log("Cleanup success! Removed " + this.changes + " duplicate categories.");
    }
  });
});
