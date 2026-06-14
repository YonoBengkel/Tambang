import React from "react";
import { motion } from "framer-motion";

export default function SineWaveGradient() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none w-full h-full">
      {/* Decorative gradient blur in the background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 opacity-60"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-slate-100/50 rounded-full blur-[100px] translate-y-1/3 opacity-60"></div>

      <svg
        className="absolute w-full h-full opacity-60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gradient-trace-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="25%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.8" />
            <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          <linearGradient id="gradient-trace-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="25%" stopColor="#0ea5e9" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.6" />
            <stop offset="75%" stopColor="#0ea5e9" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* --- Top Sine Wave --- */}
        {/* Base Track */}
        <path
          d="M -100,200 C 300,50 700,350 1100,200 C 1500,50 1900,350 2300,200"
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {/* Animated Tracer */}
        <motion.path
          d="M -100,200 C 300,50 700,350 1100,200 C 1500,50 1900,350 2300,200"
          fill="none"
          stroke="url(#gradient-trace-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          strokeDasharray="400 2400"
          initial={{ strokeDashoffset: 2800 }}
          animate={{ strokeDashoffset: -400 }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "linear",
          }}
        />

        {/* --- Bottom Sine Wave (Offset Phase) --- */}
        {/* Base Track */}
        <path
          d="M -100,600 C 300,750 700,450 1100,600 C 1500,750 1900,450 2300,600"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {/* Animated Tracer */}
        <motion.path
          d="M -100,600 C 300,750 700,450 1100,600 C 1500,750 1900,450 2300,600"
          fill="none"
          stroke="url(#gradient-trace-2)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          strokeDasharray="300 2500"
          initial={{ strokeDashoffset: -400 }}
          animate={{ strokeDashoffset: 2800 }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: "linear",
          }}
        />

        {/* --- Middle Subtle Wave --- */}
        <motion.path
          d="M -100,400 C 400,200 600,600 1100,400 C 1600,200 1800,600 2300,400"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
          strokeDasharray="200 2600"
          initial={{ strokeDashoffset: 2800 }}
          animate={{ strokeDashoffset: -200 }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "linear",
          }}
          opacity={0.5}
        />
      </svg>
    </div>
  );
}
