import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {config} from "@onflow/config"

const DEPS = new Set([
  "0xNONFUNGIBLETOKENMETADATAVIEWS",
  "0xNONFUNGIBLETOKEN"
])

export const TITLE = "Transfer NFT with Paths"
export const DESCRIPTION = "Transfers a NFT from an authorizer's NFT collection to another account's."
export const VERSION = "0.1.0"
export const HASH = "aead72317f5a7be6fada3f3e4d1cbcbe5d66f95811d65ad56c3c6ea47e00f9d1"
export const CODE = `import NonFungibleToken from 0xNONFUNGIBLETOKEN

/// Can pass in any storage path and receiver path instead of just the default.
/// This lets you choose the token you want to send as well the capability you want to send it to.
///
/// Any token path can be passed as an argument here, so wallets should
/// should check argument values to make sure the intended token path is passed in
///
transaction(to: Address, id: UInt64, senderPathIdentifier: String, receiverPathIdentifier: String) {

    // The NFT resource to be transferred
    let tempNFT: @{NonFungibleToken.NFT}

    prepare(signer: auth(BorrowValue) &Account) {

        let storagePath = StoragePath(identifier: senderPathIdentifier)
            ?? panic("Could not construct a storage path from the provided path identifier string")

        // borrow a reference to the signer's NFT collection
        let withdrawRef = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                from: storagePath
            ) ?? panic("Account does not store a collection object at the specified path")

        self.tempNFT <- withdrawRef.withdraw(withdrawID: id)
    }

    execute {
        let publicPath = PublicPath(identifier: receiverPathIdentifier)
            ?? panic("Could not construct a public path from the provided path identifier string")

        // get the recipients public account object
        let recipient = getAccount(to)

        // borrow a public reference to the receivers collection
        let receiverRef = recipient.capabilities.borrow<&{NonFungibleToken.Receiver}>(publicPath)
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

export const template = async ({ proposer, authorization, payer, senderPathIdentifier = "", receiverPathIdentifier = ""}) => {
  for (let addr of DEPS) await addressCheck(addr)

  return fcl.pipe([
    fcl.transaction(CODE),
    fcl.args([fcl.arg(senderPathIdentifier, t.String), fcl.arg(receiverPathIdentifier, t.String)]),
    fcl.proposer(proposer),
    fcl.authorizations([authorization]),
    fcl.payer(payer)
  ])
}
