# @onflow/six-remove-key

Stored Interaction for removing a key on an Account on Flow.

# Status

- **Last Updated:** April 10 2024
- **Stable:** No
- **Risk of Breaking Change:** Very High

Known Upcoming Changes:

- Potential changes to all aspects of Stored Interactions

# Install

npm install @onflow/six-remove-key

# Usage:

```javascript
import * as fcl from "@onflow/fcl"
import { template as addNewKey } from "@onflow/six-remove-key"

fcl.config().put("accessNode", "http://localhost:8080");

const response = await fcl.send([
    addNewKey({
        proposer: fcl.currentUser().authorization,
        authorization: fcl.currentUser().authorization,     
        payer: fcl.currentUser().authorization,             
        keyIndex: 1 
    })
])

```

# Hashing

Hashing Code:
```javascript
    console.log(crypto.createHash('sha256').update(CODE, 'utf8').digest('hex'))
```