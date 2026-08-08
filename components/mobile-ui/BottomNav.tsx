"use client";

import React from "react";
import { Grid, Heart, Home, ShoppingCart, User } from "lucide-react";
import { useMobileStore } from "@/lib/mobile-store";

interface BottomNavProps {
  activeScreen?: "categories" | "cart" | "checkout" | "favorites" | "home";
  onNavigate?: (screen: "categories" | "cart" | "checkout" | "favorites") => void;
}

export default function BottomNav({ activeScreen: propActive, onNavigate }: BottomNavProps) {
  const { cart, favorites, activeScreen: storeActive, setActiveScreen } = useMobileStore();
  const current = propActive || storeActive;

  const handleNav = (target: "categories" | "cart" | "checkout" | "favorites") => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      setActiveScreen(target);
    }
  };

  const totalCartCount = cart.length > 0 ? cart.map((i) => i.quantity || 1).reduce((a, b) => a + b, 0) : 0;
  const totalFavCount = favorites.length;

  return (
    <nav
      style={{
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(226, 232, 240, 0.9)",
        padding: "8px 16px 12px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        position: "relative",
        zIndex: 40,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
      }}
    >
      {/* 1. CATEGORIES */}
      <button
        onClick={() => handleNav("categories")}
        style={{
          background: "none",
          border: "none",
          padding: "6px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          cursor: "pointer",
          color: current === "categories" ? "#0F172A" : "#94A3B8",
          transition: "all 0.2s ease",
        }}
        aria-label="Catégories"
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Grid
            style={{
              width: 24,
              height: 24,
              strokeWidth: current === "categories" ? 2.5 : 1.8,
              color: current === "categories" ? "#0F172A" : "#8E9BAE",
            }}
          />
        </div>
      </button>

      {/* 2. FAVORITES */}
      <button
        onClick={() => handleNav("favorites")}
        style={{
          background: "none",
          border: "none",
          padding: "6px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          cursor: "pointer",
          color: current === "favorites" ? "#DC2626" : "#94A3B8",
          transition: "all 0.2s ease",
        }}
        aria-label="Mes favoris"
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Heart
            style={{
              width: 24,
              height: 24,
              strokeWidth: current === "favorites" ? 2.3 : 1.8,
              color: current === "favorites" ? "#DC2626" : "#8E9BAE",
              fill: current === "favorites" ? "#DC2626" : "none",
            }}
          />
          {totalFavCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -2,
                right: -3,
                width: 6,
                height: 6,
                background: "#DC2626",
                borderRadius: "50%",
                boxShadow: "0 0 0 1.5px #FFFFFF",
              }}
            />
          )}
        </div>
      </button>

      {/* 3. HOME */}
      <button
        onClick={() => handleNav("categories")}
        style={{
          background: "none",
          border: "none",
          padding: "6px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          cursor: "pointer",
          color: "#8E9BAE",
          transition: "all 0.2s ease",
        }}
        aria-label="Accueil"
      >
        <Home
          style={{
            width: 24,
            height: 24,
            strokeWidth: 1.8,
            color: "#8E9BAE",
          }}
        />
      </button>

      {/* 4. CART */}
      <button
        onClick={() => handleNav("cart")}
        style={{
          background: "none",
          border: "none",
          padding: "6px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          cursor: "pointer",
          color: current === "cart" || current === "checkout" ? "#0F172A" : "#94A3B8",
          transition: "all 0.2s ease",
        }}
        aria-label="Panier"
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShoppingCart
            style={{
              width: 24,
              height: 24,
              strokeWidth: current === "cart" || current === "checkout" ? 2.5 : 1.8,
              color: current === "cart" || current === "checkout" ? "#0F172A" : "#8E9BAE",
            }}
          />
          {totalCartCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -5,
                right: -8,
                background: "#DC2626",
                color: "#FFF",
                fontSize: 10,
                fontWeight: 800,
                minWidth: 16,
                height: 16,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 2px",
                boxShadow: "0 0 0 1.5px #FFFFFF",
              }}
            >
              {totalCartCount}
            </span>
          )}
        </div>
      </button>

      {/* 5. PROFILE */}
      <button
        onClick={() => handleNav("checkout")}
        style={{
          background: "none",
          border: "none",
          padding: "6px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          cursor: "pointer",
          color: "#8E9BAE",
          transition: "all 0.2s ease",
        }}
        aria-label="Compte"
      >
        <User
          style={{
            width: 24,
            height: 24,
            strokeWidth: 1.8,
            color: "#8E9BAE",
          }}
        />
      </button>
    </nav>
  );
}
