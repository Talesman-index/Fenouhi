"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Info,
  ShoppingBag,
  CreditCard,
  Package,
  MapPin,
  MoreHorizontal,
  ChevronRight,
  Truck,
  Mail,
  Tag,
  Percent,
  CheckCircle2,
  Facebook,
  Instagram,
  Smartphone,
  Download,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer style={{ background: "#FFFFFF", borderTop: "1px solid #E2E8F0", paddingTop: 40, paddingBottom: 32 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px" }}>
        
        {/* ==================================================================== */}
        {/* 1. TOP NEWSLETTER BANNER ("Restez branché")                          */}
        {/* ==================================================================== */}
        <div
          style={{
            background: "linear-gradient(135deg, #F1F5F9 0%, #EEF2FF 50%, #F8FAFC 100%)",
            borderRadius: 24,
            padding: "24px 32px",
            marginBottom: 48,
            border: "1px solid #E2E8F0",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
          }}
        >
          {/* Subtle background decorative shapes */}
          <div style={{ position: "absolute", left: "4%", top: "20%", opacity: 0.15, pointerEvents: "none" }}>
            <Percent style={{ width: 28, height: 28, color: "#D97706" }} />
          </div>
          <div style={{ position: "absolute", left: "18%", bottom: "15%", opacity: 0.2, pointerEvents: "none" }}>
            <Mail style={{ width: 24, height: 24, color: "#D97706" }} />
          </div>
          <div style={{ position: "absolute", right: "16%", top: "15%", opacity: 0.2, pointerEvents: "none" }}>
            <Mail style={{ width: 24, height: 24, color: "#D97706" }} />
          </div>
          <div style={{ position: "absolute", right: "6%", bottom: "20%", opacity: 0.15, pointerEvents: "none" }}>
            <Tag style={{ width: 28, height: 28, color: "#D97706" }} />
          </div>

          {/* Left Title with Vertical Accent */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 1 }}>
            <div style={{ width: 5, height: 32, background: "#F59E0B", borderRadius: 4 }} />
            <h3 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", margin: 0, fontFamily: "'Poppins', sans-serif" }}>
              Restez branché
            </h3>
          </div>

          {/* Center Search / Email Pill */}
          <form
            onSubmit={handleSubscribe}
            style={{
              display: "flex",
              alignItems: "center",
              background: "#FFFFFF",
              borderRadius: 99,
              padding: "4px 4px 4px 20px",
              border: "1px solid #CBD5E1",
              maxWidth: 520,
              width: "100%",
              boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
              zIndex: 1,
            }}
          >
            {subscribed ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#16A34A", fontWeight: 700, fontSize: 13, width: "100%", padding: "8px 0" }}>
                <CheckCircle2 style={{ width: 18, height: 18 }} />
                <span>Merci ! Vous êtes inscrit aux offres usine FENOUHIMIN.</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Recevez des coupons, des offres et bien plus..."
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: 13,
                    color: "#0F172A",
                    background: "transparent",
                    paddingRight: 10,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 99,
                    padding: "10px 22px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
                    transition: "transform 0.2s",
                  }}
                >
                  <span>Inscrivez-vous</span>
                  <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              </>
            )}
          </form>
        </div>

        {/* ==================================================================== */}
        {/* 2. MAIN 6 NAVIGATION COLUMNS                                         */}
        {/* ==================================================================== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 28,
            marginBottom: 44,
          }}
        >
          {/* COL 1: LIENS RAPIDES */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                paddingBottom: 10,
                borderBottom: "1px solid #E2E8F0",
                marginBottom: 16,
              }}
            >
              <Info style={{ width: 16, height: 16, color: "#94A3B8" }} />
              <span>LIENS RAPIDES</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <li><Link href="/terms" style={{ color: "#64748B", textDecoration: "none" }}>À propos de nous</Link></li>
              <li><Link href="/contact" style={{ color: "#64748B", textDecoration: "none" }}>Contactez-nous</Link></li>
              <li><Link href="/quote-request" style={{ color: "#64748B", textDecoration: "none" }}>Demande de devis</Link></li>
              <li><Link href="/terms" style={{ color: "#64748B", textDecoration: "none" }}>Propriété intellectuelle</Link></li>
              <li><Link href="/catalog" style={{ color: "#64748B", textDecoration: "none" }}>Plan du site</Link></li>
              <li><Link href="/dashboard" style={{ color: "#64748B", textDecoration: "none" }}>Suivi de commande</Link></li>
            </ul>
          </div>

          {/* COL 2: FENOUHIMIN */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                paddingBottom: 10,
                borderBottom: "1px solid #E2E8F0",
                marginBottom: 16,
              }}
            >
              <ShoppingBag style={{ width: 16, height: 16, color: "#94A3B8" }} />
              <span>FENOUHIMIN</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <li><a href="#app" style={{ color: "#64748B", textDecoration: "none" }}>Téléchargez l'Application</a></li>
              <li><Link href="/categories" style={{ color: "#64748B", textDecoration: "none" }}>Liste des usines & marques</Link></li>
              <li><Link href="/terms" style={{ color: "#64748B", textDecoration: "none" }}>Commentaires des clients</Link></li>
              <li><Link href="/returns-warranty" style={{ color: "#64748B", textDecoration: "none" }}>Politique de retour</Link></li>
              <li><Link href="/terms" style={{ color: "#64748B", textDecoration: "none" }}>Blog & actualités</Link></li>
              <li><Link href="/contact" style={{ color: "#64748B", textDecoration: "none" }}>FAQ & Aide</Link></li>
            </ul>
          </div>

          {/* COL 3: PAIEMENT */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                paddingBottom: 10,
                borderBottom: "1px solid #E2E8F0",
                marginBottom: 16,
              }}
            >
              <CreditCard style={{ width: 16, height: 16, color: "#94A3B8" }} />
              <span>PAIEMENT</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", fontWeight: 600 }}>
                <img src="/images/payments/mtn.png" alt="MTN Mobile Money" style={{ height: 18, width: "auto", objectFit: "contain" }} />
                <span>MTN MoMo</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", fontWeight: 600 }}>
                <img src="/images/payments/moov_africa_official.png" alt="Moov Money" style={{ height: 18, width: "auto", objectFit: "contain" }} />
                <span>Moov Money</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", fontWeight: 600 }}>
                <img src="/images/payments/visa.png" alt="Visa" style={{ height: 16, width: "auto", objectFit: "contain" }} />
                <span>Visa</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", fontWeight: 600 }}>
                <img src="/images/payments/mastercard.png" alt="MasterCard" style={{ height: 16, width: "auto", objectFit: "contain" }} />
                <span>MasterCard</span>
              </div>
            </div>
          </div>

          {/* COL 4: EXPÉDITION */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                paddingBottom: 10,
                borderBottom: "1px solid #E2E8F0",
                marginBottom: 16,
              }}
            >
              <Package style={{ width: 16, height: 16, color: "#94A3B8" }} />
              <span>EXPÉDITION</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                  <Truck style={{ width: 15, height: 15, color: "#F59E0B" }} />
                  <span>Livraison express Air</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2, paddingLeft: 21 }}>
                  5 à 12 jours ouvrés (Bénin & Ouest Afrique)
                </div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                  <Package style={{ width: 15, height: 15, color: "#64748B" }} />
                  <span>Expédition maritime</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2, paddingLeft: 21 }}>
                  Groupage économique 30 à 45 jours
                </div>
              </div>
            </div>
          </div>

          {/* COL 5: VILLES COUVERTES */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                paddingBottom: 10,
                borderBottom: "1px solid #E2E8F0",
                marginBottom: 16,
              }}
            >
              <MapPin style={{ width: 16, height: 16, color: "#94A3B8" }} />
              <span>VILLES COUVERTES</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#64748B" }}>
              <li>Cotonou</li>
              <li>Porto-Novo</li>
              <li>Parakou</li>
              <li>Djougou</li>
              <li>Bohicon</li>
              <li>Abomey</li>
            </ul>
           {/* COL 6: APPLICATION PWA */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                fontWeight: 600,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                paddingBottom: 10,
                borderBottom: "1px solid #E2E8F0",
                marginBottom: 16,
              }}
            >
              <Smartphone style={{ width: 16, height: 16, color: "#165491" }} />
              <span>Application PWA</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#64748B", marginBottom: 12, lineHeight: 1.35 }}>
              Télécharger notre Web App PWA
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Badge 1: PWA iOS */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#000000",
                  color: "#FFFFFF",
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <svg viewBox="0 0 384 512" fill="#FFFFFF" style={{ width: 18, height: 18, flexShrink: 0 }}>
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-91.9-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.7 26.2 2 52.2-14.3 69.5-34.1z"/>
                </svg>
                <div>
                  <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.4px", color: "#A1A1AA", fontWeight: 500 }}>
                    APPLICATION PWA
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.1, fontFamily: "'Poppins', sans-serif" }}>
                    Disponible sur iOS
                  </div>
                </div>
              </button>

              {/* Badge 2: PWA Android */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#000000",
                  color: "#FFFFFF",
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <svg viewBox="0 0 24 24" fill="#3DDC84" style={{ width: 18, height: 18, flexShrink: 0 }}>
                  <path d="M17.523 15.3414C17.06 15.3414 16.6853 14.9667 16.6853 14.5037C16.6853 14.0407 17.06 13.666 17.523 13.666C17.986 13.666 18.3607 14.0407 18.3607 14.5037C18.3607 14.9667 17.986 15.3414 17.523 15.3414ZM6.477 15.3414C6.014 15.3414 5.6393 14.9667 5.6393 14.5037C5.6393 14.0407 6.014 13.666 6.477 13.666C6.94 13.666 7.3147 14.0407 7.3147 14.5037C7.3147 14.9667 6.94 15.3414 6.477 15.3414ZM17.935 9.8714L19.789 6.6604C19.92 6.4334 19.843 6.1434 19.616 6.0124C19.389 5.8814 19.099 5.9584 18.968 6.1854L17.082 9.4524C15.545 8.7534 13.824 8.3584 12 8.3584C10.176 8.3584 8.455 8.7534 6.918 9.4524L5.032 6.1854C4.901 5.9584 4.611 5.8814 4.384 6.0124C4.157 6.1434 4.08 6.4334 4.211 6.6604L6.065 9.8714C2.585 11.8314 0.176 15.3984 0 19.6424H24C23.824 15.3984 21.415 11.8314 17.935 9.8714Z" />
                </svg>
                <div>
                  <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.4px", color: "#A1A1AA", fontWeight: 500 }}>
                    APPLICATION PWA
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.1, fontFamily: "'Poppins', sans-serif" }}>
                    Disponible sur Android
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* ==================================================================== */}
        {/* 3. LEGAL BOTTOM BAR                                                  */}
        {/* ==================================================================== */}
        <div
          style={{
            borderTop: "1px solid #E2E8F0",
            paddingTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            color: "#64748B",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>© FENOUHIMIN — Logistique Directe Chine-Bénin. Tous droits réservés.</div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/privacy-policy" style={{ color: "#64748B", textDecoration: "none" }}>Politique de Confidentialité</Link>
            <Link href="/terms" style={{ color: "#64748B", textDecoration: "none" }}>Conditions d'Utilisation</Link>
            <Link href="/returns-warranty" style={{ color: "#64748B", textDecoration: "none" }}>Garantie & Retours</Link>
            <Link href="/shipping-policy" style={{ color: "#64748B", textDecoration: "none" }}>Politique d'Expédition</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
