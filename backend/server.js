const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = 3000;
const SECRET = 'secret_key';

app.use(cors());
app.use(bodyParser.json());

// Signup
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed], (err) => {
    if (err) return res.status(400).json({ message: 'User already exists' });
    res.json({ message: 'Signup successful' });
  });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, results[0].password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: results[0].id }, SECRET);
    res.json({ token });
  });
});

// Save history
app.post('/save', (req, res) => {
  const { token, wpm, accuracy, timer } = req.body;
  try {
    const decoded = jwt.verify(token, SECRET);
    db.query('INSERT INTO history (user_id, wpm, accuracy, timer) VALUES (?, ?, ?, ?)', [decoded.userId, wpm, accuracy, timer], () => {
      res.json({ message: 'Saved' });
    });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Get history
app.get('/history', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, SECRET);
    db.query('SELECT wpm, accuracy, timer, created_at FROM history WHERE user_id = ? ORDER BY created_at DESC', [decoded.userId], (err, results) => {
      if (err) return res.status(500).json({ message: 'Error fetching history' });
      res.json(results);
    });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
