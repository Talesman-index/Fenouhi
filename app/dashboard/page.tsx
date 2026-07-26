"use client";

import React, { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import TrackingTimeline from "@/components/TrackingTimeline";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Package, Clock, CheckCircle, FileText, ArrowRight, User, PlusCircle } from "lucide-react";
import type { Profile } from "@/types/supabase";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("orders");
  const [profile, setProfile] = useState<Profile | null>(null);

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
          setProfile(data as Profile);
        }
      }
    }

    loadProfile();
  }, []);

  return (
    <div style={{ padding: "20px 0 60px", background: "var(--bg-main)", minHeight: "80vh", overflowX: "hidden" }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", paddingLeft: 16, paddingRight: 16, boxSizing: "border-box" }}>
        
        {/* ELEGANT RESPONSIVE TOP HEADER BAR */}
        <div className="dashboard-header-bar" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(22, 84, 145, 0.08)", color: "#165491", padding: "4px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 800, marginBottom: 8, letterSpacing: "0.5px" }}>
                📦 PORTAIL CLIENT CARGOLINK
              </div>
              <h1 style={{ color: "#0F172A", fontSize: "clamp(20px, 4vw, 26px)", margin: 0, fontWeight: 900, lineHeight: 1.25, wordBreak: "break-word" }}>
                Espace Client & Suivi Logistique
              </h1>
              <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0", lineHeight: 1.4, wordBreak: "break-word" }}>
                Bienvenue <strong style={{ color: "#0F172A" }}>{profile ? `${profile.first_name} ${profile.last_name}` : "Client"}</strong> • Compte : <strong style={{ color: "var(--orange-primary)" }}>{profile?.account_type || "Particulier"}</strong>
              </p>
            </div>

            <Link 
              href="/quote-request" 
              className="btn btn-orange dashboard-header-cta" 
              style={{ borderRadius: 9999, padding: "10px 22px", fontSize: 13, fontWeight: 900, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(249,115,22,0.25)", flexShrink: 0 }}
            >
              <PlusCircle style={{ width: 16 }} /> Nouvelle Demande de Devis
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
                    <div><strong>Départ :</strong> Guangzhou Baiyun</div>
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
                  <button className="btn btn-orange" style={{ flex: 1, minWidth: "100%", padding: 12, fontSize: 13, fontWeight: 800, textAlign: "center", justifyContent: "center" }} onClick={() => alert("Redirection vers paiement Mobile Money...")}>
                    Valider & Payer par Mobile Money
                  </button>
                  <Link href="/contact" className="btn btn-primary" style={{ width: "100%", background: "rgba(15,23,42,0.08)", color: "var(--navy-dark)", padding: 12, fontSize: 13, fontWeight: 800, textAlign: "center", justifyContent: "center" }}>
                    Discuter sur WhatsApp
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "profile" && profile && (
              <div className="card admin-card" style={{ padding: "18px 16px", overflow: "hidden", maxWidth: "100%", boxSizing: "border-box" }}>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 14 }}>
                  Mon Profil & Informations Personnelles
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, fontSize: 13 }}>
                  <div style={{ background: "#F8FAFC", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 10.5, color: "#64748B" }}>Nom & Prénom</div>
                    <div style={{ fontWeight: 800, color: "#0F172A", marginTop: 2, wordBreak: "break-word" }}>{profile.first_name} {profile.last_name}</div>
                  </div>
                  <div style={{ background: "#F8FAFC", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 10.5, color: "#64748B" }}>Email</div>
                    <div style={{ fontWeight: 800, color: "#0F172A", marginTop: 2, wordBreak: "break-word" }}>{profile.email}</div>
                  </div>
                  <div style={{ background: "#F8FAFC", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 10.5, color: "#64748B" }}>Téléphone WhatsApp</div>
                    <div style={{ fontWeight: 800, color: "#0F172A", marginTop: 2, wordBreak: "break-word" }}>{profile.phone || "Non renseigné"}</div>
                  </div>
                  <div style={{ background: "#F8FAFC", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 10.5, color: "#64748B" }}>Pays & Ville</div>
                    <div style={{ fontWeight: 800, color: "#0F172A", marginTop: 2, wordBreak: "break-word" }}>{profile.city || "Cotonou"}, {profile.country || "Bénin"}</div>
                  </div>
                </div>
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
  );
}
