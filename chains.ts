// chains.ts (in the root or /config folder)

// 1) Create an object with chain data
export const CHAINS = {
    ETHEREUM: {
      chainId: "0x1", // 1 in decimal
      chainName: "Ethereum Mainnet",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: ["https://mainnet.infura.io/v3/YOUR-INFURA-KEY"],
      blockExplorerUrls: ["https://etherscan.io/"],
    },
    POLYGON: {
      chainId: "0x89", // 137 in decimal
      chainName: "Polygon Mainnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      rpcUrls: ["https://polygon-rpc.com/"],
      blockExplorerUrls: ["https://polygonscan.com/"],
    },
    ARBITRUM: {
      chainId: "0xa4b1", // 42161 in decimal
      chainName: "Arbitrum One",
      nativeCurrency: {
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: ["https://arb1.arbitrum.io/rpc"],
      blockExplorerUrls: ["https://arbiscan.io/"],
    },
    AVALANCHE: {
      chainId: "0xa86a", // 43114 in decimal
      chainName: "Avalanche C-Chain",
      nativeCurrency: {
        name: "Avalanche",
        symbol: "AVAX",
        decimals: 18,
      },
      rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
      blockExplorerUrls: ["https://snowtrace.io/"],
    },
    BASE: {
      chainId: "0x2105", // 8453 in decimal
      chainName: "Base Mainnet",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: ["https://mainnet.base.org"],
      blockExplorerUrls: ["https://explorer.base.org/"],
    },
  } as const;
  
  // 2) Optionally export a type for convenience
  export type ChainKey = keyof typeof CHAINS;
  