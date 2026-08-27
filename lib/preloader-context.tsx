"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import Image from "next/image";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [message, setMessage] = useState("Achat & Expédition Chine → Afrique");
  const [progress, setProgressState] = useState(100);
  const [isPWA, setIsPWA] = useState(false);
  const isMountedRef = useRef(false);

  // Initial startup load
  useEffect(() => {
    isMountedRef.current = true;

    // Hide static HTML splash screen if present
    if (typeof document !== "undefined") {
      const initialSplash = document.getElementById("initial-splash-screen");
      if (initialSplash) {
        initialSplash.style.opacity = "0";
        initialSplash.style.display = "none";
      }
    }

    // Detect PWA standalone mode
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;
      setIsPWA(isStandalone);

      // Check if preloader was already shown in this session
      const alreadySeen = sessionStorage.getItem("fenou_preloader_seen");
      if (!alreadySeen) {
        sessionStorage.setItem("fenou_preloader_seen", "true");
        setIsLoading(true);
        setProgressState(25);

        // Smooth quick progress
        const interval = setInterval(() => {
          setProgressState((prev) => {
            if (prev >= 95) {
              clearInterval(interval);
              return 95;
            }
            return prev + 25;
          });
        }, 60);

        // Absolute dismiss timer
        const dismissTimer = setTimeout(() => {
          clearInterval(interval);
          setProgressState(100);
          setIsFading(true);
          setTimeout(() => {
            if (isMountedRef.current) {
              setIsLoading(false);
            }
          }, 250);
        }, 500);

        return () => {
          clearInterval(interval);
          clearTimeout(dismissTimer);
        };
      } else {
        // Already seen, keep hidden
        setIsLoading(false);
      }
    }
  }, []);

  const showPreloader = (msg = "Chargement en cours...") => {
    setMessage(msg);
    setProgressState(60);
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
    }, 250);
  };

  const setProgress = (percent: number) => {
    setProgressState(percent);
  };

  const handleDismissImmediately = () => {
    setIsFading(true);
    setIsLoading(false);
  };

  return (
    <PreloaderContext.Provider
      value={{
        isLoading,
        message,
        progress,
        showPreloader,
        hidePreloader,
        setProgress,
      }}
    >
      {children}

      {/* GLOBAL FENOUHIMIN PRELOADER OVERLAY */}
      {isLoading && (
        <div
          aria-hidden="true"
          id="fenouhimin-global-preloader"
          onClick={handleDismissImmediately}
          role="button"
          tabIndex={0}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "#0F172A",
            zIndex: 999999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: isFading ? 0 : 1,
            visibility: isFading ? "hidden" : "visible",
            transition: "opacity 0.25s ease, visibility 0.25s ease",
            userSelect: "none",
            pointerEvents: isFading ? "none" : "auto",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: "absolute",
              width: 340,
              height: 340,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(22, 84, 145, 0.18) 50%, rgba(15, 23, 42, 0) 75%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              filter: "blur(45px)",
              pointerEvents: "none",
            }}
          />

          {/* Preloader Container */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              padding: 24,
              textAlign: "center",
              maxWidth: 360,
              width: "90%",
            }}
          >
            {/* App Icon with Pulsing Ring */}
            <div
              style={{
                position: "relative",
                width: 96,
                height: 96,
                borderRadius: 24,
                padding: 4,
                background:
                  "linear-gradient(135deg, #38BDF8 0%, #165491 50%, #0F172A 100%)",
                boxShadow:
                  "0 14px 36px -8px rgba(56, 189, 248, 0.4), 0 0 24px rgba(22, 84, 145, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "fenouPulse 2s infinite ease-in-out",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 20,
                  overflow: "hidden",
                  backgroundColor: "#0F172A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  src="/icons/icon-512x512.png"
                  alt="FENOUHIMIN Logo App PWA"
                  width={84}
                  height={84}
                  priority
                  style={{
                    objectFit: "contain",
                    borderRadius: 18,
                  }}
                />
              </div>
            </div>

            {/* Brand Title & Message */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#FFFFFF",
                  letterSpacing: "-0.5px",
                  fontFamily: "'Poppins', system-ui, sans-serif",
                }}
              >
                FENOUHIMIN
              </h1>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 999,
                  backgroundColor: "rgba(56, 189, 248, 0.12)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#38BDF8",
                    boxShadow: "0 0 8px #38BDF8",
                  }}
                />
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: "#38BDF8",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  {isPWA ? "Application Mobile PWA" : "Plateforme Web"}
                </span>
              </div>

              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: "#94A3B8",
                  lineHeight: 1.4,
                }}
              >
                {message}
              </p>
            </div>

            {/* Progress Bar & Percentage */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 180,
                  height: 6,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 999,
                  overflow: "hidden",
                  position: "relative",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #165491 0%, #38BDF8 100%)",
                    borderRadius: 999,
                    transition: "width 0.15s ease-out",
                    boxShadow: "0 0 12px rgba(56, 189, 248, 0.6)",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.5px" }}>
                  {progress < 100 ? "Chargement..." : "Finalisation..."}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#38BDF8" }}>{Math.min(progress, 100)}%</span>
              </div>
            </div>
          </div>

          <style jsx global>{`
            @keyframes fenouPulse {
              0% {
                transform: scale(1);
                box-shadow: 0 14px 36px -8px rgba(56, 189, 248, 0.4), 0 0 24px rgba(22, 84, 145, 0.4);
              }
              50% {
                transform: scale(1.04);
                box-shadow: 0 18px 44px -4px rgba(56, 189, 248, 0.6), 0 0 30px rgba(56, 189, 248, 0.5);
              }
              100% {
                transform: scale(1);
                box-shadow: 0 14px 36px -8px rgba(56, 189, 248, 0.4), 0 0 24px rgba(22, 84, 145, 0.4);
              }
            }
          `}</style>
        </div>
      )}
    </PreloaderContext.Provider>
  );
}
