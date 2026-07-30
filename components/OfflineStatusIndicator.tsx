"use client";

import { useEffect, useState } from "react";

export default function OfflineStatusIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [reconnected, setReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial status check
    setIsOffline(!navigator.onLine);

    const handleOffline = () => {
      setIsOffline(true);
      setReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setReconnected(true);
      const timer = setTimeout(() => {
        setReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !reconnected) return null;

  return (
    <div
      className={`offline-toast ${reconnected ? "offline-toast--online" : "offline-toast--offline"}`}
      role="status"
      aria-live="polite"
    >
      <span className="offline-toast__dot" />
      <span className="offline-toast__text">
        {reconnected
          ? "Connexion rétablie — Mode en ligne actif"
          : "Connexion perdue — Mode hors-ligne (données en cache)"}
      </span>

      <style>{`
        .offline-toast {
          position: fixed;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9998;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.8125rem;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: toastSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
          pointer-events: none;
        }
        @keyframes toastSlideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .offline-toast--offline {
          background: rgba(30, 41, 59, 0.94);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
        }
        .offline-toast--online {
          background: rgba(30, 41, 59, 0.94);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: #86efac;
        }
        .offline-toast__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          animation: pulseDot 1.5s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
        .offline-toast__text {
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
