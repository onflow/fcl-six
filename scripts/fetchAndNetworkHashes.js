const fs = require("fs");
const axios = require("axios");
const crypto = require("crypto");

// Command line arguments
const [searchName, jsFilePath] = process.argv.slice(2);

if (!searchName || !jsFilePath) {
  console.log("Usage: node script.js <searchName> <pathToJsFile>");
  process.exit(1);
}

const urls = [
//  "https://raw.githubusercontent.com/vacuumlabs/app-flow/v_0_12_0_for_integration/transaction_metadata/manifest.mainnet.json",
//  "https://raw.githubusercontent.com/vacuumlabs/app-flow/v_0_12_0_for_integration/transaction_metadata/manifest.testnet.json",
//  "https://raw.githubusercontent.com/onflow/flow-core-contracts/refs/heads/josh/proof-of-possesion/lib/go/templates/manifest.mainnet.json",
//  "https://raw.githubusercontent.com/onflow/flow-core-contracts/refs/heads/josh/proof-of-possesion/lib/go/templates/manifest.testnet.json"
"https://raw.githubusercontent.com/onflow/ledger-app-flow/refs/heads/develop/transaction_metadata/manifest.mainnet.json",
"https://raw.githubusercontent.com/onflow/ledger-app-flow/refs/heads/develop/transaction_metadata/manifest.testnet.json"
];

function replaceContent(exp, content, replacement) {
  return content.replace(exp, replacement);
}

async function fetchAndUpdate(searchName, jsFilePath, id = null) {
  try {
    let content = await fs.promises.readFile(jsFilePath, "utf8");

    for (const url of urls) {
      const response = await axios.get(url);
      let data = response.data?.templates;

      const item = Array.isArray(data)
        ? data.find((item) => id ? item.id === id : item.name === searchName)
        : null;
      const sourceHash = item?.hash;
      const network = item?.network?.toUpperCase();

      if (!sourceHash || !network) {
        console.error(
          `${id ? `ID ${id}` : searchName} not found or network undefined for URL: ${url}`
        );
        continue;
      }

      const hashRegex = new RegExp(
        `export const ${network}_HASH =\\s*\`[^\`]*\``,
        "gs"
      );
      const hashReplacement = `export const ${network}_HASH = \`${sourceHash}\``;

      if (content.match(hashRegex)) {
        // Update existing hash
        content = replaceContent(hashRegex, content, hashReplacement);
      } else {
        // Add new hash
        content += "\n" + hashReplacement;
      }

      console.log(`Updated ${network}_HASH for ${searchName}`);
    }

    // Write updated content back to file
    await fs.promises.writeFile(jsFilePath, content, "utf8");

  } catch (error) {
    console.error("Failed to fetch or process the JSON:", error);
  }
}

const id = process.argv[4] || null; // Get optional id from command line arguments
fetchAndUpdate(searchName, jsFilePath, id);
