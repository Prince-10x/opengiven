"use client";

import { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CreateCampaignFormProps {
  onCreateCampaign: (title: string, description: string, goal: string) => Promise<string>;
  isCreating: boolean;
  isConnected: boolean;
}

export function CreateCampaignForm({
  onCreateCampaign,
  isCreating,
  isConnected,
}: CreateCampaignFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !goal) {
      toast.error("Please fill in all fields");
      return;
    }

    const goalNum = parseFloat(goal);
    if (isNaN(goalNum) || goalNum <= 0) {
      toast.error("Goal must be a positive number");
      return;
    }

    // Convert XLM to stroops (1 XLM = 10^7 stroops)
    const goalStroops = BigInt(Math.round(goalNum * 1e7)).toString();

    try {
      await onCreateCampaign(title, description, goalStroops);
      toast.success("Campaign created successfully!");
      setOpen(false);
      setTitle("");
      setDescription("");
      setGoal("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create campaign");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!isConnected} className="gap-2">
          <Gift className="h-4 w-4" />
          Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Campaign</DialogTitle>
          <DialogDescription>
            Launch a new fundraising campaign on the Stellar network.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">
              Campaign Title
            </label>
            <Input
              id="title"
              placeholder="Help build a school"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="description">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe your campaign goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="goal">
              Fundraising Goal (XLM)
            </label>
            <Input
              id="goal"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="1000"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the amount in XLM. 1 XLM = 10,000,000 stroops.
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isCreating} className="w-full gap-2">
              {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCreating ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
