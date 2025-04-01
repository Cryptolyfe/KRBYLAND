// src/app/layout.tsx
import "./globals.css"; // your global styles
import { Press_Start_2P } from "next/font/google";
import type { Metadata } from "next";
import WalletConnectLayout from "./components/WalletConnect"; 
  // IMPORTANT: note the path "components/WalletConnect" because that's where your aggregator script lives
import React from "react";

// Example: using Press_Start_2P
const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/**
 * Next.js 13+ uses metadata to inject <title>, <meta name="viewport">, etc.
 * This ensures mobile-friendly scaling.
 */
export const metadata: Metadata = {
  title: "KRBYLAND",
  viewport: {
    width: "device-width",
    initialScale: 1.0,
  },
};

// RootLayout is a SERVER component that returns <html> / <body>
// and we do NOT put "use client" at the top.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="text-[12px] sm:text-base">
      <body
        className={`min-h-screen text-xs bg-black overflow-x-hidden ${pressStart2P.className}`}
      >
        {/* HEADER with animated gradient border */}
        <header className="mx-auto w-full max-w-screen-xl my-2" style={{ height: "20mm" }}>
          <div
            className="h-full rounded-lg border-2 border-transparent bg-clip-padding p-0.5 animate-gradient"
            style={{
              backgroundImage: "linear-gradient(to right, #4f46e5, #14b8a6)",
              backgroundBlendMode: "overlay",
              backgroundSize: "200% 200%",
              backgroundPosition: "center",
            }}
          >
            <div className="h-full bg-black rounded-lg">
              <WalletConnectLayout />
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="container mx-auto px-4 py-4">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="container mx-auto px-4 py-4 my-4">
          <div className="bg-black rounded-lg p-4 text-center">
            <img
              src="/images/KRBYLAND.png"
              alt="KRBYLAND Logo"
              className="mx-auto mb-2 w-10 h-10"
            />
            <p className="text-white">
              © {new Date().getFullYear()} KRBYLAND. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
