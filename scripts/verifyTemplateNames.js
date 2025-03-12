const axios = require("axios");
const fs = require("fs");
const path = require("path");

const urls = [
  "https://raw.githubusercontent.com/onflow/ledger-app-flow/refs/heads/tarak/develop-pop/transaction_metadata/manifest.mainnet.json",
  "https://raw.githubusercontent.com/onflow/ledger-app-flow/refs/heads/tarak/develop-pop/transaction_metadata/manifest.testnet.json"
];

async function verifyTemplateNames() {
  try {
    // Read batchUpdate.sh
    const batchUpdatePath = path.join(__dirname, 'batchUpdate.sh');
    const batchContent = fs.readFileSync(batchUpdatePath, 'utf8');
    
    // Extract names from batchUpdate.sh
    const batchNames = batchContent
      .split('\n')
      .filter(line => line.trim().startsWith('npm run fetchAndUpdate'))
      .map(line => {
        const match = line.match(/"([^"]+)"/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    // Get template names from JSON
    const templateNames = new Set();
    
    for (const url of urls) {
      console.log(`\nFetching templates from: ${url}`);
      const response = await axios.get(url);
      const templates = response.data?.templates || [];
      
      templates.forEach(template => {
        templateNames.add(template.name);
      });
    }

    console.log('\n=== Analysis ===');
    
    // Find missing templates
    const missingInBatch = [...templateNames].filter(name => !batchNames.includes(name));
    if (missingInBatch.length > 0) {
      console.log('\nTemplate names missing from batchUpdate.sh:');
      missingInBatch.forEach(name => console.log(`- "${name}"`));
    } else {
      console.log('\nAll template names are present in batchUpdate.sh');
    }

    // Find extra names in batch file
    const extraInBatch = batchNames.filter(name => !templateNames.has(name));
    if (extraInBatch.length > 0) {
      console.log('\nNames in batchUpdate.sh that are not in templates:');
      extraInBatch.forEach(name => console.log(`- "${name}"`));
    }

    // Statistics
    console.log('\nStatistics:');
    console.log(`Total templates in JSON: ${templateNames.size}`);
    console.log(`Total names in batchUpdate.sh: ${batchNames.length}`);

  } catch (error) {
    console.error("Error during verification:", error);
  }
}

verifyTemplateNames(); 