const express = require('express');
const cors = require('cors');
const { pool, initDb } = require('./database/pool');
const healthRouter = require('./routes/health');
const chatRouter = require('./routes/chat');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));
app.use(express.json());

// Make pool available to routes
app.set('pool', pool);

// Mount routes
app.use('/health', healthRouter);
app.use('/chat', chatRouter);
app.use('/session', chatRouter);
app.use('/history', chatRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await initDb();
  console.log(`Pintail chat backend running on port ${PORT}`);
});
