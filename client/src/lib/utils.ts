import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatXlm(amount: string | number): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return (num / 10_000_000).toFixed(2);
}

export function toStroops(amount: number): number {
  return Math.floor(amount * 10_000_000);
}

export function fromStroops(stroops: string | number): number {
  const val = typeof stroops === "string" ? Number(stroops) : stroops;
  return val / 10_000_000;
}

export function calcProgress(raised: string | number, goal: string | number): number {
  const r = typeof raised === "string" ? Number(raised) : raised;
  const g = typeof goal === "string" ? Number(goal) : goal;
  if (g === 0) return 0;
  return Math.min(Math.round((r / g) * 100), 100);
}

export function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function explorerUrl(hash: string, network: "testnet" | "mainnet" = "testnet"): string {
  const base = network === "testnet"
    ? "https://stellar.expert/explorer/testnet"
    : "https://stellar.expert/explorer/public";
  return `${base}/tx/${hash}`;
}
