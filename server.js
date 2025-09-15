const express = require('express');
const cors = require('cors');
const path = require('path');
const CoreDNAChatbot = require('./chatbot/chatbot');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize chatbot
const chatbot = new CoreDNAChatbot();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }

    // Process the message
    const response = await chatbot.processMessage(message);
    
    // Add timestamp and session info
    const chatResponse = {
      ...response,
      timestamp: new Date().toISOString(),
      sessionId: sessionId || 'default'
    };

    res.json(chatResponse);
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Sorry, I encountered an error. Please try again.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CoreDNA Chatbot'
  });
});

// Topics endpoint - get available topics
app.get('/api/topics', (req, res) => {
  try {
    const topics = chatbot.knowledge.getTopics();
    res.json({
      topics,
      count: topics.length
    });
  } catch (error) {
    console.error('Topics error:', error);
    res.status(500).json({ error: 'Failed to load topics' });
  }
});

// Knowledge endpoint - get specific page content
app.get('/api/knowledge/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const content = chatbot.knowledge.getPageContent(slug);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Knowledge error:', error);
    res.status(500).json({ error: 'Failed to load content' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Something went wrong!',
    message: 'Please try again later.'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🤖 CoreDNA Chatbot Server');
  console.log('=========================');
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}/api/chat`);
  console.log(`📋 Topics at: http://localhost:${PORT}/api/topics`);
  console.log(`💬 Chat interface: http://localhost:${PORT}`);
  console.log('=========================');
});

module.exports = app;