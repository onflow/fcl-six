# @onflow/six-stakingcollection-register-delegator

Stored Interaction for registering a delegator held in a StakingCollection

# Status

- **Last Updated:** June 21 2021
- **Stable:** No
- **Risk of Breaking Change:** Very High

Known Upcoming Changes:

- Potential changes to all aspects of Stored Interactions

# Install

npm install @onflow/six-stakingcollection-register-delegator

# Configuration 

To use this Stored Interaction, you must configure FCL with certain account addresses which contain contracts imported by this Stored Interaction.

| Dependencies                | Mainnet            | Testnet            |
| --------------------------- | ------------------ | ------------------ |
| 0xSTAKINGCOLLECTIONADDRESS  | 0x8d0e87b65159ae63 | 0x95e019a17d0e23d7 |

Example (for mainnet):

```javascript
fcl.config()
  .put("0xSTAKINGCOLLECTIONADDRESS", "0x8d0e87b65159ae63")
```

Example (for testnet):

```javascript
fcl.config()
  .put("0xSTAKINGCOLLECTIONADDRESS", "0x95e019a17d0e23d7")
```

# Usage:

```javascript
import * as fcl from "@onflow/fcl"
import { template as registerDelegator } from "@onflow/six-stakingcollection-register-delegator"

fcl.config().put("accessNode", "http://localhost:8080");

const response = await fcl.send([
    registerDelegator({
        proposer: fcl.currentUser().authorization,
        authorization: fcl.currentUser().authorization,     
        payer: fcl.currentUser().authorization,
        nodeId: "abc123"             
        amount: "100.0",                                    
    })
])

```

# Hashing

Hashing Code:
```javascript
    console.log(crypto.createHash('sha256').update(CODE, 'utf8').digest('hex'))
```