# @onflow/six-setup-nft-collection

Stored Interaction for setting up an account with an NBA TopShot collection.

# Status

- **Last Updated:** Sept 22 2021
- **Stable:** No
- **Risk of Breaking Change:** Very High

Known Upcoming Changes:

- Potential changes to all aspects of Stored Interactions

# Install

npm install @onflow/six-setup-nft-collection

# Configuration 

To use this Stored Interaction, you must configure FCL with certain account addresses which contain contracts imported by this Stored Interaction.

| Dependencies                    | Mainnet            | Testnet            |
| ------------------------------- | ------------------ | ------------------ |
| 0xNONFUNGIBLETOKEN              | 0x1d7e57aa55817448 | 0x877931736ee77cff |
| 0xNONFUNGIBLETOKENMETADATAVIEWS | 0x1d7e57aa55817448 | 0x877931736ee77cff | 

Example (for mainnet):

```javascript
fcl.config()
  .put("0xNONFUNGIBLETOKEN", "0x1d7e57aa55817448")
```

Example (for testnet):

```javascript
fcl.config()
  .put("0xNONFUNGIBLETOKEN", "0x631e88ae7f1d7c20")
```

# Usage:

```javascript
import * as fcl from "@onflow/fcl"
import { template as nftSetupCollection } from "@onflow/six-setup-nft-collection"

fcl.config().put("accessNode", "http://localhost:8080");

const response = await fcl.send([
  nftSetupCollection({
    proposer: fcl.currentUser().authorization,
    authorization: fcl.currentUser().authorization,     
    payer: fcl.currentUser().authorization,            
    contractAddress: "0x123456ab910",
    contractName: "MyNFTCollection"
  })
])

```

# Hashing

Hashing Code:
```javascript
  console.log(crypto.createHash('sha256').update(CODE, 'utf8').digest('hex'))
```