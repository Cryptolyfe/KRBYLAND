"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Track whether user is connected and store address
  const [account, setAccount] = useState<string | null>(null);

  // Connect logic (formerly in WalletConnect)
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    } else {
      console.error("Please install MetaMask or another compatible wallet.");
    }
  };

  // Truncated address => first 5 + last 4
  const truncatedAddress = account
    ? `${account.slice(0, 5)}...${account.slice(-4)}`
    : "";

  // Shared button classes => pink→yellow gradient on hover
  const walletButtonClasses = `
    px-4 py-2
    transition-colors
    text-white
    rounded-full
    border-2
    border-white
    bg-transparent
    hover:bg-gradient-to-r
    hover:from-pink-500
    hover:to-yellow-500
    hover:text-transparent
    hover:bg-clip-text
  `;

  return (
    <html lang="en">
      <body className={`min-h-screen text-xs bg-black ${pressStart2P.className}`}>
        <header className="p-4 bg-black border-b border-neutral-800">
          <nav className="container mx-auto flex items-center justify-between">

            {/* LEFT SIDE: Logo + (Connect or Address) Button */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/images/krbyland_logo.png"
                  alt="KRBYLAND Logo"
                  width={40}
                  height={40}
                />
                <span className="text-base font-bold">KRBYLAND</span>
              </Link>

              {/* Wallet Button / Address */}
              <div className="ml-6">
                {account ? (
                  // Show truncated address with same hover gradient
                  <button className={walletButtonClasses}>
                    {truncatedAddress}
                  </button>
                ) : (
                  // Show "Connect Wallet" button with same hover gradient
                  <button onClick={connectWallet} className={walletButtonClasses}>
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Nav Menu */}
            <ul className="flex gap-5">
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

        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
