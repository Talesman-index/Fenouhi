"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Heart,
  ShoppingCart,
  Check,
} from "lucide-react";
import BottomNav from "./BottomNav";
import { useMobileStore } from "@/lib/mobile-store";

interface FavoritesViewProps {
  onBack?: () => void;
  onContinueShopping?: () => void;
}

export default function FavoritesView({ onBack, onContinueShopping }: FavoritesViewProps) {
  const {
    favorites,
    toggleFavorite,
    addToCart,
    addAllFavoritesToCart,
    formatPrice,
    setActiveScreen,
  } = useMobileStore();

  const [addedIds, setAddedIds] = useState<{ [key: string]: boolean }>({});
  const [allAddedToast, setAllAddedToast] = useState(false);

  const handleAddToCart = (item: any) => {
    addToCart({
      id: `fav-add-${item.id}`,
      name: item.name,
      category: item.category,
      price: item.price,
      oldPrice: item.oldPrice,
      image: item.image,
      deliveryRange: "Livré entre 12/12/2026 et 20/12/2026",
      shippingMode: "air",
    });

    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const handleAddAll = () => {
    addAllFavoritesToCart();
    setAllAddedToast(true);
    setTimeout(() => {
      setAllAddedToast(false);
      setActiveScreen("cart");
    }, 1200);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0F172A",
        color: "#0F172A",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        position: "relative",
        userSelect: "none",
      }}
    >
      {/* 1. TOP HEADER BAR */}
      <div
        style={{
          padding: "10px 16px 12px",
          display: "flex",
          alignItems: "center",
          color: "#0F172A",
          background: "#FFFFFF",
          position: "relative",
        }}
      >
        {/* BACK BUTTON */}
        <button
          onClick={() => {
            if (onBack) onBack();
            else setActiveScreen("cart");
          }}
          style={{
            background: "#1E293B",
            border: "none",
            color: "#FFFFFF",
            width: 32,
            height: 32,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 2,
          }}
          aria-label="Retour"
        >
          <ChevronLeft style={{ width: 20, height: 20 }} />
        </button>

        {/* TITLE */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>
            Mes favoris
          </h2>
        </div>
      </div>

      {/* 2. MAIN SCROLLABLE FAVORITES CONTAINER (WARM BEIGE CANVAS) */}
      <div
        style={{
          flex: 1,
          background: "#FAF7F2", // Exact warm creamy beige from mockup
          overflowY: "auto",
          padding: "16px 14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* TOAST FEEDBACK */}
        {allAddedToast && (
          <div
            style={{
              background: "#ECFDF5",
              color: "#065F46",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
            }}
          >
            <Check style={{ width: 16, height: 16 }} />
            <span>Tous les favoris ont été ajoutés à votre panier !</span>
          </div>
        )}

        {/* EMPTY STATE */}
        {favorites.length === 0 ? (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 22,
              padding: "40px 20px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                background: "#FEF2F2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#DC2626",
              }}
            >
              <Heart style={{ width: 28, height: 28, fill: "#DC2626" }} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: "#0F172A" }}>
              Aucun article favori
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 20px" }}>
              Enregistrez vos articles préférés pour les retrouver plus tard.
            </p>
            <button
              onClick={() => setActiveScreen("categories")}
              style={{
                background: "#0F172A",
                color: "#FFFFFF",
                border: "none",
                padding: "10px 22px",
                borderRadius: 999,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Parcourir les univers
            </button>
          </div>
        ) : (
          /* FAVORITE CARDS LIST */
          favorites.map((item) => {
            const added = addedIds[item.id];
            const oldPrice = item.oldPrice || item.price * 1.15;

            return (
              <div
                key={item.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 22,
                  padding: "14px 16px",
                  boxShadow: "0 2px 12px rgba(15, 23, 42, 0.03)",
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                }}
              >
                {/* THUMBNAIL */}
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 14,
                    background: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    overflow: "hidden",
                    border: "1px solid #F1F5F9",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      padding: 4,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/assets/hero_iphone16.png";
                    }}
                  />
                </div>

                {/* DETAILS */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* TITLE */}
                  <h4
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "#0F172A",
                      margin: "0 0 6px",
                      lineHeight: 1.25,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={item.name}
                  >
                    {item.name}
                  </h4>

                  {/* PRICES */}
                  <div style={{ marginBottom: 4 }}>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: "#94A3B8",
                        textDecoration: "line-through",
                        lineHeight: 1,
                      }}
                    >
                      {formatPrice(oldPrice)}
                    </div>
                    <div
                      style={{
                        fontSize: 14.5,
                        fontWeight: 600,
                        color: "#DC2626", // Exact red from mockup
                        lineHeight: 1.2,
                      }}
                    >
                      {formatPrice(item.price)}
                    </div>
                  </div>
                </div>

                {/* RIGHT ACTION BUTTONS: HEART (RED FILLED) & CART BUTTON */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {/* HEART TOGGLE */}
                  <button
                    onClick={() => toggleFavorite(item)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#DC2626",
                      cursor: "pointer",
                      padding: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-label="Retirer des favoris"
                  >
                    <Heart
                      style={{
                        width: 22,
                        height: 22,
                        fill: "#DC2626",
                        stroke: "#DC2626",
                      }}
                    />
                  </button>

                  {/* CART BUTTON (DARK NAVY CIRCLE) */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: added ? "#10B981" : "#1E293B", // Exact dark circle from mockup
                      color: "#FFFFFF",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.15)",
                      transition: "all 0.2s ease",
                    }}
                    aria-label="Ajouter au panier"
                  >
                    {added ? (
                      <Check style={{ width: 18, height: 18 }} />
                    ) : (
                      <ShoppingCart style={{ width: 18, height: 18 }} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. FIXED BOTTOM ACTIONS CONTAINER (WHITE ROUNDED DOCK) */}
      <div
        style={{
          background: "#FFFFFF",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: "16px 14px 10px",
          display: "grid",
          gridTemplateColumns: "1fr 1.6fr",
          gap: 10,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* CONTINUER (WHITE WITH DARK BORDER) */}
        <button
          onClick={() => {
            if (onContinueShopping) onContinueShopping();
            else setActiveScreen("categories");
          }}
          style={{
            background: "#FFFFFF",
            color: "#0F172A",
            border: "1.5px solid #0F172A",
            borderRadius: 14,
            padding: "12px 14px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <ChevronLeft style={{ width: 16, height: 16, strokeWidth: 2.5 }} />
          <span>Continuer</span>
        </button>

        {/* AJOUTER TOUT AU PANIER (DARK SLATE NAVY) */}
        <button
          onClick={handleAddAll}
          disabled={favorites.length === 0}
          style={{
            background: favorites.length === 0 ? "#94A3B8" : "#223246", // Exact dark slate from mockup
            color: "#FFFFFF",
            border: "none",
            borderRadius: 14,
            padding: "12px 14px",
            fontSize: 13,
            fontWeight: 700,
            cursor: favorites.length === 0 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.15)",
          }}
        >
          <span>Ajouter tout au panier</span>
        </button>
      </div>

      {/* 4. BOTTOM NAVIGATION BAR */}
      <BottomNav activeScreen="favorites" />
    </div>
  );
}
