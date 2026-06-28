export interface Campaign {
  name: string;
  goal: string;
  total_raised: string;
  deadline: number;
  admin: string;
  active: boolean;
}

export interface Donation {
  donor: string;
  amount: string;
  timestamp: number;
}

export interface DonorInfo {
  donor: string;
  total_donated: string;
}

export interface CampaignWithId {
  id: number;
  campaign: Campaign;
}

export interface TransactionStatus {
  hash: string;
  status: "pending" | "success" | "failed";
  label: string;
  timestamp: number;
}

export interface AppEvent {
  type: string;
  timestamp: number;
  wallet: string;
  action: string;
  txHash?: string;
}
