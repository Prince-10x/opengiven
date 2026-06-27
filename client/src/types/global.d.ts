export {};

declare global {
  interface Window {
    stellar?: {
      freighter: {
        isConnected: () => Promise<{ isConnected: boolean }>;
        isAllowed: () => Promise<{ isAllowed: boolean }>;
        setAllowed: () => Promise<{ isAllowed: boolean }>;
        getAddress: () => Promise<{ address: string }>;
        signTransaction: (
          xdr: string,
          opts?: { networkPassphrase?: string }
        ) => Promise<{ signedTxXdr: string }>;
        getNetworkDetails: () => Promise<{
          network: string;
          networkPassphrase: string;
        }>;
      };
    };
  }
}
