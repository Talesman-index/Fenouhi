"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Send, RefreshCw, Calculator, Shield, CheckCircle2 } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("calc");

  // Calculator State
  const [prodCost, setProdCost] = useState(125000);
  const [chinaFreight, setChinaFreight] = useState(15000);
  const [intlFreight, setIntlFreight] = useState(35000);
  const [customs, setCustoms] = useState(20000);
  const [serviceFee, setServiceFee] = useState(10000);

  const totalSum = prodCost + chinaFreight + intlFreight + customs + serviceFee;

  const [selectedStatus, setSelectedStatus] = useState("9");
  const [logisticsNote, setLogisticsNote] = useState("");
  const [statusUpdated, setStatusUpdated] = useState(false);

  const handleUpdateStatus = () => {
    setStatusUpdated(true);
    setTimeout(() => setStatusUpdated(false), 3000);
  };

  return (
    <div style={{ padding: "40px 0", background: "var(--bg-main)" }}>
      <div className="container">
        {/* ADMIN HEADER ROW */}
        <div className="admin-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 4 }}>
              ESPACE ÉCURIE LOGISTIQUE
            </span>
            <h1 className="hero-page-title" style={{ color: "var(--navy-dark)", fontSize: 26, margin: 0 }}>
              Tableau de Bord Administrateur Logistique
            </h1>
          </div>
          <span className="badge" style={{ background: "var(--navy-dark)", color: "#FFF" }}>
            Guangzhou Hub ➔ Cotonou
          </span>
        </div>

        {/* ADMIN KPI CARDS GRID */}
        <div className="admin-kpi-grid grid-4" style={{ marginBottom: 24 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 4 }}>DEVIS SOUMIS AUJOURD'HUI</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)" }}>14</div>
          </div>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 4 }}>COLIS EN TRANSIT AÉRIEN</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--orange-primary)" }}>38</div>
          </div>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 4 }}>VALEUR MARCHANDISE EXPÉDIÉE</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--green-success)" }}>18.4M FCFA</div>
          </div>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 4 }}>TAUX DÉDOUANEMENT CONFORME</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--blue-primary)" }}>99.2%</div>
          </div>
        </div>

        {/* MAIN ADMIN LAYOUT */}
        <div className="grid-sidebar-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
          <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

          <div className="admin-panels-grid" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* PANEL 1: QUOTE CALCULATOR */}
            <div className="card admin-card">
              <div className="admin-panel-card-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 4 }}>
                    CALCULATEUR DE COÛTS LOGISTIQUES
                  </span>
                  <h2 style={{ fontSize: 19, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>Élaborer un Devis Officiel</h2>
                </div>
                <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)" }}>Réf: DEV-2026-9410</span>
              </div>

              <div className="admin-info-box">
                <div><strong>Client :</strong> Jean Marc Koffi (+229 97 00 11 22)</div>
                <div><strong>Produit :</strong> 20 Montres Connectées SmartFit Pro X</div>
                <div><strong>Destination :</strong> Cotonou, Bénin • Mode : Fret Aérien</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>1. PRIX D'ACHAT FOURNISSEUR CHINE (FCFA)</label>
                  <input type="number" value={prodCost} onChange={(e) => setProdCost(Number(e.target.value))} className="admin-input" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>2. TRANSPORT LOCAL CHINE + CONTRÔLE QUALITÉ (FCFA)</label>
                  <input type="number" value={chinaFreight} onChange={(e) => setChinaFreight(Number(e.target.value))} className="admin-input" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>3. FRET INTERNATIONAL AÉRIEN / MARITIME (FCFA)</label>
                  <input type="number" value={intlFreight} onChange={(e) => setIntlFreight(Number(e.target.value))} className="admin-input" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>4. DOUANE ESTIMÉE + LIVRAISON LOCALE (FCFA)</label>
                  <input type="number" value={customs} onChange={(e) => setCustoms(Number(e.target.value))} className="admin-input" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>5. FRAIS DE SERVICE CARGOLINK AFRICA (FCFA)</label>
                  <input type="number" value={serviceFee} onChange={(e) => setServiceFee(Number(e.target.value))} className="admin-input" />
                </div>
              </div>

              <div className="admin-total-box">
                <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 700 }}>TOTAL CALCULÉ DEVIS CLIENT</div>
                <div style={{ fontSize: "clamp(22px, 6vw, 28px)", fontWeight: 900, color: "var(--orange-primary)", fontFamily: "var(--font-heading)" }}>
                  {totalSum.toLocaleString()} FCFA
                </div>
              </div>

              <button className="btn btn-orange admin-btn" onClick={() => alert("Démonstration UI — Calcul effectué (Intégration Supabase en phase suivante)")}>
                <Send style={{ width: 18 }} /> Envoyer le Devis au Client (Démonstration UI)
              </button>
            </div>

            {/* PANEL 2: ORDER TRANSIT STATUS UPDATER */}
            <div className="card admin-card">
              <div className="admin-panel-card-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <span className="badge" style={{ background: "var(--green-bg)", color: "var(--green-success)", marginBottom: 4 }}>
                    GESTION DU TRANSIT LOGISTIQUE
                  </span>
                  <h2 style={{ fontSize: 19, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>Mise à jour Statut Colis</h2>
                </div>
                <span className="badge" style={{ background: "var(--navy-dark)", color: "#FFF" }}>CMD-2026-45892</span>
              </div>

              <div className="admin-info-box">
                <div><strong>Client :</strong> Jean Marc Koffi</div>
                <div><strong>Colis :</strong> 50 Casques Bluetooth ANC SoundBass</div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>AVANCER LA TIMELINE LOGISTIQUE (14 ÉTAPES) :</label>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="admin-input" style={{ background: "#FFF" }}>
                  <option value="1">1. Paiement en attente</option>
                  <option value="2">2. Commande confirmée</option>
                  <option value="4">4. Produit acheté à l'usine Shenzhen</option>
                  <option value="7">7. Arrivé au dépôt Chine (Guangzhou)</option>
                  <option value="9">9. En transit international (Vol AF-842)</option>
                  <option value="11">11. Inspection & Dédouanement local</option>
                  <option value="14">14. Commande livrée & clôturée 🎉</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>NOTE LOGISTIQUE / OBSERVATION INTERNE</label>
                <textarea 
                  value={logisticsNote}
                  onChange={(e) => setLogisticsNote(e.target.value)}
                  placeholder="Ex: Arrivée prévue à l'aéroport de Cotonou le 26 Juillet..."
                  className="admin-input" 
                  style={{ height: 80 }}
                ></textarea>
              </div>

              {statusUpdated && (
                <div style={{ background: "var(--green-bg)", color: "var(--green-success)", padding: 12, borderRadius: "var(--radius-sm)", marginBottom: 16, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 style={{ width: 18 }} /> Statut logistique mis à jour avec succès !
                </div>
              )}

              <button className="btn btn-primary admin-btn" onClick={handleUpdateStatus}>
                <RefreshCw style={{ width: 18 }} /> Publier la Mise à Jour & Notifier le Client
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
