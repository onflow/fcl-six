import * as fcl from "@onflow/fcl"
import {t, config} from "@onflow/fcl"

const DEPS = new Set([
    "0xSTAKINGCOLLECTIONADDRESS",
])

export const TITLE = "Create Machine Account"
export const DESCRIPTION = "Creates a Machine Account for node held in Staking Collection."
export const VERSION = "0.1.0"
export const HASH = "f198785f62ed2d916b7e7eaa4ef9ff4007b3b4c5a046915ecadc0e683ef6ab34"
export const CODE = `import Crypto
import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS

/// Creates a machine account for a node that is already in the staking collection
/// and adds public keys to the new account

transaction(nodeID: String, 
            machineAccountKey: String, 
            machineAccountKeySignatureAlgorithm: UInt8, 
            machineAccountKeyHashAlgorithm: UInt8) {
    
    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection

    prepare(account: auth(BorrowValue) &Account) {
        self.stakingCollectionRef = account.storage.borrow<auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow a reference to a StakingCollection in the primary user's account")

        if let machineAccount = self.stakingCollectionRef.createMachineAccountForExistingNode(nodeID: nodeID, payer: account) {
            let sigAlgo = SignatureAlgorithm(rawValue: machineAccountKeySignatureAlgorithm)
                ?? panic("Could not get a signature algorithm from the raw enum value provided")

            let hashAlgo = HashAlgorithm(rawValue: machineAccountKeyHashAlgorithm)
                ?? panic("Could not get a hash algorithm from the raw enum value provided")
            
            let publicKey = PublicKey(
			    publicKey: machineAccountKey.decodeHex(),
			    signatureAlgorithm: sigAlgo
		    )
            machineAccount.keys.add(publicKey: publicKey, hashAlgorithm: hashAlgo, weight: 1000.0)
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


const cryptoToRuntimeSigningAlgorithm = (cryptoSigningAlgorithm) => {
    switch (cryptoSigningAlgorithm) {
      case 1: // crypto.BLSBLS12381
        return 3; // BLS_BLS12381
      case 2: // crypto.ECDSAP256
        return 1; // ECDSA_P256
      case 3: // crypto.ECDSASecp256k1
        return 2; // ECDSA_secp256k1
      default:
        return 0; // UNKNOWN
    }
  };

export const template = async ({ proposer, authorization, payer, nodeId = "", publicKey = ""}) => {
    for (let addr of DEPS) await addressCheck(addr)

        const pk = fcl.withPrefix(publicKey);
        const values = publicKey ? decode(pk) : [];
        const machineAccountKey =
          values.length > PUBLIC_KEY ? values[PUBLIC_KEY]?.toString("hex") : "";
        const signatureAlgorithm =
          values.length > SIG_ALGO
            ? cryptoToRuntimeSigningAlgorithm(
                parseInt(values[SIG_ALGO]?.toString("hex"), 16)
              )
            : 1;
        const hashAlgorithm =
          values.length > HASH_ALGO
            ? parseInt(values[HASH_ALGO]?.toString("hex"), 16)
            : 1;


    return fcl.pipe([
        fcl.transaction(CODE),
        fcl.args([
            fcl.arg(nodeID, t.String),
            fcl.arg(machineAccountKey, t.String),
            fcl.arg(signatureAlgorithm, t.UInt8),
            fcl.arg(hashAlgorithm, t.UInt8),
        ]),
        fcl.proposer(proposer),
        fcl.authorizations([authorization]),
        fcl.payer(payer)
    ])
}
