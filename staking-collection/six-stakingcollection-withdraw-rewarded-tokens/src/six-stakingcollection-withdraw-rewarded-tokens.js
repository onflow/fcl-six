import * as fcl from "@onflow/fcl"
import {t, config} from "@onflow/fcl"

const DEPS = new Set([
    "0xSTAKINGCOLLECTIONADDRESS",
])

export const TITLE = "Withdraw Rewarded Tokens"
export const DESCRIPTION = "Withdraws rewarded tokens from a stake held in a Staking Collection."
export const VERSION = "0.2.1"
export const HASH = "61ba9b321f4ed1abe55409406d9e54d47d059c469b9e36956a35629650e89966"
export const CODE = 
`import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS

/// Request to withdraw rewarded tokens for the specified node or delegator in the staking collection
/// The tokens are automatically deposited to the unlocked account vault first,
/// And then any locked tokens are deposited into the locked account vault

transaction(nodeID: String, delegatorID: UInt32?, amount: UFix64) {
    
    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection

    prepare(account: auth(BorrowValue) &Account) {
        self.stakingCollectionRef = account.storage.borrow<auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow a reference to a StakingCollection in the primary user's account")
    }

    execute {
        self.stakingCollectionRef.withdrawRewardedTokens(nodeID: nodeID, delegatorID: delegatorID, amount: amount)
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

export const MAINNET_HASH = `fbd8ebbfff7a88b6b667ff4e3f9f904eaaba71cbf02a140f3b7007c61fbd8f34`
export const TESTNET_HASH = `5a07ca4c016973bdeb168590e111b2c2855833b5ece11ffb28b08b8668f258a8`