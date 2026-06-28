import { create } from "zustand";
import type { TransactionStatus, AppEvent } from "@/types";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  network: string;
  setAddress: (address: string | null) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setNetwork: (network: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  isConnecting: false,
  network: "testnet",
  setAddress: (address) => set({ address }),
  setConnected: (connected) => set({ isConnected: connected }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setNetwork: (network) => set({ network }),
  disconnect: () => set({ address: null, isConnected: false }),
}));

interface TransactionState {
  transactions: TransactionStatus[];
  addTransaction: (tx: TransactionStatus) => void;
  updateTransaction: (hash: string, status: "success" | "failed") => void;
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  addTransaction: (tx) =>
    set((state) => ({ transactions: [tx, ...state.transactions].slice(0, 50) })),
  updateTransaction: (hash, status) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.hash === hash ? { ...t, status } : t,
      ),
    })),
  clearTransactions: () => set({ transactions: [] }),
}));

interface EventState {
  events: AppEvent[];
  addEvent: (event: AppEvent) => void;
  clearEvents: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  addEvent: (event) =>
    set((state) => ({ events: [event, ...state.events].slice(0, 100) })),
  clearEvents: () => set({ events: [] }),
}));
