import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {config} from "@onflow/config"

const DEPS = new Set([
    "0xFLOWTOKENADDRESS",
    "0xLOCKEDTOKENADDRESS"
])

export const TITLE = "Withdraw Rewarded Flow"
export const DESCRIPTION = "Withdraw Rewarded Flow to an account."
export const VERSION = "0.1.0"
export const HASH = "3f587311734adc2f1da1e1d9cf2d48fa8e0352a14e79942203d6b58c19d58871"
export const CODE = `import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS

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
      const msg = `Stored Interaction Error: Missing configuration for ${address}. Please see the following to learn more: https://github.com/onflow/fcl-six/blob/main/six-withdraw-rewarded-flow/README.md`.trim()
      super(msg)
      this.name = "Stored Interaction Undefined Address Configuration Error"
    }
}

const addressCheck = async address => {
    if (!await config().get(address)) throw new UndefinedConfigurationError(address)
}

export const template = async ({ proposer, authorization, payer, amount = ""}) => {
    for (let addr of DEPS) await addressCheck(addr)

    return fcl.pipe([
        fcl.transaction(CODE),
        fcl.args([fcl.arg(amount, t.UFix64)]),
        fcl.proposer(proposer),
        fcl.authorizations([authorization]),
        fcl.payer(payer)
    ])
}
