import * as fcl from "@onflow/fcl";
import { t, config } from "@onflow/fcl";
import { decode } from "@onflow/rlp";

const PUBLIC_KEY = 0;
const SIG_ALGO = 1;
const HASH_ALGO = 2;
const WEIGHT = 3;

const DEPS = new Set(["0xSTAKINGCOLLECTIONADDRESS"]);

export const TITLE = "Register Node with Pop";
export const DESCRIPTION = "Register a node held in a Staking Collection with proof of possession.";
export const VERSION = "0.1.1";
export const HASH =
  "df77422a20db56be7b6a4aea1282d5a53ea9a6509a6fcf653722229890cc8904";
export const CODE = `import Crypto
import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS

/// Registers a delegator in the staking collection resource
/// for the specified node information and the amount of tokens to commit

transaction(id: String,
            role: UInt8,
            networkingAddress: String,
            networkingKey: String,
            stakingKey: String,
            stakingKeyPoP: String,
            amount: UFix64,
            machineAccountKey: String, 
            machineAccountKeySignatureAlgorithm: UInt8, 
            machineAccountKeyHashAlgorithm: UInt8) {

    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection

    prepare(account: auth(BorrowValue) &Account) {
        pre {
			machineAccountKeySignatureAlgorithm == 1 || machineAccountKeySignatureAlgorithm == 2:
                "Cannot register node with provided machine account key: Must provide a signature algorithm raw value that corresponds to "
                .concat("one of the available signature algorithms for Flow keys.")
                .concat("You provided ").concat(machineAccountKeySignatureAlgorithm.toString())
                .concat(" but the options are either 1 (ECDSA_P256) or 2 (ECDSA_secp256k1).")
			machineAccountKeyHashAlgorithm == 1 || machineAccountKeyHashAlgorithm == 3:
                "Cannot register node with provided machine account key: Must provide a hash algorithm raw value that corresponds to "
                .concat("one of of the available hash algorithms for Flow keys.")
                .concat("You provided ").concat(machineAccountKeyHashAlgorithm.toString())
                .concat(" but the options are either 1 (SHA2_256) or 3 (SHA3_256).")
		}

        self.stakingCollectionRef = account.storage.borrow<auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic(FlowStakingCollection.getCollectionMissingError(nil))

        if let machineAccount = self.stakingCollectionRef.registerNode(
            id: id,
            role: role,
            networkingAddress: networkingAddress,
            networkingKey: networkingKey,
            stakingKey: stakingKey,
            stakingKeyPoP: stakingKeyPoP,
            amount: amount,
            payer: account
        ) {
            let sigAlgo = SignatureAlgorithm(rawValue: machineAccountKeySignatureAlgorithm)!

            let hashAlgo = HashAlgorithm(rawValue: machineAccountKeyHashAlgorithm)!
            
            let publicKey = PublicKey(
			    publicKey: machineAccountKey.decodeHex(),
			    signatureAlgorithm: sigAlgo
		    )
            machineAccount.keys.add(publicKey: publicKey, hashAlgorithm: hashAlgo, weight: 1000.0)
        }
    }
}
`;

class UndefinedConfigurationError extends Error {
  constructor(address) {
    const msg =
      `Stored Interaction Error: Missing configuration for ${address}. Please see the following to learn more: https://github.com/onflow/fcl-six/blob/main/six-withdraw-unstaked-flow/README.md`.trim();
    super(msg);
    this.name = "Stored Interaction Undefined Address Configuration Error";
  }
}

const addressCheck = async (address) => {
  if (!(await config().get(address)))
    throw new UndefinedConfigurationError(address);
};


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

export const template = async ({
  proposer,
  authorization,
  payer,
  nodeID = "",
  nodeRole = "",
  networkingAddress = "",
  networkingKey = "",
  stakingKey = "",
  stakingKeyPoP = "",
  amount = "",
  publicKey = "",
}) => {
  for (let addr of DEPS) await addressCheck(addr);

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
      fcl.arg(nodeRole, t.UInt8),
      fcl.arg(networkingAddress, t.String),
      fcl.arg(networkingKey, t.String),
      fcl.arg(stakingKey, t.String),
      fcl.arg(stakingKeyPoP, t.String),
      fcl.arg(amount, t.UFix64),
      fcl.arg(machineAccountKey, t.String),
      fcl.arg(signatureAlgorithm, t.UInt8),
      fcl.arg(hashAlgorithm, t.UInt8),
    ]),
    fcl.proposer(proposer),
    fcl.authorizations([authorization]),
    fcl.payer(payer),
  ]);
};
export const MAINNET_HASH = `3b0b2bbc3a2ad674122c182112f7008a8d3d1b60b107033c0ebe7bbe50df5267`
export const TESTNET_HASH = `deb5f758f3eb3b125cd9b14a6528f18d535377709fcef41e743751eb82800921`