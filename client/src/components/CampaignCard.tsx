"use client";

import type { CampaignWithId } from "@/types";
import { ProgressBar } from "./ProgressBar";
import { calcProgress, formatXlm, timeAgo, truncateAddress } from "@/lib/utils";
import { Clock, Target, Users } from "lucide-react";
import { useState } from "react";
import { DonateModal } from "./DonateModal";

interface CampaignCardProps {
  data: CampaignWithId;
  walletAddress?: string | null;
  onDonate: (campaignId: number, amount: number) => void;
  isDonating: boolean;
}

export function CampaignCard({
  data,
  walletAddress,
  onDonate,
  isDonating,
}: CampaignCardProps) {
  const { id, campaign } = data;
  const progress = calcProgress(campaign.total_raised, campaign.goal);
  const raisedXlm = formatXlm(campaign.total_raised);
  const goalXlm = formatXlm(campaign.goal);
  const isExpired = Date.now() / 1000 > campaign.deadline;
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {campaign.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                by {truncateAddress(campaign.admin)}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                !campaign.active || isExpired
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              }`}
            >
              {!campaign.active
                ? "Closed"
                : isExpired
                  ? "Ended"
                  : "Active"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {raisedXlm} XLM raised
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <ProgressBar value={progress} />
            <p className="text-xs text-muted-foreground">Goal: {goalXlm} XLM</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Campaign #{id}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(campaign.deadline)}
            </span>
          </div>

          {campaign.active && !isExpired && walletAddress && (
            <button
              onClick={() => setDonateOpen(true)}
              disabled={isDonating}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isDonating ? "Processing..." : "Donate"}
            </button>
          )}
        </div>
      </div>

      <DonateModal
        open={donateOpen}
        onOpenChange={setDonateOpen}
        campaignId={id}
        campaignName={campaign.name}
        onDonate={onDonate}
        isDonating={isDonating}
      />
    </>
  );
}
