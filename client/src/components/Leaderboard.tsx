"use client";

import { Trophy, Medal, Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useContract } from "@/hooks/useContract";
import { useQuery } from "@tanstack/react-query";
import { shortenAddress, formatStroops } from "@/lib/utils";
import type { Donation } from "@/types";

interface LeaderboardProps {
  campaignId: number;
}

const rankIcons = [Trophy, Medal, Medal];

export function Leaderboard({ campaignId }: LeaderboardProps) {
  const { getDonors } = useContract();

  const { data: donors, isLoading } = useQuery({
    queryKey: ["donors", campaignId],
    queryFn: () => getDonors(campaignId),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Donor Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!donors || donors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Donor Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No donations yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Be the first to donate!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by amount descending
  const sorted = [...donors].sort(
    (a, b) => parseFloat(b.amount) - parseFloat(a.amount)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Donor Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.slice(0, 10).map((donation, index) => {
            const RankIcon = rankIcons[index];
            return (
              <div
                key={`${donation.donor}-${donation.timestamp}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {index < 3 ? (
                    <RankIcon
                      className={`h-5 w-5 ${
                        index === 0
                          ? "text-yellow-500"
                          : index === 1
                          ? "text-gray-400"
                          : "text-amber-600"
                      }`}
                    />
                  ) : (
                    <span className="w-5 text-center text-sm font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {shortenAddress(donation.donor)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(donation.timestamp * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {formatStroops(donation.amount)}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
