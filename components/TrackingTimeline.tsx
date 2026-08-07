"use client";

import React from "react";
import { CheckCircle2, Clock, MapPin, Plane, PackageCheck } from "lucide-react";

interface Step {
  stepNumber: number;
  title: string;
  location: string;
  time: string;
  completed: boolean;
  active?: boolean;
}

interface TrackingTimelineProps {
  currentStep?: number;
  trackingNumber?: string;
}

export default function TrackingTimeline({
  currentStep = 9,
  trackingNumber = "CMD-2026-45892"
}: TrackingTimelineProps) {
  const steps: Step[] = [
    { stepNumber: 1, title: "Paiement Acompte Validé", location: "Cotonou, Bénin", time: "12 Juil 09:30", completed: true },
    { stepNumber: 4, title: "Achat Fournisseur Effectué", location: "Hub International Usine", time: "14 Juil 14:15", completed: true },
    { stepNumber: 7, title: "Arrivé au Dépôt Export", location: "Centre Logistique Export", time: "18 Juil 11:00", completed: true },
    { stepNumber: 9, title: "En Transit Aérien (Vol AF-842)", location: "Espace Aérien", time: "22 Juil 06:45", completed: true, active: true },
    { stepNumber: 11, title: "Dédouanement Local", location: "Aéroport de Cotonou", time: "En attente", completed: false },
    { stepNumber: 14, title: "Disponible en Entrepôt", location: "Dépôt Akpakpa", time: "Prévu 26 Juil", completed: false }
  ];

  return (
    <div className="card" style={{ padding: "18px 16px", overflow: "hidden", maxWidth: "100%", boxSizing: "border-box" }}>
      {/* CARD HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 6, fontSize: 11, display: "inline-block" }}>
            SUIVI EN TEMPS RÉEL
          </span>
          <h3 style={{ fontSize: "clamp(15px, 4vw, 18px)", fontWeight: 900, color: "var(--navy-dark)", margin: 0, wordBreak: "break-word", lineHeight: 1.3 }}>
            Timeline Logistique — N° {trackingNumber}
          </h3>
        </div>
        <span className="badge" style={{ background: "var(--green-bg)", color: "var(--green-success)", fontSize: 11.5, flexShrink: 0 }}>
          Étape {currentStep} / 14
        </span>
      </div>

      {/* TIMELINE LIST */}
      <div className="timeline-container" style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
        {steps.map((s, idx) => (
          <div 
            key={idx} 
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              background: s.active ? "rgba(249, 115, 22, 0.05)" : s.completed ? "#F8FAFC" : "#FFFFFF",
              border: s.active ? "1.5px solid var(--orange-primary)" : "1px solid #E2E8F0",
              borderRadius: 12,
              padding: 12,
              maxWidth: "100%",
              boxSizing: "border-box"
            }}
          >
            {/* STEP NUMBER / ICON BADGE */}
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: s.active ? "var(--orange-primary)" : s.completed ? "var(--green-success)" : "#CBD5E1",
                color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900
              }}>
                {s.completed ? <CheckCircle2 style={{ width: 16 }} /> : s.stepNumber}
              </div>
            </div>

            {/* STEP DETAILS */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: s.active ? "var(--orange-hover)" : "var(--navy-dark)", wordBreak: "break-word" }}>
                {s.title}
              </div>
              <div style={{ fontSize: 11.5, color: "#64748B", display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 4 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <MapPin style={{ width: 12, color: "#94A3B8" }} /> {s.location}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Clock style={{ width: 12, color: "#94A3B8" }} /> {s.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
