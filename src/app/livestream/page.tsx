"use client";

import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import ReactPlayer from "react-player";

type StreamOption =
  | "hls"
  | "webrtc"
  | "youtube"
  | "twitch"
  | "facebook"
  | "instagram"
  | "tiktok";

export default function Page() {
  const [selected, setSelected] = useState<StreamOption>("hls");

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-8 w-full">
      {/* Center the main heading */}
      <h1 className="text-3xl mb-4 text-center">Mega Livestream</h1>

      {/* Center the nav items for both mobile & desktop */}
      <nav className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        <StreamNavButton
          label="HLS"
          value="hls"
          selected={selected}
          setSelected={setSelected}
        />
        <StreamNavButton
          label="WebRTC"
          value="webrtc"
          selected={selected}
          setSelected={setSelected}
        />
        <StreamNavButton
          label="YouTube"
          value="youtube"
          selected={selected}
          setSelected={setSelected}
        />
        <StreamNavButton
          label="Twitch"
          value="twitch"
          selected={selected}
          setSelected={setSelected}
        />
        <StreamNavButton
          label="Facebook"
          value="facebook"
          selected={selected}
          setSelected={setSelected}
        />
        <StreamNavButton
          label="Instagram"
          value="instagram"
          selected={selected}
          setSelected={setSelected}
        />
        <StreamNavButton
          label="TikTok"
          value="tiktok"
          selected={selected}
          setSelected={setSelected}
        />
      </nav>

      {/* Conditional Rendering */}
      {selected === "hls" && <HlsPlayer />}
      {selected === "webrtc" && <WebrtcPlayer />}
      {selected === "youtube" && <YouTubePlayer />}
      {selected === "twitch" && <TwitchPlayer />}
      {selected === "facebook" && <FacebookPlayer />}
      {selected === "instagram" && <InstagramPlayer />}
      {selected === "tiktok" && <TiktokPlayer />}
    </main>
  );
}

/**
 * StreamNavButton
 *   - Mobile (<640px): px-1 py-0.5, text-[9px]
 *   - Desktop (≥640px): px-4 py-2, text-base
 * Centers remain the same otherwise
 */
function StreamNavButton({
  label,
  value,
  selected,
  setSelected,
}: {
  label: string;
  value: StreamOption;
  selected: StreamOption;
  setSelected: React.Dispatch<React.SetStateAction<StreamOption>>;
}) {
  const isSelected = selected === value;

  return (
    <button
      onClick={() => setSelected(value)}
      className={`
        px-1 py-0.5 text-[9px]
        sm:px-4 sm:py-2 sm:text-base
        transition-colors text-white
        ${isSelected ? "bg-gray-700" : ""}
        hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
        hover:text-transparent hover:bg-clip-text
      `}
    >
      {label}
    </button>
  );
}

/** ============== 1) HLS Player Subcomponent ============== */
function HlsPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && Hls.isSupported()) {
      const hls = new Hls();
      // Replace with your actual HLS .m3u8 feed
      hls.loadSource("https://example.com/live/stream.m3u8");
      hls.attachMedia(videoRef.current);
    }
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      {/*
        Shrink heading on mobile, normal on desktop => text-xl sm:text-2xl
        & center it => text-center
      */}
      <h2 className="text-xl sm:text-2xl mb-2 text-center">HLS (Standard Latency)</h2>
      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        className="w-full aspect-video bg-black"
      />
    </div>
  );
}

/** ============== 2) WebRTC Subcomponent ============== */
function WebrtcPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Example: Daily or LiveKit integration
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl sm:text-2xl mb-2 text-center">WebRTC (Low Latency)</h2>
      <div ref={containerRef} className="w-full aspect-video bg-neutral-700" />
    </div>
  );
}

/** ============== 3) YouTube Player Subcomponent ============== */
function YouTubePlayer() {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl sm:text-2xl mb-2 text-center">YouTube Live</h2>
      <div className="w-full aspect-video">
        <ReactPlayer
          url="https://www.youtube.com/watch?v=YOUR_LIVE_STREAM_ID"
          controls
          playing
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
}

/** ============== 4) Twitch Player Subcomponent ============== */
function TwitchPlayer() {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl sm:text-2xl mb-2 text-center">Twitch Live</h2>
      <div className="w-full aspect-video">
        <ReactPlayer
          url="https://www.twitch.tv/YourChannel"
          controls
          playing
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
}

/** ============== 5) Facebook Player ============== */
function FacebookPlayer() {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl sm:text-2xl mb-2 text-center">Facebook Live</h2>
      <div className="w-full aspect-video">
        <iframe
          src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2FFacebookLiveVideoURL"
          width="100%"
          height="100%"
          style={{ border: "none", overflow: "hidden" }}
          scrolling="no"
          allowFullScreen
        />
      </div>
    </div>
  );
}

/** ============== 6) Instagram Player ============== */
function InstagramPlayer() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Heading => shrink on mobile */}
      <h2 className="text-xl sm:text-2xl mb-2 text-center">Instagram Live (coming soon!)</h2>
      <div className="w-full aspect-video bg-neutral-700 flex items-center justify-center">
        {/* 
          The disclaimer => super small on mobile, normal on desktop
          plus text-center
        */}
        <p className="text-[9px] sm:text-sm text-center text-gray-400">
          Embedding Instagram Live is not officially supported
        </p>
      </div>
    </div>
  );
}

/** ============== 7) TikTok Player ============== */
function TiktokPlayer() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Heading => shrink on mobile */}
      <h2 className="text-xl sm:text-2xl mb-2 text-center">TikTok Live (coming soon!)</h2>
      <div className="w-full aspect-video bg-neutral-700 flex items-center justify-center">
        {/* 
          The disclaimer => super small on mobile, normal on desktop 
          & centered
        */}
        <p className="text-[9px] sm:text-sm text-center text-gray-400">
          Embedding TikTok Live not officially supported
        </p>
      </div>
    </div>
  );
}
