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

/** 
 * EVM chain configs => Ethereum, Polygon, Arbitrum, Avalanche, Base, Optimism
 */
const CHAINS = {
  ETHEREUM: {
    label: "Ethereum",
    chainId: "0x1",
    chainName: "Ethereum",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.infura.io/v3/YOUR_INFURA_KEY"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  POLYGON: {
    label: "Polygon",
    chainId: "0x89",
    chainName: "Polygon",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  ARBITRUM: {
    label: "Arbitrum",
    chainId: "0xa4b1",
    chainName: "Arbitrum One",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"],
  },
  AVALANCHE: {
    label: "Avalanche",
    chainId: "0xa86a",
    chainName: "Avalanche",
    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io"],
  },
  BASE: {
    label: "Base",
    chainId: "0x2105",
    chainName: "Base Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://explorer.base.org"],
  },
  OPTIMISM: {
    label: "Optimism",
    chainId: "0xa",
    chainName: "Optimism",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },
} as const;

type ChainKey = keyof typeof CHAINS;

/** 
 * Phantom network => "SOLANA" or "SUI"
 */
type PhantomNetworkKey = "SOLANA" | "SUI";

interface WalletConnectLayoutProps {
  children?: React.ReactNode;
}

export default function WalletConnectLayout({ children }: WalletConnectLayoutProps) {
  const [connectedWallet, setConnectedWallet] = useState<"metamask"|"coinbase"|"phantom"|null>(null);
  const [evmAddress, setEvmAddress] = useState<string|null>(null);

  // Phantom => which "network"? => solana or sui
  const [phantomNetwork, setPhantomNetwork] = useState<PhantomNetworkKey|null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string|null>(null);

  // EVM chain selection
  const [selectedChain, setSelectedChain] = useState<ChainKey>("ETHEREUM");
  const [showWalletButtons, setShowWalletButtons] = useState(false);

  // ============== CONNECT => METAMASK ==============
  async function connectMetaMask() {
    setConnectedWallet("metamask");
    setEvmAddress(null);
    setPhantomNetwork(null);
    setSolanaAddress(null);

    if (!window.ethereum) {
      alert("No window.ethereum => MetaMask missing?");
      return;
    }
    let chosenProvider = window.ethereum;
    if (window.ethereum.providers?.length) {
      const mm = window.ethereum.providers.find((p: any) => p.isMetaMask);
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
    } catch (err) {
      console.error("MetaMask connect error =>", err);
    }
  }

  // ============== CONNECT => COINBASE ==============
  async function connectCoinbase() {
    setConnectedWallet("coinbase");
    setEvmAddress(null);
    setPhantomNetwork(null);
    setSolanaAddress(null);

    if (!window.ethereum) {
      alert("No window.ethereum => Coinbase extension missing?");
      return;
    }

    let chosenProvider = window.ethereum;
    if (window.ethereum.providers?.length) {
      const cb = window.ethereum.providers.find((p: any) => p.isCoinbaseWallet);
      if (cb) chosenProvider = cb;
    }

    if (!chosenProvider?.isCoinbaseWallet) {
      alert("Coinbase overshadowed or not found!");
      return;
    }

    try {
      const provider = new BrowserProvider(chosenProvider as Eip1193Provider);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setEvmAddress(await signer.getAddress());
    } catch (err) {
      console.error("Coinbase connect error =>", err);
    }
  }

  // ============== CONNECT => PHANTOM => SOLANA ==============
  async function connectPhantom() {
    setConnectedWallet("phantom");
    setEvmAddress(null);
    setPhantomNetwork(null);
    setSolanaAddress(null);

    if (!window.solana?.isPhantom) {
      alert("Phantom overshadowed or not found => Solana!");
      return;
    }
    try {
      const resp = await window.solana.connect();
      setSolanaAddress(resp.publicKey.toString());
      setPhantomNetwork("SOLANA");
    } catch (err) {
      console.error("Phantom(Solana) connect error =>", err);
    }
  }

  // ============== DISCONNECT ==============
  function disconnectWallet() {
    setConnectedWallet(null);
    setEvmAddress(null);
    setPhantomNetwork(null);
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
    } catch (error: any) {
      if (error.code === 4902) {
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
          console.error("Failed to add chain =>", addErr);
        }
      } else {
        console.error("Failed to switch chain =>", error);
      }
    }
  }

  // aggregator => truncated address
  let displayAddress: string | null = null;
  if (connectedWallet === "metamask" || connectedWallet === "coinbase") {
    if (evmAddress) {
      displayAddress = evmAddress.slice(0,5) + "..." + evmAddress.slice(-4);
    }
  } else if (connectedWallet === "phantom") {
    if (phantomNetwork === "SOLANA" && solanaAddress) {
      displayAddress = solanaAddress.slice(0,5) + "..." + solanaAddress.slice(-4);
    }
  }

  // EVM chain selection callback
  const handleSelectChain = useCallback((key: string) => {
    setSelectedChain(key as ChainKey);
    switchChain(key as ChainKey);
  }, [evmAddress, connectedWallet]);

  // Slightly smaller text on mobile => `text-[6px] sm:text-[10px]`
  const aggregatorBtn = `
    px-1 py-0.5
    sm:px-2 sm:py-1
    text-[6px]
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

  const navLink = `
    nav-override
    text-white
    transition-colors
  `;

  return (
    <>
      {/* aggregator nav bar code => same styling/sizing as before */}
      <header className={`p-2 bg-black border-b border-neutral-800 ${pressStart2P.className}`}>
        <nav className="container mx-auto px-4 py-2 flex flex-wrap items-center">
          {/* LEFT => brand + nav */}
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

          {/* RIGHT => aggregator => chain or phantom net => address => disconnect */}
          <div className="ml-auto w-full sm:w-auto flex flex-wrap items-center justify-end gap-1 sm:gap-2 mt-2 sm:mt-0">
            {displayAddress ? (
              <>
                {/* EVM chain dropdown if metamask/coinbase */}
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

      {/* If you want aggregator to render children, uncomment below: */}
      {/* <div>{children}</div> */}
    </>
  );
}
