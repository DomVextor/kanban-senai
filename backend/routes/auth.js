const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkanban';

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });

    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, hash], function(err) {
      if (err) return res.status(400).json({ error: 'Email already exists' });
      
      const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: this.lastID, name, email, avatar: null } });
    });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'User not found' });

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
    });
  });
});

module.exports = router;
