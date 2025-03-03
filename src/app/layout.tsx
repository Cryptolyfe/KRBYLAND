"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import "./globals.css"; // The code that excludes <button>/<select> from the universal gradient
import Image from "next/image";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";

// 1) Press_Start_2P
const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/** 2) 5 EVM Chains */
const CHAINS = {
  ETHEREUM: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.infura.io/v3/YOUR_INFURA_KEY"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  POLYGON: {
    chainId: "0x89",
    chainName: "Polygon Mainnet",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  ARBITRUM: {
    chainId: "0xa4b1",
    chainName: "Arbitrum One",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"],
  },
  AVALANCHE: {
    chainId: "0xa86a",
    chainName: "Avalanche C-Chain",
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io"],
  },
  BASE: {
    chainId: "0x2105",
    chainName: "Base Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://explorer.base.org"],
  },
} as const;

/** 3) A CUSTOM CHAIN DROPDOWN (no native <select>) */
function ChainDropdown({
  chains,
  selectedKey,
  onSelect,
}: {
  chains: { key: string; chainName: string }[];
  selectedKey: string;
  onSelect: (chainKey: string) => void;
}) {
  const [open, setOpen] = useState(false);

  // find chain name for the currently selected key
  const selectedChainName =
    chains.find((c) => c.key === selectedKey)?.chainName || "Select Chain";

  // The same pink→yellow gradient on hover style for the toggle
  const toggleClasses = `
    px-2 py-1
    text-xs
    text-white
    border-2
    border-white
    rounded-full
    bg-transparent
    transition-colors
    cursor-pointer
    hover:bg-gradient-to-r
    hover:from-pink-500
    hover:to-yellow-500
    hover:text-transparent
    hover:bg-clip-text
  `;

  return (
    <div className="relative inline-block">
      {/* 1) The toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={toggleClasses}
      >
        {selectedChainName}
      </button>

      {/* 2) The custom dropdown menu => only shows when open===true */}
      {open && (
        <div className="
          absolute
          mt-2
          w-60                /* Increased width from w-44 to w-60 */
          whitespace-nowrap   /* Prevent chain names from wrapping */
          border
          border-white
          rounded
          bg-black
          text-white
          z-10
        ">
          {chains.map((chain) => (
            <div
              key={chain.key}
              onClick={() => {
                onSelect(chain.key);
                setOpen(false);
              }}
              // White text => pink→yellow gradient on hover
              className="
                px-3
                py-1
                cursor-pointer
                hover:bg-gradient-to-r
                hover:from-pink-500
                hover:to-yellow-500
                hover:text-transparent
                hover:bg-clip-text
              "
            >
              {chain.chainName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** 4) RootLayout => uses our custom ChainDropdown for chain selection */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState<keyof typeof CHAINS>("ETHEREUM");

  // Same connect logic
  const connectWallet = async () => {
    if (!window.ethereum) {
      console.error("Please install MetaMask or another compatible wallet.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  // same chain switch logic
  const switchChain = async (chainKey: keyof typeof CHAINS) => {
    if (!window.ethereum) return;
    const chainData = CHAINS[chainKey];
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainData.chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // chain not added => attempt add
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
          console.error("Failed to add chain:", addError);
        }
      } else {
        console.error("Failed to switch chain:", error);
      }
    }
  };

  // Build an array for the custom dropdown
  const chainArray = Object.entries(CHAINS).map(([key, data]) => ({
    key,
    chainName: data.chainName,
  }));

  // truncated address
  const truncatedAddress = account
    ? `${account.slice(0, 5)}...${account.slice(-4)}`
    : "";

  // White→pink/yellow gradient on hover => for Connect Wallet
  const sharedHoverGradient = `
    px-2 py-1
    text-xs
    text-white
    border-2
    border-white
    rounded-full
    bg-transparent
    transition-colors
    cursor-pointer
    hover:bg-gradient-to-r
    hover:from-pink-500
    hover:to-yellow-500
    hover:text-transparent
    hover:bg-clip-text
  `;

  return (
    <html lang="en">
      <body className={`min-h-screen text-xs bg-black ${pressStart2P.className}`}>
        
        {/* 5) Nav Bar / Header */}
        <header className="p-2 bg-black border-b border-neutral-800">
          <nav className="container mx-auto flex items-center justify-between">

            {/* LEFT SIDE: Logo + Title + Connect or Address */}
            <div className="flex items-center">
              {/* Logo + Title */}
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/images/krbyland_logo.png"
                  alt="KRBYLAND Logo"
                  width={36}
                  height={36}
                />
                <span className="text-xs font-bold">KRBYLAND</span>
              </Link>

              {/* Connect Button or truncated address => same pink→yellow hover */}
              <div className="ml-2">
                {account ? (
                  <button className={sharedHoverGradient}>
                    {truncatedAddress}
                  </button>
                ) : (
                  <button onClick={connectWallet} className={sharedHoverGradient}>
                    Connect Wallet
                  </button>
                )}
              </div>

              {/* 6) Instead of <select>, we show our custom chain dropdown, if connected */}
              {account && (
                <div className="ml-2">
                  <ChainDropdown
                    chains={chainArray}
                    selectedKey={selectedChain}
                    onSelect={(chainKey) => {
                      setSelectedChain(chainKey as keyof typeof CHAINS);
                      switchChain(chainKey as keyof typeof CHAINS);
                    }}
                  />
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Full Nav => Home, About, Livestream, Contact, Settings */}
            <ul className="flex gap-2">
              <li>
                <Link
                  href="/"
                  className="nav-override text-white hover:text-fuchsia-500 transition-colors text-xs"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="nav-override text-white hover:text-green-300 transition-colors text-xs"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/livestream"
                  className="nav-override text-white hover:text-cyan-300 transition-colors text-xs"
                >
                  Livestream
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="nav-override text-white hover:text-indigo-500 transition-colors text-xs"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="nav-override text-white hover:text-yellow-300 transition-colors text-xs"
                >
                  Settings
                </Link>
              </li>
            </ul>

          </nav>
        </header>

        {/* 7) Main Content */}
        <main className="container mx-auto px-4 py-4">
          {children}
        </main>
      </body>
    </html>
  );
}
