"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.infura.io/v3/YOUR_INFURA_KEY"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  POLYGON: {
    label: "Polygon",
    chainId: "0x89",
    chainName: "Polygon Mainnet",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  // etc...
} as const;

type ChainKey = keyof typeof CHAINS;
type PhantomNetworkKey = "SOLANA" | "SUI";

export default function WalletConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ===================== STATE =====================
  const [connectedWallet, setConnectedWallet] =
    useState<"metamask" | "coinbase" | "phantom" | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState<ChainKey>("ETHEREUM");
  const [showWalletButtons, setShowWalletButtons] = useState(false);

  // ===================== CONNECT: METAMASK =====================
  async function connectMetaMask() {
    setConnectedWallet("metamask");
    setEvmAddress(null);

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
      console.error("MetaMask connect error:", err);
    }
  }

  // ===================== CONNECT: COINBASE =====================
  async function connectCoinbase() {
    setConnectedWallet("coinbase");
    setEvmAddress(null);

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
      console.error("Coinbase connect error:", err);
    }
  }

  // ===================== CONNECT: PHANTOM (SOLANA) =====================
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
    } catch (err) {
      console.error("Phantom connect error:", err);
    }
  }

  // ===================== DISCONNECT =====================
  function disconnectWallet() {
    setConnectedWallet(null);
    setEvmAddress(null);
    setSolanaAddress(null);
  }

  // ===================== SWITCH EVM CHAIN =====================
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
      if ((error as any)?.code === 4902) {
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

  // ===================== TRUNCATED ADDRESS =====================
  let displayAddress: string | null = null;
  if (connectedWallet === "metamask" || connectedWallet === "coinbase") {
    if (evmAddress) {
      displayAddress = evmAddress.slice(0, 5) + "..." + evmAddress.slice(-4);
    }
  } else if (connectedWallet === "phantom" && solanaAddress) {
    displayAddress = solanaAddress.slice(0, 5) + "..." + solanaAddress.slice(-4);
  }

  // ===================== CHAIN SELECT CALLBACK =====================
  const handleSelectChain = useCallback((key: string) => {
    setSelectedChain(key as ChainKey);
    switchChain(key as ChainKey);
  }, []);

  // The gradient-on-hover styling, with focus/active for mobile taps.
  const sharedHoverGradient = `
    border-2 
    border-white 
    rounded-full 
    bg-transparent 
    text-white
    transition-colors
    cursor-pointer

    /* smaller for mobile */
    px-1 py-0.5 text-[9px] 
    /* normal for >= sm */
    sm:px-2 sm:py-1 sm:text-xs

    hover:bg-gradient-to-r
    hover:from-pink-500
    hover:to-yellow-500
    hover:text-transparent
    hover:bg-clip-text

    focus:bg-gradient-to-r
    focus:from-pink-500
    focus:to-yellow-500
    focus:text-transparent
    focus:bg-clip-text

    active:bg-gradient-to-r
    active:from-pink-500
    active:to-yellow-500
    active:text-transparent
    active:bg-clip-text
  `;

  return (
    <>
      <header
        className={`p-2 bg-black border-b border-neutral-800 text-[9px] sm:text-[10px] ${pressStart2P.className}`}
      >
        {/*
          flex-wrap => can wrap on narrower screens
          justify-between => brand on left, aggregator on the right
        */}
        <nav className="container mx-auto px-2 py-1 sm:px-4 sm:py-2 flex flex-wrap items-center justify-between">
          
          {/* LEFT => brand + nav */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/KRBYLAND.png"
                alt="KRBYLAND Logo"
                className="w-6 h-6 sm:w-9 sm:h-9"
                width={36}
                height={36}
              />
            </Link>
            <ul className="flex flex-wrap gap-1 sm:gap-2">
              <li>
                <Link
                  href="/"
                  className="nav-override text-white hover:text-fuchsia-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="nav-override text-white hover:text-green-300 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/livestream"
                  className="nav-override text-white hover:text-cyan-300 transition-colors"
                >
                  Livestream
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="nav-override text-white hover:text-indigo-500 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="nav-override text-white hover:text-yellow-300 transition-colors"
                >
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* RIGHT => aggregator => 
              We center its sub-items with `justify-center`.
              This way, the aggregator container is on the right side, 
              but the aggregator's own buttons are centered horizontally 
              within that container.
          */}
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {displayAddress ? (
              <>
                {/* If EVM => chain dropdown */}
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
                <button className={sharedHoverGradient}>
                  {displayAddress}
                </button>
                <button
                  onClick={disconnectWallet}
                  className={sharedHoverGradient}
                >
                  Disconnect
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowWalletButtons(!showWalletButtons)}
                  className={sharedHoverGradient}
                >
                  {showWalletButtons ? "Hide Wallets" : "Connect Wallet"}
                </button>
                {showWalletButtons && (
                  <div className="flex flex-wrap items-center gap-2 justify-center">
                    <button onClick={connectMetaMask} className={sharedHoverGradient}>
                      MetaMask
                    </button>
                    <button onClick={connectCoinbase} className={sharedHoverGradient}>
                      Coinbase
                    </button>
                    <button onClick={connectPhantom} className={sharedHoverGradient}>
                      Phantom
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </nav>
      </header>

      {/* MAIN => pass-through for the rest */}
      <main className="container mx-auto px-2 py-2 sm:px-4 sm:py-4">
        {children}
      </main>
    </>
  );
}
