"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContract } from "./useContract";
import { useWalletStore } from "@/store/walletStore";
import type { Campaign } from "@/types";

export function useCampaigns() {
  const { getAllCampaigns, getCampaign, getDonors, createCampaign: createC, donate: donateToC } = useContract();
  const { addTransaction, updateTransaction } = useWalletStore();
  const queryClient = useQueryClient();

  const campaignsQuery = useQuery({
    queryKey: ["campaigns"],
    queryFn: getAllCampaigns,
    refetchInterval: 10000,
  });

  const campaignDetailQuery = (id: number) =>
    useQuery({
      queryKey: ["campaign", id],
      queryFn: () => getCampaign(id),
      refetchInterval: 5000,
    });

  const donorsQuery = (id: number) =>
    useQuery({
      queryKey: ["donors", id],
      queryFn: () => getDonors(id),
      refetchInterval: 5000,
    });

  const createCampaignMutation = useMutation({
    mutationFn: async ({
      title,
      description,
      goal,
    }: {
      title: string;
      description: string;
      goal: string;
    }) => {
      const hash = await createC(title, description, goal);
      addTransaction({
        hash,
        status: "pending",
        type: "create_campaign",
        timestamp: Math.floor(Date.now() / 1000),
      });

      // Poll for status
      let attempts = 0;
      while (attempts < 60) {
        try {
          const { rpc: rpcModule } = await import("@stellar/stellar-sdk");
          const server = new rpcModule.Server(
            process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org"
          );
          const result = await server.getTransaction(hash);
          if (result.status === "SUCCESS") {
            updateTransaction(hash, { status: "success" });
            return hash;
          }
          if (result.status === "FAILED") {
            updateTransaction(hash, { status: "failed", error: "Transaction failed" });
            throw new Error("Transaction failed");
          }
        } catch (e: any) {
          if (e.message !== "Transaction failed") {
            // Still pending
            await new Promise((r) => setTimeout(r, 1000));
            attempts++;
            continue;
          }
          throw e;
        }
        await new Promise((r) => setTimeout(r, 1000));
        attempts++;
      }
      updateTransaction(hash, { status: "failed", error: "Timed out" });
      throw new Error("Transaction timed out");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  const donateMutation = useMutation({
    mutationFn: async ({
      campaignId,
      amount,
    }: {
      campaignId: number;
      amount: string;
    }) => {
      const hash = await donateToC(campaignId, amount);
      addTransaction({
        hash,
        status: "pending",
        type: "donate",
        campaignId,
        amount,
        timestamp: Math.floor(Date.now() / 1000),
      });

      let attempts = 0;
      while (attempts < 60) {
        try {
          const { rpc: rpcModule } = await import("@stellar/stellar-sdk");
          const server = new rpcModule.Server(
            process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org"
          );
          const result = await server.getTransaction(hash);
          if (result.status === "SUCCESS") {
            updateTransaction(hash, { status: "success" });
            return hash;
          }
          if (result.status === "FAILED") {
            updateTransaction(hash, { status: "failed", error: "Transaction failed" });
            throw new Error("Transaction failed");
          }
        } catch (e: any) {
          if (e.message !== "Transaction failed") {
            await new Promise((r) => setTimeout(r, 1000));
            attempts++;
            continue;
          }
          throw e;
        }
        await new Promise((r) => setTimeout(r, 1000));
        attempts++;
      }
      updateTransaction(hash, { status: "failed", error: "Timed out" });
      throw new Error("Transaction timed out");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ["donors", variables.campaignId] });
    },
  });

  return {
    campaigns: campaignsQuery.data || ([] as Campaign[]),
    isLoading: campaignsQuery.isLoading,
    error: campaignsQuery.error,
    refetch: campaignsQuery.refetch,
    campaignDetailQuery,
    donorsQuery,
    createCampaign: createCampaignMutation.mutateAsync,
    donate: donateMutation.mutateAsync,
    isCreating: createCampaignMutation.isPending,
    isDonating: donateMutation.isPending,
  };
}
