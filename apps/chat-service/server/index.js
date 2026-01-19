const express = require('express');
const path = require('path');
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

// Host the widget assets and test page from /widget
app.use('/widget', express.static(path.join(__dirname, '..', 'widget')));

// Make pool available to routes
app.set('pool', pool);

// Mount routes
app.use('/health', healthRouter);
app.use('/', chatRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await initDb();
  console.log(`Pintail chat backend running on port ${PORT}`);
});
