import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {config} from "@onflow/config"

const DEPS = new Set([
  "0xNONFUNGIBLETOKEN",
  "0xNONFUNGIBLETOKENMETADATAVIEWS"
])

export const TITLE = "Setup NFT Collection"
export const DESCRIPTION = "Sets up an account with an NFT collection."
export const VERSION = "0.1.0"
export const HASH = "ec16ea7b7647f458e5daeb4dd821ec5affc05ef4c8ff6ac46399d98e5ace253d"
export const CODE = `/// This transaction is what an account would run
/// to set itself up to receive NFTs. This function
/// uses views to know where to set up the collection
/// in storage and to create the empty collection.

import NonFungibleToken from 0xNONFUNGIBLETOKEN
import MetadataViews from 0xNONFUNGIBLETOKENMETADATAVIEWS

transaction(contractAddress: Address, contractName: String) {

    prepare(signer: auth(IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        // Borrow a reference to the nft contract deployed to the passed account
        let resolverRef = getAccount(contractAddress)
            .contracts.borrow<&{NonFungibleToken}>(name: contractName)
            ?? panic("Could not borrow a reference to the non-fungible token contract")

        // Use that reference to retrieve the NFTCollectionData view 
        let collectionData = resolverRef.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
            ?? panic("Could not resolve the NFTCollectionData view for the given non-fungible token contract")

        // Create a new empty collections
        let emptyCollection <- collectionData.createEmptyCollection()

        // save it to the account
        signer.storage.save(<-emptyCollection, to: collectionData.storagePath)

        // create a public capability for the collection
        let collectionCap = signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(
                collectionData.storagePath
            )
        signer.capabilities.publish(collectionCap, at: collectionData.publicPath)
    }
}
`

class UndefinedConfigurationError extends Error {
  constructor(address) {
    const msg = `Stored Interaction Error: Missing configuration for ${address}. Please see the following to learn more: https://github.com/onflow/fcl-six/blob/main/six-topshot-setup-collection/README.md`.trim()
    super(msg)
    this.name = "Stored Interaction Undefined Address Configuration Error"
  }
}

const addressCheck = async address => {
  if (!await config().get(address)) throw new UndefinedConfigurationError(address)
}

export const template = async ({ proposer, authorization, payer, contractAddress = "", contractName = "" }) => {
  for (let addr of DEPS) await addressCheck(addr)

  return fcl.pipe([
    fcl.transaction(CODE),
    fcl.args([fcl.arg(contractAddress, t.Address), fcl.arg(contractName, t.String)]),
    fcl.proposer(proposer),
    fcl.authorizations([authorization]),
    fcl.payer(payer)
  ])
}
