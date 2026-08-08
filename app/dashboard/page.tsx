"use client";

import React, { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import TrackingTimeline from "@/components/TrackingTimeline";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PlusCircle, FileText, ShoppingBag, Truck, ArrowRight, ShieldCheck, Clock, CheckCircle2, Package } from "lucide-react";
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
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);

        setProfile(prev => prev ? {
          ...prev,
          first_name: firstName,
          last_name: lastName,
          phone,
          city,
          country,
          account_type: accountType as any
        } : null);

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
      <div style={{ padding: "20px 0 60px", background: "var(--bg-main)", minHeight: "80vh", overflowX: "hidden" }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", paddingLeft: 16, paddingRight: 16, boxSizing: "border-box" }}>
        
        {/* ELEGANT RESPONSIVE TOP HEADER BAR */}
        <div className="dashboard-header-bar" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(22, 84, 145, 0.08)", color: "#165491", padding: "4px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 800, marginBottom: 8, letterSpacing: "0.5px" }}>
                <Package style={{ width: 14, height: 14 }} /> PORTAIL CLIENT CARGOLINK
              </div>
              <h1 style={{ color: "#0F172A", fontSize: "clamp(20px, 4vw, 26px)", margin: 0, fontWeight: 900, lineHeight: 1.25, wordBreak: "break-word" }}>
                Espace Client & Suivi Logistique
              </h1>
              <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0", lineHeight: 1.4, wordBreak: "break-word" }}>
                Bienvenue <strong style={{ color: "#0F172A" }}>{profile ? `${profile.first_name} ${profile.last_name}` : "Client"}</strong> • Compte : <strong style={{ color: "var(--orange-primary)" }}>{profile?.account_type || "Particulier"}</strong>
              </p>
            </div>

            <Link 
              href="/catalog" 
              className="btn btn-primary dashboard-header-cta" 
              style={{ borderRadius: 9999, padding: "10px 22px", fontSize: 13, fontWeight: 900, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6, background: "var(--navy-dark)", color: "#FFF", flexShrink: 0 }}
            >
              <ShoppingBag style={{ width: 16 }} /> Retour à la Boutique
            </Link>
          </div>
        </div>

        {/* RESPONSIVE DASHBOARD LAYOUT GRID */}
        <div className="dashboard-grid-layout" style={{ maxWidth: "100%", overflow: "hidden" }}>
          {/* SIDEBAR (STACKS TOP ON MOBILE WITH HORIZONTAL TABS) */}
          <DashboardSidebar activeTab={activeTab} onSelectTab={setActiveTab} profile={profile} />

          {/* MAIN TAB CONTENT */}
          <div style={{ display: "flex", gap: 16, flexDirection: "column", minWidth: 0, width: "100%" }}>
            
            {activeTab === "orders" && (
              <>
                {/* ACTIVE ORDER SUMMARY CARD */}
                <div className="card" style={{ padding: "18px 16px", overflow: "hidden", maxWidth: "100%", boxSizing: "border-box" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span className="badge" style={{ background: "var(--green-bg)", color: "var(--green-success)", marginBottom: 4, fontSize: 11 }}>
                        EN TRANSIT AÉRIEN
                      </span>
                      <h3 style={{ fontSize: "clamp(15px, 4vw, 17px)", fontWeight: 900, color: "var(--navy-dark)", margin: 0, wordBreak: "break-word" }}>
                        50 Casques Bluetooth ANC SoundBass
                      </h3>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Référence Commande</div>
                      <div style={{ fontSize: 13.5, fontWeight: 900, color: "var(--navy-dark)" }}>CMD-2026-45892</div>
                    </div>
                  </div>

                  <div className="dashboard-summary-grid" style={{ background: "var(--bg-main)", padding: 12, borderRadius: 10, border: "1px solid var(--border-light)", fontSize: 12.5, gap: 8 }}>
                    <div><strong>Mode :</strong> Fret Aérien Express</div>
                    <div><strong>Départ :</strong> Hub Logistique International</div>
                    <div><strong>Arrivée Estimée :</strong> 26 Juillet 2026</div>
                  </div>
                </div>

                {/* TRACKING TIMELINE COMPONENT */}
                <TrackingTimeline currentStep={9} trackingNumber="CMD-2026-45892" />
              </>
            )}

            {activeTab === "quotes" && (
              <div className="card" style={{ padding: "18px 16px", overflow: "hidden", maxWidth: "100%", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 4, fontSize: 11 }}>DEVIS PRÊT À VALIDER</span>
                    <h3 style={{ fontSize: "clamp(15px, 4vw, 17px)", fontWeight: 900, color: "var(--navy-dark)", margin: 0, wordBreak: "break-word" }}>Réf: DEV-2026-9410</h3>
                  </div>
                  <span style={{ fontSize: 17, fontWeight: 900, color: "var(--orange-primary)", flexShrink: 0 }}>205 000 FCFA</span>
                </div>

                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5, wordBreak: "break-word" }}>
                  Produit : 20 Montres Connectées SmartFit Pro X • Mode : Fret Aérien Express vers Cotonou.
                </p>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link href="/payment?quote_id=DEV-2026-9410" className="btn btn-orange" style={{ flex: 1, minWidth: "100%", padding: 12, fontSize: 13, fontWeight: 800, textAlign: "center", justifyContent: "center" }}>
                    Valider & Payer par Mobile Money
                  </Link>
                  <Link href="/contact" className="btn btn-primary" style={{ width: "100%", background: "rgba(15,23,42,0.08)", color: "var(--navy-dark)", padding: 12, fontSize: 13, fontWeight: 800, textAlign: "center", justifyContent: "center" }}>
                    Discuter sur WhatsApp
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="card admin-card" style={{ padding: "24px 20px", overflow: "hidden", maxWidth: "100%", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
                      Mon Profil & Informations Personnelles
                    </h3>
                    <p style={{ fontSize: 12.5, color: "#64748B", margin: "2px 0 0" }}>
                      Modifiez vos coordonnées de livraison et vos informations de contact.
                    </p>
                  </div>
                  <span className="badge" style={{ background: "#EFF6FF", color: "#165491", fontWeight: 800 }}>
                    {accountType === "business" ? "Entreprise / PME" : accountType === "reseller" ? "Revendeur" : "Particulier"}
                  </span>
                </div>

                {successMsg && (
                  <div style={{ background: "#DCFCE7", border: "1px solid #86EFAC", color: "#166534", padding: 12, borderRadius: 10, marginBottom: 18, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 style={{ width: 18 }} />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                        PRÉNOM *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="admin-input"
                        placeholder="Ex: Serge"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                        NOM *
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="admin-input"
                        placeholder="Ex: Mensah"
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                        ADRESSE EMAIL (NON MODIFIABLE)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={profile?.email || "client.demo@cargolink.africa"}
                        className="admin-input"
                        style={{ background: "#F1F5F9", color: "#64748B", cursor: "not-allowed" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                        TÉLÉPHONE WHATSAPP *
                      </label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="admin-input"
                        placeholder="+229 97 00 00 00"
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                        VILLE DE LIVRAISON *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="admin-input"
                        placeholder="Ex: Cotonou"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 900, color: "#0F172A", display: "block", marginBottom: 6 }}>
                        PAYS DE DESTINATION *
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="admin-input"
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
                      className="btn btn-orange"
                      style={{ padding: "12px 24px", fontSize: 13.5, fontWeight: 900, borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 8 }}
                    >
                      {saving ? "Enregistrement..." : "Enregistrer les Modifications"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab !== "orders" && activeTab !== "quotes" && activeTab !== "profile" && (
              <div className="card" style={{ padding: 24, textAlign: "center" }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "var(--navy-dark)" }}>Section en cours d'actualisation</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Vos données sont synchronisées en temps réel.</p>
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
    <React.Suspense fallback={<div style={{ padding: "80px 0", textAlign: "center", fontWeight: 800, color: "#0F172A" }}>Chargement de l'Espace Client...</div>}>
      <DashboardContent />
    </React.Suspense>
  );
}
