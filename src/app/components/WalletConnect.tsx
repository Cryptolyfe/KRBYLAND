"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import "./globals.css"; // The code that excludes <button>/<select> from your universal gradient
import Image from "next/image";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";

/** Press_Start_2P as before */
const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/** Minimal chain configs for demonstration */
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
  // ... Arbitrum, Avalanche, Base if desired
} as const;

/** 
 * 1) A custom chain dropdown => shows if user is EVM-connected 
 */
function ChainDropdown({
  chains,
  selectedChain,
  onSelectChain,
}: {
  chains: { key: string; label: string }[];
  selectedChain: string;
  onSelectChain: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);

  // find label for the selected chain
  const chainLabel =
    chains.find((c) => c.key === selectedChain)?.label || "Select Chain";

  return (
    <div className="relative inline-block ml-2">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 text-xs text-white border-2 border-white rounded-full bg-transparent
                   transition-colors cursor-pointer
                   hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
                   hover:text-transparent hover:bg-clip-text"
      >
        {chainLabel}
      </button>
      {open && (
        <div className="absolute mt-2 w-40 whitespace-nowrap border border-white rounded bg-black text-white z-10">
          {chains.map((c) => (
            <div
              key={c.key}
              onClick={() => {
                onSelectChain(c.key);
                setOpen(false);
              }}
              className="px-3 py-1 cursor-pointer
                         hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
                         hover:text-transparent hover:bg-clip-text"
            >
              {c.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** 
 * 2) The RootLayout => same UI ordering, 
 *    left => Logo + Title + (chain dropdown if EVM connected) + wallet logic
 *    right => Nav menu (Home, About, etc.)
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // State: which wallet is connected? "metamask","coinbase","phantom" or null
  const [connectedWallet, setConnectedWallet] = useState<"metamask"|"coinbase"|"phantom"|null>(null);

  // The actual EVM address (if EVM connected) or null
  const [evmAddress, setEvmAddress] = useState<string|null>(null);

  // If user picks Solana Phantom => store that address here
  const [solanaAddress, setSolanaAddress] = useState<string|null>(null);

  // For chain switching => default "ETHEREUM"
  const [selectedChain, setSelectedChain] = useState<keyof typeof CHAINS>("ETHEREUM");

  // Show/hide sub-buttons => metamask/coinbase/phantom
  const [showWalletButtons, setShowWalletButtons] = useState(false);

  // =============== Connect Logic ===============

  // (A) Connect => EVM (MetaMask) => never pick Phantom EVM
  async function connectMetaMask() {
    setConnectedWallet("metamask");
    setSolanaAddress(null); // reset solana if previously connected

    // Forcibly pick metamask if multiple providers => skip p.isPhantom
    let chosenProvider: any = window.ethereum;
    if (window.ethereum?.providers) {
      const mm = window.ethereum.providers.find((p: any) => p.isMetaMask);
      if (mm) chosenProvider = mm;
    }
    if (!chosenProvider?.isMetaMask) {
      alert("MetaMask overshadowed or not found!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(chosenProvider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setEvmAddress(address);
    } catch (err) {
      console.error("MetaMask connect error", err);
    }
  }

  // (B) Connect => EVM (Coinbase) => never pick Phantom EVM
  async function connectCoinbase() {
    setConnectedWallet("coinbase");
    setSolanaAddress(null);

    let chosenProvider: any = window.ethereum;
    if (window.ethereum?.providers) {
      const cb = window.ethereum.providers.find((p: any) => p.isCoinbaseWallet);
      if (cb) chosenProvider = cb;
    }
    if (!chosenProvider?.isCoinbaseWallet) {
      alert("Coinbase overshadowed or not found!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(chosenProvider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setEvmAddress(address);
    } catch (err) {
      console.error("Coinbase connect error", err);
    }
  }

  // (C) Connect => Phantom => solana only => ignore phantom EVM
  async function connectPhantom() {
    setConnectedWallet("phantom");
    setEvmAddress(null); // reset EVM if previously connected

    if (!window.solana?.isPhantom) {
      alert("Phantom overshadowed or not found!");
      return;
    }
    try {
      const resp = await window.solana.connect();
      setSolanaAddress(resp.publicKey.toString());
    } catch (err) {
      console.error("Phantom connect error", err);
    }
  }

  // =============== Disconnect ================
  function disconnectWallet() {
    setConnectedWallet(null);
    setEvmAddress(null);
    setSolanaAddress(null);
  }

  // =============== Switch EVM chain ===============
  async function switchChain(chainKey: keyof typeof CHAINS) {
    if (!evmAddress) {
      alert("No EVM address found. Connect an EVM wallet first!");
      return;
    }
    if (connectedWallet!=="metamask" && connectedWallet!=="coinbase") {
      alert("Chain switching only for metamask/coinbase wallets.");
      return;
    }
    const chainData = CHAINS[chainKey];
    if (!chainData) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainData.chainId }],
      });
    } catch (error: any) {
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
        } catch (addErr) {
          console.error("Failed to add chain", addErr);
        }
      } else {
        console.error("Failed to switch chain", error);
      }
    }
  }

  // Figure out which address to display => EVM or solana
  let displayAddress: string | null = null;
  if (connectedWallet==="metamask" || connectedWallet==="coinbase") {
    if (evmAddress) {
      displayAddress = evmAddress.slice(0,5)+"..."+evmAddress.slice(-4);
    }
  } else if (connectedWallet==="phantom") {
    if (solanaAddress) {
      displayAddress = solanaAddress.slice(0,5)+"..."+solanaAddress.slice(-4);
    }
  }

  // Pink→yellow gradient on hover => for "Connect Wallet" button
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

        {/* 
          EXACT same layout => left = brand + chain + "Connect or address"
          right = nav
        */}
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
                <span className="text-xs font-bold">KRBYLAND</span>
              </Link>

              {connectedWallet!=="phantom" && evmAddress && (
                <ChainDropdown
                  chains={Object.keys(CHAINS).map((k) => ({
                    key: k,
                    label: CHAINS[k as keyof typeof CHAINS].label
                  }))}
                  selectedChain={selectedChain}
                  onSelectChain={(k: string) => {
                    setSelectedChain(k as keyof typeof CHAINS);
                    switchChain(k as keyof typeof CHAINS);
                  }}
                />
              )}

              {/* If connected => show address + Disconnect. Else show "Connect" => sub buttons */}
              <div className="ml-2">
                {displayAddress ? (
                  <div className="flex items-center gap-2">
                    {/* Show truncated address in a button or span */}
                    <button className={sharedHoverGradient}>
                      {displayAddress}
                    </button>
                    {/* New "Disconnect" button => sets connectedWallet to null */}
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

              {/* The row of 3 sub-buttons => metamask, coinbase, phantom => only if not connected */}
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

            {/* RIGHT side => nav menu => exactly the same as your code */}
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

        <main className="container mx-auto px-4 py-4">
          {children}
        </main>
      </body>
    </html>
  );
}
