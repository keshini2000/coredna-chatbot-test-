const KnowledgeSearch = require('./knowledgeSearch');

class CoreDNAChatbot {
  constructor() {
    this.knowledge = new KnowledgeSearch();
    this.greetings = [
      'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'
    ];
    this.goodbyes = [
      'bye', 'goodbye', 'see you', 'farewell', 'thanks', 'thank you'
    ];
  }

  async processMessage(message) {
    const query = message.trim().toLowerCase();
    
    // Handle greetings
    if (this.isGreeting(query)) {
      return this.getGreetingResponse();
    }

    // Handle goodbyes
    if (this.isGoodbye(query)) {
      return this.getGoodbyeResponse();
    }

    // Handle help requests
    if (this.isHelpRequest(query)) {
      return this.getHelpResponse();
    }

    // Handle specific topic requests
    const topicResponse = this.handleTopicRequest(query);
    if (topicResponse) {
      return topicResponse;
    }

    // Search knowledge base
    const searchResults = this.knowledge.searchContent(message);
    
    if (searchResults.length === 0) {
      return this.getNoResultsResponse(message);
    }

    return this.formatSearchResponse(searchResults, message);
  }

  isGreeting(query) {
    return this.greetings.some(greeting => query.includes(greeting));
  }

  isGoodbye(query) {
    return this.goodbyes.some(goodbye => query.includes(goodbye));
  }

  isHelpRequest(query) {
    const helpKeywords = ['help', 'what can you do', 'how can you help', 'what do you know'];
    return helpKeywords.some(keyword => query.includes(keyword));
  }

  getGreetingResponse() {
    return {
      message: "Hello! I'm the CoreDNA assistant. I can help you learn about CoreDNA's platform, pricing, features, and more. What would you like to know?",
      type: 'greeting',
      suggestions: [
        "What is CoreDNA?",
        "Tell me about pricing",
        "What features does CoreDNA offer?",
        "How does CoreDNA eCommerce work?"
      ]
    };
  }

  getGoodbyeResponse() {
    return {
      message: "Thank you for your interest in CoreDNA! If you have more questions, feel free to ask anytime or contact our team directly.",
      type: 'goodbye'
    };
  }

  getHelpResponse() {
    const topics = this.knowledge.getTopics();
    return {
      message: "I can help you with information about CoreDNA! Here are the main topics I know about:",
      type: 'help',
      topics: topics.map(topic => ({
        title: topic.title,
        description: topic.description.slice(0, 100) + '...'
      })),
      suggestions: [
        "What are CoreDNA's pricing plans?",
        "How does CoreDNA compare to other platforms?",
        "What eCommerce features are available?",
        "Tell me about the CMS capabilities"
      ]
    };
  }

  handleTopicRequest(query) {
    // Direct topic requests
    if (query.includes('pricing') || query.includes('cost') || query.includes('price')) {
      const pricingInfo = this.knowledge.searchByCategory('pricing')[0];
      if (pricingInfo) {
        return {
          message: "Here's information about CoreDNA's pricing:",
          type: 'pricing',
          content: this.extractPricingInfo(pricingInfo),
          source: pricingInfo.title
        };
      }
    }

    if (query.includes('feature') || query.includes('capability') || query.includes('function')) {
      const featuresInfo = this.knowledge.searchByCategory('features')[0];
      if (featuresInfo) {
        return {
          message: "Here are CoreDNA's key features:",
          type: 'features',
          content: this.extractFeaturesList(featuresInfo),
          source: featuresInfo.title
        };
      }
    }

    if (query.includes('ecommerce') || query.includes('e-commerce') || query.includes('online store')) {
      const ecommerceInfo = this.knowledge.searchByCategory('ecommerce')[0];
      if (ecommerceInfo) {
        return {
          message: "Here's what CoreDNA offers for eCommerce:",
          type: 'ecommerce',
          content: this.extractKeyPoints(ecommerceInfo),
          source: ecommerceInfo.title
        };
      }
    }

    return null;
  }

  extractPricingInfo(page) {
    const content = page.content;
    const plans = [];
    
    // Extract pricing tiers
    if (content.includes('$1250/month')) {
      plans.push('💼 CMS Plan: From $1,250/month - Includes 100k requests, content applications, API access');
    }
    if (content.includes('$2450/month')) {
      plans.push('🛒 eCommerce Plan: From $2,450/month - Includes 300k requests, all CMS features, plus eCommerce tools');
    }
    if (content.includes('Enterprise')) {
      plans.push('🏢 Enterprise DXP: Custom pricing - Multi-site, dedicated infrastructure, custom integrations');
    }

    return {
      plans,
      highlights: [
        '✅ No transaction fees',
        '✅ Transparent pricing that scales',
        '✅ All plans include pre-built applications',
        '✅ Continuous support & training included'
      ]
    };
  }

  extractFeaturesList(page) {
    return {
      keyFeatures: page.keyPoints.slice(0, 6),
      highlights: [
        '🎯 All-in-one platform',
        '⚡ Fast setup, no learning curve', 
        '🔧 Custom fit, no compromises',
        '📈 Future-proof flexibility',
        '🛠️ Managed services included'
      ]
    };
  }

  extractKeyPoints(page) {
    return {
      mainPoints: page.keyPoints.slice(0, 5),
      description: page.metaDescription
    };
  }

  formatSearchResponse(results, originalQuery) {
    const topResult = results[0];
    
    return {
      message: `Based on your question about "${originalQuery}", here's what I found:`,
      type: 'search',
      mainResult: {
        title: topResult.page.title,
        source: topResult.page.url,
        relevantInfo: topResult.relevantPoints.slice(0, 3)
      },
      additionalResults: results.slice(1).map(result => ({
        title: result.page.title,
        snippet: result.relevantPoints[0] || result.page.metaDescription
      })),
      suggestions: this.generateFollowUpSuggestions(topResult.slug)
    };
  }

  generateFollowUpSuggestions(slug) {
    const suggestions = {
      'pricing': ['What features are included?', 'How does pricing compare to competitors?'],
      'features': ['Tell me about eCommerce features', 'What about content management?'],
      'ecommerce-platform': ['What are the pricing options?', 'How does setup work?'],
      'content-management-platform': ['What are the key features?', 'How easy is it to use?'],
      'why-coredna': ['What makes CoreDNA different?', 'Show me pricing plans']
    };

    return suggestions[slug] || ['Tell me more about CoreDNA', 'What are the pricing options?'];
  }

  getNoResultsResponse(query) {
    return {
      message: `I couldn't find specific information about "${query}", but I can help you with these CoreDNA topics:`,
      type: 'no_results',
      suggestions: [
        'What is CoreDNA?',
        'Pricing information',
        'Platform features',
        'eCommerce capabilities',
        'Content management'
      ]
    };
  }
}

module.exports = CoreDNAChatbot;