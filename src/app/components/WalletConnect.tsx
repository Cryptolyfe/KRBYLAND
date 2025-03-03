"use client";

import React, { useState } from "react";
import { ethers } from "ethers";

// Minimal chain configs for demonstration
// (In production, consider a separate chains.ts file)
const CHAINS = {
  ETHEREUM: {
    label: "Ethereum",
    chainId: "0x1", // decimal 1
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.infura.io/v3/YOUR_INFURA_KEY"],
    blockExplorerUrls: ["https://etherscan.io/"],
  },
  POLYGON: {
    label: "Polygon",
    chainId: "0x89", // decimal 137
    chainName: "Polygon Mainnet",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  ARBITRUM: {
    label: "Arbitrum",
    chainId: "0xa4b1", // decimal 42161
    chainName: "Arbitrum One",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"],
  },
  AVALANCHE: {
    label: "Avalanche",
    chainId: "0xa86a", // decimal 43114
    chainName: "Avalanche C-Chain",
    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io"],
  },
  BASE: {
    label: "Base",
    chainId: "0x2105", // decimal 8453
    chainName: "Base Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://explorer.base.org"],
  },
};

function WalletConnect({ onConnect }: { onConnect: () => void }) {
  const [account, setAccount] = useState<string | null>(null);

  // ===== Existing Connect Logic (Preserved) =====
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        onConnect(); // Notify layout/parent that connection occurred
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    } else {
      console.error("Please install MetaMask or another compatible wallet.");
    }
  };

  // ===== New: Switch to a Different EVM Chain =====
  const switchChain = async (chainKey: keyof typeof CHAINS) => {
    const chainData = CHAINS[chainKey];
    if (!window.ethereum || !chainData) return;

    try {
      // Attempt to switch the wallet to the chain
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainData.chainId }],
      });
    } catch (error: any) {
      // Error code 4902 = chain not added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainData.chainId,
                chainName: chainData.chainName,
                nativeCurrency: chainData.nativeCurrency,
                rpcUrls: chainData.rpcUrls,
                blockExplorerUrls: chainData.blockExplorerUrls,
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add chain to MetaMask:", addError);
        }
      } else {
        console.error("Failed to switch chain:", error);
      }
    }
  };

  // Truncate wallet address => first 5 + last 4
  const truncatedAddress = account ? `${account.slice(0, 5)}...${account.slice(-4)}` : "";

  return (
    <div>
      {/* If connected, show truncated address & chain-switch buttons */}
      {account ? (
        <div className="flex flex-col gap-2">
          <span className="text-white">{truncatedAddress}</span>

          {/* New: Buttons to switch between chains */}
          <div className="flex gap-2">
            {Object.keys(CHAINS).map((chainKey) => (
              <button
                key={chainKey}
                onClick={() => switchChain(chainKey as keyof typeof CHAINS)}
                className="px-2 py-1 border rounded text-white"
              >
                Switch to {CHAINS[chainKey as keyof typeof CHAINS].label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Existing "Connect Wallet" button (unchanged)
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default WalletConnect;
