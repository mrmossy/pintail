const express = require('express');
const cors = require('cors');
const { streamText } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const MAX_HISTORY_MESSAGES = 20;  // Limit context size
const SYSTEM_PROMPT = `You are a helpful assistant for Pintail Property Management.
You help tenants with questions about their lease, maintenance requests, rent payments,
and general property information. Be friendly, concise, and professional.`;

// Database connection
const useSsl =
  process.env.NODE_ENV === 'production' || process.env.POSTGRES_SSL === 'true';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  options: '-c search_path=app,public',
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok!', service: 'pintail-chat', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR!', database: 'disconnected' });
  }
});

// Fetch conversation history from database
async function getConversationHistory(sessionId) {
  if (!sessionId) return [];

  try {
    const result = await pool.query(
      `SELECT user_message, assistant_response
       FROM conversations
       WHERE session_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [sessionId, MAX_HISTORY_MESSAGES]
    );

    // Reverse to get chronological order, then flatten to messages array
    const messages = [];
    result.rows.reverse().forEach(row => {
      messages.push({ role: 'user', content: row.user_message });
      messages.push({ role: 'assistant', content: row.assistant_response });
    });

    return messages;
  } catch (error) {
    console.error('Failed to fetch history:', error.message);
    return [];
  }
}

// Chat endpoint with SSE streaming
app.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Send thinking indicator
    res.write(`data: ${JSON.stringify({ status: 'thinking' })}\n\n`);

    // Build messages array with history
    const history = await getConversationHistory(sessionId);
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message }
    ];

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: messages,
    });

    let fullResponse = '';

    for await (const chunk of result.textStream) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    // Log conversation to database
    try {
      await pool.query(
        'INSERT INTO conversations (session_id, user_message, assistant_response, created_at) VALUES ($1, $2, $3, NOW())',
        [sessionId || 'anonymous', message, fullResponse]
      );
    } catch (dbError) {
      console.error('Failed to log conversation:', dbError.message);
    }

    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  }

  res.end();
});

// Start new session (optional - client can call to get a fresh sessionId)
app.post('/session', async (req, res) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.json({ sessionId });
});

// Get conversation history for a session (useful for reconnecting)
app.get('/history/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const history = await getConversationHistory(sessionId);
  res.json({ sessionId, messages: history });
});

// Initialize database table
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255),
        user_message TEXT,
        assistant_response TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add index for faster session lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_session_id
      ON conversations(session_id)
    `);

    console.log('Database initialized');
  } catch (error) {
    console.error('Database init error:', error.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await initDb();
  console.log(`Pintail chat backend running on port ${PORT}`);
});
