"use client";

import { useEffect, useRef } from "react";
import {
  Gift,
  Heart,
  RefreshCw,
  Loader2,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEvents } from "@/hooks/useEvents";
import { shortenAddress, getTimeAgo, formatStroops } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function EventFeed() {
  const { events, isLoading, refetch } = useEvents();
  const bottomRef = useRef<HTMLDivElement>(null);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "campaign_created":
        return <Gift className="h-4 w-4 text-blue-500" />;
      case "donation_received":
        return <Heart className="h-4 w-4 text-red-500" />;
      default:
        return <Zap className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case "campaign_created":
        return "Campaign Created";
      case "donation_received":
        return "Donation";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Activity Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Live Activity Feed
            {events.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {events.length}
              </Badge>
            )}
          </div>
          <button
            onClick={() => refetch()}
            className="p-1 hover:bg-accent rounded-md transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Zap className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No events yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Events will appear here as they happen
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {events.slice(0, 50).map((event, index) => (
              <div
                key={`${event.txHash}-${index}`}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="mt-0.5">{getEventIcon(event.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {getEventLabel(event.type)}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      #{event.campaignId}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {event.donor && (
                      <span>{shortenAddress(event.donor)}</span>
                    )}
                    {event.amount && (
                      <span className="font-mono">
                        {formatStroops(event.amount)}
                      </span>
                    )}
                    <span>{getTimeAgo(event.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
