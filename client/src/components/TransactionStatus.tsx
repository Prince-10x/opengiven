"use client";

import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getExplorerUrl, formatStroops, getTimeAgo } from "@/lib/utils";
import { useWalletStore } from "@/store/walletStore";
import type { TransactionRecord } from "@/types";

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    variant: "pending" as const,
  },
  success: {
    icon: CheckCircle2,
    label: "Success",
    variant: "success" as const,
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    variant: "destructive" as const,
  },
};

export function TransactionStatus() {
  const { transactions, network } = useWalletStore();

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No transactions yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Your transaction history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const config = statusConfig[tx.status];
        const StatusIcon = config.icon;

        return (
          <div
            key={tx.hash}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {tx.status === "pending" ? (
                <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
              ) : (
                <StatusIcon
                  className={`h-5 w-5 ${
                    tx.status === "success"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">
                    {tx.type.replace("_", " ")}
                  </span>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {tx.campaignId && <span>Campaign #{tx.campaignId}</span>}
                  {tx.amount && (
                    <span className="font-mono">
                      {formatStroops(tx.amount)}
                    </span>
                  )}
                  <span>{getTimeAgo(tx.timestamp)}</span>
                </div>
                {tx.error && (
                  <p className="text-xs text-red-500 mt-0.5">{tx.error}</p>
                )}
              </div>
            </div>

            <a
              href={getExplorerUrl(tx.hash, network)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" title="View on Explorer">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        );
      })}
    </div>
  );
}
