"use client";

import { useEffect } from "react";
import { useTransactionStore } from "@/store";
import { explorerUrl, timeAgo } from "@/lib/utils";
import { server } from "@/lib/contract";
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";

export function TransactionTracker() {
  const { transactions, updateTransaction, clearTransactions } =
    useTransactionStore();

  // Poll pending transactions for status updates
  useEffect(() => {
    const pending = transactions.filter((t) => t.status === "pending");
    if (pending.length === 0) return;

    const interval = setInterval(async () => {
      for (const tx of pending) {
        try {
          const result = await server.getTransaction(tx.hash);
          if (result.status === "SUCCESS") {
            updateTransaction(tx.hash, "success");
          } else if (result.status === "FAILED") {
            updateTransaction(tx.hash, "failed");
          }
        } catch {
          // keep polling
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [transactions, updateTransaction]);

  if (transactions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        No transactions yet
      </div>
    );
  }

  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";

  return (
    <div className="space-y-2">
      {transactions.slice(0, 10).map((tx) => (
        <div
          key={tx.hash}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <div>
            {tx.status === "pending" && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            )}
            {tx.status === "success" && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {tx.status === "failed" && (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{tx.label}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground font-mono truncate">
                {tx.hash.slice(0, 16)}...
              </span>
              <span className="text-xs text-muted-foreground">
                {timeAgo(Math.floor(tx.timestamp / 1000))}
              </span>
            </div>
          </div>
          <a
            href={explorerUrl(tx.hash, network as any)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      ))}
      {transactions.length > 0 && (
        <button
          onClick={clearTransactions}
          className="text-xs text-muted-foreground hover:text-foreground w-full text-center pt-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
