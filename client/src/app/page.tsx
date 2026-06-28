"use client";

import { useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { CampaignCard } from "@/components/CampaignCard";
import { CreateCampaignModal } from "@/components/CreateCampaignModal";
import { DonorLeaderboard } from "@/components/DonorLeaderboard";
import { EventFeed } from "@/components/EventFeed";
import { TransactionTracker } from "@/components/TransactionTracker";
import { useCampaigns, useCreateCampaign, useDonate } from "@/hooks/useContract";
import { usePollEvents } from "@/hooks/useEvents";
import { useWallet } from "@/hooks/useWallet";
import { Plus, Gift, Activity, Trophy, ArrowRight, Loader2 } from "lucide-react";

function Home() {
  const { address, isConnected, signTx } = useWallet();
  const { data: campaigns, isLoading, error } = useCampaigns();
  const createCampaign = useCreateCampaign();
  const donate = useDonate();
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"campaigns" | "leaderboard" | "events" | "transactions">("campaigns");

  usePollEvents();

  const handleCreateCampaign = useCallback(
    (name: string, goal: number, deadline: number) => {
      if (!address) return;
      createCampaign.mutate({
        admin: address,
        name,
        goal,
        deadline,
        signTx,
      });
      setCreateOpen(false);
    },
    [address, createCampaign],
  );

  const handleDonate = useCallback(
    (campaignId: number, amount: number) => {
      if (!address) return;
      donate.mutate({
        donor: address,
        campaignId,
        amount,
        signTx,
      });
    },
    [address, donate],
  );

  const tabs = [
    { id: "campaigns", label: "Campaigns", icon: Gift },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "events", label: "Activity", icon: Activity },
    { id: "transactions", label: "Transactions", icon: ArrowRight },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Transparent Donation Tracker
              </h1>
              <p className="text-muted-foreground mt-1">
                Every donation is recorded on the Stellar blockchain. Full transparency, zero trust needed.
              </p>
            </div>
            {isConnected && (
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === "campaigns" && (
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <p className="text-red-500">Failed to load campaigns</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Make sure the contract is deployed and configured
                  </p>
                </div>
              ) : !campaigns || campaigns.length === 0 ? (
                <div className="text-center py-16 border rounded-lg">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mt-4">No campaigns yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isConnected
                      ? "Create the first campaign to get started!"
                      : "Connect your wallet to create or donate to campaigns."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {campaigns.map((c) => (
                    <CampaignCard
                      key={c.id}
                      data={c}
                      walletAddress={address}
                      onDonate={handleDonate}
                      isDonating={donate.isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="lg:col-span-3 max-w-2xl mx-auto w-full">
              <h2 className="text-xl font-semibold mb-4">Top Donors</h2>
              <DonorLeaderboard />
            </div>
          )}

          {activeTab === "events" && (
            <div className="lg:col-span-3 max-w-2xl mx-auto w-full">
              <h2 className="text-xl font-semibold mb-4">Activity Feed</h2>
              <EventFeed />
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="lg:col-span-3 max-w-2xl mx-auto w-full">
              <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
              <TransactionTracker />
            </div>
          )}
        </div>
      </main>

      <CreateCampaignModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateCampaign}
        isCreating={createCampaign.isPending}
      />
    </div>
  );
}

export default Home;
