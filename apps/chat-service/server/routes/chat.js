const express = require('express');
const { streamText } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { getConfig } = require('../config/configLoader');

const router = express.Router();

// Fetch conversation history from database
async function getConversationHistory(pool, sessionId) {
  if (!sessionId) return [];

  try {
    const config = getConfig();
    const result = await pool.query(
      `SELECT user_message, assistant_response
       FROM conversations
       WHERE session_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [sessionId, config.maxHistoryMessages]
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
router.post('/chat', async (req, res) => {
  const message = req.body.message || req.body.text || req.body.input || req.body.chatInput;
  const { sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Set SSE headers with CORS
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    // Send thinking indicator
    res.write(`data: ${JSON.stringify({ status: 'thinking' })}\n\n`);

    // Load config for this request
    const config = getConfig();

    // Build messages array with history
    const pool = req.app.get('pool');
    const history = await getConversationHistory(pool, sessionId);
    const messages = [
      { role: 'system', content: config.systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    const result = await streamText({
      model: openai(config.aiModel),
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
router.post('/session', async (req, res) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.json({ sessionId });
});

// Get conversation history for a session (useful for reconnecting)
router.get('/history/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const pool = req.app.get('pool');
  const history = await getConversationHistory(pool, sessionId);
  res.json({ sessionId, messages: history });
});

module.exports = router;
