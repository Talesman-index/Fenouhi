"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import TrackingTimeline from "@/components/TrackingTimeline";
import Link from "next/link";
import { Package, Clock, CheckCircle, FileText, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div style={{ padding: "40px 0", background: "var(--bg-main)" }}>
      <div className="container">
        {/* HEADER BAR */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 className="hero-page-title" style={{ color: "var(--navy-dark)", fontSize: 26, margin: 0 }}>
              Espace Client & Suivi Logistique
            </h1>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "4px 0 0" }}>
              Bienvenue Jean Marc Koffi • Vos commandes et devis d'importation en temps réel.
            </p>
          </div>

          <Link href="/quote-request" className="btn btn-orange btn-pill-sm">
            + Nouvelle Demande de Devis
          </Link>
        </div>

        {/* MAIN DASHBOARD LAYOUT */}
        <div className="grid-sidebar-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
          {/* SIDEBAR */}
          <DashboardSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

          {/* MAIN TAB CONTENT */}
          <div style={{ display: "flex", gap: 24, flexDirection: "column" }}>
            
            {activeTab === "orders" && (
              <>
                {/* ACTIVE ORDER SUMMARY CARD */}
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                    <div>
                      <span className="badge" style={{ background: "var(--green-bg)", color: "var(--green-success)", marginBottom: 4 }}>
                        EN TRANSIT AÉRIEN
                      </span>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
                        50 Casques Bluetooth ANC SoundBass
                      </h3>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Référence Commande</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--navy-dark)" }}>CMD-2026-45892</div>
                    </div>
                  </div>

                  <div className="grid-3" style={{ background: "var(--bg-main)", padding: 14, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: 13, gap: 12 }}>
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
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 4 }}>DEVIS PRÊT À VALIDER</span>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>Réf: DEV-2026-9410</h3>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "var(--orange-primary)" }}>205 000 FCFA</span>
                </div>

                <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 20 }}>
                  Produit : 20 Montres Connectées SmartFit Pro X • Mode : Fret Aérien Express vers Cotonou.
                </p>

                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn btn-orange" style={{ flex: 1 }} onClick={() => alert("Redirection vers paiement Mobile Money...")}>
                    Valider & Payer par Mobile Money
                  </button>
                  <Link href="/contact" className="btn btn-primary" style={{ background: "rgba(15,23,42,0.1)", color: "var(--navy-dark)" }}>
                    Discuter sur WhatsApp
                  </Link>
                </div>
              </div>
            )}

            {activeTab !== "orders" && activeTab !== "quotes" && (
              <div className="card" style={{ padding: 32, textAlign: "center" }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)" }}>Section en cours d'actualisation</h3>
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Vos données sont synchronisées en temps réel.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
