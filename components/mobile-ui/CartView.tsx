"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Trash2,
  X,
  Heart,
  Minus,
  Plus,
  Tag,
  Check,
  ShoppingBag,
} from "lucide-react";
import BottomNav from "./BottomNav";
import { useMobileStore } from "@/lib/mobile-store";

interface CartViewProps {
  onBack?: () => void;
  onProceedToCheckout?: () => void;
}

export default function CartView({ onBack, onProceedToCheckout }: CartViewProps) {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleFavorite,
    isFavorite,
    promoCode,
    applyPromoCode,
    promoApplied,
    discountPercent,
    totalPanier,
    discountAmount,
    finalTotal,
    formatPrice,
    setActiveScreen,
  } = useMobileStore();

  const [promoInput, setPromoInput] = useState(promoCode || "");
  const [promoMessage, setPromoMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleApplyPromo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = applyPromoCode(promoInput);
    setPromoMessage({ text: res.message, success: res.success });
    setTimeout(() => {
      setPromoMessage(null);
    }, 4000);
  };

  const handleCommander = () => {
    if (onProceedToCheckout) {
      onProceedToCheckout();
    } else {
      setActiveScreen("checkout");
    }
  };

  const totalItemCount = cart.length > 0 ? cart.map((i) => i.quantity || 1).reduce((a, b) => a + b, 0) : 0;

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
          justifyContent: "space-between",
          color: "#0F172A",
          background: "#FFFFFF",
        }}
      >
        {/* BACK BUTTON */}
        <button
          onClick={() => {
            if (onBack) onBack();
            else setActiveScreen("categories");
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
          }}
          aria-label="Retour"
        >
          <ChevronLeft style={{ width: 20, height: 20 }} />
        </button>

        {/* TITLE & PRODUCTS COUNT */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0 }}>Panier</h2>
        </div>

        {/* TOP RIGHT: ITEM COUNT & VIDER PANIER */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
            {totalItemCount} {totalItemCount > 1 ? "produits" : "produit"}
          </span>
          <button
            onClick={() => {
              if (confirm("Voulez-vous vraiment vider votre panier ?")) {
                clearCart();
              }
            }}
            style={{
              background: "#F8ECE0", // Exact light peach/sand button from mockup
              border: "none",
              borderRadius: 8,
              padding: "4px 8px",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11.5,
              fontWeight: 600,
              color: "#78350F",
              cursor: "pointer",
            }}
            aria-label="Vider panier"
          >
            <span>Vider panier</span>
            <Trash2 style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>

      {/* 2. MAIN SCROLLABLE CART CONTAINER (WARM BEIGE CANVAS) */}
      <div
        style={{
          flex: 1,
          background: "#FAF7F2", // Exact warm creamy beige
          overflowY: "auto",
          padding: "16px 14px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* EMPTY STATE */}
        {cart.length === 0 ? (
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
                color: "#EF4444",
              }}
            >
              <ShoppingBag style={{ width: 28, height: 28 }} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: "#0F172A" }}>
              Votre panier est vide
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 20px" }}>
              Explorez nos milliers de références direct usines certifiées en Chine.
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
              Explorer le catalogue
            </button>
          </div>
        ) : (
          /* PRODUCT CARDS LIST */
          cart.map((item) => {
            const fav = isFavorite(item.id);
            const itemTotal = item.price * item.quantity;
            const oldTotal = item.oldPrice ? item.oldPrice * item.quantity : itemTotal * 1.15;

            return (
              <div
                key={item.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 22,
                  padding: "12px 14px",
                  boxShadow: "0 2px 12px rgba(15, 23, 42, 0.03)",
                  position: "relative",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                {/* REMOVE BUTTON (TOP RIGHT) */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 12,
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Supprimer l'article"
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>

                {/* PRODUCT THUMBNAIL */}
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
                    position: "relative",
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
                <div style={{ flex: 1, minWidth: 0, paddingRight: 18 }}>
                  {/* TITLE */}
                  <h4
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#0F172A",
                      margin: "0 0 2px",
                      lineHeight: 1.25,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={item.name}
                  >
                    {item.name}
                  </h4>

                  {/* DELIVERY DATE ESTIMATION */}
                  <p
                    style={{
                      fontSize: 10.5,
                      color: "#64748B",
                      margin: "0 0 6px",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {item.deliveryRange}
                  </p>

                  {/* PRICE & ACTIONS ROW */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    {/* PRICES */}
                    <div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: "#94A3B8",
                          textDecoration: "line-through",
                          lineHeight: 1,
                        }}
                      >
                        {formatPrice(oldTotal)}
                      </div>
                      <div
                        style={{
                          fontSize: 14.5,
                          fontWeight: 800,
                          color: "#DC2626", // Exact vibrant red accent from mockup
                          lineHeight: 1.2,
                        }}
                      >
                        {formatPrice(itemTotal)}
                      </div>
                    </div>

                    {/* ACTIONS: HEART & QUANTITY STEPPER */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {/* FAVORITE HEART */}
                      <button
                        onClick={() =>
                          toggleFavorite({
                            id: item.id,
                            name: item.name,
                            category: item.category,
                            price: item.price,
                            oldPrice: item.oldPrice,
                            image: item.image,
                            inStock: true,
                          })
                        }
                        style={{
                          background: "#F1F5F9",
                          border: "none",
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: fav ? "#DC2626" : "#94A3B8",
                        }}
                        aria-label="Ajouter aux favoris"
                      >
                        <Heart
                          style={{
                            width: 14,
                            height: 14,
                            fill: fav ? "#DC2626" : "none",
                            strokeWidth: 2,
                          }}
                        />
                      </button>

                      {/* STEPPER: [-] 1 [+] */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: "transparent",
                          gap: 4,
                        }}
                      >
                        {/* MINUS */}
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "#CBD5E1", // Exact light slate from mockup
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#FFFFFF",
                          }}
                          aria-label="Diminuer la quantité"
                        >
                          <Minus style={{ width: 14, height: 14, strokeWidth: 3 }} />
                        </button>

                        {/* COUNT */}
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#0F172A",
                            minWidth: 16,
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </span>

                        {/* PLUS */}
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "#0F172A", // Exact dark slate plus from mockup
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#FFFFFF",
                          }}
                          aria-label="Augmenter la quantité"
                        >
                          <Plus style={{ width: 14, height: 14, strokeWidth: 3 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* 3. PROMO CODE BANNER (WARM AMBER GRADIENT BOX) */}
        {cart.length > 0 && (
          <div
            style={{
              background: "#E8890C", // Exact amber orange from screenshot
              borderRadius: 18,
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(232, 137, 12, 0.25)",
            }}
          >
            {/* TAG ICON */}
            <div
              style={{
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                flexShrink: 0,
              }}
            >
              <Tag style={{ width: 18, height: 18, fill: "#FFFFFF", stroke: "#E8890C" }} />
            </div>

            {/* WHITE INPUT BOX */}
            <div
              style={{
                flex: 1,
                background: "#FFFFFF",
                borderRadius: 12,
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Code Promo ici"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#92400E",
                  background: "transparent",
                }}
              />
            </div>

            {/* VALIDER BUTTON */}
            <button
              onClick={() => handleApplyPromo()}
              style={{
                background: "#78350F", // Dark amber/brown from screenshot
                color: "#FFFFFF",
                border: "none",
                borderRadius: 12,
                padding: "8px 16px",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
                transition: "opacity 0.2s ease",
              }}
            >
              Valider
            </button>
          </div>
        )}

        {/* PROMO NOTIFICATION FEEDBACK */}
        {promoMessage && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 10,
              background: promoMessage.success ? "#ECFDF5" : "#FEF2F2",
              color: promoMessage.success ? "#065F46" : "#991B1B",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Check style={{ width: 14, height: 14 }} />
            <span>{promoMessage.text}</span>
          </div>
        )}

        {/* 4. TOTAL SUMMARY CARD (WHITE ROUNDED SURFACE) */}
        {cart.length > 0 && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 22,
              padding: "16px 18px",
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* TOTAL PANIER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 13.5,
                color: "#334155",
                fontWeight: 600,
              }}
            >
              <span>Total panier</span>
              <span style={{ fontWeight: 800, color: "#0F172A" }}>
                {formatPrice(totalPanier)}
              </span>
            </div>

            {/* DISCOUNT IF APPLIED */}
            {promoApplied && discountPercent > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 13,
                  color: "#059669",
                  fontWeight: 600,
                }}
              >
                <span>Remise Code Promo (-{discountPercent}%)</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            {/* LIVRAISON */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 13.5,
                color: "#334155",
                fontWeight: 600,
              }}
            >
              <span>Livraison</span>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>Gratuit</span>
            </div>

            {/* TOTAL TTC */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 14,
                fontWeight: 800,
                color: "#0F172A",
                paddingTop: 4,
                borderTop: "1px solid #F1F5F9",
              }}
            >
              <span>TOTAL TTC</span>
              <span style={{ fontSize: 16, color: "#DC2626" }}>
                {formatPrice(finalTotal)}
              </span>
            </div>

            {/* COMMANDER PRIMARY BUTTON (DARK SLATE NAVY) */}
            <button
              onClick={handleCommander}
              style={{
                marginTop: 6,
                background: "#223246", // Exact deep navy slate button from mockup
                color: "#FFFFFF",
                border: "none",
                borderRadius: 14,
                padding: "14px 20px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 6px 18px rgba(15, 23, 42, 0.15)",
                transition: "transform 0.15s ease",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span>Commander</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. BOTTOM NAVIGATION BAR */}
      <BottomNav activeScreen="cart" />
    </div>
  );
}
