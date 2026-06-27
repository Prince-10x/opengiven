"use client";

import { useState } from "react";
import { Gift, Loader2, AlertCircle } from "lucide-react";
import { CampaignCard } from "@/components/CampaignCard";
import { CreateCampaignForm } from "@/components/CreateCampaignForm";
import { DonateModal } from "@/components/DonateModal";
import { CampaignProgress } from "@/components/CampaignProgress";
import { Leaderboard } from "@/components/Leaderboard";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useWallet } from "@/hooks/useWallet";
import { Skeleton } from "@/components/ui/skeleton";
import type { Campaign } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CampaignsPage() {
  const {
    campaigns,
    isLoading,
    error,
    createCampaign,
    donate,
    isCreating,
    isDonating,
  } = useCampaigns();
  const { isConnected } = useWallet();

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donateOpen, setDonateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleDonate = (id: number) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) {
      setSelectedCampaign(campaign);
      setDonateOpen(true);
    }
  };

  const handleViewDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Browse and support fundraising campaigns
          </p>
        </div>
        <CreateCampaignForm
          onCreateCampaign={createCampaign}
          isCreating={isCreating}
          isConnected={isConnected}
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            {error instanceof Error
              ? error.message
              : "Failed to load campaigns. Make sure the contract is deployed and configured."}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Gift className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">No campaigns yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first to create a fundraising campaign.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="cursor-pointer"
              onClick={() => handleViewDetail(campaign)}
            >
              <CampaignCard
                campaign={campaign}
                onDonate={(id) => {
                  // Stop propagation to prevent opening detail
                  handleDonate(id);
                }}
                isConnected={isConnected}
              />
            </div>
          ))}
        </div>
      )}

      {/* Donate Modal */}
      <DonateModal
        campaign={selectedCampaign}
        open={donateOpen}
        onOpenChange={setDonateOpen}
        onDonate={donate}
        isDonating={isDonating}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.title}</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {selectedCampaign.description}
              </p>

              <CampaignProgress
                raised={selectedCampaign.raised}
                goal={selectedCampaign.goal}
                donorCount={selectedCampaign.donor_count}
              />

              <Leaderboard campaignId={selectedCampaign.id} />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDetailOpen(false);
                    setDonateOpen(true);
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 gap-2 w-full"
                  disabled={!isConnected}
                >
                  <Gift className="h-4 w-4" />
                  Donate Now
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
