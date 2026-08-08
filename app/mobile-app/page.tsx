"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  Grid,
  ShoppingCart,
  CreditCard,
  Heart,
  Globe,
  Coins,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Layers,
  RotateCcw,
  Zap,
  Truck,
  ExternalLink,
} from "lucide-react";
import { MobileStoreProvider, useMobileStore, COUNTRIES, CurrencyCode } from "@/lib/mobile-store";
import CategoriesView from "@/components/mobile-ui/CategoriesView";
import CartView from "@/components/mobile-ui/CartView";
import CheckoutView from "@/components/mobile-ui/CheckoutView";
import FavoritesView from "@/components/mobile-ui/FavoritesView";
import MobileFrame from "@/components/mobile-ui/MobileFrame";

function MobileExperienceContent() {
  const {
    country,
    setCountry,
    currency,
    setCurrency,
    activeScreen,
    setActiveScreen,
    cart,
    favorites,
    formatPrice,
    totalPanier,
    installmentAmount,
  } = useMobileStore();

  const [viewMode, setViewMode] = useState<"side-by-side" | "interactive">("side-by-side");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F172A", // Deep Navy background showcasing the premium mobile mockups
        color: "#F8FAFC",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        padding: "36px 16px 80px",
      }}
    >
      <div style={{ maxWidth: 1380, margin: "0 auto" }}>
        
        {/* 1. TOP HERO & BRANDING HEADER */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(22, 84, 145, 0.3)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: 999,
              padding: "6px 16px",
              fontSize: 12.5,
              fontWeight: 700,
              color: "#38BDF8",
              marginBottom: 14,
            }}
          >
            <Sparkles style={{ width: 14, height: 14 }} />
            <span>CARGOLINK AFRICA • NOUVELLE INTERFACE MOBILE & FLUX DE PAIEMENT</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 900,
              color: "#FFFFFF",
              margin: "0 0 12px",
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: -0.5,
            }}
          >
            L'Expérience Mobile avec nos Couleurs & notre Contexte
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "#94A3B8",
              maxWidth: 720,
              margin: "0 auto 24px",
              lineHeight: 1.6,
            }}
          >
            Adaptation fidèle des 4 écrans clés : <strong>Catégories & Univers Usines</strong>,{" "}
            <strong>Panier & Code Promo</strong>, <strong>Livraison & Paiement Échelonné en 4X</strong>, et{" "}
            <strong>Mes Favoris</strong> — connecté à nos devises (Ariary, FCFA, USD, EUR) et nos hubs logistiques africains.
          </p>

          {/* VIEW SWITCHER & CUSTOMIZER BAR */}
          <div
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              background: "#1E293B",
              border: "1px solid #334155",
              borderRadius: 20,
              padding: "8px 14px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            {/* VIEW MODE TOGGLE */}
            <div style={{ display: "flex", background: "#0F172A", borderRadius: 12, padding: 3, gap: 3 }}>
              <button
                onClick={() => setViewMode("side-by-side")}
                style={{
                  background: viewMode === "side-by-side" ? "#165491" : "transparent",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s ease",
                }}
              >
                <Layers style={{ width: 14, height: 14 }} />
                <span>Vue 4 Écrans (Côte-à-Côte)</span>
              </button>

              <button
                onClick={() => setViewMode("interactive")}
                style={{
                  background: viewMode === "interactive" ? "#165491" : "transparent",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s ease",
                }}
              >
                <Smartphone style={{ width: 14, height: 14 }} />
                <span>Simulateur Interactif</span>
              </button>
            </div>

            {/* SEPARATOR */}
            <div style={{ width: 1, height: 24, background: "#334155" }} />

            {/* COUNTRY SELECTOR */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Globe style={{ width: 14, height: 14, color: "#38BDF8" }} />
              <select
                value={country.code}
                onChange={(e) => {
                  const found = COUNTRIES.find((c) => c.code === e.target.value);
                  if (found) setCountry(found);
                }}
                style={{
                  background: "#0F172A",
                  border: "1px solid #475569",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CURRENCY SELECTOR */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Coins style={{ width: 14, height: 14, color: "#F59E0B" }} />
              {(["Ar", "FCFA", "USD", "EUR"] as CurrencyCode[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  style={{
                    background: currency === cur ? "#F59E0B" : "#0F172A",
                    color: currency === cur ? "#0F172A" : "#94A3B8",
                    border: "1px solid",
                    borderColor: currency === cur ? "#F59E0B" : "#334155",
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. MODE A: 4 SCREENS SIDE-BY-SIDE (MATCHING USER SCREENSHOTS) */}
        {viewMode === "side-by-side" && (
          <div>
            {/* GRID OF 4 PHONES */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
                gap: 24,
                justifyItems: "center",
                marginBottom: 40,
              }}
            >
              {/* SCREEN 1: CATEGORIES */}
              <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#38BDF8",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Grid style={{ width: 14, height: 14 }} />
                  <span>1. Univers & Catégories</span>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: 690,
                    background: "#0F172A",
                    borderRadius: 40,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 0 8px #1E293B",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                    border: "1.5px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {/* HARDWARE NOTCH */}
                  <div
                    style={{
                      height: 38,
                      background: "#0F172A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 20px",
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <span>08:30</span>
                    <div style={{ width: 88, height: 22, background: "#000", borderRadius: 14 }} />
                    <span>5G • 100%</span>
                  </div>

                  <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <CategoriesView compact />
                  </div>
                </div>
              </div>

              {/* SCREEN 2: CART */}
              <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#F59E0B",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ShoppingCart style={{ width: 14, height: 14 }} />
                  <span>2. Panier & Code Promo</span>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: 690,
                    background: "#0F172A",
                    borderRadius: 40,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 0 8px #1E293B",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                    border: "1.5px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div
                    style={{
                      height: 38,
                      background: "#0F172A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 20px",
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <span>08:30</span>
                    <div style={{ width: 88, height: 22, background: "#000", borderRadius: 14 }} />
                    <span>5G • 100%</span>
                  </div>

                  <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <CartView />
                  </div>
                </div>
              </div>

              {/* SCREEN 3: CHECKOUT & 4X PAYMENTS */}
              <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#10B981",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <CreditCard style={{ width: 14, height: 14 }} />
                  <span>3. Livraison & Paiement 4X</span>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: 690,
                    background: "#0F172A",
                    borderRadius: 40,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 0 8px #1E293B",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                    border: "1.5px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div
                    style={{
                      height: 38,
                      background: "#0F172A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 20px",
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <span>08:30</span>
                    <div style={{ width: 88, height: 22, background: "#000", borderRadius: 14 }} />
                    <span>5G • 100%</span>
                  </div>

                  <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <CheckoutView />
                  </div>
                </div>
              </div>

              {/* SCREEN 4: FAVORITES */}
              <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#EF4444",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Heart style={{ width: 14, height: 14, fill: "#EF4444" }} />
                  <span>4. Mes Favoris & Ajout Rapide</span>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: 690,
                    background: "#0F172A",
                    borderRadius: 40,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 0 8px #1E293B",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                    border: "1.5px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div
                    style={{
                      height: 38,
                      background: "#0F172A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 20px",
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <span>08:30</span>
                    <div style={{ width: 88, height: 22, background: "#000", borderRadius: 14 }} />
                    <span>5G • 100%</span>
                  </div>

                  <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <FavoritesView />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. MODE B: SINGLE LARGE INTERACTIVE SMARTPHONE SIMULATOR */}
        {viewMode === "interactive" && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
            <MobileFrame initialScreen="cart" showCustomizer={false} />
          </div>
        )}

        {/* 4. DESIGN TOKENS & CONTEXT HIGHLIGHT CARD */}
        <div
          style={{
            background: "#1E293B",
            border: "1px solid #334155",
            borderRadius: 24,
            padding: "24px 28px",
            marginTop: 20,
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#FFFFFF",
              margin: "0 0 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ShieldCheck style={{ width: 20, height: 20, color: "#10B981" }} />
            <span>Alignement Design System & Spécificités CargoLink Africa</span>
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {/* TOKEN 1 */}
            <div style={{ background: "#0F172A", borderRadius: 16, padding: "14px 16px", border: "1px solid #334155" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#FAF7F2", border: "1px solid #CBD5E1" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>Fond Warm Beige (#FAF7F2)</span>
              </div>
              <p style={{ fontSize: 12, color: "#94A3B8", margin: 0, lineHeight: 1.4 }}>
                Surface intérieure chaleureuse et contrastée inspirée directement de la maquette originale.
              </p>
            </div>

            {/* TOKEN 2 */}
            <div style={{ background: "#0F172A", borderRadius: 16, padding: "14px 16px", border: "1px solid #334155" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#16A34A" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>Paiement en 4X (#16A34A)</span>
              </div>
              <p style={{ fontSize: 12, color: "#94A3B8", margin: 0, lineHeight: 1.4 }}>
                Échéancier en 4 étapes avec point aujourd'hui ambré ({formatPrice(installmentAmount)}/mois) et jalons mensuels.
              </p>
            </div>

            {/* TOKEN 3 */}
            <div style={{ background: "#0F172A", borderRadius: 16, padding: "14px 16px", border: "1px solid #334155" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#DC2626" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>Prix Accent Rouge (#DC2626)</span>
              </div>
              <p style={{ fontSize: 12, color: "#94A3B8", margin: 0, lineHeight: 1.4 }}>
                Mise en valeur percutante des tarifs négociés direct usines en Chine avec prix barrés.
              </p>
            </div>

            {/* TOKEN 4 */}
            <div style={{ background: "#0F172A", borderRadius: 16, padding: "14px 16px", border: "1px solid #334155" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#E8890C" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>Code Promo Ambré (#E8890C)</span>
              </div>
              <p style={{ fontSize: 12, color: "#94A3B8", margin: 0, lineHeight: 1.4 }}>
                Bannière d'application immédiate de réductions (essayez <code>CARGO10</code> ou <code>BIENVENUE</code>).
              </p>
            </div>
          </div>

          {/* QUICK LINKS TO DEDICATED ROUTES */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid #334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600 }}>
              Accéder directement aux pages dédiées de l'application :
            </span>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link
                href="/cart"
                style={{
                  background: "#0F172A",
                  color: "#FFFFFF",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ShoppingCart style={{ width: 12, height: 12 }} />
                <span>/cart</span>
              </Link>

              <Link
                href="/checkout"
                style={{
                  background: "#0F172A",
                  color: "#FFFFFF",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CreditCard style={{ width: 12, height: 12 }} />
                <span>/checkout</span>
              </Link>

              <Link
                href="/favorites"
                style={{
                  background: "#0F172A",
                  color: "#FFFFFF",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Heart style={{ width: 12, height: 12 }} />
                <span>/favorites</span>
              </Link>

              <Link
                href="/categories"
                style={{
                  background: "#0F172A",
                  color: "#FFFFFF",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Grid style={{ width: 12, height: 12 }} />
                <span>/categories</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function MobileExperiencePage() {
  return <MobileExperienceContent />;
}
