const axios = require("axios");

const urls = [
  "https://raw.githubusercontent.com/onflow/ledger-app-flow/refs/heads/tarak/develop-pop/transaction_metadata/manifest.mainnet.json",
  "https://raw.githubusercontent.com/onflow/ledger-app-flow/refs/heads/tarak/develop-pop/transaction_metadata/manifest.testnet.json"
];

async function listTemplateNames() {
  try {
    for (const url of urls) {
      console.log(`\nFetching templates from: ${url}`);
      const response = await axios.get(url);
      const templates = response.data?.templates;

      if (Array.isArray(templates)) {
        console.log('Available template names:');
        templates.forEach(template => {
          console.log(`- ${template.name} (${template.network})`);
        });
      } else {
        console.log('No templates found in the response');
      }
    }
  } catch (error) {
    console.error("Error fetching or processing the JSON:", error);
  }
}

listTemplateNames(); 