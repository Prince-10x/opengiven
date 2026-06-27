"use client";

import { useCallback } from "react";
import {
  rpc,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  Address,
} from "@stellar/stellar-sdk";
import { useWalletStore } from "@/store/walletStore";
import { useWallet } from "./useWallet";

const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

const server = new rpc.Server(RPC_URL);

// ScVal conversion helpers
function toScValString(v: string) {
  return nativeToScVal(v, { type: "string" });
}

function toScValU64(v: number) {
  return nativeToScVal(v, { type: "u64" });
}

function toScValI128(v: string) {
  return nativeToScVal(v, { type: "i128" });
}

function toScValAddress(v: string) {
  return new Address(v).toScVal();
}

function toScValBool(v: boolean) {
  return nativeToScVal(v, { type: "bool" });
}

// Parse contract return values
function parseCampaign(val: any) {
  return {
    id: Number(val.id),
    title: val.title,
    description: val.description,
    goal: val.goal.toString(),
    raised: val.raised.toString(),
    donor_count: Number(val.donor_count),
    active: val.active,
  };
}

function parseDonation(val: any) {
  return {
    donor: val.donor.toString(),
    amount: val.amount.toString(),
    timestamp: Number(val.timestamp),
  };
}

export function useContract() {
  const { address, network } = useWalletStore();
  const { signTransaction } = useWallet();

  const simulateTx = useCallback(
    async (method: string, params: any[], source?: string) => {
      if (!CONTRACT_ADDRESS) {
        throw new Error("Contract address not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.");
      }

      const contract = new Contract(CONTRACT_ADDRESS);
      const caller = source || address;

      // Get account
      let account;
      try {
        account = await server.getAccount(caller || "");
      } catch {
        throw new Error("Account not found on network. Make sure it's funded.");
      }

      // Build operation
      const op = contract.call(method, ...params);

      // Build, simulate, and return result
      const tx = new TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase,
      })
        .addOperation(op)
        .setTimeout(30)
        .build();

      const sim = await server.simulateTransaction(tx);

      if (sim.error) {
        throw new Error(`Simulation error: ${sim.error}`);
      }

      // For read-only functions, parse the result
      if (sim.result) {
        return sim.result.retval ? scValToNative(sim.result.retval) : null;
      }

      // For write functions, return the assembled tx
      if (!sim.result?.auth || !("assembleTransaction" in rpc)) {
        return tx;
      }

      const assembled = rpc.assembleTransaction(tx, sim);
      return assembled;
    },
    [address]
  );

  const signAndSend = useCallback(
    async (tx: any): Promise<string> => {
      const xdr = tx.toXDR();
      const signedXdr = await signTransaction(xdr);
      const signedTx = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);

      const sendResult = await server.sendTransaction(signedTx);

      if (sendResult.status === "ERROR") {
        throw new Error(sendResult.errorResult?.result?.code || "Transaction failed");
      }

      // Poll for completion
      const hash = sendResult.hash;
      let attempts = 0;
      while (attempts < 30) {
        const txResult = await server.getTransaction(hash);
        if (txResult.status === "SUCCESS") {
          return hash;
        }
        if (txResult.status === "FAILED") {
          throw new Error(`Transaction failed: ${txResult.resultXdr}`);
        }
        await new Promise((r) => setTimeout(r, 1000));
        attempts++;
      }

      throw new Error("Transaction timed out");
    },
    [signTransaction]
  );

  // --- Contract Read Functions ---

  const getCampaignCount = useCallback(async (): Promise<number> => {
    try {
      const result = await simulateTx("get_campaign_count", []);
      return Number(result);
    } catch {
      return 0;
    }
  }, [simulateTx]);

  const getCampaign = useCallback(
    async (id: number) => {
      const result = await simulateTx("get_campaign", [toScValU64(id)]);
      return parseCampaign(result);
    },
    [simulateTx]
  );

  const getAllCampaigns = useCallback(async () => {
    const result = await simulateTx("get_all_campaigns", []);
    if (!result) return [];
    return result.map(parseCampaign);
  }, [simulateTx]);

  const getDonors = useCallback(
    async (id: number) => {
      const result = await simulateTx("get_donors", [toScValU64(id)]);
      if (!result) return [];
      return result.map(parseDonation);
    },
    [simulateTx]
  );

  // --- Contract Write Functions ---

  const createCampaign = useCallback(
    async (title: string, description: string, goal: string) => {
      if (!address) throw new Error("Wallet not connected");

      const tx = await simulateTx(
        "create_campaign",
        [toScValString(title), toScValString(description), toScValI128(goal)],
        address
      );
      return signAndSend(tx);
    },
    [address, simulateTx, signAndSend]
  );

  const donate = useCallback(
    async (campaignId: number, amount: string) => {
      if (!address) throw new Error("Wallet not connected");

      const tx = await simulateTx(
        "donate",
        [toScValU64(campaignId), toScValAddress(address), toScValI128(amount)],
        address
      );
      return signAndSend(tx);
    },
    [address, simulateTx, signAndSend]
  );

  return {
    getCampaignCount,
    getCampaign,
    getAllCampaigns,
    getDonors,
    createCampaign,
    donate,
    CONTRACT_ADDRESS,
  };
}
