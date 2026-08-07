import React from "react";
import { ShieldCheck, RotateCcw, LifeBuoy } from "lucide-react";

export default function ReturnsWarrantyPage() {
  return (
    <div>
      <header style={{ background: "var(--navy-dark)", color: "#FFF", padding: "45px 0 55px", borderBottom: "4px solid var(--orange-primary)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <span className="badge" style={{ marginBottom: 12, background: "rgba(255,255,255,0.15)", color: "#FFF", fontSize: 12 }}>GARANTIE CARGOLINK 100% SÉCURISÉE</span>
          <h1 className="hero-page-title">Politique de Garanties & Gestion des Litiges</h1>
          <p style={{ fontSize: 15, color: "#CBD5E1", maxWidth: 660, margin: "0 auto", lineHeight: 1.5 }}>
            Votre sérénité d'importation est notre priorité absolue. Découvrez nos engagements en cas de non-conformité, produit défectueux ou retard d'acheminement.
          </p>
        </div>
      </header>

      <section style={{ padding: "50px 0", background: "var(--bg-main)" }}>
        <div className="container">
          <div className="grid-3" style={{ gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <ShieldCheck style={{ width: 32, color: "var(--green-success)", marginBottom: 12 }} />
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>Contrôle Qualité Avant Départ</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                Chaque produit est inspecté visuellement dans nos entrepôts internationaux. Des photos HD vous sont soumises avant tout emballage d'expédition.
              </p>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <RotateCcw style={{ width: 32, color: "var(--orange-primary)", marginBottom: 12 }} />
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>Remplacement / Remboursement</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                Si l'article reçu ne correspond pas à votre devis officiel, CargoLink s'engage au remboursement ou à la réexpédition à nos frais.
              </p>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <LifeBuoy style={{ width: 32, color: "var(--navy-dark)", marginBottom: 12 }} />
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>Gestion Express des Litiges</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                Une équipe dédiée prend en charge vos réclamations sous 24h via WhatsApp ou téléphone pour un traitement sans tracas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
