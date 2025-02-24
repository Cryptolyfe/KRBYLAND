// app/livestream/page.tsx
"use client";

import Link from "next/link";

export default function LivestreamPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-8">
      <h1 className="text-3xl mb-6">Livestream</h1>
      <p className="max-w-lg text-center mb-8">
        Choose your preferred streaming option:
      </p>

      <div className="flex flex-col gap-4">
        {/* HLS Link */}
        <Link
          href="/livestream/hls"
          className="
            bg-cyan-600 px-4 py-2 rounded transition-colors
            hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
            hover:text-transparent hover:bg-clip-text
          "
        >
          HLS (Standard Latency)
        </Link>

        {/* WebRTC Link */}
        <Link
          href="/livestream/webrtc"
          className="
            bg-green-600 px-4 py-2 rounded transition-colors
            hover:bg-gradient-to-r hover:from-indigo-500 hover:to-pink-500
            hover:text-transparent hover:bg-clip-text
          "
        >
          WebRTC (Low Latency)
        </Link>

        {/* YouTube Link */}
        <Link
          href="/livestream/youtube"
          className="
            bg-red-600 px-4 py-2 rounded transition-colors
            hover:bg-gradient-to-r hover:from-yellow-400 hover:to-purple-600
            hover:text-transparent hover:bg-clip-text
          "
        >
          YouTube Live
        </Link>
      </div>
    </main>
  );
}
