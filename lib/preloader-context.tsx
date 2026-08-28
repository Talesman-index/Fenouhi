"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import LogoMark from "@/components/LogoMark";

interface PreloaderContextType {
  isLoading: boolean;
  message: string;
  progress: number;
  showPreloader: (msg?: string) => void;
  hidePreloader: () => void;
  setProgress: (percent: number) => void;
}

const PreloaderContext = createContext<PreloaderContextType>({
  isLoading: false,
  message: "Chargement en cours...",
  progress: 100,
  showPreloader: () => {},
  hidePreloader: () => {},
  setProgress: () => {},
});

export const usePreloader = () => useContext(PreloaderContext);

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [stage, setStage] = useState<"splash" | "welcome">("splash");
  const [progress, setProgressState] = useState(15);
  const isMountedRef = useRef(false);

  // Trigger loading animation on every page load / refresh
  useEffect(() => {
    isMountedRef.current = true;
    setIsLoading(true);
    setIsFading(false);
    setStage("splash");
    setProgressState(15);

    // Stage 1 (Splash) -> Stage 2 (Welcome with Device & Products) transition after 750ms
    const stageTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setStage("welcome");
      }
    }, 750);

    // Progressive smooth progress bar filling 15% -> 100% over 3.1s
    const startTime = Date.now();
    const duration = 3100;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round(15 + (elapsed / duration) * 85));
      setProgressState(pct);
      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 50);

    // Complete & smooth fade dismiss at ~3.5 seconds
    const dismissTimer = setTimeout(() => {
      clearInterval(interval);
      setProgressState(100);
      setIsFading(true);
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }, 350);
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(stageTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const showPreloader = () => {
    setProgressState(30);
    setStage("welcome");
    setIsFading(false);
    setIsLoading(true);
  };

  const hidePreloader = () => {
    setProgressState(100);
    setIsFading(true);
    setTimeout(() => {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }, 300);
  };

  const setProgress = (percent: number) => {
    setProgressState(percent);
  };

  const handleDismissImmediately = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  return (
    <PreloaderContext.Provider
      value={{
        isLoading,
        message: "Achat & Expédition Chine → Afrique",
        progress,
        showPreloader,
        hidePreloader,
        setProgress,
      }}
    >
      {children}

      {/* GOPUFF-STYLE FULLSCREEN LOADING SCREEN IN FENOUHI COLORS */}
      {isLoading && (
        <div
          id="fenouhi-gopuff-loader"
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "#0D2B4D", // Brand Navy
            zIndex: 999999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "env(safe-area-inset-top, 24px) 20px env(safe-area-inset-bottom, 24px)",
            opacity: isFading ? 0 : 1,
            visibility: isFading ? "hidden" : "visible",
            transform: isFading ? "scale(1.02) translateY(-8px)" : "scale(1) translateY(0)",
            transition: "opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.35s",
            userSelect: "none",
            overflow: "hidden",
            color: "#FFFFFF",
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          }}
        >
          {/* AMBIENT BACKGROUND GLOW */}
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 380,
              height: 380,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124, 182, 217, 0.22) 0%, rgba(13, 43, 77, 0) 70%)",
              pointerEvents: "none",
              filter: "blur(40px)",
            }}
          />

          {/* ========================================================================= */}
          {/* STAGE 1: INTRO SPLASH SCREEN (LARGE BOLD WORDMARK & MONOGRAM)              */}
          {/* ========================================================================= */}
          {stage === "splash" ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                animation: "gopuffPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 28,
                  background: "#FFFFFF",
                  padding: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 20px 45px rgba(0, 0, 0, 0.35), 0 0 30px rgba(124, 182, 217, 0.4)",
                }}
              >
                <LogoMark size={64} />
              </div>

              <h1
                style={{
                  fontSize: "clamp(48px, 12vw, 76px)",
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: "-0.04em",
                  margin: 0,
                  lineHeight: 1,
                  fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif",
                }}
              >
                fenouh<span style={{ color: "#7CB6D9" }}>i</span>
              </h1>
            </div>
          ) : (
            /* ========================================================================= */
            /* STAGE 2: GOPUFF WELCOME SCREEN WITH PHONE & PRODUCTS ILLUSTRATION         */
            /* ========================================================================= */
            <>
              {/* TOP HEADER: "Bienvenue sur" + "fenouhi" */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: 18,
                  animation: "gopuffSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
              >
                {/* SOFT SKY BLUE RETRO STICKER BADGE */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transform: "rotate(-2.5deg)",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(24px, 5.5vw, 36px)",
                      fontWeight: 900,
                      color: "#7CB6D9", // Soft Sky Blue
                      letterSpacing: "-0.02em",
                      textTransform: "capitalize",
                      textShadow: "2px 2px 0px #071C35, -1px -1px 0px #071C35, 1px -1px 0px #071C35, -1px 1px 0px #071C35, 0px 3px 8px rgba(124, 182, 217, 0.4)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Bienvenue sur
                  </span>
                </div>

                {/* FULL OFFICIAL LOGO LOCKUP (MONOGRAM + CAPITALIZED WORDMARK) */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    margin: "4px 0 0",
                  }}
                >
                  {/* OFFICIAL MONOGRAM MARK IN WHITE TILE */}
                  <div
                    style={{
                      width: "clamp(46px, 10vw, 58px)",
                      height: "clamp(46px, 10vw, 58px)",
                      borderRadius: 16,
                      background: "#FFFFFF",
                      padding: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(124, 182, 217, 0.35)",
                      flexShrink: 0,
                    }}
                  >
                    <LogoMark size={42} />
                  </div>

                  {/* CAPITALIZED FULL WORDMARK */}
                  <h1
                    style={{
                      fontSize: "clamp(44px, 10vw, 68px)",
                      fontWeight: 900,
                      color: "#FFFFFF",
                      letterSpacing: "-0.04em",
                      margin: 0,
                      lineHeight: 1,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      display: "inline-flex",
                      alignItems: "baseline",
                      textShadow: "0 8px 20px rgba(0,0,0,0.35)",
                    }}
                  >
                    Fenouh<span style={{ color: "#7CB6D9" }}>i</span>
                  </h1>
                </div>
              </div>

              {/* CENTERPIECE: STYLIZED PHONE IN HAND WITH OVERFLOWING PRODUCTS */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  width: "100%",
                  maxWidth: 360,
                  margin: "8px 0",
                  animation: "gopuffFloat 3s ease-in-out infinite alternate",
                }}
              >
                {/* SPARKLE STARS ✨ (STRICTLY SKY BLUE) */}
                <svg
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 20,
                    width: 24,
                    height: 24,
                    animation: "gopuffSpin 4s linear infinite",
                  }}
                  viewBox="0 0 24 24"
                  fill="#7CB6D9"
                >
                  <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
                </svg>

                <svg
                  style={{
                    position: "absolute",
                    bottom: 40,
                    right: 24,
                    width: 20,
                    height: 20,
                    animation: "gopuffSpin 3.5s linear infinite reverse",
                  }}
                  viewBox="0 0 24 24"
                  fill="#7CB6D9"
                >
                  <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
                </svg>

                <svg
                  style={{
                    position: "absolute",
                    top: 80,
                    right: 18,
                    width: 18,
                    height: 18,
                    animation: "gopuffPulse 2s ease-in-out infinite",
                  }}
                  viewBox="0 0 24 24"
                  fill="#7CB6D9"
                >
                  <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
                </svg>

                {/* SVG ILLUSTRATION: HAND HOLDING PHONE WITH PRODUCTS */}
                <svg
                  viewBox="0 0 340 380"
                  width="100%"
                  height="100%"
                  style={{ maxHeight: 310, overflow: "visible" }}
                >
                  <defs>
                    <linearGradient id="phoneBody" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#7CB6D9" />
                      <stop offset="100%" stopColor="#5B9EC5" />
                    </linearGradient>
                    <linearGradient id="screenBg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EBF4FA" />
                      <stop offset="100%" stopColor="#D2E7F5" />
                    </linearGradient>
                    <linearGradient id="boxGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#E59866" />
                      <stop offset="100%" stopColor="#D35400" />
                    </linearGradient>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FDE047" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                    <linearGradient id="handSkin" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#B45309" />
                    </linearGradient>
                    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#071C35" floodOpacity="0.4" />
                    </filter>
                  </defs>

                  {/* 1. BACK FINGERS / PALM (GRIPPING PHONE) */}
                  <path
                    d="M 68 180 C 40 200 35 270 70 310 C 95 340 145 350 185 345 L 205 340 C 235 330 270 300 280 250 C 290 200 270 170 255 160"
                    fill="url(#handSkin)"
                    stroke="#071C35"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                  />

                  {/* 2. SMARTPHONE DEVICE CHASSIS */}
                  <g filter="url(#cardShadow)">
                    {/* Phone Outer Shell */}
                    <rect
                      x="92"
                      y="40"
                      width="156"
                      height="270"
                      rx="30"
                      fill="url(#phoneBody)"
                      stroke="#071C35"
                      strokeWidth="5"
                    />

                    {/* Phone Inner Screen Glass */}
                    <rect
                      x="100"
                      y="48"
                      width="140"
                      height="254"
                      rx="22"
                      fill="url(#screenBg)"
                      stroke="#071C35"
                      strokeWidth="3.5"
                    />

                    {/* Dynamic Island / Speaker Pill */}
                    <rect
                      x="142"
                      y="56"
                      width="56"
                      height="12"
                      rx="6"
                      fill="#071C35"
                    />

                    {/* App Header Icons inside Phone */}
                    <line x1="112" y1="64" x2="124" y2="64" stroke="#0D2B4D" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="112" y1="68" x2="120" y2="68" stroke="#0D2B4D" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="226" cy="64" r="3.5" stroke="#0D2B4D" strokeWidth="2" fill="none" />
                    <line x1="229" y1="67" x2="232" y2="70" stroke="#0D2B4D" strokeWidth="2" strokeLinecap="round" />

                    {/* 3. PRODUCTS OVERFLOWING FROM SCREEN */}
                    {/* A. CARDBOARD SHIPPING BOX (CHINE -> AFRIQUE) */}
                    <g transform="translate(108, 140)">
                      <polygon points="12,18 64,8 116,18 64,28" fill="#F6D59B" stroke="#071C35" strokeWidth="3" />
                      <polygon points="12,18 64,28 64,82 12,70" fill="#E59866" stroke="#071C35" strokeWidth="3" />
                      <polygon points="64,28 116,18 116,70 64,82" fill="#D35400" stroke="#071C35" strokeWidth="3" />
                      {/* Shipping Tape */}
                      <path d="M 38 23 L 90 13 L 90 23 L 38 33 Z" fill="#FBBF24" stroke="#071C35" strokeWidth="2" />
                      {/* Fenouhi Monogram Badge on Box */}
                      <circle cx="64" cy="54" r="10" fill="#0D2B4D" stroke="#FFFFFF" strokeWidth="1.5" />
                      <path d="M 60 50 C 60 47 62 45 65 45 H 68 C 69 45 70 46 70 47 C 70 48 69 49 68 49 H 66 V 58 H 63 V 50 Z" fill="#FFFFFF" />
                    </g>

                    {/* B. HIGH-TECH IPHONE STANDING BEHIND BOX */}
                    <g transform="translate(162, 90)">
                      <rect x="0" y="0" width="58" height="105" rx="12" fill="#0D2B4D" stroke="#071C35" strokeWidth="3.5" />
                      <rect x="4" y="4" width="50" height="97" rx="9" fill="#1E293B" />
                      {/* Triple Camera Ring */}
                      <circle cx="15" cy="16" r="4.5" fill="#071C35" stroke="#7CB6D9" strokeWidth="1.5" />
                      <circle cx="28" cy="16" r="4.5" fill="#071C35" stroke="#7CB6D9" strokeWidth="1.5" />
                      <circle cx="21.5" cy="27" r="4.5" fill="#071C35" stroke="#7CB6D9" strokeWidth="1.5" />
                      {/* Apple Gloss Reflection */}
                      <path d="M 6 12 L 48 68" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
                    </g>

                    {/* C. BEAUTY / CARE LOTION BOTTLE */}
                    <g transform="translate(108, 98)">
                      <rect x="12" y="32" width="34" height="62" rx="8" fill="#FDF2F4" stroke="#071C35" strokeWidth="3" />
                      <rect x="22" y="18" width="14" height="15" rx="3" fill="#D4A373" stroke="#071C35" strokeWidth="2.5" />
                      <path d="M 29 18 V 10 H 38" stroke="#071C35" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      {/* Gold Sun on Bottle */}
                      <circle cx="29" cy="58" r="8" fill="#FBBF24" />
                      <path d="M 21 64 H 37" stroke="#071C35" strokeWidth="2" strokeLinecap="round" />
                    </g>

                    {/* D. LUXURY PERFUME / DROPLET BOTTLE */}
                    <g transform="translate(196, 175)">
                      <path d="M 12 18 C 12 8 36 8 36 18 V 48 C 36 54 30 58 24 58 C 18 58 12 54 12 48 Z" fill="#7CB6D9" stroke="#071C35" strokeWidth="3" />
                      <rect x="20" y="6" width="8" height="12" rx="2" fill="#FBBF24" stroke="#071C35" strokeWidth="2" />
                      <circle cx="24" cy="34" r="5" fill="#FFFFFF" opacity="0.6" />
                    </g>
                  </g>

                  {/* 4. FOREGROUND FINGERS (WRAPPING AROUND FRONT OF PHONE) */}
                  {/* Finger 1 (Top) */}
                  <path
                    d="M 235 125 C 265 128 288 140 286 160 C 284 175 260 180 232 176"
                    fill="url(#handSkin)"
                    stroke="#071C35"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                  />
                  {/* Finger 2 (Middle) */}
                  <path
                    d="M 235 174 C 270 178 290 190 288 208 C 286 224 260 226 230 222"
                    fill="url(#handSkin)"
                    stroke="#071C35"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                  />
                  {/* Finger 3 (Ring) */}
                  <path
                    d="M 232 222 C 265 226 284 238 280 255 C 276 270 252 270 228 265"
                    fill="url(#handSkin)"
                    stroke="#071C35"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                  />
                  {/* Thumb (Left Front) */}
                  <path
                    d="M 68 200 C 60 160 85 145 106 170 C 114 180 110 205 92 225 C 80 240 70 225 68 200 Z"
                    fill="url(#handSkin)"
                    stroke="#071C35"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* BOTTOM FOOTER: ENGAGING TAGLINE + PROGRESS BAR */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                  padding: "0 20px",
                }}
              >
                {/* PROMINENT ENGAGING TAGLINE WITHOUT EMOJIS */}
                <p
                  style={{
                    fontSize: "clamp(15px, 4.2vw, 19px)",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    textAlign: "center",
                    margin: 0,
                    lineHeight: 1.3,
                    letterSpacing: "-0.02em",
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    textShadow: "0 2px 12px rgba(0, 0, 0, 0.4)",
                    maxWidth: 320,
                  }}
                >
                  Retrouvez tous vos produits de Chine à <span style={{ color: "#7CB6D9" }}>bas prix</span>
                </p>

                {/* SLIM SOFT SKY BLUE PROGRESS BAR */}
                <div
                  style={{
                    width: 200,
                    height: 5,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: 999,
                    overflow: "hidden",
                    position: "relative",
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "100%",
                      backgroundColor: "#7CB6D9",
                      borderRadius: 999,
                      transition: "width 0.08s ease-out",
                      boxShadow: "0 0 10px #7CB6D9",
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* GLOBAL ANIMATIONS KEYFRAMES */}
          <style jsx global>{`
            @keyframes gopuffPopIn {
              0% {
                opacity: 0;
                transform: scale(0.65);
              }
              100% {
                opacity: 1;
                transform: scale(1);
              }
            }
            @keyframes gopuffSlideDown {
              0% {
                opacity: 0;
                transform: translateY(-20px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes gopuffFloat {
              0% {
                transform: translateY(0px);
              }
              100% {
                transform: translateY(-8px);
              }
            }
            @keyframes gopuffSpin {
              0% {
                transform: rotate(0deg) scale(0.9);
              }
              50% {
                transform: rotate(180deg) scale(1.15);
              }
              100% {
                transform: rotate(360deg) scale(0.9);
              }
            }
            @keyframes gopuffPulse {
              0% {
                transform: scale(0.8);
                opacity: 0.7;
              }
              50% {
                transform: scale(1.2);
                opacity: 1;
              }
              100% {
                transform: scale(0.8);
                opacity: 0.7;
              }
            }
          `}</style>
        </div>
      )}
    </PreloaderContext.Provider>
  );
}

