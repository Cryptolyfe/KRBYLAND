import "./globals.css";
import { Press_Start_2P } from "next/font/google";
import type { Metadata } from "next";
import React from "react";
import WalletConnectLayout from "./components/WalletConnect";

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KRBYLAND",
  viewport: {
    width: "device-width",
    initialScale: 1.0,
  },
};

// This is a SERVER component => no "use client" at top
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="text-[12px] sm:text-base">
      <body
        className={`min-h-screen text-xs bg-black overflow-x-hidden ${pressStart2P.className}`}
      >
        {/* HEADER */}
        <header
          className="mx-auto w-full max-w-screen-xl my-2"
          style={{ height: "20mm" }}
        >
          <div
            className="w-full h-full rounded-lg border-2 border-transparent bg-clip-padding p-0.5 animate-gradient"
            style={{
              backgroundImage: "linear-gradient(to right, #4f46e5, #14b8a6)",
              backgroundBlendMode: "overlay",
              backgroundSize: "200% 200%",
              backgroundPosition: "center",
            }}
          >
            <div className="h-full bg-black rounded-lg">
              {/* Aggregator script */}
              <WalletConnectLayout />
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="mx-auto w-full max-w-screen-xl my-2 flex justify-center items-center">
          <div
            className="w-full rounded-lg border-2 border-transparent bg-clip-padding p-0.5 animate-gradient"
            style={{
              backgroundImage: "linear-gradient(to right, #4f46e5, #14b8a6)",
              backgroundBlendMode: "overlay",
              backgroundSize: "200% 200%",
              backgroundPosition: "center",
            }}
          >
            <div className="bg-black rounded-lg p-2 overflow-hidden flex justify-center items-center w-full h-full">
              {children}
            </div>
          </div>
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
