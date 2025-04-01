"use client";

import React, { useState, useCallback } from "react";
import { Eip1193Provider, BrowserProvider } from "ethers";
import "../globals.css";
import Image from "next/image";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";
import ChainDropdown from "./chainDropdown";

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const CHAINS = {
  ETHEREUM: {
    label: "Ethereum",
    chainId: "0x1",
    // ... your configuration ...
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.infura.io/v3/YOUR_INFURA_KEY"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  POLYGON: {
    label: "Polygon",
    chainId: "0x89",
    // ... your configuration ...
    chainName: "Polygon Mainnet",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  // add more as needed
} as const;

type ChainKey = keyof typeof CHAINS;
type PhantomNetworkKey = "SOLANA" | "SUI";

export default function WalletConnectLayout({ children }: { children: React.ReactNode }) {
  // State
  const [connectedWallet, setConnectedWallet] =
    useState<"metamask" | "coinbase" | "phantom" | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState<ChainKey>("ETHEREUM");
  const [showWalletButtons, setShowWalletButtons] = useState(false);

  // ============== CONNECT => METAMASK ==============
  async function connectMetaMask() {
    setConnectedWallet("metamask");
    setEvmAddress(null);

    if (!window.ethereum) {
      alert("No window.ethereum => MetaMask missing?");
      return;
    }
    let chosenProvider = window.ethereum;
    if (window.ethereum.providers?.length) {
      const mm = window.ethereum.providers.find((p) => p.isMetaMask);
      if (mm) chosenProvider = mm;
    }
    if (!chosenProvider?.isMetaMask) {
      alert("MetaMask overshadowed or not found!");
      return;
    }
    try {
      const provider = new BrowserProvider(chosenProvider as Eip1193Provider);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setEvmAddress(await signer.getAddress());
    } catch (err: unknown) {
      console.error("MetaMask connect error:", err);
    }
  }

  // ============== CONNECT => COINBASE ==============
  async function connectCoinbase() {
    setConnectedWallet("coinbase");
    setEvmAddress(null);
  
    const { ethereum } = window as any;
    if (!ethereum) {
      alert("Coinbase Wallet extension is not installed.");
      return;
    }
    let chosenProvider = ethereum;
    if (ethereum.providers?.length) {
      chosenProvider = ethereum.providers.find((p: any) => p.isCoinbaseWallet);
    }
    if (!chosenProvider?.isCoinbaseWallet) {
      alert("Coinbase Wallet is either overshadowed by another wallet or not found. Please ensure it's installed and enabled.");
      return;
    }
    try {
      const provider = new BrowserProvider(chosenProvider as Eip1193Provider);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setEvmAddress(address);
    } catch (err: unknown) {
      console.error("Coinbase connect error:", err);
    }
  }

  // ============== CONNECT => PHANTOM => SOLANA ==============
  async function connectPhantom() {
    setConnectedWallet("phantom");
    setEvmAddress(null);
    if (!window.solana?.isPhantom) {
      alert("Phantom overshadowed or not found => Solana!");
      return;
    }
    try {
      const resp = await window.solana.connect();
      setSolanaAddress(resp.publicKey.toString());
    } catch (err: unknown) {
      console.error("Phantom connect error:", err);
    }
  }

  // ============== DISCONNECT ==============
  function disconnectWallet() {
    setConnectedWallet(null);
    setEvmAddress(null);
    setSolanaAddress(null);
  }

  // ============== SWITCH EVM CHAIN ==============
  async function switchChain(chainKey: ChainKey) {
    if (!evmAddress) {
      alert("No EVM address => connect metamask/coinbase first!");
      return;
    }
    if (connectedWallet !== "metamask" && connectedWallet !== "coinbase") {
      alert("EVM chain switching => metamask or coinbase only!");
      return;
    }
    const chainData = CHAINS[chainKey];
    if (!chainData) return;
    try {
      await window.ethereum?.request?.({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainData.chainId }],
      });
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).code === 4902) {
        try {
          await window.ethereum?.request?.({
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
        } catch (addErr) {
          console.error("Failed to add chain", addErr);
        }
      } else {
        console.error("Failed to switch chain", error);
      }
    }
  }

  // ============== Display Address Aggregator ==============
  let displayAddress: string | null = null;
  if (connectedWallet === "metamask" || connectedWallet === "coinbase") {
    if (evmAddress) {
      displayAddress = evmAddress.slice(0, 5) + "..." + evmAddress.slice(-4);
    }
  } else if (connectedWallet === "phantom" && solanaAddress) {
    displayAddress = solanaAddress.slice(0, 5) + "..." + solanaAddress.slice(-4);
  }

  // ============== EVM Chain Selection Callback ==============
  const handleSelectChain = useCallback((key: string) => {
    setSelectedChain(key as ChainKey);
    switchChain(key as ChainKey);
  }, []);

  // ============== Aggregator Button Styling ==============
  const aggregatorBtn = `
    px-1 py-0.5
    sm:px-2 sm:py-1
    text-[8px]
    sm:text-[10px]
    border-2
    border-white
    rounded-full
    bg-transparent
    text-white
    transition-colors
    cursor-pointer
    hover:bg-gradient-to-r
    hover:from-pink-500
    hover:to-yellow-500
    hover:text-transparent
    hover:bg-clip-text
  `;

  // ============== Nav Link Styling ==============
  const navLink = `
    nav-override
    text-white
    transition-colors
  `;

  return (
    <>
      <header
        className={`p-2 bg-[radial-gradient(circle, var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black border-b border-neutral-800 ${pressStart2P.className}`}
      >
        <nav className="container mx-auto px-4 py-2 flex flex-wrap items-center">
          {/* LEFT: Brand + Nav */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/KRBYLAND.png"
                alt="KRBYLAND Logo"
                className="w-5 h-5 sm:w-8 sm:h-8"
                width={32}
                height={32}
              />
            </Link>
            <ul className="flex gap-1 sm:gap-2 text-[8px] sm:text-[10px]">
              <li>
                <Link href="/" className={`${navLink} hover:text-fuchsia-500`}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className={`${navLink} hover:text-green-300`}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/livestream" className={`${navLink} hover:text-cyan-300`}>
                  Livestream
                </Link>
              </li>
              <li>
                <Link href="/contact" className={`${navLink} hover:text-indigo-500`}>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/settings" className={`${navLink} hover:text-yellow-300`}>
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* RIGHT: Aggregator */}
          <div className="ml-auto w-full sm:w-auto flex flex-wrap items-center justify-end gap-1 sm:gap-2 mt-2 sm:mt-0">
            {displayAddress ? (
              <>
                {connectedWallet !== "phantom" && evmAddress && (
                  <ChainDropdown
                    chains={Object.keys(CHAINS).map((k) => ({
                      key: k,
                      chainName: CHAINS[k as ChainKey].label,
                    }))}
                    selected={selectedChain}
                    onSelect={handleSelectChain}
                  />
                )}
                <button className={aggregatorBtn}>{displayAddress}</button>
                <button onClick={disconnectWallet} className={aggregatorBtn}>
                  Disconnect
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowWalletButtons(!showWalletButtons)}
                  className={aggregatorBtn}
                >
                  {showWalletButtons ? "Hide Wallets" : "Connect Wallet"}
                </button>
                {showWalletButtons && (
                  <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
                    <button onClick={connectMetaMask} className={aggregatorBtn}>
                      MetaMask
                    </button>
                    <button onClick={connectCoinbase} className={aggregatorBtn}>
                      Coinbase
                    </button>
                    <button onClick={connectPhantom} className={aggregatorBtn}>
                      Phantom
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-4">{children}</main>
    </>
  );
}
