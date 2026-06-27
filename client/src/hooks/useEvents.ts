"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { rpc } from "@stellar/stellar-sdk";
import type { ContractEvent } from "@/types";

const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export function useEvents() {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastLedger = useRef<string | undefined>(undefined);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return;

    try {
      const server = new rpc.Server(RPC_URL);
      const response = await server.getEvents({
        startLedger: lastLedger.current ? Number(lastLedger.current) : undefined,
        filters: [
          {
            type: "contract",
            contractIds: [CONTRACT_ADDRESS],
          },
        ],
        pagination: {
          limit: 20,
        },
      });

      if (response && response.events.length > 0) {
        // Update last ledger
        if (response.latestLedger) {
          lastLedger.current = response.latestLedger.toString();
        }

        const newEvents: ContractEvent[] = response.events
          .map((ev: any) => {
            try {
              const topics = ev.topic || [];
              const eventType = topics[0]?.toString() || "unknown";
              const value = ev.value || {};

              // Parse based on event type
              if (eventType.includes("camp_created")) {
                return {
                  type: "campaign_created",
                  campaignId: Number(value._0 || value[0] || 0),
                  timestamp: Math.floor(Date.now() / 1000),
                  txHash: ev.id || "",
                };
              }

              if (eventType.includes("donation")) {
                return {
                  type: "donation_received",
                  campaignId: Number(value._0 || value[0] || 0),
                  donor: (value._1 || value[1] || "").toString(),
                  amount: (value._2 || value[2] || "0").toString(),
                  timestamp: Math.floor(Date.now() / 1000),
                  txHash: ev.id || "",
                };
              }

              return null;
            } catch {
              return null;
            }
          })
          .filter(Boolean) as ContractEvent[];

        if (newEvents.length > 0) {
          setEvents((prev) => {
            const existing = new Set(prev.map((e) => e.txHash));
            const unique = newEvents.filter((e) => !existing.has(e.txHash));
            return [...unique, ...prev].slice(0, 100);
          });
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchEvents();

    // Poll every 5 seconds
    intervalRef.current = setInterval(fetchEvents, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchEvents]);

  return { events, isLoading, refetch: fetchEvents };
}
