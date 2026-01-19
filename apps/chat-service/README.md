# Chat Backend

Express.js API for the Pintail Property Management chat service. Provides real-time streaming chat powered by OpenAI with conversation history persistence to PostgreSQL.

## Features

- **Server-Sent Events (SSE) streaming** - Real-time chat responses
- **Conversation history** - Persistent storage and retrieval of chat sessions
- **Configurable AI model** - Easily switch between different OpenAI models
- **Dynamic system prompt** - Update prompt without rebuilding the container
- **Health checks** - Database connectivity monitoring

## Configuration

Configuration is managed through a single JSON file: `config/config.json`

### config.json

```json
{
  "systemPrompt": "Your assistant instructions here...",
  "aiModel": "gpt-4o-mini",
  "maxHistoryMessages": 20
}
```

**Parameters:**
- `systemPrompt` - System instructions for the AI assistant (supports multi-line strings)
- `aiModel` - OpenAI model to use (e.g., `gpt-4o-mini`, `gpt-4-turbo`, `gpt-4o`)
- `maxHistoryMessages` - Number of previous messages to include in context
- Additional parameters can be added as needed for future enhancements

**Note:** Configuration is loaded on each request, so changes to `config.json` are reflected immediately without restarting the container.

## Environment Variables

Required environment variables (typically set in `docker-compose.yml`):

```
NODE_ENV              # 'development' or 'production'
OPENAI_API_KEY        # OpenAI API key
POSTGRES_HOST         # Database host
POSTGRES_PORT         # Database port (default: 5432)
POSTGRES_DB           # Database name
POSTGRES_USER         # Database user
POSTGRES_PASSWORD     # Database password
POSTGRES_SSL          # 'true' for SSL connections (production)
CONFIG_PATH           # Path to config.json (default: /app/config/config.json)
PORT                  # Server port (default: 3000)
```

## API Endpoints

### `POST /chat`

Stream chat responses with conversation history.

**Request:**
```json
{
  "message": "Your question here",
  "sessionId": "optional-session-id"
}
```

**Response:** Server-Sent Events stream
```
data: {"status":"thinking"}
data: {"text":"Part of response"}
data: {"text":" continues here..."}
data: [DONE]
```

### `POST /session`

Create a new chat session.

**Response:**
```json
{
  "sessionId": "session_1705420800000_abc123def456"
}
```

### `GET /history/:sessionId`

Retrieve conversation history for a session.

**Response:**
```json
{
  "sessionId": "session_...",
  "messages": [
    {"role": "user", "content": "First message"},
    {"role": "assistant", "content": "First response"},
    ...
  ]
}
```

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok!",
  "service": "pintail-chat",
  "database": "connected"
}
```

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- OpenAI API key

### Local Setup

```bash
# Install dependencies
npm install

# Set environment variables
export OPENAI_API_KEY=your_key_here
export POSTGRES_HOST=localhost
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=password
export POSTGRES_DB=pintail_chat

# Start server
npm start
```

### Docker

Build and run via docker-compose (from `infra/` directory):

```bash
./start.sh
```

## Database Schema

The app automatically creates the required table on startup:

```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  user_message TEXT,
  assistant_response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_session_id ON conversations(session_id);
```

## Architecture

- **Config Loading** - Reads `config/config.json` on each request for dynamic configuration
- **Database** - PostgreSQL connection pool for efficient query management
- **AI Integration** - Vercel AI SDK with OpenAI provider
- **Streaming** - SSE for real-time response streaming
- **Error Handling** - Graceful fallbacks and error logging

## Troubleshooting

**Config not loading:**
- Check that `config/config.json` exists and is valid JSON
- Verify the volume mount in docker-compose.yml
- Check server logs for parsing errors

**Database connection issues:**
- Ensure PostgreSQL is running and accessible
- Verify environment variables are set correctly
- Check that the database and user exist

**Chat endpoint returns errors:**
- Verify OPENAI_API_KEY is set and valid
- Check OpenAI API status
- Ensure aiModel in config.json is a valid model name
