"use client";

import React, { useState, useEffect } from "react";
import { ethers, Eip1193Provider } from "ethers";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";

/**
 * 1) Retro font => Press_Start_2P
 */
const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/**
 * 2) EVM chain configs => Ethereum, Polygon, Arbitrum, Avalanche, Base, Optimism
 */
const EVM_CHAINS = {
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
    chainName: "Avalanche C-Chain",
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
    chainName: "Optimism Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },
} as const;

type EvmChainKey = keyof typeof EVM_CHAINS;

/** 
 * 3) Phantom network => "SOLANA" or "SUI"
 *    We'll keep "SUI" in the union, but won't ever use it below.
 */
type PhantomNetworkKey = "SOLANA" | "SUI"; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // SSR skip => “ready” approach
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const [connectedWallet, setConnectedWallet] = useState<"metamask"|"coinbase"|"phantom"|null>(null);
  const [evmAddress, setEvmAddress] = useState<string|null>(null);

  // Phantom => which "network"? => solana or sui
  const [phantomNetwork, setPhantomNetwork] = useState<PhantomNetworkKey|null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string|null>(null);

  // Comment out the SUI address if you're not supporting it
  // const [suiAddress, setSuiAddress] = useState<string|null>(null);

  const [selectedEvmChain, setSelectedEvmChain] = useState<EvmChainKey>("ETHEREUM");
  const [showWalletButtons, setShowWalletButtons] = useState(false);

  // ============== CONNECT => METAMASK ==============
  async function connectMetaMask() {
    setConnectedWallet("metamask");
    setEvmAddress(null);
    setPhantomNetwork(null);
    setSolanaAddress(null);
    // setSuiAddress(null);

    if (!window.ethereum) {
      alert("No window.ethereum => MetaMask missing?");
      return;
    }

    let chosenProvider = window.ethereum;
    if (window.ethereum.providers && window.ethereum.providers.length > 0) {
      const mm = window.ethereum.providers.find((p) => p.isMetaMask);
      if (mm) chosenProvider = mm;
    }

    if (!chosenProvider?.isMetaMask) {
      alert("MetaMask overshadowed or not found!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(chosenProvider as Eip1193Provider);
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
    // setSuiAddress(null);

    if (!window.ethereum) {
      alert("No window.ethereum => Coinbase extension missing?");
      return;
    }

    let chosenProvider = window.ethereum;
    if (window.ethereum.providers && window.ethereum.providers.length > 0) {
      const cb = window.ethereum.providers.find((p) => p.isCoinbaseWallet);
      if (cb) chosenProvider = cb;
    }

    if (!chosenProvider?.isCoinbaseWallet) {
      alert("Coinbase overshadowed or not found!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(chosenProvider as Eip1193Provider);
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
    // setSuiAddress(null);

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

  // ============== SWITCH PHANTOM => SUI (COMMENT OUT) ==============
  // async function switchPhantomToSui() {
  //   alert("Phantom Sui is not supported yet!");
  //   // If you actually had code calling window.phantom.sui, remove or comment it out.
  // }

  // ============== SWITCH PHANTOM => SOLANA ==============
  async function switchPhantomToSolana() {
    if (!window.solana?.isPhantom) {
      alert("Phantom overshadowed or not found => Solana!");
      return;
    }
    try {
      const resp = await window.solana.connect();
      setSolanaAddress(resp.publicKey.toString());
      setPhantomNetwork("SOLANA");
      // setSuiAddress(null);
    } catch (err) {
      console.error("Phantom(Solana) connect error =>", err);
    }
  }

  // ============== SWITCH EVM CHAIN ==============
  async function switchEvmChain(chainKey: EvmChainKey) {
    if (!evmAddress) {
      alert("No EVM address => connect metamask/coinbase first!");
      return;
    }
    if (connectedWallet !== "metamask" && connectedWallet !== "coinbase") {
      alert("EVM chain switching => metamask or coinbase only!");
      return;
    }

    const chainData = EVM_CHAINS[chainKey];
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
          console.error("Failed to add chain =>", addErr);
        }
      } else {
        console.error("Failed to switch chain =>", error);
      }
    }
  }

  // ============== aggregator => truncated address ==============
  let displayAddress: string | null = null;
  if (connectedWallet === "metamask" || connectedWallet === "coinbase") {
    if (evmAddress) {
      displayAddress = evmAddress.slice(0, 5) + "..." + evmAddress.slice(-4);
    }
  } else if (connectedWallet === "phantom") {
    if (phantomNetwork === "SOLANA" && solanaAddress) {
      displayAddress = solanaAddress.slice(0, 5) + "..." + solanaAddress.slice(-4);
    }
    // else if (phantomNetwork === "SUI" && suiAddress) {
    //   displayAddress = suiAddress.slice(0, 5) + "..." + suiAddress.slice(-4);
    // }
  }

  // ============== aggregator => disconnect ==============
  function disconnectWallet() {
    setConnectedWallet(null);
    setEvmAddress(null);
    setPhantomNetwork(null);
    setSolanaAddress(null);
    // setSuiAddress(null);
  }

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

  if (!ready) {
    return (
      <html lang="en">
        <body className={`min-h-screen text-xs bg-black ${pressStart2P.className}`}>
          <div className="p-4 text-white text-center">Loading aggregator...</div>
          <main className="container mx-auto px-4 py-4">{children}</main>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`min-h-screen text-xs bg-black ${pressStart2P.className}`}>
        <header className="p-2 bg-black border-b border-neutral-800">
          <nav className="container mx-auto flex items-center justify-between">
            
            {/* LEFT => brand + nav */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/images/KRBYLAND.png"
                  alt="KRBYLAND Logo"
                  width={36}
                  height={36}
                />
              </Link>
              {/* Nav */}
              <ul className="flex gap-2 text-[10px]">
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

            {/* RIGHT => aggregator => chain or phantom net => address => disconnect */}
            <div className="flex items-center gap-2">
              {displayAddress ? (
                <>
                  {/* EVM chain dropdown if metamask or coinbase */}
                  {connectedWallet !== "phantom" && evmAddress && (
                    <EvmChainDropdown
                      chainKey={selectedEvmChain}
                      onSwitch={(ck) => {
                        setSelectedEvmChain(ck);
                        switchEvmChain(ck);
                      }}
                    />
                  )}

                  {/* Phantom net dropdown if phantom */}
                  {connectedWallet === "phantom" && (
                    <PhantomNetworkDropdown
                      current={phantomNetwork}
                      switchToSolana={switchPhantomToSolana}
                      // switchToSui={switchPhantomToSui} // commented out
                    />
                  )}

                  <button className={sharedHoverGradient}>
                    {displayAddress}
                  </button>
                  <button onClick={disconnectWallet} className={sharedHoverGradient}>
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
                    <div className="flex items-center space-x-2">
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

        <main className="container mx-auto px-4 py-4">{children}</main>
      </body>
    </html>
  );
}

/**
 * EvmChainDropdown => “Ethereum / Polygon / …”
 */
function EvmChainDropdown({
  chainKey,
  onSwitch,
}: {
  chainKey: EvmChainKey;
  onSwitch: (ck: EvmChainKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = EVM_CHAINS[chainKey].label;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="
          px-2 py-1 text-xs text-white border-2 border-white rounded-full bg-transparent
          transition-colors cursor-pointer
          hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
          hover:text-transparent hover:bg-clip-text
        "
      >
        {label}
      </button>
      {open && (
        <div className="absolute mt-2 w-44 border border-white rounded bg-black text-white z-10">
          {Object.entries(EVM_CHAINS).map(([k, data]) => (
            <div
              key={k}
              onClick={() => {
                onSwitch(k as EvmChainKey);
                setOpen(false);
              }}
              className="
                px-3 py-1 cursor-pointer
                hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
                hover:text-transparent hover:bg-clip-text
              "
            >
              {data.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * PhantomNetworkDropdown => pick “Solana” ~~or “Sui”~~
 *    we comment out anything referencing "SUI"
 */
function PhantomNetworkDropdown({
  current,
  switchToSolana,
  // switchToSui,
}: {
  current: PhantomNetworkKey | null;
  switchToSolana: () => Promise<void>;
  // switchToSui: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  // We'll pretend only SOLANA is valid now
  let label = "Phantom?";
  if (current === "SOLANA") label = "Solana";
  // if (current === "SUI") label = "Sui";

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="
          px-2 py-1 text-xs text-white border-2 border-white rounded-full bg-transparent
          transition-colors cursor-pointer
          hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
          hover:text-transparent hover:bg-clip-text
        "
      >
        {label}
      </button>
      {open && (
        <div className="absolute mt-2 w-24 border border-white rounded bg-black text-white z-10">
          <div
            onClick={() => {
              switchToSolana();
              setOpen(false);
            }}
            className="
              px-3 py-1 cursor-pointer
              hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
              hover:text-transparent hover:bg-clip-text
            "
          >
            Solana
          </div>
          {/* <div
            onClick={() => {
              switchToSui();
              setOpen(false);
            }}
            className="
              px-3 py-1 cursor-pointer
              hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
              hover:text-transparent hover:bg-clip-text
            "
          >
            Sui
          </div> */}
        </div>
      )}
    </div>
  );
}
