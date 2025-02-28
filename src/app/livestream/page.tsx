"use client";

import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import ReactPlayer from "react-player";

/** 
 * A single page that conditionally renders:
 *  - HLS
 *  - WebRTC (placeholder)
 *  - YouTube
 *  - Twitch
 *  - Facebook
 *  - Instagram
 *  - TikTok
 * 
 * We'll store these in the 'selected' state. 
 */
type StreamOption =
  | "hls"
  | "webrtc"
  | "youtube"
  | "twitch"
  | "facebook"
  | "instagram"
  | "tiktok";

export default function MegaLivestreamPage() {
  // Track selected approach
  const [selected, setSelected] = useState<StreamOption>("hls");

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-8 w-full">
      <h1 className="text-3xl mb-4">Mega Livestream</h1>

      {/* Horizontal nav => 7 buttons, all using pink->yellow for hover */}
      <nav className="mb-6 flex gap-4 flex-wrap">
        <StreamNavButton label="HLS" value="hls" selected={selected} setSelected={setSelected} />
        <StreamNavButton label="WebRTC" value="webrtc" selected={selected} setSelected={setSelected} />
        <StreamNavButton label="YouTube" value="youtube" selected={selected} setSelected={setSelected} />
        <StreamNavButton label="Twitch" value="twitch" selected={selected} setSelected={setSelected} />
        <StreamNavButton label="Facebook" value="facebook" selected={selected} setSelected={setSelected} />
        <StreamNavButton label="Instagram" value="instagram" selected={selected} setSelected={setSelected} />
        <StreamNavButton label="TikTok" value="tiktok" selected={selected} setSelected={setSelected} />
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
 * A small helper button to reduce repeated classes.
 * All use the same from-pink-500 to-yellow-500 for rainbow hover
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
        px-4 py-2 transition-colors text-white
        ${isSelected ? "bg-gray-700" : ""}
        hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
        hover:text-transparent hover:bg-clip-text
      `}
    >
      {label}
    </button>
  );
}

/** 2) HLS Player Subcomponent */
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
      <h2 className="text-2xl mb-2">HLS (Standard Latency)</h2>
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

/** 3) WebRTC Subcomponent => minimal placeholder */
function WebrtcPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Example: Daily or LiveKit integration
    // const frame = DailyIframe.createFrame(containerRef.current!, { ... });
    // frame.join({ url: "https://your.daily.co/room" });
    // return () => frame.destroy();
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl mb-2">WebRTC (Low Latency)</h2>
      <div
        ref={containerRef}
        className="w-full aspect-video bg-neutral-700"
      >
        {/* The WebRTC library attaches a video/call frame here */}
      </div>
    </div>
  );
}

/** 4) YouTube Player Subcomponent */
function YouTubePlayer() {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl mb-2">YouTube Live</h2>
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

/** 5) Twitch Player */
function TwitchPlayer() {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl mb-2">Twitch Live</h2>
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

/** 6) Facebook Player */
function FacebookPlayer() {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl mb-2">Facebook Live</h2>
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

/** 7) Instagram Player */
function InstagramPlayer() {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl mb-2">Instagram Live (coming soon!) </h2>
      <div className="w-full aspect-video bg-neutral-700 flex items-center justify-center">
        <p className="text-sm text-gray-400">
          Embedding Instagram Live is not officially supported
        </p>
      </div>
    </div>
  );
}

/** 8) TikTok Player */
function TiktokPlayer() {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl mb-2">TikTok Live (coming soon!)</h2>
      <div className="w-full aspect-video bg-neutral-700 flex items-center justify-center">
        <p className="text-sm text-gray-400">
          Embedding TikTok Live not officially supported 
        </p>
      </div>
    </div>
  );
}
