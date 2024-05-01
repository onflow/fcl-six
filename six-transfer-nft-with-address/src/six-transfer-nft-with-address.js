import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {config} from "@onflow/config"

const DEPS = new Set([
  "0xNONFUNGIBLETOKENMETADATAVIEWS",
  "0xNONFUNGIBLETOKEN"
])

export const TITLE = "Transfer NFT with address"
export const DESCRIPTION = "Transfers a moment from an authorizer's NFT to another account's."
export const VERSION = "0.1.0"
export const HASH = "24517c27f986fea9f63c9a0e0f7b585a87f7806e41e556b8255e7db7e3b4c638"
export const CODE = `import NonFungibleToken from 0xNONFUNGIBLETOKEN
import MetadataViews from 0xNONFUNGIBLETOKENMETADATAVIEWS

/// Can pass in any contract address and name
/// This lets you choose the token you want to send because
/// the transaction gets the metadata from the provided contract.
///
transaction(to: Address, id: UInt64, contractAddress: Address, contractName: String) {

    // The NFT resource to be transferred
    let tempNFT: @{NonFungibleToken.NFT}

    // NFTCollectionData struct to get paths from
    let collectionData: MetadataViews.NFTCollectionData

    prepare(signer: auth(BorrowValue) &Account) {

        // Borrow a reference to the nft contract deployed to the passed account
        let resolverRef = getAccount(contractAddress)
            .contracts.borrow<&{NonFungibleToken}>(name: contractName)
            ?? panic("Could not borrow a reference to the non-fungible token contract")

        // Use that reference to retrieve the NFTCollectionData view 
        self.collectionData = resolverRef.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
            ?? panic("Could not resolve the NFTCollectionData view for the given non-fungible token contract")


        // borrow a reference to the signer's NFT collection
        let withdrawRef = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                from: self.collectionData.storagePath
            ) ?? panic("Account does not store a collection object at the specified path")

        self.tempNFT <- withdrawRef.withdraw(withdrawID: id)
    }

    execute {
        // get the recipients public account object
        let recipient = getAccount(to)

        // borrow a public reference to the receivers collection
        let receiverRef = recipient.capabilities.borrow<&{NonFungibleToken.Receiver}>(self.collectionData.publicPath)
            ?? panic("Could not borrow reference to the recipient's receiver")

        // Deposit the NFT to the receiver
        receiverRef.deposit(token: <-self.tempNFT)
    }
}`

class UndefinedConfigurationError extends Error {
  constructor(address) {
    const msg = `Stored Interaction Error: Missing configuration for ${address}. Please see the following to learn more: https://github.com/onflow/fcl-six/blob/main/six-topshot-transfer-moment/README.md`.trim()
    super(msg)
    this.name = "Stored Interaction Undefined Address Configuration Error"
  }
}

const addressCheck = async address => {
  if (!await config().get(address)) throw new UndefinedConfigurationError(address)
}

export const template = async ({ proposer, authorization, payer, recipient = "", withdrawID = ""}) => {
  for (let addr of DEPS) await addressCheck(addr)

  return fcl.pipe([
    fcl.transaction(CODE),
    fcl.args([fcl.arg(recipient, t.Address), fcl.arg(withdrawID, t.UInt64)]),
    fcl.proposer(proposer),
    fcl.authorizations([authorization]),
    fcl.payer(payer)
  ])
}
