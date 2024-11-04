const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

// Command line arguments
const [searchName, jsFilePath] = process.argv.slice(2);

if (!searchName || !jsFilePath) {
  console.log('Usage: node script.js <searchName> <pathToJsFile>');
  process.exit(1);
}

//const url = 'https://raw.githubusercontent.com/vacuumlabs/app-flow/v_0_12_0_for_integration/transaction_metadata/manifest.mainnet.json';
const url = 'https://raw.githubusercontent.com/onflow/flow-core-contracts/refs/heads/josh/proof-of-possesion/lib/go/templates/manifest.mainnet.json';

function replaceAddressesWithPlaceholders(content) {
    let regex = /(import FlowStakingCollection from )0x[a-fA-F0-9]+/;
    let code = content.replace(regex, `$10xSTAKINGCOLLECTIONADDRESS`);

    regex = /(import FungibleTokenMetadataViews from )0x[a-fA-F0-9]+/;
    code = code.replace(regex, `$10xFUNGIBLETOKENMETADATAVIEWS`);
 
    regex = /(import FungibleToken from )0x[a-fA-F0-9]+/;
    code = code.replace(regex, `$10xFUNGIBLETOKENADDRESS`);
  
    regex = /(import FlowIDTableStaking from )0x[a-fA-F0-9]+/;
    code = code.replace(regex, `$10xIDENTITYTABLEADDRESS`);
   
    regex = /(import LockedTokens from )0x[a-fA-F0-9]+/;
    code = code.replace(regex, `$10xLOCKEDTOKENADDRESS`);

    regex = /(import NonFungibleToken from )0x[a-fA-F0-9]+/;
    code = code.replace(regex, `$10xNONFUNGIBLETOKEN`);
    
    regex = /(import MetadataViews from )0x[a-fA-F0-9]+/;
    code = code.replace(regex, `$10xNONFUNGIBLETOKENMETADATAVIEWS`);
    
    code = code.replace(/0x1654653399040a61/g, '0xFLOWTOKENADDRESS');
    return  code;
}

function replacePlaceholdersWithAddresses(content) {
    let code = content.replace(/0xSTAKINGCOLLECTIONADDRESS/g, '0x8d0e87b65159ae63');
    code = code.replace(/0xFUNGIBLETOKENADDRESS/g, '0xf233dcee88fe0abe');
    code = code.replace(/0xFLOWTOKENADDRESS/g, '0x1654653399040a61');
    code = code.replace(/0xIDENTITYTABLEADDRESS/g, '0x8624b52f9ddcd04a');
    code = code.replace(/0xLOCKEDTOKENADDRESS/g, '0x8d0e87b65159ae63');
    code = code.replace(/0xFUNGIBLETOKENMETADATAVIEWS/g, '0xf233dcee88fe0abe');
    code = code.replace(/0xNONFUNGIBLETOKENMETADATAVIEWS/g, '0x1d7e57aa55817448');
    code = code.replace(/0xNONFUNGIBLETOKEN/g, '0x1d7e57aa55817448');
    return code;
}

function getHash(code) {
    return crypto.createHash('sha256').update(code).digest('hex');
}

function replaceContent(exp, content, replacement) {
    return content.replace(exp, replacement);
}

async function fetchAndUpdate(searchName, jsFilePath) {
  try {
    const response = await axios.get(url);
    let data = response.data?.templates;
   
    data.map(x => console.log(`${x.name} ${x.hash}`));
    // Assuming the JSON data is now in an array format, find the item
    const item = Array.isArray(data) ? data.find(item => item.name === searchName) : null;

    //data.map(x => console.log(`npm run fetchAndUpdate "${x.name}" `));
    const sourceCode = item?.source;
    const sourceHash = item?.hash;

    if (!sourceCode) {
      console.error(`${searchName} not found.`);
      return;
    }

    // Read, update, and write back the JS file with the new source
    fs.readFile(jsFilePath, 'utf8', (err, content) => {
      if (err) {
        console.error('Failed: Error reading JS file:', err);
        return;
      }

      const regex = /export const CODE =\s*`[^`]*`/gs;
      const placeholderContent = replaceAddressesWithPlaceholders(sourceCode);
      let updatedContent = replaceContent(regex, content, `export const CODE = \`${placeholderContent}\``);

      const newHASH = getHash(placeholderContent);

      const hashRegex = /export const HASH =\s*`[^`]*`/gs;
      updatedContent = replaceContent(hashRegex, updatedContent, `export const HASH = \`${newHASH}\``);

      // test replacement with actual contract addresses is correct hash
     const backToOriginal = replacePlaceholdersWithAddresses(placeholderContent);
     const originalHash = getHash(backToOriginal);

     if (originalHash !== sourceHash) {
        console.error(`Failed: source hash does not match replaced hash from placeholders. ${jsFilePath}`);
        return;
     } 

      fs.writeFile(jsFilePath, updatedContent, 'utf8', (err) => {
        if (err) {
          console.error('Failed: Error writing updated JS file:', err);
          return;
        }
      });
    });
  } catch (error) {
    console.error('Failed: to fetch or process the JSON:', error);
  }
}

fetchAndUpdate(searchName, jsFilePath);
