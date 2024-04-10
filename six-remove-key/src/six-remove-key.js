import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

export const TITLE = "Remove Key"
export const DESCRIPTION = "Remove key from Account on Flow."
export const VERSION = "0.1.0"
export const HASH = "21d4e87df171ccbe015efe69dc2ffd24814c5fc0f2e364daf5c80515ce4a8bd9"
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