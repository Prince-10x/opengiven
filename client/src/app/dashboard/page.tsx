"use client";

import { Wallet, Gift, Heart, TrendingUp, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/useWallet";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useWalletStore } from "@/store/walletStore";
import { shortenAddress, formatStroops } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { address, isConnected, network, connect, isConnecting } = useWallet();
  const { campaigns } = useCampaigns();
  const { transactions } = useWalletStore();

  const totalDonated = transactions
    .filter((tx) => tx.type === "donate" && tx.status === "success")
    .reduce((sum, tx) => sum + parseFloat(tx.amount || "0"), 0);

  const myCampaigns = campaigns.filter(() => true); // All campaigns visible
  const activeCampaigns = campaigns.filter((c) => c.active).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Your Opengive overview
          </p>
        </div>
        {!isConnected && (
          <Button onClick={connect} disabled={isConnecting} className="gap-2">
            <Wallet className="h-4 w-4" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Campaigns
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeCampaigns} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Donated
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatStroops(totalDonated.toString())}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transactions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Network
            </CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={network === "testnet" ? "default" : "secondary"}>
                {network}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isConnected ? "Connected" : "Disconnected"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5" />
            Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Address:</span>
                <span className="text-sm font-mono font-medium">
                  {shortenAddress(address || "")}
                </span>
                <Badge variant="success">Connected</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Full address: {address}
              </p>
              <div className="flex gap-3 mt-4">
                <Link href="/campaigns">
                  <Button size="sm" className="gap-2">
                    <Gift className="h-4 w-4" />
                    View Campaigns
                  </Button>
                </Link>
                <Link href="/activity">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Heart className="h-4 w-4" />
                    Activity Feed
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Connect your wallet to view dashboard
              </p>
              <Button
                onClick={connect}
                disabled={isConnecting}
                className="mt-4 gap-2"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
