"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as never)["standalone"] === true)
  );
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"android" | "ios">("android");
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // If already installed as PWA, nothing to do
    if (isInStandaloneMode()) {
      setInstalled(true);
      return;
    }

    // Capture the native install prompt for Android/Chrome
    const beforeInstallHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", beforeInstallHandler);

    // Only open modal when the hamburger menu button fires this event
    const triggerHandler = () => {
      setShowModal(true);
      // Auto-select the right tab based on platform
      const ua = navigator.userAgent;
      if (/iphone|ipad|ipod/i.test(ua)) {
        setActiveTab("ios");
      } else {
        setActiveTab("android");
      }
    };
    window.addEventListener("trigger-pwa-install", triggerHandler);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowModal(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("trigger-pwa-install", triggerHandler);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        setShowModal(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (installed || !showModal) return null;

  return (
    <>
      <style>{modalStyles}</style>
      {/* Backdrop */}
      <div
        className="pwa-modal-backdrop"
        onClick={() => setShowModal(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="pwa-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Comment installer Fenouhimin"
      >
        {/* Header */}
        <div className="pwa-modal__header">
          <div className="pwa-modal__header-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-96x96.png"
              alt="Fenouhimin"
              width={44}
              height={44}
              className="pwa-modal__app-icon"
            />
            <div>
              <div className="pwa-modal__app-name">Fenouhimin</div>
              <div className="pwa-modal__app-sub">Application Mobile · PWA</div>
            </div>
          </div>
          <button
            className="pwa-modal__close"
            onClick={() => setShowModal(false)}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="pwa-modal__body">

        {/* Intro */}
        <p className="pwa-modal__intro">
          Installez l&apos;app sur votre écran d&apos;accueil pour un accès
          rapide, même sans connexion.
        </p>

        {/* Tabs */}
        <div className="pwa-modal__tabs">
          <button
            className={`pwa-tab ${activeTab === "android" ? "active" : ""}`}
            onClick={() => setActiveTab("android")}
          >
            {/* Android robot icon */}
            <svg className="pwa-tab__icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zm-2.5-1C4.67 17 5.5 16.33 5.5 15.5v-7C5.5 7.67 4.83 7 4 7s-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5zm15 0c.83 0 1.5-.67 1.5-1.5v-7C20 7.67 19.33 7 18.5 7S17 7.67 17 8.5v7c0 .83.67 1.5 1.5 1.5zM15.53 2.16l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
            </svg>
            Android
          </button>
          <button
            className={`pwa-tab ${activeTab === "ios" ? "active" : ""}`}
            onClick={() => setActiveTab("ios")}
          >
            {/* Apple logo icon */}
            <svg className="pwa-tab__icon" viewBox="0 0 814 1000" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.3 142.3-317.3 282.7-317.3 75.2 0 137.7 49.5 184.9 49.5 44.9 0 115.1-52.6 199.2-52.6zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
            </svg>
            iPhone / iPad
          </button>
        </div>

        {/* Android instructions */}
        {activeTab === "android" && (
          <div className="pwa-modal__steps">
            {deferredPrompt ? (
              <>
                <div className="pwa-step pwa-step--highlight">
                  <div className="pwa-step__num">✓</div>
                  <div className="pwa-step__text">
                    <strong>Installation disponible !</strong>
                    <span>
                      Chrome a détecté que cette app peut être installée
                      directement.
                    </span>
                  </div>
                </div>
                <button
                  className="pwa-modal__install-btn"
                  onClick={handleNativeInstall}
                >
                  <span>📲</span> Installer maintenant
                </button>
              </>
            ) : (
              <>
                <div className="pwa-step">
                  <div className="pwa-step__num">1</div>
                  <div className="pwa-step__text">
                    <strong>Ouvrez dans Chrome</strong>
                    <span>
                      Assurez-vous d&apos;utiliser le navigateur{" "}
                      <strong>Google Chrome</strong> sur votre Android.
                    </span>
                  </div>
                </div>
                <div className="pwa-step">
                  <div className="pwa-step__num">2</div>
                  <div className="pwa-step__text">
                    <strong>Menu Chrome</strong>
                    <span>
                      Appuyez sur les <strong>3 points ⋮</strong> en haut à
                      droite du navigateur.
                    </span>
                  </div>
                </div>
                <div className="pwa-step">
                  <div className="pwa-step__num">3</div>
                  <div className="pwa-step__text">
                    <strong>Ajouter à l&apos;écran d&apos;accueil</strong>
                    <span>
                      Sélectionnez{" "}
                      <em>
                        &laquo;&nbsp;Ajouter à l&apos;écran d&apos;accueil&nbsp;&raquo;
                      </em>{" "}
                      ou{" "}
                      <em>&laquo;&nbsp;Installer l&apos;application&nbsp;&raquo;</em>
                      .
                    </span>
                  </div>
                </div>
                <div className="pwa-step">
                  <div className="pwa-step__num">4</div>
                  <div className="pwa-step__text">
                    <strong>Confirmer</strong>
                    <span>
                      Appuyez sur <strong>Installer</strong> dans la boîte de
                      dialogue qui apparaît.
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* iOS instructions */}
        {activeTab === "ios" && (
          <div className="pwa-modal__steps">
            <div className="pwa-step">
              <div className="pwa-step__num">1</div>
              <div className="pwa-step__text">
                <strong>Ouvrez dans Safari</strong>
                <span>
                  L&apos;installation n&apos;est disponible que depuis{" "}
                  <strong>Safari</strong>. Copiez l&apos;adresse et ouvrez-la
                  dans Safari si nécessaire.
                </span>
              </div>
            </div>
            <div className="pwa-step">
              <div className="pwa-step__num">2</div>
              <div className="pwa-step__text">
                <strong>Bouton Partager</strong>
                <span>
                  Appuyez sur l&apos;icône de partage{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: "inline", verticalAlign: "middle" }}
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>{" "}
                  en bas de l&apos;écran (ou en haut sur iPad).
                </span>
              </div>
            </div>
            <div className="pwa-step">
              <div className="pwa-step__num">3</div>
              <div className="pwa-step__text">
                <strong>Sur l&apos;écran d&apos;accueil</strong>
                <span>
                  Faites défiler le menu et appuyez sur{" "}
                  <em>
                    &laquo;&nbsp;Sur l&apos;écran d&apos;accueil&nbsp;&raquo;
                  </em>
                  .
                </span>
              </div>
            </div>
            <div className="pwa-step">
              <div className="pwa-step__num">4</div>
              <div className="pwa-step__text">
                <strong>Confirmer</strong>
                <span>
                  Appuyez sur <strong>Ajouter</strong> en haut à droite.
                  L&apos;icône Fenouhimin apparaîtra sur votre écran
                  d&apos;accueil.
                </span>
              </div>
            </div>
            <div className="pwa-ios-tip">
              Astuce — Sur iPhone, l&apos;app s&apos;ouvre ensuite en plein écran, sans
              la barre d&apos;adresse Safari.
            </div>
          </div>
        )}

        {/* Footer */}
        <button
          className="pwa-modal__dismiss"
          onClick={() => setShowModal(false)}
        >
          Fermer
        </button>

        </div>{/* end pwa-modal__body */}
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const modalStyles = `
  .pwa-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(11, 29, 58, 0.72);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: pwa-fade-in 0.2s ease both;
  }

  .pwa-modal {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    background: #FFFFFF;
    border-radius: 24px 24px 0 0;
    max-width: 520px;
    margin: 0 auto;
    box-shadow: 0 -20px 60px rgba(0,0,0,0.22);
    animation: pwa-slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
    /* Constrain height so it never clips the header */
    max-height: 88dvh;
    max-height: 88vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pwa-modal__header {
    flex-shrink: 0;
    position: sticky;
    top: 0;
    background: #FFFFFF;
    z-index: 2;
    padding: 22px 22px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* subtle separator when scrolled */
    border-bottom: 1px solid transparent;
  }

  .pwa-modal__body {
    flex: 1;
    overflow-y: auto;
    padding: 0 22px 36px;
    -webkit-overflow-scrolling: touch;
  }

  @media (min-width: 560px) {
    .pwa-modal {
      bottom: auto;
      top: 50%;
      left: 50%;
      right: auto;
      transform: translate(-50%, -50%) !important;
      border-radius: 24px;
      max-height: 90vh;
      animation: pwa-pop-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    }
  }

  @keyframes pwa-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pwa-slide-up {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
  @keyframes pwa-pop-in {
    from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
    to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }

  /* header is now defined above in the flex layout block */

  .pwa-modal__header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pwa-modal__app-icon {
    border-radius: 14px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  }

  .pwa-modal__app-name {
    font-size: 17px;
    font-weight: 900;
    color: #0F172A;
    letter-spacing: -0.02em;
  }

  .pwa-modal__app-sub {
    font-size: 11px;
    color: #64748B;
    font-weight: 600;
    margin-top: 2px;
  }

  .pwa-modal__close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: #F1F5F9;
    color: #475569;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .pwa-modal__close:hover { background: #E2E8F0; }

  .pwa-modal__intro {
    font-size: 13.5px;
    color: #475569;
    line-height: 1.55;
    margin: 0 0 18px;
  }

  .pwa-modal__tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 18px;
    background: #F1F5F9;
    border-radius: 12px;
    padding: 4px;
  }

  .pwa-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 12px;
    border-radius: 9px;
    border: none;
    background: transparent;
    font-size: 13px;
    font-weight: 700;
    color: #64748B;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pwa-tab.active {
    background: #FFFFFF;
    color: #0F172A;
    box-shadow: 0 2px 8px rgba(0,0,0,0.09);
  }

  .pwa-tab__icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .pwa-modal__steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .pwa-step {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 14px 16px;
  }

  .pwa-step--highlight {
    background: linear-gradient(135deg, #ECFDF5 0%, #F0F9FF 100%);
    border-color: #6EE7B7;
  }

  .pwa-step__num {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #0F172A;
    color: #FFF;
    font-size: 12px;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
  }

  .pwa-step--highlight .pwa-step__num {
    background: linear-gradient(135deg, #10B981, #059669);
  }

  .pwa-step__text {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .pwa-step__text strong {
    font-size: 13.5px;
    font-weight: 800;
    color: #0F172A;
  }

  .pwa-step__text span {
    font-size: 12.5px;
    color: #475569;
    line-height: 1.5;
  }

  .pwa-ios-tip {
    background: linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%);
    border: 1px solid #FDE68A;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 12.5px;
    color: #92400E;
    font-weight: 600;
    line-height: 1.5;
  }

  .pwa-modal__install-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px;
    background: linear-gradient(135deg, #0F172A 0%, #165491 100%);
    color: #FFF;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 6px 20px rgba(15,23,42,0.2);
    letter-spacing: 0.01em;
  }

  .pwa-modal__install-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(15,23,42,0.3);
  }

  .pwa-modal__dismiss {
    width: 100%;
    padding: 12px;
    background: #F1F5F9;
    color: #475569;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
  }
  .pwa-modal__dismiss:hover { background: #E2E8F0; }
`;
