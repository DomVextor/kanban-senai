const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/stats', auth, (req, res) => {
  const userId = req.user.id;
  
  const query = `
    SELECT 
      COUNT(*) as total_tasks,
      SUM(CASE WHEN status = 'Concluído' THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN status = 'Concluído' AND (created_at >= date('now', '-7 days') OR due_date >= date('now', '-7 days')) THEN 1 ELSE 0 END) as completed_last_7_days,
      SUM(CASE WHEN status != 'Concluído' AND due_date < date('now') THEN 1 ELSE 0 END) as overdue_tasks,
      SUM(CASE WHEN due_date = date('now') THEN 1 ELSE 0 END) as due_today
    FROM tasks
    WHERE user_id = ?
  `;
  
  db.get(query, [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

module.exports = router;
