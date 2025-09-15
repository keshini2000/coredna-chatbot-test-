const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

class CoreDNAScraper {
  constructor() {
    this.pages = [
      'https://www.coredna.com/why-coredna',
      'https://www.coredna.com/ecommerce-platform',
      'https://www.coredna.com/pricing',
      'https://www.coredna.com/content-management-platform',
      'https://www.coredna.com/features'
    ];
    this.knowledgeBase = {
      pages: {},
      lastUpdated: new Date().toISOString()
    };
  }

  async init() {
    console.log('Launching browser...');
    this.browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set a realistic user agent
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  }

  async scrapePage(url) {
    try {
      console.log(`Scraping: ${url}`);
      
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      const pageData = await this.page.evaluate(() => {
        // Extract title
        const title = document.querySelector('h1')?.textContent?.trim() || 
                     document.querySelector('title')?.textContent?.trim() || 
                     'No title found';

        // Extract main content
        const contentSelectors = [
          'main',
          '.main-content',
          '.content',
          '#content',
          'article',
          '.page-content'
        ];

        let content = '';
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            content = element.innerText?.trim();
            break;
          }
        }

        // Fallback: get body text if no main content found
        if (!content) {
          content = document.body.innerText?.trim() || '';
        }

        // Extract key points from headings
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
        const keyPoints = headings
          .map(h => h.textContent?.trim())
          .filter(text => text && text.length > 0)
          .slice(0, 10); // Limit to first 10 headings

        // Extract meta description
        const metaDescription = document.querySelector('meta[name="description"]')?.content || '';

        return {
          title,
          content: content.slice(0, 5000), // Limit content length
          keyPoints,
          metaDescription
        };
      });

      // Extract page slug from URL
      const slug = url.split('/').pop() || url;
      
      return {
        url,
        slug,
        ...pageData,
        scrapedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      return {
        url,
        slug: url.split('/').pop() || url,
        title: 'Error loading page',
        content: '',
        keyPoints: [],
        metaDescription: '',
        error: error.message,
        scrapedAt: new Date().toISOString()
      };
    }
  }

  async scrapeAll() {
    await this.init();
    
    console.log(`Starting to scrape ${this.pages.length} pages...`);
    
    for (const url of this.pages) {
      const pageData = await this.scrapePage(url);
      this.knowledgeBase.pages[pageData.slug] = pageData;
      
      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await this.browser.close();
    console.log('Scraping completed!');
  }

  async saveKnowledgeBase() {
    const outputPath = path.join(__dirname, '..', 'data', 'knowledge-base.json');
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeJson(outputPath, this.knowledgeBase, { spaces: 2 });
    console.log(`Knowledge base saved to: ${outputPath}`);
    
    // Also save a summary
    const summary = {
      totalPages: Object.keys(this.knowledgeBase.pages).length,
      pages: Object.keys(this.knowledgeBase.pages),
      lastUpdated: this.knowledgeBase.lastUpdated
    };
    
    const summaryPath = path.join(__dirname, '..', 'data', 'summary.json');
    await fs.writeJson(summaryPath, summary, { spaces: 2 });
    console.log(`Summary saved to: ${summaryPath}`);
  }

  async run() {
    try {
      await this.scrapeAll();
      await this.saveKnowledgeBase();
      console.log('\n✅ CoreDNA knowledge base created successfully!');
      
      // Display summary
      const pageCount = Object.keys(this.knowledgeBase.pages).length;
      console.log(`📊 Scraped ${pageCount} pages:`);
      Object.values(this.knowledgeBase.pages).forEach(page => {
        console.log(`   • ${page.title} (${page.slug})`);
      });
      
    } catch (error) {
      console.error('❌ Scraping failed:', error.message);
      throw error;
    }
  }
}

module.exports = CoreDNAScraper;