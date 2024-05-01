import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

export const TITLE = "Remove Key"
export const DESCRIPTION = "Remove key from Account on Flow."
export const VERSION = "0.1.0"
export const HASH = "6c7ab72837fdce77a910f6fc0c622c6c4d5b17f6fbf7295f345d50d3508dd515"
export const CODE = `transaction(keyIndex: Int) {
	prepare(signer: auth(RevokeKey) &Account) {
		if let key = signer.keys.get(keyIndex: keyIndex) {
			signer.keys.revoke(keyIndex: keyIndex)
		} else {
			panic("No key with the given index exists on the authorizer's account")
		}
	}
}`

export const template = ({
    proposer,
    authorization,
    payer,
    keyIndex 
}) => fcl.pipe([
    fcl.invariant(keyIndex !== null, "template({keyIndex}) -- keyIndex not be an empty string."),
    fcl.transaction(CODE),
    fcl.args([
        fcl.arg(keyIndex, t.Int)
    ]),
    fcl.proposer(proposer),
    fcl.authorizations([authorization]),
    fcl.payer(payer)
])
