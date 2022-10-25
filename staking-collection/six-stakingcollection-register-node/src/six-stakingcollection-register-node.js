import * as fcl from "@onflow/fcl";
import { t, config } from "@onflow/fcl";

const DEPS = new Set(["0xSTAKINGCOLLECTIONADDRESS"]);

export const TITLE = "Register Node";
export const DESCRIPTION = "Register a node held in a Staking Collection.";
export const VERSION = "0.0.8";
export const HASH =
  "888e40ddf906f8194d6fe2d7675db4fb0e7c1d87a9b4796df4df68ca0559601e";
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
            publicKeys: [Crypto.KeyListEntry]?) {
    
    let stakingCollectionRef: &FlowStakingCollection.StakingCollection

    prepare(account: AuthAccount) {
        self.stakingCollectionRef = account.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow ref to StakingCollection")

        if let machineAccount = self.stakingCollectionRef.registerNode(
            id: id,
            role: role,
            networkingAddress: networkingAddress,
            networkingKey: networkingKey,
            stakingKey: stakingKey,
            stakingKeyPoP: stakingKeyPoP,
            amount: amount,
            payer: account) 
        {
            if publicKeys == nil || publicKeys!.length == 0 {
                panic("Cannot provide zero keys for the machine account")
            }
            for key in publicKeys! {
                machineAccount.keys.add(publicKey: key.publicKey, hashAlgorithm: key.hashAlgorithm, weight: key.weight)
            }
        }
    }
}
`;

class UndefinedConfigurationError extends Error {
  constructor(address) {
    const msg =
      `Stored Interaction Error: Missing configuration for ${address}. Please see the following to learn more: https://github.com/onflow/flow-js-sdk/blob/master/six/six-withdraw-unstaked-flow/README.md`.trim();
    super(msg);
    this.name = "Stored Interaction Undefined Address Configuration Error";
  }
}

const addressCheck = async (address) => {
  if (!(await config().get(address)))
    throw new UndefinedConfigurationError(address);
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
  stakingKeyPop = "",
  amount = "",
  publicKeys = [],
}) => {
  for (let addr of DEPS) await addressCheck(addr);

  return fcl.pipe([
    fcl.transaction(CODE),
    fcl.args([
      fcl.arg(nodeID, t.String),
      fcl.arg(nodeRole, t.UInt8),
      fcl.arg(networkingAddress, t.String),
      fcl.arg(networkingKey, t.String),
      fcl.arg(stakingKey, t.String),
      fcl.arg(stakingKeyPop, t.String),
      fcl.arg(amount, t.UFix64),
      fcl.arg(
        publicKeys.map((pk) => ({
          fields: [
            { name: "keyIndex", value: pk.keyIndex },
            {
              name: "publicKey",
              value: {
                publicKey: pk.publicKey.publicKey,
                signatureAlgorithm: pk.publicKey.signatureAlgorithm,
              },
            },
            { name: "hashAlgorithm", value: pk.hashAlgorithm },
            { name: "weight", value: pk.weight },
            { name: "isRevoked", value: pk.isRevoked },
          ],
        })),
        t.Optional(
          t.Array(
            t.Struct("I.Crypto.KeyListEntry", [
              { value: t.Int },
              {
                value: t.Struct("I.Crypto.PublicKey", [
                  { value: t.Array(t.UInt8) },
                  { value: t.UInt8 },
                ]),
              },
              { value: t.UInt8 },
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
