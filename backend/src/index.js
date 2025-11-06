const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');

const prisma = new PrismaClient();
const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: true }));
app.use(rateLimit({ windowMs: 60_000, max: 200 }));

app.use('/api/auth', authRoutes(prisma));
app.use('/api/contacts', contactRoutes(prisma));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on ${port}`));