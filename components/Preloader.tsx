"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(18);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Detect if running inside PWA standalone mode
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;
      setIsPWA(isStandalone);
    }

    // Animate progress bar smoothly
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) {
          clearInterval(progressInterval);
          return 100;
        }
        const step = Math.floor(Math.random() * 16) + 8;
        const next = prev + step;
        return next > 96 ? 96 : next;
      });
    }, 90);

    const handleLoad = () => {
      setProgress(100);
      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 500); // 500ms smooth fade transition
      }, 350);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      const timer = setTimeout(handleLoad, 1600); // Safety fallback timeout
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div
      aria-hidden="true"
      id="cargolink-app-preloader"
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
        transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        userSelect: "none",
        pointerEvents: isFading ? "none" : "all",
        overflow: "hidden",
      }}
    >
      {/* Glow Backlight Effect */}
      <div
        style={{
          position: "absolute",
          width: "340px",
          height: "340px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(22, 84, 145, 0.15) 45%, rgba(15, 23, 42, 0) 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Content Container */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "22px",
          padding: "24px",
          textAlign: "center",
          maxWidth: "360px",
          width: "90%",
        }}
      >
        {/* PWA App Icon Frame */}
        <div
          className="preloader-app-icon-container"
          style={{
            position: "relative",
            width: "104px",
            height: "104px",
            borderRadius: "26px",
            padding: "5px",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(56, 189, 248, 0.3) 50%, rgba(22, 84, 145, 0.5) 100%)",
            boxShadow: "0 16px 40px -10px rgba(56, 189, 248, 0.4), 0 0 20px rgba(22, 84, 145, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "preloaderPulse 2.2s infinite ease-in-out",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "22px",
              overflow: "hidden",
              backgroundColor: "#0F172A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src="/icons/icon-512x512.png"
              alt="CargoLink Africa Logo App PWA"
              width={94}
              height={94}
              priority
              style={{
                objectFit: "contain",
                borderRadius: "20px",
              }}
            />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.5px",
              fontFamily: "var(--font-heading), system-ui, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            CargoLink <span style={{ color: "#38BDF8" }}>Africa</span>
          </h1>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "20px",
              backgroundColor: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              marginTop: "2px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#38BDF8",
                boxShadow: "0 0 8px #38BDF8",
              }}
            />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              {isPWA ? "Application PWA" : "Plateforme Web"}
            </span>
          </div>

          <p
            style={{
              margin: "6px 0 0 0",
              fontSize: "12.5px",
              fontWeight: 500,
              color: "#94A3B8",
              lineHeight: 1.4,
            }}
          >
            Achat & Expédition Chine → Afrique
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginTop: "6px" }}>
          <div
            style={{
              width: "190px",
              height: "6px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #165491 0%, #38BDF8 50%, #60A5FA 100%)",
                borderRadius: "10px",
                transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 0 12px rgba(56, 189, 248, 0.7)",
              }}
            />
          </div>

          {/* Status Details */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {progress < 100 ? "Chargement..." : "Initialisation terminée"}
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#38BDF8" }}>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Global CSS keyframes for pulse */}
      <style jsx global>{`
        @keyframes preloaderPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 16px 40px -10px rgba(56, 189, 248, 0.4), 0 0 20px rgba(22, 84, 145, 0.4);
          }
          50% {
            transform: scale(1.04);
            box-shadow: 0 20px 48px -6px rgba(56, 189, 248, 0.65), 0 0 28px rgba(56, 189, 248, 0.5);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 16px 40px -10px rgba(56, 189, 248, 0.4), 0 0 20px rgba(22, 84, 145, 0.4);
          }
        }
      `}</style>
    </div>
  );
}

