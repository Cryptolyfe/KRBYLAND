// src/app/layout.tsx
import "./globals.css"; // global styles
import { Press_Start_2P } from "next/font/google";
import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="text-[12px] sm:text-base">
      <body
        className={`
          min-h-screen
          bg-black
          overflow-x-hidden
          text-white
          ${pressStart2P.className}
        `}
      >
        <WalletConnectLayout>
          {/* 
            Wrap your page content in a custom centered container
            that forces a maximum width and consistent horizontal padding.
          */}
          <div className="mx-auto w-full max-w-screen-xl px-4 py-4">
            {children}
          </div>
        </WalletConnectLayout>
      </body>
    </html>
  );
}
