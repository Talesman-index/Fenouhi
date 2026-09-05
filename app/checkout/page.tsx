"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plane,
  Ship,
  Truck,
  Car,
  Check,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Lock,
  Globe,
  Coins,
  User,
  LogIn,
  UserPlus,
  Package,
  Clock,
  Warehouse,
  FileCheck2,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MobileStoreProvider, useMobileStore, COUNTRIES, CurrencyCode } from "@/lib/mobile-store";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

function CheckoutPageInner() {
  const router = useRouter();
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
    setCountry,
    currency,
    setCurrency,
    cart,
    clearCart,
  } = useMobileStore();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [freightMode, setFreightMode] = useState<"air" | "sea">("air");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [customAddress, setCustomAddress] = useState(country.defaultAddress);

  // Check Supabase authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          try {
            const { data: prof } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();

            const fn = prof?.first_name || "";
            const ln = prof?.last_name || "";
            const fullName = `${fn} ${ln}`.trim() || user.user_metadata?.full_name || user.email?.split("@")[0] || "Client CargoLink";

            setCurrentUser({
              id: user.id,
              name: fullName,
              email: prof?.email || user.email || "",
              phone: prof?.phone || "+229 97 00 00 00",
              address: prof?.address || country.defaultAddress,
            });
            if (prof?.address) setCustomAddress(prof.address);
          } catch {
            setCurrentUser({
              id: user.id,
              name: user.email?.split("@")[0] || "Client CargoLink",
              email: user.email || "",
              address: country.defaultAddress,
            });
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setLoadingAuth(false);
      }
    }

    checkAuth();
  }, [country]);

  const handleValidate = async () => {
    if (!currentUser) {
      router.push(`/auth/login?redirectTo=${encodeURIComponent("/checkout")}`);
      return;
    }

    if (!acceptedTerms) {
      alert("Veuillez accepter les conditions générales de vente pour valider votre commande.");
      return;
    }

    setSubmittingOrder(true);
    const ref = `CL-${country.code}-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const supabase = createClient();
      await supabase.from("orders").insert([
        {
          order_number: ref,
          user_id: currentUser.id,
          total_amount: finalTotal,
          payment_method: paymentMode === "4x" ? "installments_4x" : "full_cash",
          delivery_mode: `${freightMode.toUpperCase()}_${deliveryMode.toUpperCase()}`,
          delivery_address: deliveryMode === "home" ? customAddress : country.defaultDriveHub,
          destination_country: country.name,
          currency: currency,
          status: "pending_payment",
        },
      ]);
    } catch {
      // Fallback
    } finally {
      setSubmittingOrder(false);
      router.push(`/payment?ref=${ref}&freight=${freightMode}&delivery=${deliveryMode}`);
    }
  };

  if (loadingAuth) {
    return (
      <div style={{ background: "#FAF7F2", minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#64748B", fontSize: 14, fontWeight: 700 }}>
          Vérification de la session sécurisée FENOUHI...
        </div>
      </div>
    );
  }

  // 1. NON-AUTHENTICATED USER GATEWAY
  if (!currentUser) {
    return (
      <div style={{ background: "#FAF7F2", minHeight: "85vh", padding: "40px 16px 80px" }}>
        <div className="container" style={{ maxWidth: 640, margin: "0 auto" }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "40px 32px",
              boxShadow: "0 10px 40px rgba(15, 23, 42, 0.06)",
              border: "1px solid #E2D9CC",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#0F172A",
                color: "#F59E0B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Lock style={{ width: 28, height: 28 }} />
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(245, 158, 11, 0.15)",
                color: "#B45309",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                padding: "4px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 12,
                textTransform: "uppercase",
              }}
            >
              <ShieldCheck style={{ width: 14, height: 14, color: "#D97706" }} />
              <span>Espace Client Sécurisé FENOUHI</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(22px, 3.5vw, 28px)",
                fontWeight: 700,
                color: "#0F172A",
                fontFamily: "'Poppins', sans-serif",
                margin: "0 0 10px",
              }}
            >
              Connexion requise pour le Checkout
            </h1>

            <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px", lineHeight: 1.5 }}>
              Pour garantir la traçabilité de votre expédition Chine ➔ {country.name} et associer votre adresse de livraison, veuillez vous connecter.
            </p>

            {cart.length > 0 && (
              <div
                style={{
                  background: "#FAF7F2",
                  borderRadius: 16,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 28,
                  border: "1px solid #E2D9CC",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Package style={{ width: 20, height: 20, color: "#165491" }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
                      {cart.length} {cart.length > 1 ? "articles conservés" : "article conservé"} dans votre panier
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>
                      Votre panier reste actif après connexion
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#DC2626", fontFamily: "'Poppins', sans-serif" }}>
                  {formatPrice(finalTotal)}
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Link
                href={`/auth/login?redirectTo=${encodeURIComponent("/checkout")}`}
                style={{
                  background: "#0F172A",
                  color: "#FFFFFF",
                  padding: "15px 24px",
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 6px 20px rgba(15, 23, 42, 0.2)",
                }}
              >
                <LogIn style={{ width: 18, height: 18 }} />
                <span>Se connecter à mon compte</span>
              </Link>

              <Link
                href={`/auth/sign-up?redirectTo=${encodeURIComponent("/checkout")}`}
                style={{
                  background: "#FFFFFF",
                  color: "#0F172A",
                  border: "1.5px solid #CBD5E1",
                  padding: "14px 24px",
                  borderRadius: 14,
                  fontSize: 14.5,
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <UserPlus style={{ width: 18, height: 18 }} />
                <span>Créer un compte client FENOUHI</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED USER CHECKOUT
  return (
    <div style={{ background: "#FAF7F2", minHeight: "85vh", padding: "24px 0 60px" }}>
      <div className="container" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px" }}>
        
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
            {/* STEP 1 */}
            <Link href="/cart" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: "50%", background: "#16A34A", color: "#FFF", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, aspectRatio: "1/1" }}>
                ✓
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#16A34A" }} className="desktop-only">1. Mon Panier</span>
            </Link>

            {/* STEP 2 (ACTIVE) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: "50%", background: "#0F172A", color: "#FFFFFF", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, aspectRatio: "1/1", boxShadow: "0 0 0 3px rgba(15, 23, 42, 0.15)" }}>
                2
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A" }}>2. Fret & Livraison</span>
            </div>

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

        {/* TOP BREADCRUMB & REGION CONTROLS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/cart"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "#165491",
                textDecoration: "none",
              }}
            >
              <ArrowLeft style={{ width: 15, height: 15 }} />
              <span>Retour au panier</span>
            </Link>
            <span style={{ color: "#CBD5E1" }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
              Étape 2 : Mode de Fret & Adresse de Livraison
            </span>
          </div>


        </div>

        {/* LOGGED IN USER STATUS BANNER */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2D9CC",
            borderRadius: 16,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#0F172A",
                color: "#F59E0B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              <User style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A" }}>
                Client connecté : {currentUser.name}
              </div>
              <div style={{ fontSize: 11.5, color: "#64748B" }}>
                {currentUser.email} • {currentUser.phone}
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#ECFDF5",
              color: "#065F46",
              border: "1px solid #A7F3D0",
              padding: "5px 12px",
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <ShieldCheck style={{ width: 14, height: 14, color: "#10B981" }} />
            <span>Compte vérifié FENOUHI</span>
          </div>
        </div>

        {/* CARGOLINK 4-STEP LOGISTICS PROCESS VISUALIZER */}
        <div
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #165491 100%)",
            borderRadius: 20,
            padding: "20px 24px",
            color: "#FFFFFF",
            marginBottom: 24,
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#38BDF8" }}>
                Processus Logistique FENOUHI
              </span>
            </div>
            <span style={{ fontSize: 11.5, color: "#94A3B8" }}>Traçabilité 100% garantie Chine ➔ {country.name}</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {[
              {
                step: "1",
                title: "Sourcing & Usine",
                desc: "Inspection qualité en Chine",
                icon: <Warehouse style={{ width: 16, height: 16, color: "#F59E0B" }} />,
              },
              {
                step: "2",
                title: freightMode === "air" ? "Fret Aérien Express" : "Fret Maritime Groupé",
                desc: freightMode === "air" ? "Vol direct (5-12j)" : "Conteneur scellé (40-65j)",
                icon: freightMode === "air" ? <Plane style={{ width: 16, height: 16, color: "#38BDF8" }} /> : <Ship style={{ width: 16, height: 16, color: "#06B6D4" }} />,
              },
              {
                step: "3",
                title: "Dédouanement Inclus",
                desc: "Formalités & taxes gérées",
                icon: <FileCheck2 style={{ width: 16, height: 16, color: "#10B981" }} />,
              },
              {
                step: "4",
                title: deliveryMode === "home" ? "Livraison Domicile" : "Retrait Hub Agence",
                desc: `Arrivée à ${country.defaultCity}`,
                icon: <Truck style={{ width: 16, height: 16, color: "#F59E0B" }} />,
              },
            ].map((p, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(255, 255, 255, 0.07)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 14,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {p.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#FFFFFF" }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-COLUMN CHECKOUT GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* LEFT COLUMN: FREIGHT, DELIVERY & PAYMENT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, gridColumn: "span 2" }}>
            
            {/* STEP 1: CHOIX DU FRET INTERNATIONAL (CHINE -> AFRIQUE) */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                padding: "22px 24px",
                border: "1px solid #E2D9CC",
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#0F172A",
                    fontFamily: "'Poppins', sans-serif",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#0F172A",
                      color: "#FFFFFF",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    1
                  </span>
                  Mode de Fret International (Chine ➔ Afrique)
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
                {/* AIR FREIGHT */}
                <div
                  onClick={() => setFreightMode("air")}
                  style={{
                    background: freightMode === "air" ? "#F0F9FF" : "#FFFFFF",
                    borderRadius: 16,
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    border: freightMode === "air" ? "2px solid #0284C7" : "1.5px solid #E2E8F0",
                    boxShadow: freightMode === "air" ? "0 4px 16px rgba(2, 132, 199, 0.12)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: freightMode === "air" ? "#0284C7" : "#F1F5F9",
                      color: freightMode === "air" ? "#FFFFFF" : "#0284C7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Plane style={{ width: 22, height: 22 }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
                        Fret Aérien Express
                      </span>
                      <span
                        style={{
                          background: "#0284C7",
                          color: "#FFFFFF",
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        5 - 12 jours
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
                      Idéal électronique, mode & colis prioritaires
                    </div>
                  </div>

                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: freightMode === "air" ? "2px solid #0284C7" : "2px solid #CBD5E1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {freightMode === "air" && (
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#0284C7" }} />
                    )}
                  </div>
                </div>

                {/* SEA FREIGHT */}
                <div
                  onClick={() => setFreightMode("sea")}
                  style={{
                    background: freightMode === "sea" ? "#ECFEFF" : "#FFFFFF",
                    borderRadius: 16,
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    border: freightMode === "sea" ? "2px solid #0891B2" : "1.5px solid #E2E8F0",
                    boxShadow: freightMode === "sea" ? "0 4px 16px rgba(8, 145, 178, 0.12)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: freightMode === "sea" ? "#0891B2" : "#F1F5F9",
                      color: freightMode === "sea" ? "#FFFFFF" : "#0891B2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Ship style={{ width: 22, height: 22 }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
                        Fret Maritime Groupé
                      </span>
                      <span
                        style={{
                          background: "#0891B2",
                          color: "#FFFFFF",
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        40 - 65 jours
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
                      Économique pour gros volumes & machinerie
                    </div>
                  </div>

                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: freightMode === "sea" ? "2px solid #0891B2" : "2px solid #CBD5E1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {freightMode === "sea" && (
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#0891B2" }} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: MODE DE LIVRAISON LOCALE AU BÉNIN */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                padding: "22px 24px",
                border: "1px solid #E2D9CC",
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
              }}
            >
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#0F172A",
                  fontFamily: "'Poppins', sans-serif",
                  margin: "0 0 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#0F172A",
                    color: "#FFFFFF",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  2
                </span>
                Réception & Livraison locale au Bénin
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 16 }}>
                {/* HOME DELIVERY */}
                <div
                  onClick={() => setDeliveryMode("home")}
                  style={{
                    background: deliveryMode === "home" ? "#FFFBEB" : "#FFFFFF",
                    borderRadius: 16,
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    border: deliveryMode === "home" ? "2px solid #F59E0B" : "1.5px solid #E2E8F0",
                    boxShadow: deliveryMode === "home" ? "0 4px 16px rgba(245, 158, 11, 0.12)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: deliveryMode === "home" ? "#F59E0B" : "#F1F5F9",
                      color: deliveryMode === "home" ? "#FFFFFF" : "#F59E0B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Truck style={{ width: 22, height: 22 }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
                      LIVRAISON À DOMICILE / BUREAU
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
                      {customAddress}
                    </div>
                  </div>

                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: deliveryMode === "home" ? "2px solid #D97706" : "2px solid #CBD5E1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {deliveryMode === "home" && (
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#D97706" }} />
                    )}
                  </div>
                </div>

                {/* DRIVE / HUB */}
                <div
                  onClick={() => setDeliveryMode("drive")}
                  style={{
                    background: deliveryMode === "drive" ? "#FFFBEB" : "#FFFFFF",
                    borderRadius: 16,
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    border: deliveryMode === "drive" ? "2px solid #F59E0B" : "1.5px solid #E2E8F0",
                    boxShadow: deliveryMode === "drive" ? "0 4px 16px rgba(245, 158, 11, 0.12)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: deliveryMode === "drive" ? "#F59E0B" : "#F1F5F9",
                      color: deliveryMode === "drive" ? "#FFFFFF" : "#F59E0B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Car style={{ width: 22, height: 22 }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
                      RETRAIT HUB / AGENCE BÉNIN
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
                      {country.defaultDriveHub}
                    </div>
                  </div>

                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: deliveryMode === "drive" ? "2px solid #D97706" : "2px solid #CBD5E1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {deliveryMode === "drive" && (
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#D97706" }} />
                    )}
                  </div>
                </div>
              </div>

              {/* BENIN CITY QUICK CHIPS */}
              <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#475569" }}>Villes desservies :</span>
                {["Cotonou", "Abomey-Calavi", "Porto-Novo", "Parakou", "Bohicon", "Ouidah"].map((city) => (
                  <span
                    key={city}
                    onClick={() => {
                      if (deliveryMode === "home") {
                        setCustomAddress(`${city} - Quartier résidentiel`);
                      }
                    }}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#0F172A",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <MapPin style={{ width: 12, height: 12, color: "#EA580C" }} />
                    <span>{city}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* STEP 3: MODALITÉ DE PAIEMENT & MOBILE MONEY BÉNIN */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                padding: "20px 22px",
                border: "1.5px solid #E2E8F0",
                boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.04)",
              }}
            >
              <h2
                style={{
                  fontSize: 16.5,
                  fontWeight: 700,
                  color: "#0F172A",
                  margin: "0 0 4px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "#0F172A",
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  3
                </span>
                Modalité de paiement sécurisé au Bénin
              </h2>
              <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 16px", paddingLeft: 36, lineHeight: 1.45 }}>
                Paiement direct sécurisé par Mobile Money Bénin (MTN MoMo ou Moov Money).
              </p>

              {/* DIRECT PAYMENT AMOUNT SUMMARY */}
              <div
                style={{
                  background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
                  border: "1px solid #CBD5E1",
                  borderRadius: 16,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <div style={{ flex: "1 1 180px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Mode de Règlement
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <ShieldCheck style={{ width: 18, height: 18, color: "#16A34A", flexShrink: 0 }} />
                    <span>Paiement Direct Sécurisé</span>
                  </div>
                </div>
                <div style={{ flex: "0 1 auto" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 3 }}>
                    Total à régler :
                  </div>
                  <div
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FCA5A5",
                      padding: "5px 12px",
                      borderRadius: 10,
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#DC2626",
                      fontFamily: "'Poppins', sans-serif",
                      letterSpacing: "-0.02em",
                      boxShadow: "0 2px 6px rgba(220, 38, 38, 0.08)",
                      display: "inline-block",
                    }}
                  >
                    {formatPrice(finalTotal)}
                  </div>
                </div>
              </div>

              {/* BENIN PAYMENT OPERATORS BADGES */}
              <div
                style={{
                  paddingTop: 14,
                  borderTop: "1px solid #E2E8F0",
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>
                  Moyens acceptés au Bénin :
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #FEFCE8 0%, #FEF9C3 100%)",
                      border: "1.5px solid #FDE047",
                      color: "#713F12",
                      padding: "10px 12px",
                      borderRadius: 12,
                      fontSize: 12.5,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 2px 6px rgba(234, 179, 8, 0.12)",
                    }}
                  >
                    <img src="/images/payments/mtn.png" alt="MTN" style={{ height: 16, width: "auto", objectFit: "contain" }} />
                    <span>MTN Mobile Money</span>
                  </div>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
                      border: "1.5px solid #93C5FD",
                      color: "#1E40AF",
                      padding: "10px 12px",
                      borderRadius: 12,
                      fontSize: 12.5,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 2px 6px rgba(59, 130, 246, 0.12)",
                    }}
                  >
                    <img src="/images/payments/moov_africa_official.png" alt="Moov" style={{ height: 16, width: "auto", objectFit: "contain" }} />
                    <span>Moov Money (Flooz)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4: CGV & VALIDATION */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                padding: "20px 24px",
                border: "1px solid #E2D9CC",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                onClick={() => setAcceptedTerms(!acceptedTerms)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: acceptedTerms ? "#0F172A" : "#F1F5F9",
                    border: acceptedTerms ? "none" : "1.5px solid #CBD5E1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  {acceptedTerms && <Check style={{ width: 16, height: 16, strokeWidth: 3 }} />}
                </div>

                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A" }}>
                  J'ai lu les conditions générales de vente FENOUHI et j'y adhère sans réserve.
                </span>
              </div>

              <button
                onClick={handleValidate}
                disabled={submittingOrder}
                style={{
                  background: "#16A34A",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 14,
                  padding: "16px 28px",
                  fontSize: 15.5,
                  fontWeight: 600,
                  cursor: submittingOrder ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: "0 6px 20px rgba(22, 163, 74, 0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                <span>
                  {submittingOrder
                    ? "Préparation du paiement..."
                    : `Procéder au Paiement (${paymentMode === "4x" ? `${formatPrice(installmentAmount)} aujourd'hui` : formatPrice(finalTotal)})`}
                </span>
                <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: RECAP & ASSURANCE */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              padding: "24px",
              border: "1px solid #E2D9CC",
              boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                Détail de la commande ({cart.length})
              </h3>
              <span
                style={{
                  background: "#F1F5F9",
                  color: "#0F172A",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 6,
                }}
              >
                {country.name}
              </span>
            </div>

            {/* CART ITEMS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 240, overflowY: "auto" }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      background: "#F8FAFC",
                      objectFit: "contain",
                      padding: 2,
                      border: "1px solid #E2E8F0",
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/assets/placeholder_product.svg";
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>Qté : {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A" }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: "#F1F5F9" }} />

            {/* FREIGHT & LOGISTICS BREAKDOWN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#475569" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Sous-total Usines</span>
                <span style={{ fontWeight: 600, color: "#0F172A" }}>{formatPrice(finalTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Fret ({freightMode === "air" ? "Aérien Express" : "Maritime Groupé"})</span>
                <span style={{ fontWeight: 600, color: "#0284C7" }}>Inclus</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Dédouanement & Taxes</span>
                <span style={{ fontWeight: 600, color: "#16A34A" }}>100% Inclus</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Livraison {deliveryMode === "home" ? "à Domicile" : "au Hub"}</span>
                <span style={{ fontWeight: 600, color: "#16A34A" }}>Gratuit</span>
              </div>
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
                borderTop: "1.5px solid #F1F5F9",
              }}
            >
              <span>TOTAL TTC</span>
              <span style={{ fontSize: 20, color: "#DC2626", fontFamily: "'Poppins', sans-serif" }}>
                {formatPrice(finalTotal)}
              </span>
            </div>

            {/* ASSURANCE BADGE */}
            <div
              style={{
                background: "#FAF7F2",
                borderRadius: 14,
                padding: "14px",
                fontSize: 11.5,
                color: "#64748B",
                border: "1px solid #E2D9CC",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0F172A", fontWeight: 600 }}>
                <ShieldCheck style={{ width: 16, height: 16, color: "#16A34A" }} />
                <span>Garantie FENOUHI 100% Sécurisé</span>
              </div>
              <div>
                Fournisseurs d'usines certifiés, contrôle qualité avant embarquement et dédouanement tout-en-un.
              </div>
            </div>
          </div>
        </div>

        {/* ORDER SUCCESS POPUP */}
        {orderConfirmed && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(6px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 24,
                padding: "36px 32px",
                maxWidth: 460,
                width: "100%",
                textAlign: "center",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: "#DCFCE7",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <ShieldCheck style={{ width: 38, height: 38 }} />
              </div>

              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>
                Commande Confirmée !
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 18px", lineHeight: 1.4 }}>
                Merci <strong>{currentUser.name}</strong>. Votre dossier logistique Chine ➔ {country.name} ({freightMode === "air" ? "Fret Aérien Express" : "Fret Maritime Groupé"}) a été enregistré avec succès.
              </p>

              <div
                style={{
                  background: "#FAF7F2",
                  border: "1px dashed #CBD5E1",
                  borderRadius: 14,
                  padding: "14px 18px",
                  marginBottom: 24,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                N° de Suivi : {orderRef}
                <div style={{ fontSize: 12, color: "#059669", fontWeight: 700, marginTop: 4 }}>
                  {paymentMode === "4x"
                    ? `Paiement en 4X : 1ère mensualité ${formatPrice(installmentAmount)} validée`
                    : `Paiement comptant intégral : ${formatPrice(finalTotal)}`}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <Link
                  href="/dashboard?tab=orders"
                  style={{
                    flex: 1,
                    background: "#0F172A",
                    color: "#FFFFFF",
                    borderRadius: 12,
                    padding: "14px 18px",
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <span>Suivre ma commande</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>

                <Link
                  href="/catalog"
                  style={{
                    background: "#F1F5F9",
                    color: "#0F172A",
                    borderRadius: 12,
                    padding: "14px 18px",
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Catalogue
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <CheckoutPageInner />;
}

