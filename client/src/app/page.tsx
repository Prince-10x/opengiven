"use client";

import Link from "next/link";
import { Gift, Heart, Shield, Zap, ArrowRight, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Gift,
    title: "Campaign Creation",
    description: "Launch transparent fundraising campaigns on the Stellar network.",
  },
  {
    icon: Shield,
    title: "On-Chain Transparency",
    description: "All donations are recorded on the Stellar blockchain for full transparency.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Real-time progress bars showing campaign fundraising status.",
  },
  {
    icon: Users,
    title: "Donor Leaderboard",
    description: "Public leaderboard showcasing top donors for each campaign.",
  },
  {
    icon: Zap,
    title: "Live Activity Feed",
    description: "Real-time event feed showing all campaign and donation activity.",
  },
  {
    icon: Heart,
    title: "Wallet Integration",
    description: "Connect with Freighter wallet to donate and create campaigns.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="flex flex-col items-center text-center py-16 md:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm mb-8">
          <Zap className="h-4 w-4 text-primary" />
          <span>Built on Stellar Network</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
          Transparent Donation Tracking
          <span className="text-primary block mt-2">
            On the Blockchain
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mt-6">
          Opengive is a decentralized donation platform where every contribution
          is recorded on the Stellar network. Create campaigns, track progress,
          and see who's donating — all on-chain.
        </p>
        <div className="flex gap-4 mt-8">
          <Link href="/campaigns">
            <Button size="lg" className="gap-2">
              Explore Campaigns
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">100%</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>On-Chain Transparency</CardDescription>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">Real-Time</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Progress & Activity Updates</CardDescription>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">Stellar</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Secure & Low-Cost Network</CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section className="py-8">
        <h2 className="text-2xl font-bold text-center mb-10">
          Everything You Need
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12">
        <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Make a Difference?</CardTitle>
            <CardDescription className="text-base">
              Connect your wallet to start donating or create your own campaign.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
