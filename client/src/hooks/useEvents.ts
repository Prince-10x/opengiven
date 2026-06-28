"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { server, CONTRACT_ADDRESS } from "@/lib/contract";
import { useEventStore } from "@/store";
import type { AppEvent } from "@/types";

const RECENT_EVENTS_KEY = "recentEvents";

export function usePollEvents() {
  const addEvent = useEventStore((s) => s.addEvent);
  const events = useEventStore((s) => s.events);
  const prevLenRef = useRef(0);

  // Restore events from session storage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(RECENT_EVENTS_KEY);
      if (stored) {
        const parsed: AppEvent[] = JSON.parse(stored);
        // Only restore if store is empty
        const store = useEventStore.getState();
        if (store.events.length === 0) {
          parsed.forEach((e) => store.addEvent(e));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist events to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem(RECENT_EVENTS_KEY, JSON.stringify(events.slice(0, 50)));
    } catch {
      // ignore
    }
  }, [events]);

  // Poll Soroban events via RPC getEvents
  useEffect(() => {
    if (!CONTRACT_ADDRESS) return;

    const interval = setInterval(async () => {
      try {
        // Use RPC getEvents to fetch recent events for the contract
        const response = await fetch(
          process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getEvents",
              params: {
                startLedger: 0,
                filters: [
                  {
                    type: "contract",
                    contractIds: [CONTRACT_ADDRESS],
                  },
                ],
                pagination: { limit: 20 },
              },
            }),
          },
        );
        const data = await response.json();
        if (data.result?.events) {
          for (const event of data.result.events) {
            const value = event.value;
            const topics = event.topic;
            // Parse donation event: topics: ["donation"], value: [campaign_id, donor, amount]
            if (topics?.[0] === "donation") {
              const donorAddr = value?.[1] || "unknown";
              const campId = value?.[0] || 0;
              addEvent({
                type: "donation",
                timestamp: Date.now(),
                wallet: donorAddr,
                action: `Donated to campaign #${campId}`,
                txHash: event.id,
              });
            }
          }
        }
      } catch {
        // Polling is best-effort
      }
    }, 10_000);

    return () => clearInterval(interval);
  }, [addEvent]);
}

export function useEvents() {
  return useEventStore((s) => s.events);
}
