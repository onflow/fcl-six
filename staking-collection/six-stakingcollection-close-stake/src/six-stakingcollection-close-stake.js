import * as fcl from "@onflow/fcl"
import {t, config} from "@onflow/fcl"

const DEPS = new Set([
    "0xSTAKINGCOLLECTIONADDRESS",
])

export const TITLE = "Close Stake"
export const DESCRIPTION = "Closes a stake held in a Staking Collection."
export const VERSION = "0.2.2"
export const HASH = "aa28456248b460ccec0fed7d4c87d58135ccfe002c2da850a34450f857dd16c6"
export const CODE = `import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS

// Closes out a staking object in the staking collection
// This does not remove the record from the identity table,
// but it does mean that the account that closes it cannot ever access it again

transaction(nodeID: String, delegatorID: UInt32?) {
    
    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection

    prepare(account: auth(BorrowValue) &Account) {
        self.stakingCollectionRef = account.storage.borrow<auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow a reference to a StakingCollection in the primary user's account")
    }

    execute {
        self.stakingCollectionRef.closeStake(nodeID: nodeID, delegatorID: delegatorID)
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

export const template = async ({ proposer, authorization, payer, nodeId = "", delegatorId = null}) => {
    for (let addr of DEPS) await addressCheck(addr)

    return fcl.pipe([
        fcl.transaction(CODE),
        fcl.args([fcl.arg(nodeId, t.String), fcl.arg(delegatorId, t.Optional(t.UInt32))]),
        fcl.proposer(proposer),
        fcl.authorizations([authorization]),
        fcl.payer(payer)
    ])
}

export const MAINNET_HASH = `a0fad319bf8aede66212257ad0d21532858381e2c9d7c4cec179b28180f5be93`
export const TESTNET_HASH = `7e216d96d75414b27c2301a3b0a7816804d43014337a14731d1493531116d185`