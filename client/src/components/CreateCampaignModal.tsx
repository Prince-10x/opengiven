"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, goal: number, deadline: number) => void;
  isCreating: boolean;
}

export function CreateCampaignModal({
  open,
  onOpenChange,
  onCreate,
  isCreating,
}: Props) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [days, setDays] = useState("30");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !goal) return;
    const goalStroops = Math.floor(parseFloat(goal) * 10_000_000);
    const deadline = Math.floor(Date.now() / 1000) + parseInt(days) * 86400;
    onCreate(name, goalStroops, deadline);
    setName("");
    setGoal("");
    setDays("30");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="relative w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Create Campaign</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Campaign Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Help Build a School"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Goal (XLM)</label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. 1000"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (days)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 border border-input hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !name || !goal}
              className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
