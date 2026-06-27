export interface Campaign {
  id: number;
  title: string;
  description: string;
  goal: string;
  raised: string;
  donor_count: number;
  active: boolean;
}

export interface Donation {
  donor: string;
  amount: string;
  timestamp: number;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  network: string;
  balance: string;
}

export interface TransactionRecord {
  hash: string;
  status: "pending" | "success" | "failed";
  type: "donate" | "create_campaign";
  campaignId?: number;
  amount?: string;
  timestamp: number;
  error?: string;
}

export interface ContractEvent {
  type: string;
  campaignId?: number;
  donor?: string;
  amount?: string;
  timestamp: number;
  txHash: string;
}
