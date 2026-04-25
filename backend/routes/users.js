const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Define Multer storage for Avatar
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Get current user profile
router.get('/me', auth, (req, res) => {
  db.get('SELECT id, name, email, avatar FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Also fetch basic stats for profile
    db.get('SELECT count(*) as total FROM tasks WHERE user_id = ?', [req.user.id], (err, countRow) => {
      user.total_tasks = countRow ? countRow.total : 0;
      res.json(user);
    });
  });
});

// Update Profile logic (Only Avatar for now)
router.post('/avatar', auth, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const avatarUrl = '/uploads/avatars/' + req.file.filename;

  db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, avatar: avatarUrl });
  });
});

module.exports = router;
