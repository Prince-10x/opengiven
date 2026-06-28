"use client";

import { useCallback, useEffect, useState } from "react";
import {
  StellarWalletsKit,
  Networks,
  KitEventType,
} from "@creit.tech/stellar-wallets-kit";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { useWalletStore } from "@/store";

// Initialize the kit statically (only once)
const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015";

let initialized = false;
function ensureKitInit() {
  if (!initialized) {
    StellarWalletsKit.init({
      modules: defaultModules(),
      network: Networks.TESTNET,
    });
    initialized = true;
  }
}

export function useWallet() {
  const {
    address,
    isConnected,
    isConnecting,
    setAddress,
    setConnected,
    setConnecting,
    disconnect: storeDisconnect,
  } = useWalletStore();

  const [error, setError] = useState<string | null>(null);

  // Listen for wallet state changes (network switch, disconnects)
  useEffect(() => {
    ensureKitInit();
    const unsub = StellarWalletsKit.on(
      KitEventType.STATE_UPDATED,
      (event) => {
        if (event.payload.address) {
          setAddress(event.payload.address);
          setConnected(true);
        } else {
          setAddress(null);
          setConnected(false);
        }
      },
    );
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [setAddress, setConnected]);

  const connect = useCallback(async () => {
    ensureKitInit();
    setConnecting(true);
    setError(null);
    try {
      const { address: addr } = await StellarWalletsKit.authModal();
      setAddress(addr);
      setConnected(true);
    } catch (e: any) {
      // User closed the modal
      if (e?.code === -1) {
        // Modal closed — not an error, just no selection
        return;
      }
      if (
        typeof e?.message === "string" &&
        (e.message.toLowerCase().includes("reject") ||
          e.message.toLowerCase().includes("denied") ||
          e.message.toLowerCase().includes("cancelled"))
      ) {
        setError("Transaction rejected by user");
      } else if (
        typeof e?.message === "string" &&
        e.message.toLowerCase().includes("not found")
      ) {
        setError(
          "Wallet not found. Please install Freighter or another Stellar wallet.",
        );
      } else {
        setError(e?.message || "Failed to connect wallet");
      }
    } finally {
      setConnecting(false);
    }
  }, [setAddress, setConnected, setConnecting]);

  const signTx = useCallback(
    async (xdr: string): Promise<string> => {
      ensureKitInit();
      const addr = useWalletStore.getState().address;
      if (!addr) throw new Error("No wallet connected");
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: addr,
      });
      return signedTxXdr;
    },
    [],
  );

  const handleDisconnect = useCallback(() => {
    storeDisconnect();
    setError(null);
  }, [storeDisconnect]);

  return {
    address,
    isConnected,
    isConnecting,
    error,
    connect,
    signTx,
    disconnect: handleDisconnect,
  };
}
