"use client";

import React, { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import TrackingTimeline from "@/components/TrackingTimeline";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  PlusCircle,
  FileText,
  ShoppingBag,
  Truck,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Package,
  User,
  MapPin,
  PhoneCall,
  Check,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { Profile } from "@/types/supabase";
import DemoBanner from "@/components/DemoBanner";

function DashboardContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "orders");
  const [profile, setProfile] = useState<Profile | null>(null);

  // Profile Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [accountType, setAccountType] = useState("individual");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          const prof = data as Profile;
          setProfile(prof);
          setFirstName(prof.first_name || "");
          setLastName(prof.last_name || "");
          setPhone(prof.phone || "");
          setCity(prof.city || "Cotonou");
          setCountry(prof.country || "Bénin");
          setAccountType(prof.account_type || "individual");
        }
      }
    }

    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({
            first_name: firstName,
            last_name: lastName,
            phone,
            city,
            country,
            account_type: accountType,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        setProfile((prev) =>
          prev
            ? {
                ...prev,
                first_name: firstName,
                last_name: lastName,
                phone,
                city,
                country,
                account_type: accountType as any,
              }
            : null
        );

        setSuccessMsg("Votre profil a été mis à jour avec succès !");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error("Save profile error", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DemoBanner userEmail={profile?.email} />

      <div
        style={{
          padding: "24px 0 80px",
          background: "#FAF7F2",
          minHeight: "85vh",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <div
          className="container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}
        >
          {/* 1. TOP HEADER BANNER CARD */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "24px 28px",
              border: "1px solid #EAE5DC",
              boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(22, 84, 145, 0.08)",
                    color: "#165491",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: 800,
                    marginBottom: 8,
                    letterSpacing: "0.5px",
                  }}
                >
                  <ShieldCheck style={{ width: 14, height: 14, color: "#165491" }} />
                  <span>ESPACE CLIENT & SUIVI LOGISTIQUE FENOUHIMIN</span>
                </div>

                <h1
                  style={{
                    color: "#0F172A",
                    fontSize: "clamp(22px, 4vw, 28px)",
                    margin: "0 0 6px",
                    fontWeight: 900,
                    fontFamily: "'Outfit', sans-serif",
                    lineHeight: 1.2,
                  }}
                >
                  Mon Compte
                </h1>

                <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                  Bienvenue <strong style={{ color: "#0F172A" }}>{profile ? `${profile.first_name} ${profile.last_name}` : "Client FENOUHIMIN"}</strong> • Compte : <strong style={{ color: "#165491" }}>{profile?.account_type || "Particulier"}</strong>
                </p>
              </div>

              <Link
                href="/catalog"
                style={{
                  background: "#0F172A",
                  color: "#FFFFFF",
                  padding: "12px 24px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.2)",
                }}
              >
                <ShoppingBag style={{ width: 16, height: 16 }} />
                <span>Boutique & Catalogue</span>
              </Link>
            </div>
          </div>

          {/* 2. MAIN 2-COLUMN DASHBOARD GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              alignItems: "start",
            }}
          >
            {/* SIDEBAR TABS */}
            <div style={{ minWidth: 260 }}>
              <DashboardSidebar
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                profile={profile}
              />
            </div>

            {/* MAIN TAB CONTENT AREA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20, gridColumn: "span 2" }}>
              {/* TAB 1: MES COMMANDES */}
              {activeTab === "orders" && (
                <>
                  {/* ACTIVE ORDER CARD */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 22,
                      padding: "24px",
                      border: "1px solid #EAE5DC",
                      boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 12,
                        marginBottom: 16,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            background: "#ECFDF5",
                            color: "#059669",
                            border: "1px solid #A7F3D0",
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 800,
                            display: "inline-block",
                            marginBottom: 8,
                          }}
                        >
                          EN TRANSIT AÉRIEN (5-12J)
                        </span>

                        <h3
                          style={{
                            fontSize: 18,
                            fontWeight: 900,
                            color: "#0F172A",
                            margin: 0,
                            fontFamily: "'Outfit', sans-serif",
                          }}
                        >
                          50 Casques Bluetooth ANC SoundBass Pro
                        </h3>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "#64748B" }}>Référence Commande</div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "#0F172A" }}>
                          CMD-2026-45892
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#FAF7F2",
                        padding: "14px 18px",
                        borderRadius: 14,
                        border: "1px solid #E2D9CC",
                        fontSize: 13,
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 12,
                        color: "#475569",
                      }}
                    >
                      <div>
                        <strong style={{ color: "#0F172A" }}>Mode :</strong> Fret Aérien Express
                      </div>
                      <div>
                        <strong style={{ color: "#0F172A" }}>Départ :</strong> Hub Guangzhou
                      </div>
                      <div>
                        <strong style={{ color: "#0F172A" }}>Arrivée Estimée :</strong> 26 Juillet 2026
                      </div>
                    </div>
                  </div>

                  {/* TRACKING TIMELINE */}
                  <TrackingTimeline currentStep={9} trackingNumber="CMD-2026-45892" />
                </>
              )}

              {/* TAB 2: DEVIS À VALIDER */}
              {activeTab === "quotes" && (
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 22,
                    padding: "24px",
                    border: "1px solid #EAE5DC",
                    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          background: "#FEF3C7",
                          color: "#92400E",
                          border: "1px solid #FDE68A",
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 800,
                          display: "inline-block",
                          marginBottom: 8,
                        }}
                      >
                        DEVIS PRÊT À VALIDER
                      </span>

                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: "#0F172A",
                          margin: 0,
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        Devis N° DEV-2026-9410
                      </h3>
                    </div>

                    <span
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: "#DC2626",
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      205 000 FCFA
                    </span>
                  </div>

                  <p style={{ fontSize: 13.5, color: "#475569", marginBottom: 20, lineHeight: 1.5 }}>
                    Produit : 20 Montres Connectées SmartFit Pro X • Mode : Fret Aérien Express vers Cotonou.
                  </p>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link
                      href="/payment?quote_id=DEV-2026-9410"
                      style={{
                        background: "#0F172A",
                        color: "#FFFFFF",
                        padding: "14px 24px",
                        borderRadius: 14,
                        fontSize: 14,
                        fontWeight: 800,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.2)",
                        flex: 1,
                        minWidth: 220,
                      }}
                    >
                      <span>Valider & Payer par Mobile Money</span>
                      <ArrowRight style={{ width: 16, height: 16 }} />
                    </Link>

                    <Link
                      href="/contact"
                      style={{
                        background: "#F1F5F9",
                        color: "#0F172A",
                        padding: "14px 24px",
                        borderRadius: 14,
                        fontSize: 14,
                        fontWeight: 800,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <span>Discuter sur WhatsApp</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 3: PROFIL & ADRESSES */}
              {activeTab === "profile" && (
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 22,
                    padding: "28px",
                    border: "1px solid #EAE5DC",
                    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 20,
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: "#0F172A",
                          margin: "0 0 4px",
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        Mon Profil & Coordonnées
                      </h3>
                      <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                        Modifiez vos coordonnées de livraison et vos informations personnelles.
                      </p>
                    </div>

                    <span
                      style={{
                        background: "#EFF6FF",
                        color: "#165491",
                        fontSize: 11.5,
                        fontWeight: 800,
                        padding: "4px 12px",
                        borderRadius: 999,
                      }}
                    >
                      {accountType === "business"
                        ? "Entreprise / PME"
                        : accountType === "reseller"
                        ? "Revendeur"
                        : "Particulier"}
                    </span>
                  </div>

                  {successMsg && (
                    <div
                      style={{
                        background: "#ECFDF5",
                        border: "1px solid #A7F3D0",
                        color: "#065F46",
                        padding: "12px 16px",
                        borderRadius: 12,
                        marginBottom: 20,
                        fontSize: 13,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <CheckCircle2 style={{ width: 18, height: 18, color: "#10B981" }} />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                          PRÉNOM *
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Ex: Serge"
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: 12,
                            border: "1.5px solid #E2E8F0",
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: "#0F172A",
                            outline: "none",
                            background: "#F8FAFC",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                          NOM *
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Ex: Mensah"
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: 12,
                            border: "1.5px solid #E2E8F0",
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: "#0F172A",
                            outline: "none",
                            background: "#F8FAFC",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                          ADRESSE EMAIL (NON MODIFIABLE)
                        </label>
                        <input
                          type="email"
                          disabled
                          value={profile?.email || "client@fenouhimin.com"}
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: 12,
                            border: "1.5px solid #E2E8F0",
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: "#64748B",
                            background: "#F1F5F9",
                            cursor: "not-allowed",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                          TÉLÉPHONE WHATSAPP *
                        </label>
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+229 97 00 00 00"
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: 12,
                            border: "1.5px solid #E2E8F0",
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: "#0F172A",
                            outline: "none",
                            background: "#F8FAFC",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                          VILLE DE LIVRAISON *
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Ex: Cotonou"
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: 12,
                            border: "1.5px solid #E2E8F0",
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: "#0F172A",
                            outline: "none",
                            background: "#F8FAFC",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                          PAYS DE DESTINATION *
                        </label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: 12,
                            border: "1.5px solid #E2E8F0",
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: "#0F172A",
                            outline: "none",
                            background: "#F8FAFC",
                          }}
                        >
                          <option value="Bénin">Bénin</option>
                          <option value="Togo">Togo</option>
                          <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                          <option value="Sénégal">Sénégal</option>
                          <option value="Cameroun">Cameroun</option>
                          <option value="Niger">Niger</option>
                          <option value="Mali">Mali</option>
                          <option value="Burkina Faso">Burkina Faso</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <button
                        type="submit"
                        disabled={saving}
                        style={{
                          background: "#0F172A",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: 12,
                          padding: "14px 28px",
                          fontSize: 14,
                          fontWeight: 800,
                          cursor: saving ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          boxShadow: "0 4px 16px rgba(15, 23, 42, 0.2)",
                        }}
                      >
                        {saving ? "Enregistrement..." : "Enregistrer les Modifications"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* OTHER TABS FALLBACK */}
              {activeTab !== "orders" && activeTab !== "quotes" && activeTab !== "profile" && (
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 22,
                    padding: "36px 20px",
                    textAlign: "center",
                    border: "1px solid #EAE5DC",
                  }}
                >
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
                    Section en cours de synchronisation
                  </h3>
                  <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                    Vos données FENOUHIMIN sont mises à jour en temps réel.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div
          style={{
            padding: "80px 0",
            textAlign: "center",
            fontWeight: 800,
            color: "#0F172A",
            background: "#FAF7F2",
            minHeight: "80vh",
          }}
        >
          Chargement de l'Espace Client FENOUHIMIN...
        </div>
      }
    >
      <DashboardContent />
    </React.Suspense>
  );
}
