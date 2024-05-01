import * as fcl from "@onflow/fcl"
import {t, config} from "@onflow/fcl"

const DEPS = new Set([
    "0xSTAKINGCOLLECTIONADDRESS",
])

export const TITLE = "Stake Unstaked Tokens"
export const DESCRIPTION = "Stakes unstaked tokens for a stake held in a Staking Collection."
export const VERSION = "0.1.0"
export const HASH = "a9ebc7e1aaaca4dfee1b149f513a43d2547a6eef0630dbce70d165ef58b1467d"
export const CODE = `import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS

/// Commits unstaked tokens to stake for the specified node or delegator in the staking collection

transaction(nodeID: String, delegatorID: UInt32?, amount: UFix64) {
    
    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection

    prepare(account: auth(BorrowValue) &Account) {
        self.stakingCollectionRef = account.storage.borrow<auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow a reference to a StakingCollection in the primary user's account")
    }

    execute {
        self.stakingCollectionRef.stakeUnstakedTokens(nodeID: nodeID, delegatorID: delegatorID, amount: amount)
    }
}
`

class UndefinedConfigurationError extends Error {
    constructor(address) {
      const msg = `Stored Interaction Error: Missing configuration for ${address}. Please see the following to learn more: https://github.com/onflow/fcl-six/blob/main/six-withdraw-unstaked-flow/README.md`.trim()
      super(msg)
      this.name = "Stored Interaction Undefined Address Configuration Error"
    }
}

const addressCheck = async address => {
    if (!await config().get(address)) throw new UndefinedConfigurationError(address)
}

export const template = async ({ proposer, authorization, payer, nodeId = "", delegatorId = null, amount = ""}) => {
    for (let addr of DEPS) await addressCheck(addr)
    
    return fcl.pipe([
        fcl.transaction(CODE),
        fcl.args([fcl.arg(nodeId, t.String), fcl.arg(delegatorId, t.Optional(t.UInt32)), fcl.arg(amount, t.UFix64)]),
        fcl.proposer(proposer),
        fcl.authorizations([authorization]),
        fcl.payer(payer)
    ])
}
