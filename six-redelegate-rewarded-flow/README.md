# @onflow/six-redelegate-rewarded-flow

Stored Interaction for redelegating rewarded Flow

# Status

- **Last Updated:** April 28 2021
- **Stable:** No
- **Risk of Breaking Change:** Very High

Known Upcoming Changes:

- Potential changes to all aspects of Stored Interactions

# Install

npm install @onflow/six-redelegate-rewarded-flow

# Configuration 

To use this Stored Interaction, you must configure FCL with certain account addresses which contain contracts imported by this Stored Interaction.

| Dependencies          | Mainnet            | Testnet            |
| --------------------- | ------------------ | ------------------ |
| 0xLOCKEDTOKENADDRESS  | 0x8d0e87b65159ae63 | 0x95e019a17d0e23d7 |

Example (for mainnet):

```javascript
fcl.config()
  .put("0xLOCKEDTOKENADDRESS", "0x8d0e87b65159ae63")
```

Example (for testnet):

```javascript
fcl.config()
  .put("0xLOCKEDTOKENADDRESS", "0x95e019a17d0e23d7")
```

Learn more about configuring FCL here: https://github.com/onflow/fcl-six/blob/master/docs/configure-fcl.mdx

# Usage:

```javascript
import * as fcl from "@onflow/fcl"
import { template as redelegateRewardedFlow } from "@onflow/six-redelegate-rewarded-flow"

fcl.config().put("accessNode", "http://localhost:8080");

const response = await fcl.send([
    redelegateRewardedFlow({
        proposer: fcl.currentUser().authorization,
        authorization: fcl.currentUser().authorization,     
        payer: fcl.currentUser().authorization,             
        amount: "123.456",                                    // Amount as a String representing a Cadence UFix64
    })
])

```

# Hashing

Hashing Code:
```javascript
    console.log(crypto.createHash('sha256').update(CODE, 'utf8').digest('hex'))
```