"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Truck,
  Car,
  ShieldCheck,
  Check,
} from "lucide-react";
import BottomNav from "./BottomNav";
import { useMobileStore } from "@/lib/mobile-store";

interface CheckoutViewProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export default function CheckoutView({ onBack, onSuccess }: CheckoutViewProps) {
  const {
    deliveryMode,
    setDeliveryMode,
    paymentMode,
    setPaymentMode,
    acceptedTerms,
    setAcceptedTerms,
    finalTotal,
    installmentAmount,
    formatPrice,
    country,
    setActiveScreen,
  } = useMobileStore();

  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const handleValidateOrder = () => {
    if (!acceptedTerms) {
      alert("Veuillez accepter les conditions générales de vente pour continuer.");
      return;
    }

    const ref = `CL-${country.code}-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(ref);
    setOrderConfirmed(true);

    if (onSuccess) {
      onSuccess();
    }
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
          aria-label="Retour au panier"
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
          <h2 style={{ fontSize: 14.5, fontWeight: 700, color: "#0F172A", margin: 0 }}>
            Information de livraison
          </h2>
        </div>
      </div>

      {/* 2. MAIN SCROLLABLE CHECKOUT CONTAINER (WARM BEIGE CANVAS) */}
      <div
        style={{
          flex: 1,
          background: "#FAF7F2", // Exact warm creamy beige from mockup
          overflowY: "auto",
          padding: "16px 14px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* SECTION 1: MODE DE LIVRAISON */}
        <div>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#0F172A",
              margin: "0 0 10px 4px",
            }}
          >
            Mode de livraison
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* OPTION 1: A DOMICILE */}
            <div
              onClick={() => setDeliveryMode("home")}
              style={{
                background: "#FFFFFF",
                borderRadius: 22,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
                border: deliveryMode === "home" ? "1.5px solid #F59E0B" : "1.5px solid transparent",
                transition: "all 0.2s ease",
              }}
            >
              {/* TRUCK ICON (IN DARK CIRCLE) */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#1E293B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  flexShrink: 0,
                }}
              >
                <Truck style={{ width: 22, height: 22 }} />
              </div>

              {/* DETAILS */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A", letterSpacing: 0.2 }}>
                  A DOMICILE
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#94A3B8",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {country.defaultAddress}
                </div>
              </div>

              {/* RADIO BUTTON (AMBER / GOLD RING WHEN SELECTED) */}
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: deliveryMode === "home" ? "2px solid #D97706" : "2px solid #CBD5E1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {deliveryMode === "home" && (
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#D97706",
                    }}
                  />
                )}
              </div>
            </div>

            {/* OPTION 2: DRIVE */}
            <div
              onClick={() => setDeliveryMode("drive")}
              style={{
                background: "#FFFFFF",
                borderRadius: 22,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
                border: deliveryMode === "drive" ? "1.5px solid #F59E0B" : "1.5px solid transparent",
                transition: "all 0.2s ease",
              }}
            >
              {/* CAR / WAREHOUSE ICON */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#1E293B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  flexShrink: 0,
                }}
              >
                <Car style={{ width: 22, height: 22 }} />
              </div>

              {/* DETAILS */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A", letterSpacing: 0.2 }}>
                  DRIVE
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#94A3B8",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {country.defaultDriveHub}
                </div>
              </div>

              {/* RADIO BUTTON */}
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: deliveryMode === "drive" ? "2px solid #D97706" : "2px solid #CBD5E1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {deliveryMode === "drive" && (
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#D97706",
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SUBTLE HORIZONTAL SEPARATOR */}
        <div style={{ height: 1, background: "#E2D9CC", margin: "2px 0" }} />

        {/* SECTION 2: MODE DE PAIEMENT */}
        <div>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#0F172A",
              margin: "0 0 6px 4px",
            }}
          >
            Mode de paiement
          </h3>
          <p
            style={{
              fontSize: 12.5,
              color: "#475569",
              margin: "0 0 12px 4px",
            }}
          >
            Choisissez votre modalité de payement
          </p>

          {/* DUAL TOGGLE SWITCHER (TOTALITÉ vs PAYER EN 4X) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {/* TOTALITÉ */}
            <button
              onClick={() => setPaymentMode("full")}
              style={{
                background: paymentMode === "full" ? "#0F172A" : "#E2E8F0",
                color: paymentMode === "full" ? "#FFFFFF" : "#64748B",
                border: "none",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              TOTALITÉ
            </button>

            {/* PAYER EN 4X (GREEN ACTIVE BUTTON) */}
            <button
              onClick={() => setPaymentMode("4x")}
              style={{
                background: paymentMode === "4x" ? "#16A34A" : "#E2E8F0", // Exact green from mockup
                color: paymentMode === "4x" ? "#FFFFFF" : "#64748B",
                border: "none",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: paymentMode === "4x" ? "0 4px 12px rgba(22, 163, 74, 0.25)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              PAYER EN 4X
            </button>
          </div>

          {/* 4-STEP PROGRESS TIMELINE (WHEN PAYER EN 4X ACTIVE) */}
          {paymentMode === "4x" && (
            <div
              style={{
                background: "transparent",
                padding: "8px 2px 14px",
                position: "relative",
              }}
            >
              {/* CONNECTING PROGRESS LINE */}
              <div
                style={{
                  position: "absolute",
                  top: 17,
                  left: "10%",
                  right: "10%",
                  height: 3,
                  background: "#16A34A",
                  zIndex: 1,
                }}
              />

              {/* 4 STEP NODES */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  textAlign: "center",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {/* STEP 1: AUJOURD'HUI (AMBER RING / DOT) */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#FFFFFF",
                      border: "2px solid #16A34A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: "#E8890C", // Amber dot for active step 1
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#0F172A", lineHeight: 1.2 }}>
                    {formatPrice(installmentAmount)}
                  </div>
                  <div style={{ fontSize: 8.5, color: "#475569", marginTop: 2 }}>Aujourd'hui</div>
                </div>

                {/* STEP 2: DANS 1 MOIS */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#16A34A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#FFFFFF",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#0F172A", lineHeight: 1.2 }}>
                    {formatPrice(installmentAmount)}
                  </div>
                  <div style={{ fontSize: 8.5, color: "#475569", marginTop: 2 }}>dans 1 mois</div>
                </div>

                {/* STEP 3: DANS 2 MOIS */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#16A34A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#FFFFFF",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#0F172A", lineHeight: 1.2 }}>
                    {formatPrice(installmentAmount)}
                  </div>
                  <div style={{ fontSize: 8.5, color: "#475569", marginTop: 2 }}>dans 2 mois</div>
                </div>

                {/* STEP 4: DANS 3 MOIS */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#16A34A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#FFFFFF",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#0F172A", lineHeight: 1.2 }}>
                    {formatPrice(installmentAmount)}
                  </div>
                  <div style={{ fontSize: 8.5, color: "#475569", marginTop: 2 }}>dans 3 mois</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: CHECKBOX CONDITIONS & SUMMARY CARD (WHITE ROUNDED SURFACE) */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 22,
            padding: "16px 18px",
            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* TERMS CHECKBOX */}
          <div
            onClick={() => setAcceptedTerms(!acceptedTerms)}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              cursor: "pointer",
              paddingBottom: 10,
              borderBottom: "1px solid #F1F5F9",
            }}
          >
            {/* DARK CHECKBOX BOX */}
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: acceptedTerms ? "#1E293B" : "#F1F5F9",
                border: acceptedTerms ? "none" : "1.5px solid #CBD5E1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {acceptedTerms && <Check style={{ width: 18, height: 18, strokeWidth: 3 }} />}
            </div>

            {/* LABEL TEXT */}
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#1E293B",
                lineHeight: 1.35,
              }}
            >
              J'ai lu les conditions générales de vente et j'y adhère sans réserve.
            </span>
          </div>

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
            <span style={{ fontWeight: 600, color: "#0F172A" }}>
              {formatPrice(finalTotal)}
            </span>
          </div>

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
              fontWeight: 600,
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

          {/* VALIDATION BUTTON (GREEN BUTTON WITH CHECKMARK) */}
          <button
            onClick={handleValidateOrder}
            style={{
              marginTop: 4,
              background: "#16A34A", // Exact green from mockup
              color: "#FFFFFF",
              border: "none",
              borderRadius: 14,
              padding: "14px 20px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 6px 18px rgba(22, 163, 74, 0.25)",
              transition: "transform 0.15s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#FFFFFF",
                color: "#16A34A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check style={{ width: 14, height: 14, strokeWidth: 3 }} />
            </div>
            <span>Valider</span>
          </button>
        </div>
      </div>

      {/* 3. ORDER CONFIRMATION MODAL CELEBRATION */}
      {orderConfirmed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "26px 20px",
              width: "100%",
              maxWidth: 320,
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              animation: "popIn 0.3s ease-out",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#DCFCE7",
                color: "#16A34A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <ShieldCheck style={{ width: 32, height: 32 }} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0F172A", margin: "0 0 6px" }}>
              Commande Validée !
            </h3>
            <p style={{ fontSize: 12.5, color: "#64748B", margin: "0 0 14px" }}>
              Votre demande a été transmise à notre équipe logistique Chine → {country.name}.
            </p>

            <div
              style={{
                background: "#F8FAFC",
                border: "1px dashed #CBD5E1",
                borderRadius: 12,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 12,
                fontWeight: 700,
                color: "#0F172A",
              }}
            >
              Réf : {orderNumber}
              <div style={{ fontSize: 10.5, color: "#059669", fontWeight: 600, marginTop: 2 }}>
                {paymentMode === "4x"
                  ? `Paiement en 4X : 1ère échéance ${formatPrice(installmentAmount)}`
                  : `Paiement intégral comptant : ${formatPrice(finalTotal)}`}
              </div>
            </div>

            <button
              onClick={() => {
                setOrderConfirmed(false);
                setActiveScreen("cart");
              }}
              style={{
                width: "100%",
                background: "#0F172A",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 12,
                padding: "12px",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      )}

      {/* 4. BOTTOM NAVIGATION BAR */}
      <BottomNav activeScreen="checkout" />
    </div>
  );
}
