"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { calculateProgress, formatStroops } from "@/lib/utils";
import type { Campaign } from "@/types";

interface DonateModalProps {
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDonate: (campaignId: number, amount: string) => Promise<string>;
  isDonating: boolean;
}

export function DonateModal({
  campaign,
  open,
  onOpenChange,
  onDonate,
  isDonating,
}: DonateModalProps) {
  const [amount, setAmount] = useState("");

  if (!campaign) return null;

  const progress = calculateProgress(campaign.raised, campaign.goal);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      // Convert XLM to stroops
      const amtStroops = BigInt(Math.round(amt * 1e7)).toString();
      await onDonate(campaign.id, amtStroops);
      toast.success(`Donated ${amt} XLM to "${campaign.title}"!`);
      setAmount("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to process donation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Donate to {campaign.title}</DialogTitle>
          <DialogDescription>
            Support this campaign with a donation in XLM.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatStroops(campaign.raised)} raised</span>
              <span>Goal: {formatStroops(campaign.goal)}</span>
            </div>
          </div>

          <form onSubmit={handleDonate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="amount">
                Donation Amount (XLM)
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={isDonating}
                className="w-full gap-2"
              >
                {isDonating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    Donate {amount ? `${amount} XLM` : ""}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
