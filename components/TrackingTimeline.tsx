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
    { stepNumber: 4, title: "Achat Fournisseur Effectué", location: "Shenzhen, Chine", time: "14 Juil 14:15", completed: true },
    { stepNumber: 7, title: "Arrivé au Dépôt Export", location: "Guangzhou Baiyun", time: "18 Juil 11:00", completed: true },
    { stepNumber: 9, title: "En Transit Aérien (Vol AF-842)", location: "Espace Aérien", time: "22 Juil 06:45", completed: true, active: true },
    { stepNumber: 11, title: "Dédouanement Local", location: "Aéroport de Cotonou", time: "En attente", completed: false },
    { stepNumber: 14, title: "Disponible en Entrepôt", location: "Dépôt Akpakpa", time: "Prévu 26 Juil", completed: false }
  ];

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 4 }}>SUIVI EN TEMPS RÉEL</span>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>Timeline Logistique — N° {trackingNumber}</h3>
        </div>
        <span className="badge" style={{ background: "var(--green-bg)", color: "var(--green-success)" }}>
          Étape {currentStep} / 14
        </span>
      </div>

      <div className="timeline">
        {steps.map((s, idx) => (
          <div key={idx} className={`timeline-item ${s.completed ? "completed" : ""} ${s.active ? "active" : ""}`} style={{ display: "flex", gap: 16, marginBottom: 20, position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: s.active ? "var(--orange-primary)" : s.completed ? "var(--green-success)" : "#E2E8F0",
                color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, zIndex: 2
              }}>
                {s.completed ? <CheckCircle2 style={{ width: 16 }} /> : s.stepNumber}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: s.active ? "var(--orange-primary)" : "var(--navy-dark)" }}>
                {s.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 12, marginTop: 2 }}>
                <span><MapPin style={{ width: 12, display: "inline" }} /> {s.location}</span>
                <span><Clock style={{ width: 12, display: "inline" }} /> {s.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
