"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send, FileText, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";

export default function QuoteRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    productName: "",
    quantity: "50",
    destCountry: "Bénin (Cotonou)",
    shippingMode: "aérien",
    clientName: "",
    clientPhone: "",
    details: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      {/* HERO HEADER */}
      <header style={{ background: "var(--navy-dark)", color: "#FFF", padding: "45px 0 55px", borderBottom: "4px solid var(--orange-primary)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <span className="badge" style={{ marginBottom: 12, background: "rgba(255,255,255,0.15)", color: "#FFF", fontSize: 12 }}>
            SOUCHING SUR-MESURE & FRET SECOURU
          </span>
          <h1 className="hero-page-title">Demande de Devis Détaillé d'Importation</h1>
          <p style={{ fontSize: 15, color: "#CBD5E1", maxWidth: 660, margin: "0 auto", lineHeight: 1.5 }}>
            Soumettez votre besoin (lien 1688/Alibaba, photo ou description). Notre bureau de Guangzhou vous émet un devis officiel sous 2 heures.
          </p>
        </div>
      </header>

      {/* FORM SECTION */}
      <section style={{ padding: "50px 0", background: "var(--bg-main)" }}>
        <div className="container">
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            
            {submitted ? (
              <div className="card" style={{ padding: 40, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--green-bg)", color: "var(--green-success)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <CheckCircle2 style={{ width: 36 }} />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>
                  Demande de Devis Soumise avec Succès !
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
                  Référence temporaire : <strong>DEV-2026-{Math.floor(1000 + Math.random() * 9000)}</strong>. Notre équipe étudie votre dossier et vous contacte sur WhatsApp.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <Link href="/dashboard" className="btn btn-orange">Accéder au Dashboard Client</Link>
                  <button onClick={() => setSubmitted(false)} className="btn btn-primary" style={{ background: "rgba(15,23,42,0.1)", color: "var(--navy-dark)" }}>Faire une autre demande</button>
                </div>
              </div>
            ) : (
              <div className="card admin-card" style={{ padding: 32 }}>
                <div style={{ background: "var(--blue-light)", color: "var(--blue-primary)", padding: 12, borderRadius: "var(--radius-sm)", marginBottom: 20, fontSize: 13, fontWeight: 700 }}>
                  ℹ️ Mode Démonstration Interface — Ce formulaire validera les entrées et sera connecté à Supabase lors de la prochaine phase.
                </div>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                      1. LIEN DU PRODUIT (1688, TAOBAO, ALIBABA, POIZON) OU DESIGNATION
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: https://detail.1688.com/offer/6543210.html ou '200 paires de baskets'"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="admin-input"
                    />
                  </div>

                  <div className="grid-2" style={{ gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                        2. QUANTITÉ SOUHAITÉE (UNITÉS / CARTONS) *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                        3. PAYS & VILLE DE DESTINATION *
                      </label>
                      <select
                        value={formData.destCountry}
                        onChange={(e) => setFormData({ ...formData, destCountry: e.target.value })}
                        className="admin-input"
                        style={{ background: "#FFF" }}
                      >
                        <option>Bénin (Cotonou)</option>
                        <option>Togo (Lomé)</option>
                        <option>Côte d'Ivoire (Abidjan)</option>
                        <option>Sénégal (Dakar)</option>
                        <option>Cameroun (Douala)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                        4. VOTRE NOM & PRÉNOM *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Jean Koffi"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                        5. NUMÉRO WHATSAPP (AVEC INDICATIF) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="+229 97 00 11 22"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                      6. DÉTAILS COMPLÉMENTAIRES (COULEURS, TAILLES, LOGO PERSONNALISÉ)
                    </label>
                    <textarea
                      placeholder="Spécifiez vos exigences particulières..."
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      className="admin-input"
                      style={{ height: 90 }}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-orange admin-btn" style={{ padding: 14, fontSize: 16 }}>
                    <Send style={{ width: 18 }} /> Soumettre ma Demande de Devis Gratuit
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  );
}
