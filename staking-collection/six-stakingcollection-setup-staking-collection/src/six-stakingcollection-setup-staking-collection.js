import * as fcl from "@onflow/fcl"
import {t, config} from "@onflow/fcl"

const DEPS = new Set([
    "0xSTAKINGCOLLECTIONADDRESS",
])

export const TITLE = "Setup Staking Collection"
export const DESCRIPTION = "Sets up a Staking Collection for an account."
export const VERSION = "0.1.0"
export const HASH = "7a418759877ccbe9dd3a8404fe2eda72c3ab10a95490378232fab3410f735ae8"
export const CODE = `import FungibleToken from 0xFUNGIBLETOKENADDRESS
import FlowToken from 0xFLOWTOKENADDRESS
import FlowIDTableStaking from 0xIDENTITYTABLEADDRESS
import LockedTokens from 0xLOCKEDTOKENADDRESS
import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS

/// This transaction sets up an account to use a staking collection
/// It will work regardless of whether they have a regular account, a two-account locked tokens setup,
/// or staking objects stored in the unlocked account

transaction {
    prepare(signer: auth(BorrowValue, Storage, Capabilities) &Account) {

        // If there isn't already a staking collection
        if signer.storage.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath) == nil {

            // Create private capabilities for the token holder and unlocked vault
            let lockedHolder = signer.capabilities.storage.issue<auth(FungibleToken.Withdraw, LockedTokens.TokenOperations) &LockedTokens.TokenHolder>(LockedTokens.TokenHolderStoragePath)!
            let flowToken = signer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &FlowToken.Vault>(/storage/flowTokenVault)!

            // Create a new Staking Collection and put it in storage
            if lockedHolder.check() {
                signer.storage.save(
                    <- FlowStakingCollection.createStakingCollection(
                        unlockedVault: flowToken,
                        tokenHolder: lockedHolder
                    ),
                    to: FlowStakingCollection.StakingCollectionStoragePath
                )
            } else {
                signer.storage.save(
                    <- FlowStakingCollection.createStakingCollection(
                        unlockedVault: flowToken,
                        tokenHolder: nil
                    ),
                    to: FlowStakingCollection.StakingCollectionStoragePath
                )
            }

            // Publish a capability to the created staking collection.
            let stakingCollectionCap = signer.capabilities.storage.issue<&FlowStakingCollection.StakingCollection>(
                FlowStakingCollection.StakingCollectionStoragePath
            )

            signer.capabilities.publish(
                stakingCollectionCap,
                at: FlowStakingCollection.StakingCollectionPublicPath
            )
        }

        // borrow a reference to the staking collection
        let collectionRef = signer.storage.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow staking collection reference")

        // If there is a node staker object in the account, put it in the staking collection
        if signer.storage.borrow<&FlowIDTableStaking.NodeStaker>(from: FlowIDTableStaking.NodeStakerStoragePath) != nil {
            let node <- signer.storage.load<@FlowIDTableStaking.NodeStaker>(from: FlowIDTableStaking.NodeStakerStoragePath)!
            collectionRef.addNodeObject(<-node, machineAccountInfo: nil)
        }

        // If there is a delegator object in the account, put it in the staking collection
        if signer.storage.borrow<&FlowIDTableStaking.NodeDelegator>(from: FlowIDTableStaking.DelegatorStoragePath) != nil {
            let delegator <- signer.storage.load<@FlowIDTableStaking.NodeDelegator>(from: FlowIDTableStaking.DelegatorStoragePath)!
            collectionRef.addDelegatorObject(<-delegator)
        }
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

export const template = async ({ proposer, authorization, payer }) => {
    for (let addr of DEPS) await addressCheck(addr)
    
    return fcl.pipe([
        fcl.transaction(CODE),
        fcl.proposer(proposer),
        fcl.authorizations([authorization]),
        fcl.payer(payer)
    ])
}

export const MAINNET_HASH = `69f30decc15bd78107c631e200963398e8ddbc58bb61e577d223725f348fc2d9`
export const TESTNET_HASH = `861784e7ac135a9cfec90decdff2e53971a4d63135db77bcef3b273b710b1814`