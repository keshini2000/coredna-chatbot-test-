const fs = require('fs-extra');
const path = require('path');

class KnowledgeSearch {
  constructor() {
    this.knowledgeBase = null;
    this.loadKnowledgeBase();
  }

  async loadKnowledgeBase() {
    try {
      const kbPath = path.join(__dirname, '..', 'data', 'knowledge-base.json');
      this.knowledgeBase = await fs.readJson(kbPath);
      console.log('✅ Knowledge base loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load knowledge base:', error.message);
      this.knowledgeBase = { pages: {} };
    }
  }

  // Simple keyword matching with scoring
  searchContent(query) {
    if (!this.knowledgeBase || !this.knowledgeBase.pages) {
      return [];
    }

    const searchTerms = query.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(term => term.length > 2); // Only words longer than 2 chars

    const results = [];

    Object.entries(this.knowledgeBase.pages).forEach(([slug, page]) => {
      let score = 0;
      const content = `${page.title} ${page.content} ${page.metaDescription}`.toLowerCase();
      const keyPoints = page.keyPoints.join(' ').toLowerCase();

      searchTerms.forEach(term => {
        // Title matches get highest score
        if (page.title.toLowerCase().includes(term)) {
          score += 10;
        }
        
        // Key points get medium score
        if (keyPoints.includes(term)) {
          score += 5;
        }
        
        // Content matches get base score
        const matches = (content.match(new RegExp(term, 'g')) || []).length;
        score += matches;
      });

      if (score > 0) {
        results.push({
          slug,
          page,
          score,
          relevantPoints: this.extractRelevantPoints(page, searchTerms)
        });
      }
    });

    // Sort by score (highest first) and return top 3
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  extractRelevantPoints(page, searchTerms) {
    const points = [];
    
    // Add relevant key points
    page.keyPoints.forEach(point => {
      if (searchTerms.some(term => point.toLowerCase().includes(term))) {
        points.push(point);
      }
    });

    // Extract relevant sentences from content
    const sentences = page.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    sentences.forEach(sentence => {
      const matches = searchTerms.filter(term => 
        sentence.toLowerCase().includes(term)
      ).length;
      
      if (matches >= 2 || (matches >= 1 && sentence.length < 200)) {
        points.push(sentence.trim());
      }
    });

    return points.slice(0, 5); // Limit to 5 most relevant points
  }

  // Get specific page content
  getPageContent(slug) {
    if (!this.knowledgeBase || !this.knowledgeBase.pages[slug]) {
      return null;
    }
    return this.knowledgeBase.pages[slug];
  }

  // Get all available topics
  getTopics() {
    if (!this.knowledgeBase) return [];
    
    return Object.entries(this.knowledgeBase.pages).map(([slug, page]) => ({
      slug,
      title: page.title,
      description: page.metaDescription || page.keyPoints[0] || ''
    }));
  }

  // Search for specific topics
  searchByCategory(category) {
    const categoryMap = {
      'pricing': ['pricing'],
      'features': ['features'],
      'ecommerce': ['ecommerce-platform'],
      'cms': ['content-management-platform'],
      'why': ['why-coredna'],
      'about': ['why-coredna']
    };

    const slugs = categoryMap[category.toLowerCase()] || [];
    return slugs.map(slug => this.getPageContent(slug)).filter(Boolean);
  }
}

module.exports = KnowledgeSearch;