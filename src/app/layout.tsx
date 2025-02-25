"use client";

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
  return (
    <html lang="en">
      <body className={`min-h-screen text-xs bg-black ${pressStart2P.className}`}>
        <header className="p-4 bg-black border-b border-neutral-800">
          <nav className="container mx-auto flex items-center justify-between">
            {/* Logo + Title (wrapped in Link). Increased spacing => "space-x-3" */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-5">
                <Image
                  src="/images/krbyland_logo.png"
                  alt="KRBYLAND Logo"
                  width={40}
                  height={40}
                />
                <span className="text-base font-bold">KRBYLAND</span>
              </Link>
            </div>

            {/* Nav with white text + multi-color hovers */}
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
