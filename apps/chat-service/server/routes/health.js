const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    await pool.query('SELECT 1');
    res.json({ status: 'ok!', service: 'pintail-chat', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR!', database: 'cannot connect to db' });
  }
});

module.exports = router;
