import React from "react";
import { Plane, Ship, CheckCircle } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div>
      <header style={{ background: "var(--navy-dark)", color: "#FFF", padding: "45px 0 55px", borderBottom: "4px solid var(--orange-primary)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <span className="badge" style={{ marginBottom: 12, background: "rgba(255,255,255,0.15)", color: "#FFF", fontSize: 12 }}>FRET AÉRIEN & MARITIME</span>
          <h1 className="hero-page-title">Politique d'Expédition & Modalités Logistiques</h1>
          <p style={{ fontSize: 15, color: "#CBD5E1", maxWidth: 660, margin: "0 auto", lineHeight: 1.5 }}>
            Transparence totale sur nos tarifs de transport, processus d'inspection en usine et délais de livraison de Guangzhou & Shenzhen vers Cotonou, Lomé, Abidjan et Douala.
          </p>
        </div>
      </header>

      <section style={{ padding: "50px 0", background: "var(--bg-main)" }}>
        <div className="container">
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div className="grid-2">
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid var(--orange-light)" }}>
                  <Plane style={{ width: 28, color: "var(--orange-primary)" }} />
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>Fret Aérien Express</h3>
                    <span style={{ fontSize: 12, color: "var(--orange-primary)", fontWeight: 800 }}>Délais : 5 à 10 jours ouvrés</span>
                  </div>
                </div>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
                  <li style={{ display: "flex", gap: 10 }}><CheckCircle style={{ width: 18, color: "var(--green-success)" }} /> Départs quotidiens aéroport Guangzhou Baiyun (CAN).</li>
                  <li style={{ display: "flex", gap: 10 }}><CheckCircle style={{ width: 18, color: "var(--green-success)" }} /> Emballage renforcé antichoc et suivi GPS en direct.</li>
                </ul>
              </div>

              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid var(--border-light)" }}>
                  <Ship style={{ width: 28, color: "var(--navy-dark)" }} />
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>Fret Maritime Groupé (LCL/FCL)</h3>
                    <span style={{ fontSize: 12, color: "var(--navy-dark)", fontWeight: 800 }}>Délais : 30 à 45 jours</span>
                  </div>
                </div>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
                  <li style={{ display: "flex", gap: 10 }}><CheckCircle style={{ width: 18, color: "var(--green-success)" }} /> Conteneurs hebdomadaires au départ de Nansha & Yantian.</li>
                  <li style={{ display: "flex", gap: 10 }}><CheckCircle style={{ width: 18, color: "var(--green-success)" }} /> Dédouanement complet pris en charge à Cotonou / Lomé.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
