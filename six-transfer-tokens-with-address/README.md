# @onflow/six-transfer-tokens-with-address

Stored Interaction for transfering tokens between accounts on Flow.

# Status

- **Last Updated:** April 9 2024
- **Stable:** No
- **Risk of Breaking Change:** Very High

Known Upcoming Changes:

- Potential changes to all aspects of Stored Interactions

# Install

npm install @onflow/six-transfer-tokens-with-address

# Configuration 

To use this Stored Interaction, you must configure FCL with certain account addresses which contain contracts imported by this Stored Interaction.

| Dependencies                 | Mainnet            | Testnet            |
| ---------------------------- | ------------------ | ------------------ |
| 0xFUNGIBLETOKENADDRESS       | 0xf233dcee88fe0abe | 0x9a0766d93b6608b7 |
| 0xFUNGIBLETOKENMETADATAVIEWS | 0xf233dcee88fe0abe | 0x9a0766d93b6608b7 |

Example (for mainnet):

```javascript
fcl.config()
  .put("0xFUNGIBLETOKENMETADATAVIEWS", "0xf233dcee88fe0abe")
  .put("0xFUNGIBLETOKENADDRESS", "0xf233dcee88fe0abe")
```

Example (for testnet):

```javascript
fcl.config()
  .put("0xFUNGIBLETOKENMETADATAVIEWS", "0x9a0766d93b6608b7")
  .put("0xFUNGIBLETOKENADDRESS", "0x9a0766d93b6608b7")
```

# Usage:

```javascript
import * as fcl from "@onflow/fcl"
import { template as transferTokens } from "@onflow/six-transfer-tokens-with-address"

fcl.config().put("accessNode", "http://localhost:8080");

const response = await fcl.send([
    transferTokens({
        proposer: fcl.currentUser().authorization,
        authorization: fcl.currentUser().authorization,     
        payer: fcl.currentUser().authorization,             
        amount: "123.456",                                    // Amount as a String representing a Cadence UFix64
        to: "0xABC123DEF456",                                  // The Address of the Account to transfer tokens to.
        contractAddress: "0x1234567890ab",                     // Contract address of fungible token
        contractName: "MyContractName"                         // Contract name of fungible token
    })
])

```

# Hashing

Hashing Code:
```javascript
    console.log(crypto.createHash('sha256').update(CODE, 'utf8').digest('hex'))
```