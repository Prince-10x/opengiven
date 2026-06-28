"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: number;
  campaignName: string;
  onDonate: (campaignId: number, amount: number) => void;
  isDonating: boolean;
}

export function DonateModal({
  open,
  onOpenChange,
  campaignId,
  campaignName,
  onDonate,
  isDonating,
}: Props) {
  const [amount, setAmount] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    const amountStroops = Math.floor(parseFloat(amount) * 10_000_000);
    onDonate(campaignId, amountStroops);
    setAmount("");
    onOpenChange(false);
  };

  const quickAmounts = [10, 50, 100, 500];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="relative w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold mb-1">Donate</h2>
        <p className="text-sm text-muted-foreground mb-4">{campaignName}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (XLM)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-lg font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {quickAmounts.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(a.toString())}
                className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors h-8 px-3 border border-input hover:bg-accent"
              >
                {a} XLM
              </button>
            ))}
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
              disabled={isDonating || !amount || parseFloat(amount) <= 0}
              className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isDonating ? "Processing..." : "Donate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
