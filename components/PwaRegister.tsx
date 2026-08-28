"use client";

import { useEffect, useState } from "react";

export default function PwaRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const isDev =
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // In development mode, unregister any existing Service Worker to avoid HMR caching issues & infinite loading
    if (isDev) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
          console.info("[CargoLink PWA] SW désactivé en mode dev pour éviter les blocages HMR ✅");
        }
      });
      return;
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Proactively check for new version & icon assets on launch
        registration.update();

        // Check if there is already a waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setUpdateAvailable(true);
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(newWorker);
              setUpdateAvailable(true);
            }
          });
        });

        console.info("[Fenouhi PWA] Service Worker & Icônes à jour ✅");
      } catch (err) {
        console.warn("[Fenouhi PWA] Échec de l'enregistrement du SW :", err);
      }
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  };

  if (!updateAvailable) return null;

  return (
    <div className="pwa-update-toast" role="alert">
      <span>🚀 Une nouvelle version de Fenouhi est disponible !</span>
      <button onClick={handleUpdate} className="pwa-update-btn">
        Mettre à jour
      </button>
      <style>{`
        .pwa-update-toast {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 10000;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(56, 189, 248, 0.4);
          border-radius: 0.75rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          color: #f8fafc;
          font-size: 0.875rem;
          font-weight: 500;
          animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .pwa-update-btn {
          background: linear-gradient(135deg, #165491, #38BDF8);
          color: white;
          border: none;
          padding: 0.375rem 0.875rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.8125rem;
          cursor: pointer;
          white-space: nowrap;
          transition: transform 0.2s;
        }
        .pwa-update-btn:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
