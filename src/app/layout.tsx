"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";

/** 1) Retro Font => Press_Start_2P => pink→yellow gradient from your globals. */
const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/** 2) EVM Chains => Ethereum, Polygon, Arbitrum, Avalanche, Base (unchanged) */
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
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
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
} as const;

/** EVM chain dropdown => same as before. */
function EvmChainDropdown({
  chains,
  selectedChain,
  onSelectChain,
}: {
  chains: { key: string; label: string }[];
  selectedChain: string;
  onSelectChain: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const chainLabel = chains.find((c) => c.key === selectedChain)?.label || "Select Chain";

  return (
    <div className="relative inline-block ml-2">
      <button
        onClick={() => setOpen(!open)}
        className="
          px-2 py-1 text-xs text-white border-2 border-white rounded-full bg-transparent
          transition-colors cursor-pointer
          hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
          hover:text-transparent hover:bg-clip-text
        "
      >
        {chainLabel}
      </button>

      {open && (
        <div
          className="
            absolute mt-2 w-60 whitespace-nowrap border border-white rounded bg-black text-white z-10
          "
        >
          {chains.map((c) => (
            <div
              key={c.key}
              onClick={() => {
                onSelectChain(c.key);
                setOpen(false);
              }}
              className="
                px-3 py-1 cursor-pointer
                hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
                hover:text-transparent hover:bg-clip-text
              "
            >
              {c.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Phantom chain dropdown => pick “Solana” or “Sui”, ignoring Phantom EVM. */
function PhantomDropdown({
  onSelectPhantomChain,
}: {
  onSelectPhantomChain: (chain: "SOLANA" | "SUI") => void;
}) {
  const [open, setOpen] = useState(false);

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
        Phantom
      </button>

      {open && (
        <div
          className="
            absolute mt-2 w-28 whitespace-nowrap border border-white rounded bg-black text-white z-10
          "
        >
          <div
            onClick={() => {
              onSelectPhantomChain("SOLANA");
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
          <div
            onClick={() => {
              onSelectPhantomChain("SUI");
              setOpen(false);
            }}
            className="
              px-3 py-1 cursor-pointer
              hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
              hover:text-transparent hover:bg-clip-text
            "
          >
            Sui
          </div>
        </div>
      )}
    </div>
  );
}

/** 
 * The aggregator code => 
 *   - Only rendered *client-side* after 'ready' is set (useEffect). 
 *   - This prevents SSR from generating aggregator HTML that extensions can modify pre-hydration.
 */
function ClientSideAggregator() {
  // track which wallet => metamask|coinbase|phantomSolana|phantomSui|null
  const [connectedWallet, setConnectedWallet] = useState<
    "metamask"|"coinbase"|"phantomSolana"|"phantomSui"|null
  >(null);

  // EVM address => metamask or coinbase
  const [evmAddress, setEvmAddress] = useState<string|null>(null);

  // Phantom => solana or sui
  const [solanaAddress, setSolanaAddress] = useState<string|null>(null);
  const [suiAddress, setSuiAddress] = useState<string|null>(null);

  // EVM chain => default => "ETHEREUM"
  const [selectedChain, setSelectedChain] = useState<keyof typeof CHAINS>("ETHEREUM");

  // show sub-wallet => metamask, coinbase, phantom
  const [showWalletButtons, setShowWalletButtons] = useState(false);

  /** Helper => debug which providers exist. */
  function debugProviders() {
    console.log("window.ethereum =>", window.ethereum);
    console.log("window.ethereum?.providers =>", (window.ethereum as any)?.providers);
  }

  /** EVM => Connect => MetaMask => ignoring Phantom EVM. */
  async function connectMetaMask() {
    debugProviders();
    setConnectedWallet("metamask");
    setSolanaAddress(null);
    setSuiAddress(null);

    if (!window.ethereum) {
      alert("No window.ethereum => metamask extension missing?");
      return;
    }
    let chosenProvider: any = window.ethereum;
    if (window.ethereum.providers) {
      const mm = window.ethereum.providers.find((p: any) => p.isMetaMask);
      if (mm) chosenProvider = mm;
    }
    if (!chosenProvider?.isMetaMask) {
      alert("Didn't find isMetaMask => overshadow or not installed!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(chosenProvider);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log("MetaMask address =>", address);
      setEvmAddress(address);
    } catch (err) {
      console.error("MetaMask connect error", err);
    }
  }

  /** EVM => coinbase => ignoring Phantom EVM. */
  async function connectCoinbase() {
    debugProviders();
    setConnectedWallet("coinbase");
    setSolanaAddress(null);
    setSuiAddress(null);

    if (!window.ethereum) {
      alert("No window.ethereum => coinbase extension missing?");
      return;
    }
    let chosenProvider: any = window.ethereum;
    if (window.ethereum.providers) {
      const cb = window.ethereum.providers.find((p: any) => p.isCoinbaseWallet);
      if (cb) chosenProvider = cb;
    }
    if (!chosenProvider?.isCoinbaseWallet) {
      alert("Didn't find isCoinbaseWallet => overshadow or not installed!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(chosenProvider);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log("Coinbase address =>", address);
      setEvmAddress(address);
    } catch (err) {
      console.error("Coinbase connect error", err);
    }
  }

  /** Phantom => Solana => ignoring EVM. */
  async function connectPhantomSolana() {
    debugProviders();
    setConnectedWallet("phantomSolana");
    setEvmAddress(null);
    setSuiAddress(null);

    if (!window.solana?.isPhantom) {
      alert("Phantom overshadowed or not found for Solana => disable Phantom EVM?");
      return;
    }
    try {
      const resp = await window.solana.connect();
      const solAddr = resp.publicKey.toString();
      console.log("Phantom Solana address =>", solAddr);
      setSolanaAddress(solAddr);
    } catch (err) {
      console.error("Phantom(Solana) connect error", err);
    }
  }

  /** Phantom => Sui => ignoring EVM. */
  async function connectPhantomSui() {
    debugProviders();
    setConnectedWallet("phantomSui");
    setEvmAddress(null);
    setSolanaAddress(null);

    if (!window.phantom?.sui) {
      alert("Phantom overshadowed or not found for Sui!");
      return;
    }
    try {
      console.log("Phantom(Sui) => placeholder only");
      setSuiAddress("0xsuiBetaAddress1234");
    } catch (err) {
      console.error("Phantom(Sui) connect error", err);
    }
  }

  function handleSelectPhantomChain(chain: "SOLANA" | "SUI") {
    if (chain==="SOLANA") connectPhantomSolana();
    else connectPhantomSui();
  }

  /** EVM => chain switching => metamask|coinbase => no rainbow. */
  async function switchChain(chainKey: keyof typeof CHAINS) {
    if (!evmAddress) {
      alert("No EVM address connected!");
      return;
    }
    if (connectedWallet!=="metamask" && connectedWallet!=="coinbase") {
      alert("Chain switching => EVM only => metamask or coinbase");
      return;
    }
    const chainData = CHAINS[chainKey];
    if (!chainData) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainData.chainId }],
      });
    } catch(error: any) {
      if (error.code===4902) {
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
        } catch (addErr) {
          console.error("Failed to add chain", addErr);
        }
      } else {
        console.error("Failed to switch chain", error);
      }
    }
  }

  /** show truncated address => EVM or solana or sui. */
  let displayAddress: string | null = null;
  if (connectedWallet==="metamask"||connectedWallet==="coinbase") {
    if (evmAddress) {
      displayAddress = evmAddress.slice(0,5)+"..."+evmAddress.slice(-4);
    }
  } else if (connectedWallet==="phantomSolana") {
    if (solanaAddress) {
      displayAddress = solanaAddress.slice(0,5)+"..."+solanaAddress.slice(-4);
    }
  } else if (connectedWallet==="phantomSui") {
    if (suiAddress) {
      displayAddress = suiAddress.slice(0,5)+"..."+suiAddress.slice(-4);
    }
  }

  // same pink->yellow => text-xs => retro style
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

  function disconnectWallet() {
    setConnectedWallet(null);
    setEvmAddress(null);
    setSolanaAddress(null);
    setSuiAddress(null);
  }

  return (
    <header className="p-2 bg-black border-b border-neutral-800">
      <nav className="container mx-auto flex items-center justify-between">
        
        {/* LEFT => brand + chain => connect/disconnect */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/krbyland_logo.png"
              alt="KRBYLAND Logo"
              width={36}
              height={36}
            />
            <span className="text-xs font-bold"></span>
          </Link>

          {(connectedWallet==="metamask" || connectedWallet==="coinbase")
            && evmAddress && (
            <EvmChainDropdown
              chains={Object.keys(CHAINS).map((k) => ({
                key: k,
                label: CHAINS[k as keyof typeof CHAINS].label,
              }))}
              selectedChain={selectedChain}
              onSelectChain={(ck) => {
                setSelectedChain(ck as keyof typeof CHAINS);
                switchChain(ck as keyof typeof CHAINS);
              }}
            />
          )}

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

          {/* sub-buttons => metamask, coinbase, phantom => only if not connected */}
          {!displayAddress && showWalletButtons && (
            <div className="ml-2 flex items-center space-x-2">
              <button onClick={connectMetaMask} className={sharedHoverGradient}>
                MetaMask
              </button>
              <button onClick={connectCoinbase} className={sharedHoverGradient}>
                Coinbase
              </button>
              <PhantomDropdown
                onSelectPhantomChain={(chain) => {
                  if (chain==="SOLANA") connectPhantomSolana();
                  else connectPhantomSui();
                }}
              />
            </div>
          )}
        </div>

        {/* RIGHT => nav => text-xs => pink->yellow => your style */}
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
      </nav>
    </header>
  );
}

/** 
 * ================ RootLayout with SSR Skipped for aggregator ================
 * We'll wrap the aggregator UI in a 'ready' check so it doesn't SSR any aggregator HTML
 * => avoids extension messing with SSR output => no hydration mismatch
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Once the client is mounted, we show the aggregator
    setReady(true);
  }, []);

  if (!ready) {
    // Return minimal SSR skeleton => no aggregator HTML => no mismatch
    return (
      <html lang="en">
        <body className={`min-h-screen text-xs bg-black ${pressStart2P.className}`}>
          {/* Possibly a placeholder or spinner */}
          <div className="p-4 text-center text-white">Loading aggregator...</div>
          <main className="container mx-auto px-4 py-4">
            {children}
          </main>
        </body>
      </html>
    );
  }

  // Now that we're client-side only, we safely render aggregator 
  return (
    <html lang="en">
      <body className={`min-h-screen text-xs bg-black ${pressStart2P.className}`}>
        {/* The aggregator UI => no SSR => no mismatch */}
        <ClientSideAggregator />

        <main className="container mx-auto px-4 py-4">
          {children}
        </main>
      </body>
    </html>
  );
}
