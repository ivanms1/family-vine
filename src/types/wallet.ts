export interface WalletInfo {
  address: string;
  label: string;
  ownerType: 'family' | 'child';
  ownerId: string;
}

export interface BlockchainSettings {
  enabled: boolean;
  familyWallet: WalletInfo | null;
  childWallets: WalletInfo[];
  contractAddress: string | null;
  explorerBaseUrl: string;
}
