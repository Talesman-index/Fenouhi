"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setChecking(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.href = "/";
      } else {
        setChecking(false);
      }
    }, 1200);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .offline-root {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0F172A;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          color: #f8fafc;
          padding: 2rem;
          text-align: center;
          gap: 0;
          position: relative;
          overflow: hidden;
        }
        .offline-root::before {
          content: '';
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(22,84,145,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .offline-icon-wrap {
          width: 96px;
          height: 96px;
          border-radius: 24px;
          background: linear-gradient(135deg, #0F172A, #165491);
          border: 1px solid rgba(56,189,248,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 8px 32px rgba(22,84,145,0.35);
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        .offline-icon-wrap svg {
          width: 48px;
          height: 48px;
        }
        .offline-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.875rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
          transition: all 0.3s;
        }
        .offline-badge--offline {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
        }
        .offline-badge--online {
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.3);
          color: #86efac;
        }
        .offline-badge__dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity:1; transform:scale(1); }
          50%       { opacity:0.5; transform:scale(0.7); }
        }
        .offline-title {
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0 0 0.75rem;
          background: linear-gradient(135deg, #f8fafc, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .offline-desc {
          font-size: 0.9375rem;
          color: #64748b;
          max-width: 340px;
          line-height: 1.65;
          margin: 0 0 2rem;
        }
        .offline-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          max-width: 280px;
        }
        .offline-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-family: inherit;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .offline-btn--primary {
          background: linear-gradient(135deg, #165491, #38BDF8);
          color: #fff;
          box-shadow: 0 4px 16px rgba(22,84,145,0.4);
        }
        .offline-btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(22,84,145,0.5);
        }
        .offline-btn--primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }
        .offline-btn--secondary {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8;
          text-decoration: none;
        }
        .offline-btn--secondary:hover {
          background: rgba(255,255,255,0.1);
          color: #f8fafc;
        }
        .offline-info {
          margin-top: 2.5rem;
          padding: 1rem 1.25rem;
          border-radius: 0.875rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          text-align: left;
          max-width: 320px;
          width: 100%;
        }
        .offline-info__title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #38BDF8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        .offline-info__list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .offline-info__list li {
          font-size: 0.8125rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .offline-spin {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="offline-root">
        {/* Logo */}
        <div style={{ marginBottom: 20 }}>
          <Logo light size={48} />
        </div>

        {/* Status badge */}
        <span className={`offline-badge ${isOnline ? "offline-badge--online" : "offline-badge--offline"}`}>
          <span className="offline-badge__dot" />
          {isOnline ? "Reconnecté" : "Hors ligne"}
        </span>

        <h1 className="offline-title">
          {isOnline ? "Vous êtes reconnecté !" : "Pas de connexion"}
        </h1>
        <p className="offline-desc">
          {isOnline
            ? "Votre connexion est rétablie. Vous pouvez retourner à FENOUHI."
            : "Impossible de charger la page. Vérifiez votre connexion internet et réessayez."}
        </p>

        <div className="offline-actions">
          <button
            className="offline-btn offline-btn--primary"
            onClick={handleRetry}
            disabled={checking}
            id="offline-retry-btn"
          >
            {checking ? (
              <><span className="offline-spin" /> Vérification…</>
            ) : isOnline ? (
              "Retourner à l'accueil →"
            ) : (
              "Réessayer"
            )}
          </button>
          <Link href="/" className="offline-btn offline-btn--secondary">
            Page d&apos;accueil
          </Link>
        </div>

        <div className="offline-info">
          <div className="offline-info__title">Disponible hors ligne</div>
          <ul className="offline-info__list">
            <li>📦 Catalogue produits (cache)</li>
            <li>📞 Informations de contact</li>
            <li>📋 Vos devis enregistrés</li>
          </ul>
        </div>
      </div>
    </>
  );
}
