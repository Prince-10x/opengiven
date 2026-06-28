import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDCIXHCTZ3WHCO6WNFDLVWR2EEDSJS3GJ7C7Y6CP2PQYBAUFULSMAXAT",
  }
} as const

export type DataKey = {tag: "Campaign", values: readonly [u64]} | {tag: "Donors", values: readonly [u64]} | {tag: "Counter", values: void} | {tag: "DonorTotal", values: readonly [string]} | {tag: "AllDonors", values: void} | {tag: "AllCampaigns", values: void};


export interface Campaign {
  active: boolean;
  admin: string;
  deadline: u64;
  goal: i128;
  name: string;
  total_raised: i128;
}


export interface Donation {
  amount: i128;
  donor: string;
  timestamp: u64;
}


export interface DonorInfo {
  donor: string;
  total_donated: i128;
}


export interface Client {
  /**
   * Construct and simulate a donate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  donate: ({donor, campaign_id, amount}: {donor: string, campaign_id: u64, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_campaign: ({campaign_id}: {campaign_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Campaign>>

  /**
   * Construct and simulate a get_campaigns transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_campaigns: (options?: MethodOptions) => Promise<AssembledTransaction<Array<u64>>>

  /**
   * Construct and simulate a close_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  close_campaign: ({admin, campaign_id}: {admin: string, campaign_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a create_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_campaign: ({admin, name, goal, deadline}: {admin: string, name: string, goal: i128, deadline: u64}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_leaderboard transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_leaderboard: (options?: MethodOptions) => Promise<AssembledTransaction<Array<DonorInfo>>>

  /**
   * Construct and simulate a get_campaign_donors transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_campaign_donors: ({campaign_id}: {campaign_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Array<Donation>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABgAAAAEAAAAAAAAACENhbXBhaWduAAAAAQAAAAYAAAABAAAAAAAAAAZEb25vcnMAAAAAAAEAAAAGAAAAAAAAAAAAAAAHQ291bnRlcgAAAAABAAAAAAAAAApEb25vclRvdGFsAAAAAAABAAAAEwAAAAAAAAAAAAAACUFsbERvbm9ycwAAAAAAAAAAAAAAAAAADEFsbENhbXBhaWducw==",
        "AAAAAAAAAAAAAAAGZG9uYXRlAAAAAAADAAAAAAAAAAVkb25vcgAAAAAAABMAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAABmFtb3VudAAAAAAACwAAAAA=",
        "AAAAAQAAAAAAAAAAAAAACENhbXBhaWduAAAABgAAAAAAAAAGYWN0aXZlAAAAAAABAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAAEZ29hbAAAAAsAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAx0b3RhbF9yYWlzZWQAAAAL",
        "AAAAAQAAAAAAAAAAAAAACERvbmF0aW9uAAAAAwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVkb25vcgAAAAAAABMAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAY=",
        "AAAAAQAAAAAAAAAAAAAACURvbm9ySW5mbwAAAAAAAAIAAAAAAAAABWRvbm9yAAAAAAAAEwAAAAAAAAANdG90YWxfZG9uYXRlZAAAAAAAAAs=",
        "AAAAAAAAAAAAAAAMZ2V0X2NhbXBhaWduAAAAAQAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAEAAAfQAAAACENhbXBhaWdu",
        "AAAABQAAAAAAAAAAAAAADURvbmF0aW9uRXZlbnQAAAAAAAABAAAADmRvbmF0aW9uX2V2ZW50AAAAAAADAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAAAAAAAAFZG9ub3IAAAAAAAATAAAAAAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAE=",
        "AAAAAAAAAAAAAAANZ2V0X2NhbXBhaWducwAAAAAAAAAAAAABAAAD6gAAAAY=",
        "AAAAAAAAAAAAAAAOY2xvc2VfY2FtcGFpZ24AAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAA=",
        "AAAAAAAAAAAAAAAPY3JlYXRlX2NhbXBhaWduAAAAAAQAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAEbmFtZQAAABAAAAAAAAAABGdvYWwAAAALAAAAAAAAAAhkZWFkbGluZQAAAAYAAAABAAAABg==",
        "AAAAAAAAAAAAAAAPZ2V0X2xlYWRlcmJvYXJkAAAAAAAAAAABAAAD6gAAB9AAAAAJRG9ub3JJbmZvAAAA",
        "AAAAAAAAAAAAAAATZ2V0X2NhbXBhaWduX2Rvbm9ycwAAAAABAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAA+oAAAfQAAAACERvbmF0aW9u" ]),
      options
    )
  }
  public readonly fromJSON = {
    donate: this.txFromJSON<null>,
        get_campaign: this.txFromJSON<Campaign>,
        get_campaigns: this.txFromJSON<Array<u64>>,
        close_campaign: this.txFromJSON<null>,
        create_campaign: this.txFromJSON<u64>,
        get_leaderboard: this.txFromJSON<Array<DonorInfo>>,
        get_campaign_donors: this.txFromJSON<Array<Donation>>
  }
}