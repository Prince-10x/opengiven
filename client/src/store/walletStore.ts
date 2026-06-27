import { create } from "zustand";
import type { WalletState, TransactionRecord } from "@/types";

interface WalletStore extends WalletState {
  transactions: TransactionRecord[];
  setAddress: (address: string | null) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setNetwork: (network: string) => void;
  setBalance: (balance: string) => void;
  reset: () => void;
  addTransaction: (tx: TransactionRecord) => void;
  updateTransaction: (hash: string, updates: Partial<TransactionRecord>) => void;
}

const initialState: WalletState = {
  address: null,
  isConnected: false,
  isConnecting: false,
  network: "testnet",
  balance: "0",
};

export const useWalletStore = create<WalletStore>((set) => ({
  ...initialState,
  transactions: [],
  setAddress: (address) => set({ address }),
  setConnected: (isConnected) => set({ isConnected }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setNetwork: (network) => set({ network }),
  setBalance: (balance) => set({ balance }),
  reset: () => set(initialState),
  addTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions].slice(0, 50),
    })),
  updateTransaction: (hash, updates) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.hash === hash ? { ...tx, ...updates } : tx
      ),
    })),
}));
