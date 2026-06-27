"use client";

import { EventFeed } from "@/components/EventFeed";

export default function ActivityPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Activity Feed</h1>
        <p className="text-muted-foreground mt-1">
          Live activity from the Opengive contracts on the Stellar network.
        </p>
      </div>

      <EventFeed />
    </div>
  );
}
