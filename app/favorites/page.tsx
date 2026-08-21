"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { MobileStoreProvider, useMobileStore } from "@/lib/mobile-store";

function FavoritesPageInner() {
  const {
    favorites,
    toggleFavorite,
    addToCart,
    addAllFavoritesToCart,
    formatPrice,
    country,
  } = useMobileStore();

  const [addedIds, setAddedIds] = useState<{ [key: string]: boolean }>({});
  const [toastMsg, setToastMsg] = useState(false);

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
    setToastMsg(true);
    setTimeout(() => {
      setToastMsg(false);
    }, 3000);
  };

  return (
    <div style={{ background: "var(--bg-main, #FAF7F2)", minHeight: "85vh", padding: "32px 0 60px" }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        
        {/* BREADCRUMB */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
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
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Mes Favoris</span>
        </div>

        {/* HEADER & TOP ACTIONS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            paddingBottom: 16,
            borderBottom: "1px solid #E2D9CC",
            marginBottom: 28,
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
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Heart style={{ width: 24, height: 24, fill: "#DC2626", color: "#DC2626" }} />
              <span>Mes Favoris ({favorites.length})</span>
            </h1>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
              Vos articles sauvegardés pour de futures commandes vers {country.name}.
            </p>
          </div>

          {favorites.length > 0 && (
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleAddAll}
                style={{
                  background: "#0F172A",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 20px",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ShoppingCart style={{ width: 16, height: 16 }} />
                <span>Ajouter tout au panier</span>
              </button>
            </div>
          )}
        </div>

        {/* TOAST MESSAGE */}
        {toastMsg && (
          <div
            style={{
              background: "#ECFDF5",
              color: "#065F46",
              borderRadius: 12,
              padding: "12px 18px",
              marginBottom: 20,
              fontSize: 13.5,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(16, 185, 129, 0.15)",
            }}
          >
            <Check style={{ width: 16, height: 16 }} />
            <span>Tous vos favoris ont été transférés dans votre panier !</span>
            <Link href="/cart" style={{ color: "#047857", textDecoration: "underline", marginLeft: 6 }}>
              Voir mon panier ➔
            </Link>
          </div>
        )}

        {/* EMPTY STATE */}
        {favorites.length === 0 ? (
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
                color: "#DC2626",
              }}
            >
              <Heart style={{ width: 32, height: 32, fill: "#DC2626" }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0F172A", margin: "0 0 8px" }}>
              Aucun favori enregistré
            </h2>
            <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px" }}>
              Enregistrez vos produits coups de cœur lors de votre navigation.
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
              <span>Parcourir les univers usines</span>
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        ) : (
          /* RESPONSIVE GRID OF FAVORITES */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {favorites.map((item) => {
              const added = addedIds[item.id];
              const oldPrice = item.oldPrice || item.price * 1.15;

              return (
                <div
                  key={item.id}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 22,
                    padding: "20px",
                    boxShadow: "0 2px 14px rgba(15, 23, 42, 0.03)",
                    border: "1px solid #EAE5DC",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  {/* REMOVE FAVORITE BUTTON */}
                  <button
                    onClick={() => toggleFavorite(item)}
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      background: "#FEF2F2",
                      border: "none",
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      color: "#DC2626",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 2,
                    }}
                    title="Retirer des favoris"
                  >
                    <Heart style={{ width: 17, height: 17, fill: "#DC2626" }} />
                  </button>

                  {/* THUMBNAIL */}
                  <div
                    style={{
                      width: "100%",
                      height: 180,
                      borderRadius: 16,
                      background: "#F8FAFC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        maxHeight: "85%",
                        maxWidth: "85%",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/assets/hero_iphone16.png";
                      }}
                    />
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 700, color: "#165491", textTransform: "uppercase" }}>
                    {item.category}
                  </span>

                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#0F172A",
                      margin: "4px 0 10px",
                      lineHeight: 1.3,
                      minHeight: 40,
                    }}
                  >
                    {item.name}
                  </h3>

                  {/* PRICE & ADD TO CART BUTTON */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "auto",
                      paddingTop: 12,
                      borderTop: "1px solid #F1F5F9",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11.5, color: "#94A3B8", textDecoration: "line-through" }}>
                        {formatPrice(oldPrice)}
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: "#DC2626", fontFamily: "'Poppins', sans-serif" }}>
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      style={{
                        background: added ? "#10B981" : "#0F172A",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: 12,
                        padding: "9px 16px",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {added ? (
                        <>
                          <Check style={{ width: 14, height: 14 }} />
                          <span>Ajouté !</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart style={{ width: 14, height: 14 }} />
                          <span>Panier</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return <FavoritesPageInner />;
}
