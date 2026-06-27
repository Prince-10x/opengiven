"use client";

import { useState } from "react";
import { Wallet, LogOut, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function WalletConnect() {
  const { address, isConnected, isConnecting, network, connect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
      toast.success("Wallet connected successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to connect wallet");
    }
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <Button onClick={handleConnect} disabled={isConnecting} className="gap-2">
        {isConnecting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className="hidden sm:inline-flex">
        {network === "testnet" ? "Testnet" : "Mainnet"}
      </Badge>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2 font-mono text-xs"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {shortenAddress(address || "")}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={disconnect}
          title="Disconnect"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
