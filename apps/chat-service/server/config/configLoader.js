const fs = require('fs');

// Load configuration from external config file
function loadConfig() {
  try {
    const configPath = process.env.CONFIG_PATH || '/app/config/config.json';
    const configData = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Failed to load config:', error.message);
    // Fallback configuration
    return {
      systemPrompt: 'You are a helpful assistant.',
      aiModel: 'gpt-4o-mini',
      maxHistoryMessages: 20
    };
  }
}

function getConfig() {
  return loadConfig();
}

module.exports = { getConfig };
