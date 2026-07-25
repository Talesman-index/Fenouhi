import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div>
      <header style={{ background: "var(--navy-dark)", color: "#FFF", padding: "45px 0 55px", borderBottom: "4px solid var(--orange-primary)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <span className="badge" style={{ marginBottom: 12, background: "rgba(255,255,255,0.15)", color: "#FFF", fontSize: 12 }}>SÉCURITÉ & CONFIDENTIALITÉ</span>
          <h1 className="hero-page-title">Politique de Confidentialité</h1>
        </div>
      </header>

      <section style={{ padding: "50px 0", background: "var(--bg-main)" }}>
        <div className="container">
          <div className="card" style={{ padding: 32, fontSize: 14, lineHeight: 1.6, color: "var(--text-main)", display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>1. Collecte des Données</h3>
              <p>Nous collectons uniquement les informations nécessaires au traitement de vos livraisons (Nom, Téléphone, Adresse de livraison Cotonou/Lomé, liens d'articles à deviser).</p>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>2. Utilisation & Protection</h3>
              <p>Vos informations sont strictement confidentielles. Aucune donnée n'est revendue à des tiers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
