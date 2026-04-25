const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET all categories
router.get('/', auth, (req, res) => {
  // We return all categories. If we had user_id we'd filter by user_id OR global ones.
  // For the MVP, we assume categories are shared/global.
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST new category
router.post('/', auth, (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });

  const query = 'INSERT INTO categories (name, color) VALUES (?, ?)';
  db.run(query, [name, color || 'bg-zinc-100 text-zinc-700'], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Já existe uma categoria com este nome.' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name, color });
  });
});

// PUT update category
router.put('/:id', auth, (req, res) => {
  const id = req.params.id;
  const { name, color } = req.body;
  
  if (!name) return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });

  const query = 'UPDATE categories SET name = ?, color = ? WHERE id = ?';
  db.run(query, [name, color || 'bg-zinc-100 text-zinc-700', id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Já existe uma categoria com este nome.' });
      }
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Categoria não encontrada.' });
    res.json({ success: true });
  });
});

// DELETE category
router.delete('/:id', auth, (req, res) => {
  const id = req.params.id;

  // Verify if it's being used by any task
  db.get('SELECT COUNT(*) as count FROM tasks WHERE category_id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row && row.count > 0) {
      return res.status(400).json({ error: `Não é possível deletar. Esta categoria está associada a ${row.count} tarefa(s).` });
    }

    db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Categoria não encontrada.' });
      res.json({ success: true });
    });
  });
});

module.exports = router;
