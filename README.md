# CoreDNA Chatbot

An intelligent chatbot with CoreDNA-branded UI that answers questions about CoreDNA's platform, pricing, and features using scraped website content.

## 🎯 Purpose

This project combines web scraping and chatbot technology to create an intelligent assistant that can answer customer inquiries about CoreDNA's services using real content from the website.

## ✨ Features

- **🤖 Smart Chatbot**: Intelligent responses about CoreDNA pricing, features, and platform
- **🎨 Branded UI**: Beautiful web interface with CoreDNA colors (red, white, black)
- **🔍 Knowledge Base**: Auto-scraped content from 5 key CoreDNA pages
- **💬 Web Interface**: Interactive chat at http://localhost:3000
- **🚀 REST API**: `/api/chat` endpoint for integration

## 📊 Knowledge Sources

The chatbot uses content scraped from:
- `/why-coredna` - Company overview and value proposition
- `/ecommerce-platform` - eCommerce platform features  
- `/pricing` - Pricing plans and comparison
- `/content-management-platform` - CMS capabilities
- `/features` - Product features overview

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation
```bash
git clone https://github.com/keshini2000/coredna-chatbot-test-.git
cd coredna-chatbot-test-
npm install
```

> **👉 Try the live demo**: https://coredna-chatbot-test-8zxbsrskf-keshs-projects-1c7038fb.vercel.app/

### Usage
```bash
# Start the chatbot server
npm start

# Update knowledge base (scrape latest content)
npm run scrape
```

## 🌐 Access the Chatbot

- **🌍 Live Demo**: https://coredna-chatbot-test-8zxbsrskf-keshs-projects-1c7038fb.vercel.app/
- **🏠 Local Development**: http://localhost:3000
- **📡 API Endpoint**: `/api/chat`

## 💬 What the Chatbot Can Answer

- **Pricing Questions**: "What are CoreDNA's pricing plans?"
- **Feature Inquiries**: "What features does CoreDNA offer?"
- **eCommerce**: "How does CoreDNA eCommerce work?"
- **General**: "What is CoreDNA?", "How does it compare?"
- **Help**: "What can you help with?"

## 🛠️ Technical Stack

- **Backend**: Node.js + Express.js
- **Scraping**: Puppeteer for dynamic content
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Search**: Intelligent keyword matching and scoring
- **UI**: Custom CSS with CoreDNA brand colors

## 📁 Project Structure

```
coredna-chatbot/
├── 🤖 chatbot/              # Smart chatbot logic
├── 🌐 public/               # Web interface (HTML/CSS/JS)
├── 📊 data/                 # Knowledge base (JSON)
├── 🔧 scraper/              # Web scraping logic
├── 🚀 server.js             # Express API server
└── 📖 README.md             # This file
```

## 🎨 UI Design

- **CoreDNA Red**: Primary brand color for headers and buttons
- **Clean White**: Chat background for readability
- **Black Accents**: Professional contrast elements
- **Custom Robot**: CSS-designed mascot matching CoreDNA style

## 📡 API Reference

### POST /api/chat
```javascript
// Request
{
  "message": "Tell me about pricing",
  "sessionId": "optional-session-id"
}

// Response
{
  "message": "Here's information about CoreDNA's pricing:",
  "type": "pricing",
  "content": { "plans": [...], "highlights": [...] },
  "timestamp": "2025-09-15T07:53:01.239Z"
}
```

### Other Endpoints
- `GET /api/topics` - Available knowledge topics
- `GET /api/knowledge/:slug` - Specific page content
- `GET /api/health` - Health check

## 🔄 Updating Content

To refresh with latest website content:
```bash
npm run scrape
```

This updates the knowledge base with fresh content from CoreDNA's website.

---

Built with ❤️ for CoreDNA customer success
