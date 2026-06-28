"use client";

import { useEvents } from "@/hooks/useEvents";
import { truncateAddress, timeAgo } from "@/lib/utils";
import { Gift, Bell, Loader2 } from "lucide-react";

export function EventFeed() {
  const events = useEvents();

  if (events.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No events yet. Start donating!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.slice(0, 20).map((event, i) => (
        <div
          key={`${event.txHash}-${i}`}
          className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
        >
          <div className="mt-0.5">
            {event.type === "donation" ? (
              <Gift className="h-4 w-4 text-green-500" />
            ) : (
              <Bell className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">{event.action}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground font-mono">
                {truncateAddress(event.wallet || "unknown", 4)}
              </span>
              <span className="text-xs text-muted-foreground">
                {timeAgo(Math.floor(event.timestamp / 1000))}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
