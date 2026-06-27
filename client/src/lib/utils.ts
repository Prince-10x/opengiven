import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatXLM(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return "0";
  // Divide by 10^7 to get actual XLM (Stellar uses 7-digit precision for stroops)
  return (num / 1e7).toFixed(2);
}

export function formatStroops(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return "0 XLM";
  return (num / 1e7).toFixed(2) + " XLM";
}

export function calculateProgress(raised: string, goal: string): number {
  const r = parseFloat(raised);
  const g = parseFloat(goal);
  if (g === 0) return 0;
  return Math.min(Math.round((r / g) * 100), 100);
}

export function getExplorerUrl(hash: string, network: string = "testnet"): string {
  if (network === "testnet") {
    return `https://stellar.expert/explorer/testnet/tx/${hash}`;
  }
  return `https://stellar.expert/explorer/public/tx/${hash}`;
}

export function getTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
