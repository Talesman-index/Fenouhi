import React from "react";

export default function TermsPage() {
  return (
    <div>
      <header style={{ background: "var(--navy-dark)", color: "#FFF", padding: "45px 0 55px", borderBottom: "4px solid var(--orange-primary)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <span className="badge" style={{ marginBottom: 12, background: "rgba(255,255,255,0.15)", color: "#FFF", fontSize: 12 }}>CADRE LÉGAL & TRANSPARENCE</span>
          <h1 className="hero-page-title">Conditions Générales d'Utilisation & Service</h1>
        </div>
      </header>

      <section style={{ padding: "50px 0", background: "var(--bg-main)" }}>
        <div className="container">
          <div className="card" style={{ padding: 32, fontSize: 14, lineHeight: 1.6, color: "var(--text-main)", display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>1. Objet des Services</h3>
              <p>CargoLink Africa opère en tant qu'intermédiaire d'achat et commissionnaire de transport logistique entre les usines partenaires en Chine et les acheteurs/commerçants en Afrique.</p>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>2. Validation des Devis & Paiements</h3>
              <p>Tout devis émis est valable 7 jours ouvrés. Le paiement s'effectue par Mobile Money (MTN, Moov, Celtiis, Kkiapay) ou virement bancaire avant le déclenchement des commandes.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
