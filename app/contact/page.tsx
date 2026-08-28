"use client";

import React, { useState } from "react";
import { MessageSquare, MapPin, Building2, Send, PhoneCall } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <header style={{ background: "var(--navy-dark)", color: "#FFF", padding: "45px 0 55px", borderBottom: "4px solid var(--orange-primary)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <span className="badge" style={{ marginBottom: 12, background: "rgba(255,255,255,0.15)", color: "#FFF", fontSize: 12 }}>SUPPORT CLIENT DÉDIÉ 7J/7</span>
          <h1 className="hero-page-title">Contactez l'Équipe FENOUHI</h1>
          <p style={{ fontSize: 15, color: "#CBD5E1", maxWidth: 660, margin: "0 auto", lineHeight: 1.5 }}>
            Une question sur une commande, un devis d'importation ou nos entrepôts de Cotonou et Guangzhou ? Nos agents vous répondent directement.
          </p>
        </div>
      </header>

      <section style={{ padding: "50px 0", background: "var(--bg-main)" }}>
        <div className="container">
          <div className="grid-2">

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card" style={{ padding: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, background: "var(--green-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MessageSquare style={{ width: 22, color: "var(--green-success)" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--navy-dark)", margin: "0 0 4px" }}>Assistance WhatsApp Directe</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>Réponse instantanée pour devis et suivi de colis.</p>
                  <a href="https://wa.me/22997001122" target="_blank" rel="noopener noreferrer" className="btn btn-orange btn-pill-sm">
                    <PhoneCall style={{ width: 14 }} /> +229 97 00 11 22
                  </a>
                </div>
              </div>

              <div className="card" style={{ padding: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, background: "var(--orange-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MapPin style={{ width: 22, color: "var(--orange-primary)" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--navy-dark)", margin: "0 0 4px" }}>Entrepôt & Dépôt Cotonou</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Quartier Akpakpa, Avenue Steinmetz, Cotonou, Bénin.</p>
                  <p style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4 }}>Horaires : Lundi à Samedi de 08:00 à 19:00.</p>
                </div>
              </div>

              <div className="card" style={{ padding: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, background: "var(--blue-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Building2 style={{ width: 22, color: "var(--blue-primary)" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--navy-dark)", margin: "0 0 4px" }}>Hub Logistique International</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Centre Logistique Export & Dépôts de Groupage Internationaux (Asie-Pacifique & Europe).</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--navy-dark)", marginBottom: 16 }}>Envoyer un Message au Support</h3>
              {submitted ? (
                <div style={{ padding: 20, background: "var(--green-bg)", color: "var(--green-success)", borderRadius: "var(--radius-sm)", fontWeight: 600 }}>
                  Message envoyé avec succès ! Notre équipe vous répond sous 2h.
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>VOTRE NOM COMPLET *</label>
                    <input type="text" required placeholder="Ex: Jean Koffi" className="admin-input" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>NUMÉRO TELEPHONE / WHATSAPP *</label>
                    <input type="text" required placeholder="+229 97 00 11 22" className="admin-input" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--navy-dark)", display: "block", marginBottom: 6 }}>VOTRE MESSAGE *</label>
                    <textarea required placeholder="Précisez votre demande..." className="admin-input" style={{ height: 100 }}></textarea>
                  </div>
                  <button type="submit" className="btn btn-orange admin-btn" style={{ padding: 14 }}>
                    <Send style={{ width: 16 }} /> Envoyer Mon Message
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
