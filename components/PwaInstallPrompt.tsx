"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "android" | "ios" | "desktop" | null;

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return "desktop";
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as never)["standalone"] === true)
  );
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) {
      setInstalled(true);
      return;
    }
    const p = detectPlatform();
    setPlatform(p);

    // Re-enable banner on every page refresh if not installed
    setShowBanner(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (p === "ios") {
      const timer = setTimeout(() => setShowIosTip(true), 2000);
      return () => clearTimeout(timer);
    }

    const handleCustomTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else if (detectPlatform() === "ios") {
        setShowIosTip(true);
      } else {
        setShowGuideModal(true);
      }
    };

    window.addEventListener("trigger-pwa-install", handleCustomTrigger);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
      setShowGuideModal(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("trigger-pwa-install", handleCustomTrigger);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
      setShowBanner(false);
    } else {
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIosTip(false);
    setShowGuideModal(false);
  };

  if (installed) return null;

  // ── Android/Desktop Banner ────────────────────────────────────────────────
  if (showBanner && (platform === "android" || platform === "desktop")) {
    return (
      <>
        <style>{bannerStyles}</style>
        <div className="pwa-banner" role="dialog" aria-label="Installer l'application">
          <div className="pwa-banner__icon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-96x96.png" alt="CargoLink Africa" width={48} height={48} />
          </div>
          <div className="pwa-banner__content">
            <strong className="pwa-banner__title">Installer CargoLink Africa</strong>
            <span className="pwa-banner__sub">
              Accès rapide, mode hors-ligne et notifications
            </span>
          </div>
          <div className="pwa-banner__actions">
            <button className="pwa-banner__btn pwa-banner__btn--install" onClick={handleInstall}>
              Installer
            </button>
            <button className="pwa-banner__btn pwa-banner__btn--dismiss" onClick={handleDismiss} aria-label="Fermer">
              ✕
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── iOS Tooltip ───────────────────────────────────────────────────────────
  if (showIosTip && platform === "ios") {
    return (
      <>
        <style>{bannerStyles}</style>
        <div className="pwa-banner pwa-banner--ios" role="dialog" aria-label="Ajouter sur l'écran d'accueil">
          <div className="pwa-banner__icon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-96x96.png" alt="CargoLink Africa" width={40} height={40} />
          </div>
          <div className="pwa-banner__content">
            <strong className="pwa-banner__title">Installer CargoLink Africa</strong>
            <span className="pwa-banner__sub">
              Appuyez sur{" "}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:"inline", verticalAlign:"middle" }}>
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>{" "}
              puis &laquo;&nbsp;Sur l&apos;écran d&apos;accueil&nbsp;&raquo;
            </span>
          </div>
          <button className="pwa-banner__btn pwa-banner__btn--dismiss" onClick={handleDismiss} aria-label="Fermer">
            ✕
          </button>
        </div>
      </>
    );
  }

  // ── Guide Modal ───────────────────────────────────────────────────────────
  if (showGuideModal) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "28px 24px", maxWidth: 420, width: "100%", border: "1px solid #E2E8F0", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-96x96.png" alt="CargoLink" width={48} height={48} style={{ borderRadius: 12 }} />
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#0F172A" }}>Installer l'Application</h3>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748B" }}>CargoLink Africa — PWA Web App</p>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, marginBottom: 16 }}>
            Pour installer CargoLink sur votre écran d&apos;accueil et profiter du mode hors-ligne :
          </p>
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 14, fontSize: 12.5, color: "#0F172A", display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            <div>📲 <strong>Sur Chrome / Android :</strong> Cliquez sur le menu <strong>⋮</strong> en haut à droite &rarr; <em>&laquo;&nbsp;Installer l&apos;application&nbsp;&raquo;</em> ou <em>&laquo;&nbsp;Ajouter à l&apos;écran d&apos;accueil&nbsp;&raquo;</em>.</div>
            <div>🍎 <strong>Sur Safari (iPhone/iPad) :</strong> Appuyez sur le bouton de partage <strong>⎋</strong> &rarr; <em>&laquo;&nbsp;Sur l&apos;écran d&apos;accueil&nbsp;&raquo;</em>.</div>
          </div>
          <button onClick={handleDismiss} style={{ width: "100%", padding: 12, background: "#0F172A", color: "#FFF", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            J&apos;ai compris
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Inline Styles ────────────────────────────────────────────────────────────
const bannerStyles = `
  .pwa-banner {
    position: fixed;
    bottom: 1.25rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    background: rgba(15, 23, 42, 0.92);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(22, 84, 145, 0.4);
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(56,189,248,0.08);
    max-width: calc(100vw - 2rem);
    width: max-content;
    animation: pwa-slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes pwa-slide-up {
    from { opacity:0; transform: translateX(-50%) translateY(24px); }
    to   { opacity:1; transform: translateX(-50%) translateY(0); }
  }
  .pwa-banner--ios {
    bottom: 5rem;
  }
  .pwa-banner__icon img {
    border-radius: 10px;
    display: block;
  }
  .pwa-banner__content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .pwa-banner__title {
    font-size: 0.875rem;
    font-weight: 700;
    color: #f8fafc;
    white-space: nowrap;
  }
  .pwa-banner__sub {
    font-size: 0.75rem;
    color: #94a3b8;
    max-width: 220px;
    line-height: 1.4;
  }
  .pwa-banner__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }
  .pwa-banner__btn {
    border: none;
    cursor: pointer;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  .pwa-banner__btn--install {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #165491, #38BDF8);
    color: #fff;
    font-size: 0.8125rem;
    white-space: nowrap;
  }
  .pwa-banner__btn--install:hover {
    opacity: 0.9;
    transform: scale(1.03);
  }
  .pwa-banner__btn--dismiss {
    padding: 0.4rem 0.6rem;
    background: rgba(255,255,255,0.08);
    color: #94a3b8;
    font-size: 0.8125rem;
  }
  .pwa-banner__btn--dismiss:hover {
    background: rgba(255,255,255,0.14);
    color: #f8fafc;
  }
`;
