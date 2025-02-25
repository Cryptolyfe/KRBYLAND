"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
// Example: If using Daily or LiveKit, import here
// import { DailyIframe } from "@daily-co/daily-js";

export default function WebrtcStreamPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // e.g. Daily pseudocode:
    /*
    const frame = DailyIframe.createFrame(containerRef.current!, {
      showLeaveButton: true,
      iframeStyle: { width: "100%", height: "100%" },
    });
    frame.join({ url: "https://your.daily.co/low-latency-room" });
    return () => frame.destroy();
    */
  }, []);

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

      <h1 className="text-3xl mb-4">WebRTC Low Latency</h1>

      <div
        ref={containerRef}
        className="w-full max-w-3xl aspect-video bg-neutral-700"
      >
        {/* The WebRTC library will attach a video/call frame here */}
      </div>
    </main>
  );
}
