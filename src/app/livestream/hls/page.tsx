"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import Link from "next/link";

export default function HlsStreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && Hls.isSupported()) {
      const hls = new Hls();
      // Replace with your own HLS URL:
      hls.loadSource("https://example.com/live/stream.m3u8");
      hls.attachMedia(videoRef.current);
    }
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-8">

      {/* Horizontal Nav (rainbow hover) */}
      <nav className="mb-8 flex gap-4">
        {/* HLS Link (current page) */}
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
        {/* WebRTC */}
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
        {/* YouTube */}
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

      <h1 className="text-3xl mb-4">HLS Stream</h1>

      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        className="w-full max-w-3xl bg-black"
      />
    </main>
  );
}
