"use client";

import React, { useState } from "react";
import {
  Wifi,
  Battery,
  Signal,
  Globe,
  Coins,
} from "lucide-react";
import CategoriesView from "./CategoriesView";
import CartView from "./CartView";
import CheckoutView from "./CheckoutView";
import FavoritesView from "./FavoritesView";
import { useMobileStore, COUNTRIES, CurrencyCode } from "@/lib/mobile-store";

interface MobileFrameProps {
  initialScreen?: "categories" | "cart" | "checkout" | "favorites";
  showCustomizer?: boolean;
}

export default function MobileFrame({
  showCustomizer = true,
}: MobileFrameProps) {
  const {
    activeScreen,
    setActiveScreen,
    country,
    setCountry,
    currency,
    setCurrency,
    cart,
    favorites,
  } = useMobileStore();

  const timeString = "08:30";
  const totalCartCount = cart.length > 0 ? cart.map((i) => i.quantity || 1).reduce((a, b) => a + b, 0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* OPTIONAL CONTEXT & CURRENCY CUSTOMIZER BAR */}
      {showCustomizer && (
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 20,
            padding: "12px 16px",
            marginBottom: 20,
            boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* HEADER TAG */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10B981",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Contexte CargoLink Africa
              </span>
            </div>

            {/* SCREEN SELECTOR TABS */}
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { id: "categories", label: "Catégories", badge: null },
                { id: "cart", label: "Panier", badge: totalCartCount },
                { id: "checkout", label: "Paiement 4X", badge: null },
                { id: "favorites", label: "Favoris", badge: favorites.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveScreen(tab.id as any)}
                  style={{
                    background: activeScreen === tab.id ? "#0F172A" : "#F1F5F9",
                    color: activeScreen === tab.id ? "#FFFFFF" : "#64748B",
                    border: "none",
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== null && tab.badge > 0 && (
                    <span
                      style={{
                        background: activeScreen === tab.id ? "#DC2626" : "#CBD5E1",
                        color: activeScreen === tab.id ? "#FFF" : "#0F172A",
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "1px 4px",
                        borderRadius: 4,
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* SECOND ROW: COUNTRY & CURRENCY SWITCHERS */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              paddingTop: 8,
              borderTop: "1px solid #F1F5F9",
              flexWrap: "wrap",
            }}
          >


            {/* CURRENCY TOGGLE */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Coins style={{ width: 14, height: 14, color: "#F59E0B" }} />
              <span style={{ fontSize: 11.5, color: "#64748B", fontWeight: 600 }}>Devise :</span>
              {(["Ar", "FCFA", "USD", "EUR"] as CurrencyCode[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  style={{
                    background: currency === cur ? "#165491" : "#F1F5F9",
                    color: currency === cur ? "#FFFFFF" : "#64748B",
                    border: "none",
                    borderRadius: 6,
                    padding: "2px 6px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SMARTPHONE HARDWARE CHASSIS (TITANIUM BLACK / DEEP NAVY SLATE) */}
      <div
        style={{
          width: "100%",
          maxWidth: 390,
          height: 780,
          background: "#0F172A",
          borderRadius: 48,
          boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.45), 0 0 0 10px #1E293B, 0 0 0 12px #0F172A",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          border: "2px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* TOP HARDWARE STATUS BAR & DYNAMIC ISLAND */}
        <div
          style={{
            height: 44,
            background: "#0F172A",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: -0.2,
            zIndex: 50,
            position: "relative",
          }}
        >
          {/* TIME */}
          <span>{timeString}</span>

          {/* DYNAMIC ISLAND CUTOUT */}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 108,
              height: 28,
              background: "#000000",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* SENSOR DOT */}
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#09090B" }} />
            {/* TINY CAMERA LENS */}
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#0c1524", border: "1px solid #1E293B" }} />
          </div>

          {/* SIGNAL & BATTERY ICONS */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Signal style={{ width: 14, height: 14 }} />
            <Wifi style={{ width: 14, height: 14 }} />
            <Battery style={{ width: 18, height: 18 }} />
          </div>
        </div>

        {/* INNER SCREEN CONTAINER (SMOOTH TRANSITIONS) */}
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {activeScreen === "categories" && (
            <CategoriesView onSelectCategory={() => setActiveScreen("cart")} />
          )}

          {activeScreen === "cart" && (
            <CartView onProceedToCheckout={() => setActiveScreen("checkout")} />
          )}

          {activeScreen === "checkout" && (
            <CheckoutView
              onBack={() => setActiveScreen("cart")}
              onSuccess={() => setActiveScreen("cart")}
            />
          )}

          {activeScreen === "favorites" && (
            <FavoritesView
              onBack={() => setActiveScreen("cart")}
              onContinueShopping={() => setActiveScreen("categories")}
            />
          )}
        </div>

        {/* BOTTOM HOME INDICATOR BAR */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: "50%",
            transform: "translateX(-50%)",
            width: 134,
            height: 4,
            background: "#FFFFFF",
            borderRadius: 2,
            opacity: 0.6,
            zIndex: 60,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
