"use client";

import React, { useState, useCallback } from "react";
import { Eip1193Provider, BrowserProvider } from "ethers";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";
import ChainDropdown from "./chainDropdown"; // Adjust the path if needed

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
  // ... add more as needed
} as const;

type ChainKey = keyof typeof CHAINS;

/** 
 * Phantom network types; note that we're keeping SUI in the union for now,
 * even though we may not use it.
 */
type PhantomNetworkKey = "SOLANA" | "SUI";

export default function WalletConnectLayout({ children }: { children: React.ReactNode }) {
  const [connectedWallet, setConnectedWallet] = useState<"metamask" | "coinbase" | "phantom" | null>(null);
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
  
    // Coinbase Wallet injected provider detection logic:
    if (ethereum.providers?.length) {
      chosenProvider = ethereum.providers.find((provider: any) => provider.isCoinbaseWallet);
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

  // ============== Disconnect ==============
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
      alert("Chain switching => metamask or coinbase only!");
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

  // ============== aggregator => truncated display address ==============
  let displayAddress: string | null = null;
  if (connectedWallet === "metamask" || connectedWallet === "coinbase") {
    if (evmAddress) {
      displayAddress = evmAddress.slice(0, 5) + "..." + evmAddress.slice(-4);
    }
  } else if (connectedWallet === "phantom") {
    if (solanaAddress) {
      displayAddress = solanaAddress.slice(0, 5) + "..." + solanaAddress.slice(-4);
    }
  }

  // Wrap the onSelect function with useCallback for stability
  const handleSelectChain = useCallback((key: string) => {
    setSelectedChain(key as ChainKey);
    switchChain(key as ChainKey);
  }, [setSelectedChain, switchChain, evmAddress, connectedWallet]);

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
        <header className="p-2 bg-black border-b border-neutral-800">
          <nav className="container mx-auto flex items-center justify-between">
            {/* LEFT side => brand, chain dropdown, connect/disconnect */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/images/krbyland_logo.png"
                  alt="KRBYLAND Logo"
                  width={36}
                  height={36}
                />
              </Link>

              {/* If user is EVM => show chain dropdown */}
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

              {/* If connected, show address + Disconnect. Else, show "Connect" */}
              <div className="ml-2">
                {displayAddress ? (
                  <div className="flex items-center gap-2">
                    <button className={sharedHoverGradient}>
                      {displayAddress}
                    </button>
                    <button onClick={disconnectWallet} className={sharedHoverGradient}>
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowWalletButtons(!showWalletButtons)}
                    className={sharedHoverGradient}
                  >
                    {showWalletButtons ? "Hide Wallets" : "Connect Wallet"}
                  </button>
                )}
              </div>

              {/* Sub-buttons if not connected */}
              {!displayAddress && showWalletButtons && (
                <div className="ml-2 flex items-center space-x-2">
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
            </div>

            {/* RIGHT side => nav menu */}
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

        <main className="container mx-auto px-4 py-4">{children}</main>
      </body>
    </html>
  );
}
