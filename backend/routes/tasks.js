const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper to sync tags for a task
const syncTags = (taskId, userId, tagsArray, callback) => {
  if (!tagsArray || tagsArray.length === 0) {
    db.run('DELETE FROM task_tags WHERE task_id = ?', [taskId], callback);
    return;
  }

  // Clear existing tags
  db.run('DELETE FROM task_tags WHERE task_id = ?', [taskId], (err) => {
    if (err) return callback(err);

    let completed = 0;
    let hasError = false;

    tagsArray.forEach(tagName => {
      tagName = tagName.trim();
      if (!tagName) {
        completed++;
        if (completed === tagsArray.length) callback(null);
        return;
      }

      // Find or create tag
      db.get('SELECT id FROM tags WHERE name = ? AND user_id = ?', [tagName, userId], (err, row) => {
        if (err) { hasError = true; return callback(err); }

        if (row) {
          db.run('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)', [taskId, row.id], () => {
            completed++;
            if (completed === tagsArray.length && !hasError) callback(null);
          });
        } else {
          db.run('INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)', [userId, tagName, 'bg-zinc-100 text-zinc-700'], function(err) {
            if (err) { hasError = true; return callback(err); }
            db.run('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)', [taskId, this.lastID], () => {
              completed++;
              if (completed === tagsArray.length && !hasError) callback(null);
            });
          });
        }
      });
    });
  });
};

// Get all tasks for user, including tags and category name
router.get('/', auth, (req, res) => {
  const query = `
    SELECT t.*, c.name as category_name
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
    ORDER BY t.due_date ASC
  `;
  
  db.all(query, [req.user.id], (err, tasks) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Fetch tags for these tasks
    db.all(`
      SELECT tt.task_id, tg.name, tg.color 
      FROM task_tags tt 
      JOIN tags tg ON tt.tag_id = tg.id 
      WHERE tg.user_id = ?
    `, [req.user.id], (err, tags) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const tasksWithTags = tasks.map(task => {
        task.tags = tags.filter(t => t.task_id === task.id);
        return task;
      });
      
      res.json(tasksWithTags);
    });
  });
});

// Create task
router.post('/', auth, (req, res) => {
  const { title, description, due_date, priority, status, category_id, tags } = req.body;
  if (!title) return res.status(400).json({ error: 'Título é obrigatório' });

  const insert = 'INSERT INTO tasks (user_id, title, description, due_date, priority, status, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  db.run(insert, [req.user.id, title, description, due_date, priority || 'Medium', status || 'A Fazer', category_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    const newTaskId = this.lastID;
    
    // Handle tags
    if (tags && Array.isArray(tags)) {
      syncTags(newTaskId, req.user.id, tags, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: newTaskId });
      });
    } else {
      res.json({ id: newTaskId });
    }
  });
});

// Update task
router.put('/:id', auth, (req, res) => {
  const { title, description, due_date, priority, status, category_id, tags } = req.body;
  if (!title) return res.status(400).json({ error: 'Título é obrigatório' });
  
  db.run(
    'UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, status = ?, category_id = ? WHERE id = ? AND user_id = ?',
    [title, description, due_date, priority, status, category_id, req.params.id, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
      
      // Handle tags
      if (tags && Array.isArray(tags)) {
        syncTags(req.params.id, req.user.id, tags, (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        });
      } else {
        syncTags(req.params.id, req.user.id, [], () => {
          res.json({ success: true });
        });
      }
    }
  );
});

// Delete task
router.delete('/:id', auth, (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json({ success: true });
  });
});

module.exports = router;
