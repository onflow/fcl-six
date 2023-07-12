import * as fcl from "@onflow/fcl"
import {t, config} from "@onflow/fcl"

const DEPS = new Set([
    "0xSTAKINGCOLLECTIONADDRESS",
])

export const TITLE = "Create Machine Account"
export const DESCRIPTION = "Creates a Machine Account for node held in Staking Collection."
export const VERSION = "0.0.3"
export const HASH = "dd3b327b09087ea7f8e92a22a6b04a3c6ca33b868b430c4f15f251658c38c1b7"
export const CODE = 
`import Crypto
import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS

/// Creates a machine account for a node that is already in the staking collection
/// and adds public keys to the new account

transaction(nodeID: String, publicKeys: [Crypto.KeyListEntry]) {
    
    let stakingCollectionRef: &FlowStakingCollection.StakingCollection

    prepare(account: AuthAccount) {
        self.stakingCollectionRef = account.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow ref to StakingCollection")

        if let machineAccount = self.stakingCollectionRef.createMachineAccountForExistingNode(nodeID: nodeID, payer: account) {
            if publicKeys == nil || publicKeys!.length == 0 {
                panic("Cannot provide zero keys for the machine account")
            }
            for key in publicKeys {
                machineAccount.keys.add(publicKey: key.publicKey, hashAlgorithm: key.hashAlgorithm, weight: key.weight)
            }
        } else {
            panic("Could not create a machine account for the node")
        }
    }
}
`

class UndefinedConfigurationError extends Error {
    constructor(address) {
      const msg = `Stored Interaction Error: Missing configuration for ${address}. Please see the following to learn more: https://github.com/onflow/fcl-six/blob/main/six-stakingcollection-create-machine-account/README.md`.trim()
      super(msg)
      this.name = "Stored Interaction Undefined Address Configuration Error"
    }
}

const addressCheck = async address => {
    if (!await config().get(address)) throw new UndefinedConfigurationError(address)
}

export const template = async ({ proposer, authorization, payer, nodeId = "", publicKeys = []}) => {
    for (let addr of DEPS) await addressCheck(addr)

    return fcl.pipe([
        fcl.transaction(CODE),
        fcl.args([fcl.arg(nodeId, t.String), fcl.arg(publicKeys, t.Array(t.String))]),
        fcl.proposer(proposer),
        fcl.authorizations([authorization]),
        fcl.payer(payer)
    ])
}
