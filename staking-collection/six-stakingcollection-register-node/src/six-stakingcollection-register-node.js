import * as fcl from "@onflow/fcl";
import { t, config } from "@onflow/fcl";
import { decode } from "@onflow/rlp";

const PUBLIC_KEY = 0;
const SIG_ALGO = 1;
const HASH_ALGO = 2;
const WEIGHT = 3;

const DEPS = new Set(["0xSTAKINGCOLLECTIONADDRESS"]);

export const TITLE = "Register Node";
export const DESCRIPTION = "Register a node held in a Staking Collection.";
export const VERSION = "0.1.0";
export const HASH = "cb447088cc809b27a9eb96cd9722f5a5dbd5cdb4085e660bf426e2f7f01debba";
export const CODE = `import Crypto
import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS

/// Registers a delegator in the staking collection resource
/// for the specified node information and the amount of tokens to commit

transaction(id: String,
            role: UInt8,
            networkingAddress: String,
            networkingKey: String,
            stakingKey: String,
            amount: UFix64,
            machineAccountKey: String, 
            machineAccountKeySignatureAlgorithm: UInt8, 
            machineAccountKeyHashAlgorithm: UInt8) {

    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection

    prepare(account: auth(BorrowValue) &Account) {
        self.stakingCollectionRef = account.storage.borrow<auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow a reference to a StakingCollection in the primary user's account")

        if let machineAccount = self.stakingCollectionRef.registerNode(
            id: id,
            role: role,
            networkingAddress: networkingAddress,
            networkingKey: networkingKey,
            stakingKey: stakingKey,
            amount: amount,
            payer: account
        ) {
            let sigAlgo = SignatureAlgorithm(rawValue: machineAccountKeySignatureAlgorithm)
                ?? panic("Could not get a signature algorithm from the raw enum value provided")

            let hashAlgo = HashAlgorithm(rawValue: machineAccountKeyHashAlgorithm)
                ?? panic("Could not get a hash algorithm from the raw enum value provided")
            
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
}

export const template = async ({ proposer, authorization, payer, nodeID = "", nodeRole = "", networkingAddress = "", networkingKey = "", stakingKey = "", amount = "", publicKeys = [] }) => {
    for (let addr of DEPS) await addressCheck(addr)

    const decodedPublicKeys = (publicKeys || []).map(pk => {
        const values = decode(`0x${pk}`)
        return {
            keyIndex: 0,
            publicKey: {
                publicKey: Array.from((values[PUBLIC_KEY].map(v => v))),
                signatureAlgorithm: cryptoToRuntimeSigningAlgorithm(parseInt(values[SIG_ALGO]?.toString("hex"), 16))
            },
            hashAlgorithm: parseInt(values[HASH_ALGO]?.toString("hex"), 16),
            weight: `${parseInt(values[WEIGHT]?.toString("hex"), 16) + ".0"}`,
            isRevoked: false
        }
    });

    return fcl.pipe([
        fcl.transaction(CODE),
        fcl.args([
            fcl.arg(nodeID, t.String),
            fcl.arg(nodeRole, t.UInt8),
            fcl.arg(networkingAddress, t.String),
            fcl.arg(networkingKey, t.String),
            fcl.arg(stakingKey, t.String),
            fcl.arg(amount, t.UFix64),
            fcl.arg(
                decodedPublicKeys.map((pk) => ({
                    fields: [
                        { name: "keyIndex", value: pk.keyIndex },
                        {
                            name: "publicKey",
                            value: {
                                fields: [
                                    { name: "publicKey", value: pk.publicKey.publicKey },
                                    {
                                        name: "signatureAlgorithm",
                                        value: {
                                            fields: [
                                                { name: "rawValue", value: pk.publicKey.signatureAlgorithm }
                                            ]
                                        }
                                    }
                                ]
                            },
                        },
                        {
                            name: "hashAlgorithm",
                            value: {
                                fields: [
                                    { name: "rawValue", value: pk.hashAlgorithm }
                                ]
                            },
                        },
                        { name: "weight", value: pk.weight },
                        { name: "isRevoked", value: pk.isRevoked },
                    ],
                })),
                t.Optional(
                    t.Array(
                        t.Struct("I.Crypto.Crypto.KeyListEntry", [
                            { value: t.Int },
                            {
                                value: t.Struct("PublicKey", [
                                    { value: t.Array(t.UInt8) },
                                    {
                                        value: t.Enum("SignatureAlgorithm", [
                                            { value: t.UInt8 }
                                        ])
                                    },
                                ]),
                            },
                            {
                                value: t.Enum("HashAlgorithm", [
                                    { value: t.UInt8 }
                                ])
                            },
                            { value: t.UFix64 },
                            { value: t.Bool },
                        ])
                    )
                )
            ),
        ]),
        fcl.proposer(proposer),
        fcl.authorizations([authorization]),
        fcl.payer(payer),
    ]);
};