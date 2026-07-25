"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Plane, Ship, ShieldCheck, ShoppingBag, ArrowRight } from "lucide-react";

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(20);

  return (
    <div style={{ padding: "40px 0", background: "var(--bg-main)" }}>
      <div className="container">
        <div className="grid-2" style={{ gap: 32 }}>
          {/* IMAGE LEFT */}
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <img 
              src="/images/assets/item_1.jpg" 
              alt="Montre Connectée SmartFit Pro X" 
              style={{ width: "100%", maxHeight: 380, objectFit: "contain", borderRadius: "var(--radius-md)" }} 
            />
          </div>

          {/* DETAILS RIGHT */}
          <div className="card" style={{ padding: 28 }}>
            <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 8 }}>
              DIRECT USINE SHENZHEN
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 8 }}>
              Montre Connectée SmartFit Pro X
            </h1>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--orange-primary)", marginBottom: 16 }}>
              6 250 FCFA / unité <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 400 }}>(Min. 10 unités)</span>
            </div>

            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>
              Écran HD 1.85", Suivi cardiaque & SpO2, Étanchéité IP68, Autonomie 7 jours. Compatible iOS & Android. Emballage individuel renforcé.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>
                QUANTITÉ À COMMANDER :
              </label>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(10, Number(e.target.value)))}
                className="admin-input" 
                style={{ width: 140 }} 
              />
            </div>

            <div style={{ background: "var(--bg-main)", padding: 16, borderRadius: "var(--radius-sm)", marginBottom: 24, fontSize: 13 }}>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>Estimation Total Marchandise :</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--navy-dark)" }}>
                {(quantity * 6250).toLocaleString()} FCFA
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                + Fret aérien/maritime calculé sur devis officiel.
              </div>
            </div>

            <Link href={`/quote-request?prod=Montre%20Connectée%20SmartFit%20Pro%20X&qty=${quantity}`} className="btn btn-orange admin-btn" style={{ padding: 14 }}>
              <ShoppingBag style={{ width: 18 }} /> Obtenir le Devis d'Expédition Complet
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
