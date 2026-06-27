"use client";

import { Target, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { calculateProgress, formatStroops } from "@/lib/utils";

interface CampaignProgressProps {
  raised: string;
  goal: string;
  donorCount: number;
  className?: string;
}

export function CampaignProgress({
  raised,
  goal,
  donorCount,
  className,
}: CampaignProgressProps) {
  const progress = calculateProgress(raised, goal);

  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-1.5">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Target className="h-3.5 w-3.5" />
          <span>{formatStroops(goal)}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{donorCount}</span>
        </div>
      </div>
      <Progress value={progress} />
      <div className="flex justify-between mt-1.5">
        <span className="text-sm font-semibold text-primary">
          {formatStroops(raised)}
        </span>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
    </div>
  );
}
