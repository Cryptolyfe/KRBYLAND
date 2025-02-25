"use client";

import React from "react";
import ReactPlayer from "react-player";
import Link from "next/link";

export default function YouTubeStreamPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-8">

      {/* Horizontal Nav (rainbow hover) */}
      <nav className="mb-8 flex gap-4">
        <Link
          href="/livestream/hls"
          className="
            px-4 py-2 transition-colors
            hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
            hover:text-transparent hover:bg-clip-text
          "
        >
          HLS
        </Link>
        <Link
          href="/livestream/webrtc"
          className="
            px-4 py-2 transition-colors
            hover:bg-gradient-to-r hover:from-indigo-500 hover:to-pink-500
            hover:text-transparent hover:bg-clip-text
          "
        >
          WebRTC
        </Link>
        <Link
          href="/livestream/youtube"
          className="
            px-4 py-2 transition-colors
            hover:bg-gradient-to-r hover:from-yellow-400 hover:to-purple-600
            hover:text-transparent hover:bg-clip-text
          "
        >
          YouTube
        </Link>
      </nav>

      <h1 className="text-3xl mb-4">YouTube Live</h1>

      <div className="w-full max-w-4xl aspect-video">
        <ReactPlayer
          url="https://www.youtube.com/watch?v=YOUR_LIVE_STREAM_ID"
          controls
          playing
          width="100%"
          height="100%"
        />
      </div>
    </main>
  );
}
