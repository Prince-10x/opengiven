"use client";

import { useCallback, useEffect } from "react";
import { useWalletStore } from "@/store/walletStore";

// Check if Freighter is available
function isFreighterAvailable(): boolean {
  return typeof window !== "undefined" && "stellar" in window && "freighter" in (window as any).stellar;
}

export function useWallet() {
  const {
    address,
    isConnected,
    isConnecting,
    network,
    balance,
    setAddress,
    setConnected,
    setConnecting,
    setNetwork,
    setBalance,
    reset,
  } = useWalletStore();

  const checkConnection = useCallback(async () => {
    try {
      if (!isFreighterAvailable()) return;

      const { isConnected: connected } = await window.stellar!.freighter.isConnected();
      if (connected) {
        const { address: addr } = await window.stellar!.freighter.getAddress();
        setAddress(addr);
        setConnected(true);

        // Get network
        try {
          const networkDetails = await window.stellar!.freighter.getNetworkDetails();
          const net = networkDetails.networkPassphrase?.includes("Test")
            ? "testnet"
            : "public";
          setNetwork(net);
        } catch {
          setNetwork("testnet");
        }
      }
    } catch (err) {
      console.error("Failed to check wallet connection:", err);
    }
  }, [setAddress, setConnected, setNetwork]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connect = useCallback(async () => {
    try {
      if (!isFreighterAvailable()) {
        throw new Error(
          "Freighter wallet not found. Please install the Freighter browser extension."
        );
      }

      setConnecting(true);

      // Request access
      const { isAllowed } = await window.stellar!.freighter.isAllowed();
      if (!isAllowed) {
        await window.stellar!.freighter.setAllowed();
      }

      const { address: addr } = await window.stellar!.freighter.getAddress();
      setAddress(addr);
      setConnected(true);

      // Get network details
      try {
        const networkDetails = await window.stellar!.freighter.getNetworkDetails();
        const net = networkDetails.networkPassphrase?.includes("Test")
          ? "testnet"
          : "public";
        setNetwork(net);
      } catch {
        setNetwork("testnet");
      }

      return addr;
    } catch (err: any) {
      const message = err?.message || "Failed to connect wallet";
      if (message.includes("not found") || message.includes("Freighter")) {
        throw new Error(
          "Wallet not found. Please install the Freighter browser extension from https://freighter.app"
        );
      }
      if (message.includes("rejected") || message.includes("denied")) {
        throw new Error("User rejected the connection request.");
      }
      throw err;
    } finally {
      setConnecting(false);
    }
  }, [setAddress, setConnected, setConnecting, setNetwork]);

  const disconnect = useCallback(() => {
    reset();
  }, [reset]);

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      if (!isFreighterAvailable()) {
        throw new Error("Freighter wallet not found.");
      }

      try {
        const { signedTxXdr } = await window.stellar!.freighter.signTransaction(xdr, {
          networkPassphrase:
            network === "testnet"
              ? "Test SDF Network ; September 2015"
              : "Public Global Stellar Network ; September 2015",
        });
        return signedTxXdr;
      } catch (err: any) {
        const message = err?.message || "";
        if (message.includes("rejected") || message.includes("cancel") || message.includes("denied")) {
          throw new Error("Transaction was rejected by user.");
        }
        if (message.includes("insufficient") || message.includes("balance")) {
          throw new Error("Insufficient balance to complete this transaction.");
        }
        throw err;
      }
    },
    [network]
  );

  return {
    address,
    isConnected,
    isConnecting,
    network,
    balance,
    connect,
    disconnect,
    signTransaction,
    checkConnection,
    isFreighterAvailable: isFreighterAvailable(),
  };
}
