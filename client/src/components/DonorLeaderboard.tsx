"use client";

import { useLeaderboard } from "@/hooks/useContract";
import { formatXlm, truncateAddress } from "@/lib/utils";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";

export function DonorLeaderboard() {
  const { data: donors, isLoading, error } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 py-4 text-center">
        Failed to load leaderboard
      </div>
    );
  }

  if (!donors || donors.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No donations yet. Be the first!
      </div>
    );
  }

  // Sort by total donated descending
  const sorted = [...donors].sort(
    (a, b) => Number(b.total_donated) - Number(a.total_donated),
  );

  const getIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (index === 1) return <Medal className="h-4 w-4 text-gray-400" />;
    if (index === 2) return <Award className="h-4 w-4 text-amber-600" />;
    return null;
  };

  return (
    <div className="space-y-2">
      {sorted.slice(0, 10).map((donor, i) => (
        <div
          key={donor.donor}
          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 text-center text-sm font-medium text-muted-foreground">
              {getIcon(i) || `#${i + 1}`}
            </span>
            <div>
              <p className="text-sm font-mono">{truncateAddress(donor.donor)}</p>
            </div>
          </div>
          <span className="text-sm font-semibold">
            {formatXlm(donor.total_donated)} XLM
          </span>
        </div>
      ))}
    </div>
  );
}
