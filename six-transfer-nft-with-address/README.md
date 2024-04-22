# @onflow/six-transfer-nft-with-address

Stored Interaction for setting up an account with an NBA TopShot collection.

# Status

- **Last Updated:** Apr 9 2024 
- **Stable:** No
- **Risk of Breaking Change:** Very High

Known Upcoming Changes:

- Potential changes to all aspects of Stored Interactions

# Install

npm install @onflow/six-transfer-nft-with-address

# Configuration 

To use this Stored Interaction, you must configure FCL with certain account addresses which contain contracts imported by this Stored Interaction.

| Dependencies                       | Mainnet            | Testnet            |
| ---------------------------------- | ------------------ | ------------------ |
| 0xNONFUNGIBLETOKENMETADATAVIEWS    | 0x1d7e57aa55817448 | 0x631e88ae7f1d7c20 |
| 0xNONFUNGIBLETOKEN                 | 0x1d7e57aa55817448 | 0x631e88ae7f1d7c20 |

Example (for mainnet):

```javascript
fcl.config()
  .put("0xNONFUNGIBLETOKENMETADATAVIEWS", "0x1d7e57aa55817448")
  .put("0xNONFUNGIBLETOKEN", "0x1d7e57aa55817448")
```

Example (for testnet):

```javascript
fcl.config()
  .put("0xNONFUNGIBLETOKENMETADATAVIEWS", "0x631e88ae7f1d7c20")
  .put("0xNONFUNGIBLETOKEN", "0x631e88ae7f1d7c20")
```

# Usage:

```javascript
import * as fcl from "@onflow/fcl"
import { template as transferNft } from "@onflow/six-transfer-nft-with-address

fcl.config().put("accessNode", "http://localhost:8080");

const response = await fcl.send([
  transferNft({
    proposer: fcl.currentUser().authorization,
    authorization: fcl.currentUser().authorization,     
    payer: fcl.currentUser().authorization,
    contractAddress: "0xABC123DEF456",  // Address of the account to transfer the moment to
    contractName: "nft collection name" // collection name
  })
])

```

# Hashing

Hashing Code:
```javascript
  console.log(crypto.createHash('sha256').update(CODE, 'utf8').digest('hex'))
```