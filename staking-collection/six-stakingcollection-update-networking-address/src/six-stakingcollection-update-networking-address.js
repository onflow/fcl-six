import * as fcl from "@onflow/fcl"
import {t, config} from "@onflow/fcl"

const DEPS = new Set([
    "0xSTAKINGCOLLECTIONADDRESS",
])

export const TITLE = "Update Networking Adddress"
export const DESCRIPTION = "Updates the networking address for a node held in a Staking Collection."
export const VERSION = "0.2.2"
export const HASH = "ddff7b7fd9908951972200428d15e007b863939e610f7210f7f89099f9477a14"
export const CODE = `import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS

/// Changes the networking address for the specified node

transaction(nodeID: String, newAddress: String) {
    
    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection

    prepare(account: auth(BorrowValue) &Account) {
        self.stakingCollectionRef = account.storage.borrow<auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow a reference to a StakingCollection in the primary user's account")
    }

    execute {
        self.stakingCollectionRef.updateNetworkingAddress(nodeID: nodeID, newAddress: newAddress)
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

export const template = async ({ proposer, authorization, payer, nodeId = "", newAddress = ""}) => {
    for (let addr of DEPS) await addressCheck(addr)
    
    return fcl.pipe([
        fcl.transaction(CODE),
        fcl.args([fcl.arg(nodeId, t.String), fcl.arg(newAddress, t.String)]),
        fcl.proposer(proposer),
        fcl.authorizations([authorization]),
        fcl.payer(payer)
    ])
}

export const MAINNET_HASH = `68d24560d9e49318dca82ab0975f526a8663d934225f0cb715cd1ff188def16d`
export const TESTNET_HASH = `3a68789d8cd56e6c7b064057045a56340746aac710db57700de2c33eb6610e5f`