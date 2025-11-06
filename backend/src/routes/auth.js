const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (prisma) => {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Missing email/password' });

      const existing = await prisma.user.findUnique({ where: { email }});
      if (existing) return res.status(409).json({ error: 'User exists' });

      const hash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { email, password: hash, name }});
      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'devsecret');
      res.json({ token, user: { id: user.id, email: user.email, name: user.name }});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email }});
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'devsecret');
      res.json({ token, user: { id: user.id, email: user.email, name: user.name }});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};