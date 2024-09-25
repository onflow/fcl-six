import * as fcl from "@onflow/fcl"
import {t, config} from "@onflow/fcl"

const DEPS = new Set([
    "0xSTAKINGCOLLECTIONADDRESS",
])

export const TITLE = "Transfer Delegator"
export const DESCRIPTION = "Transfers a delegator from one Staking Collection to another."
export const VERSION = "0.1.0"
export const HASH = "ff070fbf6b6b4fdfea5055edb86b3a3bebff95da976816ce1ebb3e8563a53663"
export const CODE = `import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS

// Transfers a NodeDelegator object from an authorizers account
// and adds the NodeDelegator to another accounts Staking Collection
// identified by the to Address.

transaction(nodeID: String, delegatorID: UInt32, to: Address) {
    let fromStakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection
    let toStakingCollectionCap: &FlowStakingCollection.StakingCollection

    prepare(account: auth(BorrowValue) &Account) {
        // The account to transfer the NodeDelegator object to must have a valid Staking Collection in order to receive the NodeDelegator.
        if (!FlowStakingCollection.doesAccountHaveStakingCollection(address: to)) {
            panic("Destination account must have a Staking Collection set up.")
        }

        // Get a reference to the authorizers StakingCollection
        self.fromStakingCollectionRef = account.storage.borrow<auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow a reference to a StakingCollection in the primary user's account")

        // Get the PublicAccount of the account to transfer the NodeDelegator to. 
        let toAccount = getAccount(to)

        // Borrow a capability to the public methods available on the receivers StakingCollection.
        self.toStakingCollectionCap = toAccount.capabilities
            .borrow<&FlowStakingCollection.StakingCollection>(FlowStakingCollection.StakingCollectionPublicPath)
            ?? panic("Could not borrow a referamce to a StakingCollection in the receiver's account")
    }

    execute {
        // Remove the NodeDelegator from the authorizers StakingCollection.
        let nodeDelegator <- self.fromStakingCollectionRef.removeDelegator(nodeID: nodeID, delegatorID: delegatorID)

        // Deposit the NodeDelegator to the receivers StakingCollection.
        self.toStakingCollectionCap.addDelegatorObject(<- nodeDelegator!)
    }
}`

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

export const template = async ({ proposer, authorization, payer, nodeId = "", delegatorId = "", to = ""}) => {
    for (let addr of DEPS) await addressCheck(addr)
    
    return fcl.pipe([
        fcl.transaction(CODE),
        fcl.args([fcl.arg(nodeId, t.String), fcl.arg(delegatorId, t.UInt32), fcl.arg(to, t.Address)]),
        fcl.proposer(proposer),
        fcl.authorizations([authorization]),
        fcl.payer(payer)
    ])
}

export const MAINNET_HASH = `8c7b8460f11ae786c207493eac35deaccb456a31f9df34ddecccad12685c61fc`
export const TESTNET_HASH = `135df83060f854d487030594e954e9642e4cf6accb5b5abbdf88a9e075468913`