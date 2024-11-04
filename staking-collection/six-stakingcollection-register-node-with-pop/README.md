# @onflow/six-stakingcollection-register-node-with-pop

Stored Interaction for registering a node with proof-of-possession held in a StakingCollection

# Status

- **Last Updated:** November 2024
- **Stable:** No
- **Risk of Breaking Change:** Very High

Known Upcoming Changes:

- Potential changes to all aspects of Stored Interactions

# Install

```bash
npm install @onflow/six-stakingcollection-register-node-with-pop
```

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
import { template as registerNodeWithPop } from "@onflow/six-stakingcollection-register-node-with-pop"

fcl.config().put("accessNode", "http://localhost:8080");

const response = await fcl.send([
    registerNodeWithPop({
        proposer: fcl.currentUser().authorization,
        authorization: fcl.currentUser().authorization,     
        payer: fcl.currentUser().authorization,
        nodeID: "1",
        nodeRole: 1,
        networkingAddress: "abc123",
        networkingKey: "abc123",
        stakingKey: "abc123",                                        
        amount: "123.456",
        publicKeys: ["abc123"],
        proofOfPossession: "def456" // Additional parameter for proof of possession                                       
    })
])
```

# Hashing

Hashing Code:
```javascript
    console.log(crypto.createHash('sha256').update(CODE, 'utf8').digest('hex'))
```
