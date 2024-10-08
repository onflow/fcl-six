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
export const CODE = `import FungibleToken from 0xFUNGIBLETOKENADDRESS
import FlowToken from 0xFLOWTOKENADDRESS
import LockedTokens from 0xLOCKEDTOKENADDRESS

transaction(amount: UFix64) {

    let holderRef: auth(LockedTokens.TokenOperations, FungibleToken.Withdraw) &LockedTokens.TokenHolder
    let vaultRef: auth(FungibleToken.Withdraw) &FlowToken.Vault

    prepare(acct: auth(BorrowValue) &Account) {
        self.holderRef = acct.storage.borrow<auth(LockedTokens.TokenOperations, FungibleToken.Withdraw) &LockedTokens.TokenHolder>(from: LockedTokens.TokenHolderStoragePath)
            ?? panic("The primary user account does not have an associated locked account")

        self.vaultRef = acct.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow flow token vault ref")
    }

    execute {
        self.vaultRef.deposit(from: <-self.holderRef.withdraw(amount: amount))
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

export const MAINNET_HASH = `c2484f17e640e285769c3edaa6f2d090dcef1f2f57983f82b7179c3c047290ca`
export const TESTNET_HASH = `01fd4ea83d20510d24ed9f245873a7ee2715aefb774495c80bce7e3e34d6442e`