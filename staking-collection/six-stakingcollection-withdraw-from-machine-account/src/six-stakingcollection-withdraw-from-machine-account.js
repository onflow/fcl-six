import * as fcl from "@onflow/fcl"
import {t, config} from "@onflow/fcl"

const DEPS = new Set([
    "0xSTAKINGCOLLECTIONADDRESS",
])

export const TITLE = "Withdraw FLOW from Machine Account"
export const DESCRIPTION = "Withdraws FLOW from a machine account."
export const VERSION = "0.1.0"
export const HASH = "c77ce3a9e3681a64880ec6c4a49b359fa143f25779ca6da46e57febe2f2e1fef"
export const CODE = `import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS

/// Request to withdraw tokens from the machine account
/// The tokens are automatically deposited to the unlocked account vault

transaction(nodeID: String, amount: UFix64) {
    
    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection

    prepare(account: auth(BorrowValue) &Account) {
        self.stakingCollectionRef = account.storage.borrow<auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow a reference to a StakingCollection in the primary user's account")
    }

    execute {
        self.stakingCollectionRef.withdrawFromMachineAccount(nodeID: nodeID, amount: amount)
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

export const template = async ({ proposer, authorization, payer, nodeId = "", amount = ""}) => {
    for (let addr of DEPS) await addressCheck(addr)

    return fcl.pipe([
        fcl.transaction(CODE),
        fcl.args([fcl.arg(nodeId, t.String), fcl.arg(amount, t.UFix64)]),
        fcl.proposer(proposer),
        fcl.authorizations([authorization]),
        fcl.payer(payer)
    ])
}

export const MAINNET_HASH = `e12b16ef4218b8ce52189ae5814b381272bf473436978fae94d01c10c0369034`
export const TESTNET_HASH = `fdd40862af04dc36dd0e9e727966c6f81dd6be8246b9c70afd18297aac9e86a8`