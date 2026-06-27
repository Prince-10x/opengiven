"use client";

import { Users, Target } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateProgress, formatStroops } from "@/lib/utils";
import type { Campaign } from "@/types";

interface CampaignCardProps {
  campaign: Campaign;
  onDonate: (id: number) => void;
  isConnected: boolean;
}

export function CampaignCard({ campaign, onDonate, isConnected }: CampaignCardProps) {
  const progress = calculateProgress(campaign.raised, campaign.goal);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{campaign.title}</CardTitle>
          {!campaign.active && <Badge variant="secondary">Inactive</Badge>}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {campaign.description}
        </p>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <Progress value={progress} />
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              <span>Goal: {formatStroops(campaign.goal)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{campaign.donor_count} donors</span>
            </div>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold text-primary">
              {formatStroops(campaign.raised)}
            </span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <span className="text-xs text-muted-foreground">
            raised of {formatStroops(campaign.goal)}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onDonate(campaign.id)}
          disabled={!isConnected || !campaign.active}
        >
          {!isConnected ? "Connect Wallet to Donate" : "Donate Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}
