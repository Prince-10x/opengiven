"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Wallet, LogOut } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { address, isConnected, isConnecting, error, connect, disconnect } =
    useWallet();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">Opengive</span>
          <span className="hidden sm:inline text-sm text-muted-foreground ml-2">
            Transparent Donation Tracker
          </span>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <span className="text-xs text-red-500 max-w-[200px] truncate">
              {error}
            </span>
          )}

          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm font-mono text-muted-foreground">
                {truncateAddress(address)}
              </span>
              <button
                onClick={disconnect}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 border border-input hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-4",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                isConnecting && "opacity-50 cursor-not-allowed",
              )}
            >
              <Wallet className="h-4 w-4 sm:mr-2" />
              <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            </button>
          )}

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 w-9 border border-input hover:bg-accent hover:text-accent-foreground"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
        </div>
      </div>
    </nav>
  );
}
