"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  readContract,
  buildContractTx,
  toScValAddress,
  toScValString,
  toScValI128,
  toScValU64,
  server,
  NETWORK_PASSPHRASE,
} from "@/lib/contract";
import { TransactionBuilder } from "@stellar/stellar-sdk";
import type { Campaign, Donation, DonorInfo, CampaignWithId } from "@/types";
import { useTransactionStore, useEventStore } from "@/store";

async function sendTx(
  method: string,
  args: any[],
  source: string,
  signTx: (xdr: string) => Promise<string>,
): Promise<string> {
  const tx = await buildContractTx(method, args, source);
  const txXdr = tx.toXDR();
  const signed = await signTx(txXdr);
  const envelope = TransactionBuilder.fromXDR(
    signed,
    NETWORK_PASSPHRASE as any,
  );
  const result = await server.sendTransaction(envelope);
  if (result.status === "ERROR") throw new Error("Transaction failed");
  return result.hash;
}

// --- Queries ---

export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async (): Promise<CampaignWithId[]> => {
      const ids: number[] = await readContract("get_campaigns", []);
      const campaigns: CampaignWithId[] = [];
      for (const id of ids) {
        const raw: any = await readContract("get_campaign", [
          toScValU64(id),
        ]);
        campaigns.push({
          id,
          campaign: {
            name: raw.name,
            goal: raw.goal.toString(),
            total_raised: raw.total_raised.toString(),
            deadline: Number(raw.deadline),
            admin: raw.admin,
            active: raw.active,
          },
        });
      }
      return campaigns;
    },
    refetchInterval: 10_000,
  });
}

export function useCampaignDonors(campaignId: number | null) {
  return useQuery({
    queryKey: ["donors", campaignId],
    queryFn: async (): Promise<Donation[]> => {
      if (!campaignId) throw new Error("No campaign ID");
      const raw: any[] = await readContract("get_campaign_donors", [
        toScValU64(campaignId),
      ]);
      return raw.map((d: any) => ({
        donor: d.donor,
        amount: d.amount.toString(),
        timestamp: Number(d.timestamp),
      }));
    },
    enabled: !!campaignId,
    refetchInterval: 10_000,
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async (): Promise<DonorInfo[]> => {
      const raw: any[] = await readContract("get_leaderboard", []);
      return raw.map((d: any) => ({
        donor: d.donor,
        total_donated: d.total_donated.toString(),
      }));
    },
    refetchInterval: 15_000,
  });
}

// --- Mutations ---

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const addEvent = useEventStore((s) => s.addEvent);

  return useMutation({
    mutationFn: async ({
      admin,
      name,
      goal,
      deadline,
      signTx,
    }: {
      admin: string;
      name: string;
      goal: number;
      deadline: number;
      signTx: (xdr: string) => Promise<string>;
    }) => {
      const hash = await sendTx(
        "create_campaign",
        [
          toScValAddress(admin),
          toScValString(name),
          toScValI128(goal),
          toScValU64(deadline),
        ],
        admin,
        signTx,
      );
      return hash;
    },
    onSuccess: (hash) => {
      addTransaction({
        hash,
        status: "pending",
        label: "Create Campaign",
        timestamp: Date.now(),
      });
      addEvent({
        type: "campaign_created",
        timestamp: Date.now(),
        wallet: "",
        action: "Campaign created",
        txHash: hash,
      });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useDonate() {
  const queryClient = useQueryClient();
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const addEvent = useEventStore((s) => s.addEvent);

  return useMutation({
    mutationFn: async ({
      donor,
      campaignId,
      amount,
      signTx,
    }: {
      donor: string;
      campaignId: number;
      amount: number;
      signTx: (xdr: string) => Promise<string>;
    }) => {
      const hash = await sendTx(
        "donate",
        [toScValAddress(donor), toScValU64(campaignId), toScValI128(amount)],
        donor,
        signTx,
      );
      return hash;
    },
    onSuccess: (hash, vars) => {
      addTransaction({
        hash,
        status: "pending",
        label: `Donate to Campaign #${vars.campaignId}`,
        timestamp: Date.now(),
      });
      addEvent({
        type: "donation",
        timestamp: Date.now(),
        wallet: vars.donor,
        action: `Donated to campaign #${vars.campaignId}`,
        txHash: hash,
      });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["donors", vars.campaignId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
