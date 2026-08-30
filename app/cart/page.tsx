"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trash2,
  X,
  Heart,
  Minus,
  Plus,
  Tag,
  Check,
  Truck,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Globe,
  Coins,
} from "lucide-react";
import { MobileStoreProvider, useMobileStore, COUNTRIES, CurrencyCode } from "@/lib/mobile-store";

function CartPageInner() {
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
    country,
    setCountry,
    currency,
    setCurrency,
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

  const totalItemCount = cart.length > 0 ? cart.map((i) => i.quantity || 1).reduce((a, b) => a + b, 0) : 0;

  return (
    <div style={{ background: "var(--bg-main, #FAF7F2)", minHeight: "85vh", padding: "32px 0 60px" }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        
        {/* USER FLOW STEPPER */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 18,
            padding: "16px 20px",
            border: "1px solid #E2D9CC",
            marginBottom: 20,
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, textAlign: "center" }}>
            {/* STEP 1 (ACTIVE) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: "50%", background: "#0F172A", color: "#FFFFFF", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, aspectRatio: "1/1", boxShadow: "0 0 0 3px rgba(15, 23, 42, 0.15)" }}>
                1
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A" }}>1. Mon Panier</span>
            </div>

            {/* STEP 2 */}
            <Link href="/checkout" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: "50%", background: "#CBD5E1", color: "#FFF", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, aspectRatio: "1/1" }}>
                2
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B" }} className="desktop-only">2. Fret & Livraison</span>
            </Link>

            {/* STEP 3 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: 0.5 }}>
              <div style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: "50%", background: "#CBD5E1", color: "#FFF", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, aspectRatio: "1/1" }}>
                3
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B" }} className="desktop-only">3. Paiement Sécurisé</span>
            </div>

            {/* STEP 4 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: 0.5 }}>
              <div style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: "50%", background: "#CBD5E1", color: "#FFF", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, aspectRatio: "1/1" }}>
                4
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B" }} className="desktop-only">4. Suivi Expédition</span>
            </div>
          </div>
        </div>

        {/* BREADCRUMB & TOP ACTIONS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/catalog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "#64748B",
                textDecoration: "none",
              }}
            >
              <ArrowLeft style={{ width: 15, height: 15 }} />
              <span>Continuer mes achats</span>
            </Link>
            <span style={{ color: "#CBD5E1" }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Mon Panier</span>
          </div>


        </div>

        {/* HEADER TITLE & PRODUCT COUNT */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 16,
            borderBottom: "1px solid #E2D9CC",
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#0F172A",
                fontFamily: "'Poppins', sans-serif",
                margin: "0 0 4px",
              }}
            >
              Panier ({totalItemCount} {totalItemCount > 1 ? "articles" : "article"})
            </h1>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
              Inspection qualité en usine certifiée et dédouanement tout-en-un vers {country.name}.
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Voulez-vous vraiment vider votre panier ?")) {
                  clearCart();
                }
              }}
              style={{
                background: "#F8ECE0",
                border: "none",
                borderRadius: 10,
                padding: "8px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12.5,
                fontWeight: 700,
                color: "#78350F",
                cursor: "pointer",
              }}
            >
              <Trash2 style={{ width: 14, height: 14 }} />
              <span>Vider le panier</span>
            </button>
          )}
        </div>

        {/* MAIN 2-COLUMN GRID (OR STACKED ON MOBILE) */}
        {cart.length === 0 ? (
          /* EMPTY STATE */
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "60px 20px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
              maxWidth: 540,
              margin: "40px auto",
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                background: "#FEF2F2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#EF4444",
              }}
            >
              <ShoppingBag style={{ width: 32, height: 32 }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0F172A", margin: "0 0 8px" }}>
              Votre panier est vide
            </h2>
            <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px" }}>
              Parcourez nos 20 univers de produits directs usines en Chine et commandez avec facilité.
            </p>
            <Link
              href="/catalog"
              style={{
                background: "#0F172A",
                color: "#FFFFFF",
                padding: "12px 28px",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>Explorer le catalogue</span>
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 32,
              alignItems: "start",
            }}
          >
            {/* LEFT COLUMN: LIST OF PRODUCT ITEMS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, gridColumn: "span 2" }}>
              {cart.map((item) => {
                const fav = isFavorite(item.id);
                const hasWholesaleDiscount = item.quantity >= 5 && item.wholesalePrice5 && Number(item.wholesalePrice5) > 0;
                const effectiveUnitPrice = hasWholesaleDiscount ? Number(item.wholesalePrice5) : item.price;
                const itemTotal = effectiveUnitPrice * item.quantity;
                const oldTotal = item.oldPrice ? item.oldPrice * item.quantity : (hasWholesaleDiscount ? item.price * item.quantity : itemTotal * 1.15);

                return (
                  <div
                    key={item.id}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 20,
                      padding: "18px 20px",
                      boxShadow: "0 2px 14px rgba(15, 23, 42, 0.03)",
                      border: "1px solid #EAE5DC",
                      position: "relative",
                      display: "flex",
                      gap: 18,
                      alignItems: "center",
                    }}
                  >
                    {/* REMOVE BUTTON TOP RIGHT */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        background: "#F8FAFC",
                        border: "none",
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        color: "#94A3B8",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Supprimer"
                    >
                      <X style={{ width: 15, height: 15 }} />
                    </button>

                    {/* PRODUCT THUMBNAIL */}
                    <div
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: 16,
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
                          padding: 6,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/assets/hero_iphone16.png";
                        }}
                      />
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#165491",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {item.category}
                      </span>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#0F172A",
                          margin: "2px 0 4px",
                          lineHeight: 1.3,
                        }}
                      >
                        {item.name}
                      </h3>

                      {item.specs && (
                        <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 6px" }}>
                          {item.specs}
                        </p>
                      )}

                      {/* DELIVERY ESTIMATE */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11.5,
                          color: "#059669",
                          fontWeight: 600,
                          background: "#ECFDF5",
                          padding: "3px 8px",
                          borderRadius: 6,
                          marginBottom: 8,
                        }}
                      >
                        <Truck style={{ width: 13, height: 13 }} />
                        <span>{item.deliveryRange}</span>
                      </div>

                      {/* WHOLESALE TIER NOTICE */}
                      {hasWholesaleDiscount ? (
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ fontSize: 11, background: "#DCFCE7", color: "#15803D", fontWeight: 700, padding: "2px 8px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            ✓ Tarif de Gros Appliqué : {formatPrice(effectiveUnitPrice)}/u (≥ 5 art.)
                          </span>
                        </div>
                      ) : item.wholesalePrice5 && Number(item.wholesalePrice5) > 0 ? (
                        <div style={{ fontSize: 11.5, color: "#D97706", fontWeight: 600, marginBottom: 8, background: "#FEF3C7", padding: "3px 8px", borderRadius: 6, display: "inline-block" }}>
                          💡 Plus que {5 - item.quantity} article(s) pour débloquer le prix de gros à {formatPrice(Number(item.wholesalePrice5))}/u
                        </div>
                      ) : null}

                      {/* PRICE & STEPPER ACTIONS */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 12,
                          paddingTop: 4,
                        }}
                      >
                        {/* PRICES */}
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#94A3B8",
                              textDecoration: "line-through",
                            }}
                          >
                            {formatPrice(oldTotal)}
                          </div>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: hasWholesaleDiscount ? "#16A34A" : "#DC2626", // Green when wholesale discount applied
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            {formatPrice(itemTotal)}
                          </div>
                        </div>

                        {/* FAVORITE & QUANTITY STEPPER */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {/* FAVORITE BUTTON */}
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
                              background: fav ? "#FEF2F2" : "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              color: fav ? "#DC2626" : "#64748B",
                            }}
                            title="Ajouter aux favoris"
                          >
                            <Heart
                              style={{
                                width: 16,
                                height: 16,
                                fill: fav ? "#DC2626" : "none",
                                strokeWidth: 2,
                              }}
                            />
                          </button>

                          {/* STEPPER [-] 1 [+] */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              background: "#F1F5F9",
                              borderRadius: 999,
                              padding: "2px 6px",
                              gap: 6,
                            }}
                          >
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: "#CBD5E1",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "#0F172A",
                              }}
                            >
                              <Minus style={{ width: 14, height: 14, strokeWidth: 2.5 }} />
                            </button>

                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#0F172A",
                                minWidth: 20,
                                textAlign: "center",
                              }}
                            >
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: "#0F172A",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "#FFFFFF",
                              }}
                            >
                              <Plus style={{ width: 14, height: 14, strokeWidth: 2.5 }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT COLUMN: RECAP CARD & PROMO CODE (STICKY ON DESKTOP) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* PROMO CODE BANNER (WARM AMBER BOX) */}
              <div
                style={{
                  background: "#E8890C",
                  borderRadius: 20,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 4px 16px rgba(232, 137, 12, 0.2)",
                }}
              >
                <div style={{ color: "#FFFFFF", display: "flex", alignItems: "center" }}>
                  <Tag style={{ width: 20, height: 20, fill: "#FFFFFF", stroke: "#E8890C" }} />
                </div>

                <div
                  style={{
                    flex: 1,
                    background: "#FFFFFF",
                    borderRadius: 12,
                    padding: "7px 12px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Code Promo (ex: CARGO10)"
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#92400E",
                      background: "transparent",
                    }}
                  />
                </div>

                <button
                  onClick={handleApplyPromo}
                  style={{
                    background: "#78350F",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 12,
                    padding: "9px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Valider
                </button>
              </div>

              {promoMessage && (
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    padding: "8px 14px",
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

              {/* ORDER SUMMARY CARD (CLEAN WHITE CARD) */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: 22,
                  padding: "24px",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                  border: "1px solid #EAE5DC",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>
                  Récapitulatif de commande
                </h3>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  <span>Total panier</span>
                  <span style={{ fontWeight: 600, color: "#0F172A" }}>{formatPrice(totalPanier)}</span>
                </div>

                {promoApplied && discountPercent > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13.5,
                      color: "#059669",
                      fontWeight: 700,
                    }}
                  >
                    <span>Remise Code Promo (-{discountPercent}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  <span>Fret & Livraison vers {country.name}</span>
                  <span style={{ fontWeight: 600, color: "#059669" }}>Gratuit</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0F172A",
                    paddingTop: 12,
                    borderTop: "1px solid #F1F5F9",
                  }}
                >
                  <span>TOTAL TTC</span>
                  <span
                    style={{
                      fontSize: 20,
                      color: "#DC2626", // Red bold price
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                {/* COMMANDER BUTTON */}
                <Link
                  href="/checkout"
                  style={{
                    background: "#0F172A",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 14,
                    padding: "16px 20px",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    textDecoration: "none",
                    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.2)",
                    marginTop: 6,
                  }}
                >
                  <span>Passer la commande ({formatPrice(finalTotal)})</span>
                  <ArrowRight style={{ width: 18, height: 18 }} />
                </Link>

                {/* ASSURANCE BADGES */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    paddingTop: 12,
                    borderTop: "1px solid #F1F5F9",
                    fontSize: 11.5,
                    color: "#64748B",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck style={{ width: 14, height: 14, color: "#10B981" }} />
                    <span>Inspection physique des colis en Chine avant expédition</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Lock style={{ width: 14, height: 14, color: "#165491" }} />
                    <span>Paiement sécurisé Mobile Money Bénin (MoMo, Flooz, Celtiis)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  return <CartPageInner />;
}
