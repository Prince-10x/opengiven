"use client";

import { TransactionStatus } from "@/components/TransactionStatus";
import { useWallet } from "@/hooks/useWallet";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
  const { isConnected, connect, isConnecting } = useWallet();

  if (!isConnected) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Your donation and campaign creation history.
          </p>
        </div>
        <div className="flex flex-col items-center py-16 text-center">
          <Wallet className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">Connect Your Wallet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Connect your wallet to view your transaction history.
          </p>
          <Button onClick={connect} disabled={isConnecting} className="gap-2">
            <Wallet className="h-4 w-4" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground mt-1">
          Your donation and campaign creation history.
        </p>
      </div>

      <TransactionStatus />
    </div>
  );
}
