import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {config} from "@onflow/config"

const DEPS = new Set([
    "0xFLOWTOKENADDRESS",
    "0xFUNGIBLETOKENADDRESS",
    "0xLOCKEDTOKENADDRESS"
])

export const TITLE = "Withdraw Unlocked Tokens"
export const DESCRIPTION = "Withdraw Unlocked Tokens to an authorizers account."
export const VERSION = "0.2.3"
export const HASH = "a2146e3e6e7718779ce59376b88760c154d82b7d132fe2c377114ec7cf434e7b"
export const CODE = `import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS

/// Request to withdraw unstaked tokens for the specified node or delegator in the staking collection
/// The tokens are automatically deposited to the unlocked account vault first,
/// And then any locked tokens are deposited into the locked account vault if it is there

transaction(nodeID: String, delegatorID: UInt32?, amount: UFix64) {
    
    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection

    prepare(account: auth(BorrowValue) &Account) {
        self.stakingCollectionRef = account.storage.borrow<auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow a reference to a StakingCollection in the primary user's account")
    }

    execute {
        self.stakingCollectionRef.withdrawUnstakedTokens(nodeID: nodeID, delegatorID: delegatorID, amount: amount)
    }
}
`

class UndefinedConfigurationError extends Error {
    constructor(address) {
      const msg = `Stored Interaction Error: Missing configuration for ${address}. Please see the following to learn more: https://github.com/onflow/fcl-six/blob/main/six-withdraw-unlocked-flow/README.md`.trim()
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

export const MAINNET_HASH = `4a830e6f93f74179a99e17c7ae762980c7fdc428bc949767529be2f071ac52b9`
export const TESTNET_HASH = `094798e93daeacaa9ff262486a3683ec5a5e2204407e7d00bc3416fbf3efa3b1`