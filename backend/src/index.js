const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');

const prisma = new PrismaClient();
const app = express();

// Trust first proxy (required on platforms like Railway so express-rate-limit can use X-Forwarded-For)
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: true }));

// rate limiter (trust proxy must be set before this)
app.use(rateLimit({ windowMs: 60_000, max: 200 }));

app.use('/api/auth', authRoutes(prisma));
app.use('/api/contacts', contactRoutes(prisma));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Root route to avoid "Cannot GET /" in the browser
app.get('/', (req, res) => {
  res.status(200).send('API running — visita /api para endpoints');
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on ${port}`));