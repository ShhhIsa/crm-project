const express = require('express');
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = (prisma) => {
  const router = express.Router();
  router.use(authMiddleware);

  router.get('/', async (req, res) => {
    try {
      const { page = 1, pageSize = 20, q } = req.query;
      const where = {
        ownerId: req.user.userId,
        ...(q ? { OR: [{ firstName: { contains: q }}, { lastName: { contains: q }}, { email: { contains: q }}] } : {})
      };
      const contacts = await prisma.contact.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: parseInt(pageSize),
        orderBy: { updatedAt: 'desc' }
      });
      res.json({ data: contacts });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const data = { ...req.body, ownerId: req.user.userId };
      const contact = await prisma.contact.create({ data });
      res.status(201).json(contact);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const contact = await prisma.contact.findUnique({ where: { id }});
    if (!contact) return res.status(404).json({ error: 'Not found' });
    res.json(contact);
  });

  router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const contact = await prisma.contact.update({ where: { id }, data: req.body });
    res.json(contact);
  });

  router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    await prisma.contact.delete({ where: { id }});
    res.status(204).send();
  });

  return router;
};