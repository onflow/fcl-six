import * as fcl from "@onflow/fcl"
import {config} from "@onflow/config"

const DEPS = new Set([
    "0xFUNGIBLETOKENADDRESS",
    "0xFUNGIBLETOKENMETADATAVIEWS"
])

export const TITLE = "Setup Token Vault"
export const DESCRIPTION = "Set up a Vault and Receiver for an account."
export const VERSION = "0.1.0"
export const HASH = "887673892a2e2c12337394570dfa30c5669e93f537ae426690f402799514a9a1"
export const CODE = `import FungibleToken from 0xFUNGIBLETOKENADDRESS
import FungibleTokenMetadataViews from 0xFUNGIBLETOKENMETADATAVIEWS

/// This transaction is what an account would run
/// to set itself up to manage fungible tokens. This function
/// uses views to know where to set up the vault
/// in storage and to create the empty vault.

transaction(contractAddress: Address, contractName: String) {

    prepare(signer: auth(SaveValue, Capabilities) &Account) {
        // Borrow a reference to the vault stored on the passed account at the passed publicPath
        let resolverRef = getAccount(contractAddress)
            .contracts.borrow<&{FungibleToken}>(name: contractName)
            ?? panic("Could not borrow a reference to the fungible token contract")

        // Use that reference to retrieve the FTView 
        let ftVaultData = resolverRef.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
            ?? panic("Could not resolve the FTVaultData view for the given Fungible token contract")

        // Create a new empty vault using the createEmptyVault function inside the FTVaultData
        let emptyVault <-ftVaultData.createEmptyVault()

        // Save it to the account
        signer.storage.save(<-emptyVault, to: ftVaultData.storagePath)
        
        // Create a public capability for the vault which includes the .Resolver interface
        let vaultCap = signer.capabilities.storage.issue<&{FungibleToken.Vault}>(ftVaultData.storagePath)
        signer.capabilities.publish(vaultCap, at: ftVaultData.metadataPath)

        // Create a public capability for the vault exposing the receiver interface
        let receiverCap = signer.capabilities.storage.issue<&{FungibleToken.Receiver}>(ftVaultData.storagePath)
        signer.capabilities.publish(receiverCap, at: ftVaultData.receiverPath)

    }
}
 `

class UndefinedConfigurationError extends Error {
    constructor(address) {
      const msg = `Stored Interaction Error: Missing configuration for ${address}. Please see the following to learn more: https://github.com/onflow/fcl-six/blob/main/six-delegate-new-locked-flow/README.md`.trim()
      super(msg)
      this.name = "Stored Interaction Undefined Address Configuration Error"
    }
}

const addressCheck = async address => {
    if (!await config().get(address)) throw new UndefinedConfigurationError(address)
}

export const template = async ({ proposer, authorization, payer, contractAddress, contractName }) => {
    for (let addr of DEPS) await addressCheck(addr)

    return fcl.pipe([
        fcl.transaction(CODE),
        fcl.args([fcl.arg(contractAddress, t.Address), fcl.arg(contractName, t.String)]),
        fcl.proposer(proposer),
        fcl.authorizations([authorization]),
        fcl.payer(payer)
    ])
}
