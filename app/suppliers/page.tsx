import React from "react";
import Link from "next/link";
import { CheckSquare, BadgePercent, Camera, Search } from "lucide-react";

export default function SuppliersPage() {
  return (
    <div>
      <header style={{ background: "var(--navy-dark)", color: "#FFF", padding: "45px 0 55px", borderBottom: "4px solid var(--orange-primary)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <span className="badge" style={{ marginBottom: 12, background: "rgba(255,255,255,0.15)", color: "#FFF", fontSize: 12 }}>RÉSEAU D'USINES NÉGOCIÉES</span>
          <h1 className="hero-page-title">Espace Fournisseurs & Sourcing Chine</h1>
          <p style={{ fontSize: 15, color: "#CBD5E1", maxWidth: 660, margin: "0 auto", lineHeight: 1.5 }}>
            Accédez aux prix directs usines sans intermédiaire. Notre équipe basée sur place négocie les tarifs de gros pour les commerçants et PME africaines.
          </p>
        </div>
      </header>

      <section style={{ padding: "50px 0", background: "var(--bg-main)" }}>
        <div className="container">
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div className="grid-3">
              <div className="card" style={{ padding: 24 }}>
                <CheckSquare style={{ width: 32, color: "var(--orange-primary)", marginBottom: 12 }} />
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>Audit & Vérification Juridique</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Vérification de la licence commerciale chinoise et des certificats CE/ISO de chaque fournisseur.
                </p>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <BadgePercent style={{ width: 32, color: "var(--green-success)", marginBottom: 12 }} />
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>Tarifs Directs Grossistes</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Négociation de remises sur volume et Quantités Minimales (MOQ) adaptées au marché africain.
                </p>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <Camera style={{ width: 32, color: "var(--navy-dark)", marginBottom: 12 }} />
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>Inspection Photos & Vidéos</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Nos agents à Guangzhou vous envoient des rapports photos complets avant tout départ.
                </p>
              </div>
            </div>

            <div className="card" style={{ padding: 32, textAlign: "center" }}>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 10 }}>Trouver un Fournisseur Spécifique ?</h3>
              <Link href="/quote-request" className="btn btn-orange" style={{ padding: "14px 28px", fontSize: 15 }}>
                <Search style={{ width: 18 }} /> Lancer un Sourcing Sur-Mesure
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
