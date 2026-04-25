const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    // We will enable foreign keys just in case
    db.run('PRAGMA foreign_keys = ON');

    db.serialize(() => {
      // Users table (added avatar)
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        avatar TEXT
      )`);

      // Try adding avatar column if table already existed (ignoring duplicate column error)
      db.run(`ALTER TABLE users ADD COLUMN avatar TEXT;`, (err) => {
        // Safe to ignore if column already exists
      });

      // Categories table
      db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        color TEXT
      )`, () => {
        // Clean up any existing duplicates (keeping the first one)
        db.run(`
          DELETE FROM categories
          WHERE id NOT IN (
              SELECT MIN(id)
              FROM categories
              GROUP BY name
          )
        `, () => {
          // Insert default categories if they still don't exist
          const defaultCategories = [
            { name: 'Trabalho', color: 'bg-blue-100 text-blue-700' },
            { name: 'Pessoal', color: 'bg-emerald-100 text-emerald-700' },
            { name: 'Estudos', color: 'bg-purple-100 text-purple-700' },
            { name: 'Casa', color: 'bg-amber-100 text-amber-700' }
          ];

          const stmt = db.prepare('INSERT INTO categories (name, color) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = ?)');
          defaultCategories.forEach(cat => {
            stmt.run([cat.name, cat.color, cat.name]);
          });
          stmt.finalize();
        });
      });

      // Tasks table
      db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        description TEXT,
        due_date TEXT,
        priority TEXT DEFAULT 'Medium', -- High, Medium, Low
        status TEXT DEFAULT 'A Fazer', -- 'A Fazer', 'Em Andamento', 'Concluído'
        category_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(category_id) REFERENCES categories(id)
      )`);

      // Tags table (added user_id)
      db.run(`CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        color TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);
      
      db.run(`ALTER TABLE tags ADD COLUMN user_id INTEGER REFERENCES users(id);`, (err) => {});

      // Task_Tags pivot table
      db.run(`CREATE TABLE IF NOT EXISTS task_tags (
        task_id INTEGER,
        tag_id INTEGER,
        FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, tag_id)
      )`);
    });
  }
});

module.exports = db;
