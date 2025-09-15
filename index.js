const CoreDNAScraper = require('./scraper/scraper');

async function main() {
  console.log('🚀 CoreDNA Knowledge Base Scraper');
  console.log('==================================');
  
  const scraper = new CoreDNAScraper();
  
  try {
    await scraper.run();
  } catch (error) {
    console.error('Failed to create knowledge base:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { CoreDNAScraper };