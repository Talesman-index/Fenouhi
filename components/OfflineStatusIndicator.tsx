"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi, X } from "lucide-react";

export default function OfflineStatusIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [reconnected, setReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial check
    const initialOffline = !navigator.onLine;
    setIsOffline(initialOffline);

    const handleOffline = () => {
      setIsOffline(true);
      setReconnected(false);
      setIsDismissed(false); // Reset dismissal on new offline event
    };

    const handleOnline = () => {
      setIsOffline(false);
      setReconnected(true);
      setIsDismissed(false); // Show reconnection notification
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

  if (isDismissed || (!isOffline && !reconnected)) return null;

  return (
    <div
      className={`offline-toast ${reconnected ? "offline-toast--online" : "offline-toast--offline"}`}
      role="status"
      aria-live="polite"
    >
      <div className="offline-toast__content">
        <div className="offline-toast__icon-wrapper">
          {reconnected ? (
            <Wifi className="offline-toast__icon" size={16} />
          ) : (
            <WifiOff className="offline-toast__icon" size={16} />
          )}
          <span className="offline-toast__dot" />
        </div>
        <div className="offline-toast__text-group">
          <span className="offline-toast__title">
            {reconnected ? "Connexion rétablie" : "Mode hors-ligne actif"}
          </span>
          <span className="offline-toast__subtitle">
            {reconnected
              ? "Vos données sont synchronisées"
              : "Vous consultez les données en cache"}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="offline-toast__close"
        onClick={() => setIsDismissed(true)}
        aria-label="Fermer la notification"
      >
        <X size={15} />
      </button>

      <style>{`
        .offline-toast {
          position: fixed;
          top: max(0.85rem, env(safe-area-inset-top, 0.85rem));
          left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          width: calc(100% - 1.5rem);
          max-width: 420px;
          padding: 0.6rem 0.75rem 0.6rem 0.85rem;
          border-radius: 14px;
          box-shadow: 0 10px 28px -4px rgba(0, 0, 0, 0.38), 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          animation: toastSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
          pointer-events: auto;
          font-family: inherit;
        }

        @keyframes toastSlideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -18px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        .offline-toast--offline {
          background: rgba(15, 23, 42, 0.94);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #f8fafc;
        }

        .offline-toast--online {
          background: rgba(15, 23, 42, 0.94);
          border: 1px solid rgba(34, 197, 94, 0.35);
          color: #f8fafc;
        }

        .offline-toast__content {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          min-width: 0;
          flex: 1;
        }

        .offline-toast__icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .offline-toast--offline .offline-toast__icon-wrapper {
          background: rgba(239, 68, 68, 0.16);
          color: #f87171;
        }

        .offline-toast--online .offline-toast__icon-wrapper {
          background: rgba(34, 197, 94, 0.16);
          color: #4ade80;
        }

        .offline-toast__dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          border: 1.5px solid #0f172a;
          background: currentColor;
          animation: pulseDot 1.6s ease-in-out infinite;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .offline-toast__text-group {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          min-width: 0;
        }

        .offline-toast__title {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .offline-toast__subtitle {
          font-size: 0.72rem;
          color: #94a3b8;
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .offline-toast__close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: none;
          background: rgba(255, 255, 255, 0.07);
          color: #94a3b8;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s ease, color 0.15s ease;
          padding: 0;
        }

        .offline-toast__close:hover,
        .offline-toast__close:active {
          background: rgba(255, 255, 255, 0.16);
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}
