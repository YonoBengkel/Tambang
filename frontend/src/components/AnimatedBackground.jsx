import React from "react";

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50/50">
      {/* Centered large purple glowing orb (Static to save GPU) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px]" />

      {/* Optional smaller secondary orb for depth (Static to save GPU) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-400/10 rounded-full blur-[80px]" />
    </div>
  );
}
