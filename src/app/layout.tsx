"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";

/** 
 * 1) Retro font => Press_Start_2P => same as before
 */
const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/** 
 * 2) EVM chain configs => Ethereum, Polygon, Arbitrum, Avalanche, Base
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
} as const;
type EvmChainKey = keyof typeof EVM_CHAINS;

/** 
 * 3) Phantom network => "SOLANA" or "SUI"
 */
type PhantomNetworkKey = "SOLANA" | "SUI";

/**
 * 4) RootLayout => single aggregator with brand+nav on left, aggregator on right
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // SSR skip => “ready” approach
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  // connected wallet => metamask, coinbase, phantom
  const [connectedWallet, setConnectedWallet] = useState<"metamask"|"coinbase"|"phantom"|null>(null);

  // EVM => metamask/coinbase address
  const [evmAddress, setEvmAddress] = useState<string|null>(null);

  // Phantom => which "network"? => solana or sui
  const [phantomNetwork, setPhantomNetwork] = useState<PhantomNetworkKey|null>(null);
  // store addresses for each
  const [solanaAddress, setSolanaAddress] = useState<string|null>(null);
  const [suiAddress, setSuiAddress] = useState<string|null>(null);

  // EVM chain => default "ETHEREUM"
  const [selectedEvmChain, setSelectedEvmChain] = useState<EvmChainKey>("ETHEREUM");

  // show sub‐buttons => metamask, coinbase, phantom
  const [showWalletButtons, setShowWalletButtons] = useState(false);

  // ============= EVM Connect => metamask =============
  async function connectMetaMask() {
    setConnectedWallet("metamask");
    setEvmAddress(null);
    setPhantomNetwork(null);
    setSolanaAddress(null);
    setSuiAddress(null);

    if (!window.ethereum) {
      alert("No window.ethereum => metamask missing?");
      return;
    }
    let chosenProvider: any = window.ethereum;
    if (window.ethereum.providers) {
      const mm = window.ethereum.providers.find((p: any) => p.isMetaMask);
      if (mm) chosenProvider = mm;
    }
    if (!chosenProvider?.isMetaMask) {
      alert("MetaMask overshadowed or not found!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(chosenProvider);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setEvmAddress(await signer.getAddress());
    } catch (err) {
      console.error("MetaMask connect error =>", err);
    }
  }

  // ============= EVM Connect => coinbase =============
  async function connectCoinbase() {
    setConnectedWallet("coinbase");
    setEvmAddress(null);
    setPhantomNetwork(null);
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
      alert("Coinbase overshadowed or not found!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(chosenProvider);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setEvmAddress(await signer.getAddress());
    } catch (err) {
      console.error("Coinbase connect error =>", err);
    }
  }

  // ============= Phantom => always connect to SOLANA by default =============
  async function connectPhantom() {
    setConnectedWallet("phantom");
    setEvmAddress(null);
    setPhantomNetwork(null);
    setSolanaAddress(null);
    setSuiAddress(null);

    // Immediately try connecting to SOLANA
    if (!window.solana?.isPhantom) {
      alert("Phantom overshadowed or not found => solana!");
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

  // Then if user picks "SUI" in the phantom dropdown, we do this:
  async function switchPhantomToSui() {
    if (!window.phantom?.sui) {
      alert("Phantom overshadowed or not found => SUI!");
      return;
    }
    try {
      // Real code may differ
      const resp = await window.phantom.sui.connect();
      setSuiAddress(resp.address);
      setPhantomNetwork("SUI");
      // clear solana address so we don't show the old one
      setSolanaAddress(null);
    } catch (err) {
      console.error("Phantom(Sui) connect error =>", err);
    }
  }

  // If user picks "Solana" in the phantom dropdown *after* picking Sui, we do:
  async function switchPhantomToSolana() {
    if (!window.solana?.isPhantom) {
      alert("Phantom overshadowed or not found => solana!");
      return;
    }
    try {
      const resp = await window.solana.connect();
      setSolanaAddress(resp.publicKey.toString());
      setPhantomNetwork("SOLANA");
      // clear sui address so we don't show the old one
      setSuiAddress(null);
    } catch (err) {
      console.error("Phantom(Solana) connect error =>", err);
    }
  }

  // ============= Switch EVM chain => metamask/coinbase only =============
  async function switchEvmChain(chainKey: EvmChainKey) {
    if (!evmAddress) {
      alert("No EVM address => connect metamask/coinbase first!");
      return;
    }
    if (connectedWallet!=="metamask" && connectedWallet!=="coinbase") {
      alert("EVM chain switching => metamask or coinbase only!");
      return;
    }
    const chainData = EVM_CHAINS[chainKey];
    if (!chainData) return;

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
        } catch (addErr) {
          console.error("Failed to add chain =>", addErr);
        }
      } else {
        console.error("Failed to switch chain =>", error);
      }
    }
  }

  // ============= aggregator => truncated address =============
  let displayAddress: string|null = null;
  if (connectedWallet==="metamask" || connectedWallet==="coinbase") {
    if (evmAddress) {
      displayAddress = evmAddress.slice(0,5)+"..."+evmAddress.slice(-4);
    }
  } else if (connectedWallet==="phantom") {
    if (phantomNetwork==="SOLANA" && solanaAddress) {
      displayAddress = solanaAddress.slice(0,5)+"..."+solanaAddress.slice(-4);
    } else if (phantomNetwork==="SUI" && suiAddress) {
      displayAddress = suiAddress.slice(0,5)+"..."+suiAddress.slice(-4);
    }
  }

  // ============= aggregator => disconnect =============
  function disconnectWallet() {
    setConnectedWallet(null);
    setEvmAddress(null);
    setPhantomNetwork(null);
    setSolanaAddress(null);
    setSuiAddress(null);
  }

  // shared style => text-xs => pink→yellow gradient on hover
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
    // SSR fallback => no aggregator
    return (
      <html lang="en">
        <body className={`min-h-screen text-xs bg-black ${pressStart2P.className}`}>
          <div className="p-4 text-white text-center">Loading aggregator...</div>
          <main className="container mx-auto px-4 py-4">
            {children}
          </main>
        </body>
      </html>
    );
  }

  // final aggregator once client is mounted
  return (
    <html lang="en">
      <body className={`min-h-screen text-xs bg-black ${pressStart2P.className}`}>
        
        <header className="p-2 bg-black border-b border-neutral-800">
          <nav className="container mx-auto flex items-center justify-between">
            
            {/* LEFT => brand + nav => text-[10px] => near each other => gap-4 */}
            <div className="flex items-center gap-4">
              {/* Brand => KRBYLAND */}
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/images/krbyland_logo.png"
                  alt="KRBYLAND Logo"
                  width={36}
                  height={36}
                />
              </Link>

              {/* Nav => text-[10px], small */}
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
                  {/** If metamask or coinbase => EVM chain dropdown */}
                  {(connectedWallet==="metamask" || connectedWallet==="coinbase") && evmAddress && (
                    <EvmChainDropdown
                      chainKey={selectedEvmChain}
                      onSwitch={(ck) => {
                        setSelectedEvmChain(ck);
                        switchEvmChain(ck);
                      }}
                    />
                  )}

                  {/** If phantom => show a phantom net dropdown => Solana / Sui */}
                  {connectedWallet==="phantom" && (
                    <PhantomNetworkDropdown
                      current={phantomNetwork}
                      switchToSolana={switchPhantomToSolana}
                      switchToSui={switchPhantomToSui}
                    />
                  )}

                  {/* truncated address + Disconnect */}
                  <button className={sharedHoverGradient}>
                    {displayAddress}
                  </button>
                  <button onClick={disconnectWallet} className={sharedHoverGradient}>
                    Disconnect
                  </button>
                </>
              ) : (
                <>
                  {/* If not connected => single “Connect Wallet” => shows sub‐buttons */}
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

        <main className="container mx-auto px-4 py-4">
          {children}
        </main>
      </body>
    </html>
  );
}

/** 
 * EvmChainDropdown => same as before => “Ethereum / Polygon / …”
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
 * PhantomNetworkDropdown => pick “Solana” or “Sui”
 * We actually do the “connectPhantomSolana()” or “connectPhantomSui()” calls 
 * in the aggregator => we pass them in as props
 */
function PhantomNetworkDropdown({
  current,
  switchToSolana,
  switchToSui,
}: {
  current: PhantomNetworkKey|null;
  switchToSolana: () => Promise<void>;
  switchToSui: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  // if user connected => show “Phantom Solana” or “Phantom Sui”
  // else => “Phantom?”
  let label = "Phantom?";
  if (current==="SOLANA") label = "Solana";
  if (current==="SUI") label = "Sui";

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
          <div
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
          </div>
        </div>
      )}
    </div>
  );
}
