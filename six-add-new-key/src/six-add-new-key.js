import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

export const TITLE = "Add New Key"
export const DESCRIPTION = "Add a new key to an Account on Flow."
export const VERSION = "0.1.0"
export const HASH = "1c9d1210f2bf129b86803b153e137420c9117e8a2409a1e2ef6f916a4e8d611f"
export const CODE = `import Crypto

transaction(key: String, signatureAlgorithm: UInt8, hashAlgorithm: UInt8, weight: UFix64) {

	prepare(signer: auth(AddKey) &Account) {
		pre {
			signatureAlgorithm >= 1 && signatureAlgorithm <= 3: "Must provide a signature algorithm raw value that is 1, 2, or 3"
			hashAlgorithm >= 1 && hashAlgorithm <= 6: "Must provide a hash algorithm raw value that is between 1 and 6"
			weight <= 1000.0: "The key weight must be between 0 and 1000"
		}
		let publicKey = PublicKey(
			publicKey: key.decodeHex(),
			signatureAlgorithm: SignatureAlgorithm(rawValue: signatureAlgorithm)!
		)

		signer.keys.add(publicKey: publicKey, hashAlgorithm: HashAlgorithm(rawValue: hashAlgorithm)!, weight: weight)
	}
}`

export const template = ({
    proposer,
    authorization,
    payer,
    publicKey,
    signatureAlgorithm,
    hashAlgorithm,
    weight
}) => fcl.pipe([
    fcl.invariant(publicKey !== "", "template({publicKey}) -- publicKey must not be an empty string."),
    fcl.invariant(signatureAlgorithm !== null, "template({signatureAlgorithm}) -- signatureAlgorithm must not be null."),
    fcl.invariant(hashAlgorithm !== null, "template({hashAlgorithm}) -- hashAlgorithm must not be null."),
    fcl.invariant(weight !== "", "template({weight}) -- weight must not be an empty string."),
    fcl.transaction(CODE),
    fcl.args([
        fcl.arg(publicKey, t.String),
        fcl.arg(signatureAlgorithm, t.UInt8),
        fcl.arg(hashAlgorithm, t.UInt8),
        fcl.arg(weight, t.UFix64)
    ]),
    fcl.proposer(proposer),
    fcl.authorizations([authorization]),
    fcl.payer(payer)
])
