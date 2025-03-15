export {};

/**
 * Minimal EIP-1193 / EVM provider interface
 * matching ethers v6 Eip1193Provider signatures.
 */
interface EvmProvider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isPhantom?: boolean; // some Phantom EVM betas might set this
  providers?: EvmProvider[];

  // Change from 'request?:' to 'request:' so it's non-optional
  request: (args: {
    method: string;
    // Ethers v6 uses any[] | Record<string, any> for 'params'
    params?: any[] | Record<string, any>;
  }) => Promise<any>;
}

declare global {
  interface Window {
    ethereum?: EvmProvider;
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString(): string } }>;
    };
    phantom?: {
      isPhantom?: boolean;
      sui?: {
        // add connect if needed
      };
    };
  }
}
