"use client";

import React from "react";
import { ShieldCheck, RefreshCw, Smartphone, Cpu, CheckCircle2 } from "lucide-react";

export interface PhoneStateBadgeProps {
  conditionState?: "Scellé" | "Reconditionné" | "Occasion" | string | null;
  grade?: string | null;
  simType?: string | null;
  regionVersion?: string | null;
  size?: "sm" | "md" | "lg";
  showSecondaryTags?: boolean;
}

export default function PhoneStateBadge({
  conditionState,
  grade,
  simType,
  regionVersion,
  size = "md",
  showSecondaryTags = true,
}: PhoneStateBadgeProps) {
  if (!conditionState && !grade && !simType && !regionVersion) {
    return null;
  }

  const isSmall = size === "sm";
  const isLarge = size === "lg";

  // Configuration par état
  let stateConfig = {
    label: conditionState || "Occasion",
    bgColor: "#FEF3C7",
    textColor: "#92400E",
    borderColor: "#FCD34D",
    Icon: Smartphone,
  };

  if (conditionState === "Scellé" || conditionState === "Neuf") {
    stateConfig = {
      label: "Scellé / Neuf",
      bgColor: "#DCFCE7",
      textColor: "#15803D",
      borderColor: "#86EFAC",
      Icon: ShieldCheck,
    };
  } else if (conditionState === "Reconditionné") {
    stateConfig = {
      label: "Reconditionné Certifié",
      bgColor: "#DBEAFE",
      textColor: "#1E40AF",
      borderColor: "#93C5FD",
      Icon: RefreshCw,
    };
  } else if (conditionState === "Occasion") {
    stateConfig = {
      label: "Occasion Contrôlée",
      bgColor: "#FEF3C7",
      textColor: "#92400E",
      borderColor: "#FCD34D",
      Icon: Smartphone,
    };
  }

  const { Icon } = stateConfig;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {/* BADGE PRINCIPAL D'ÉTAT */}
      {conditionState && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: isSmall ? 3 : 5,
            padding: isSmall ? "2px 6px" : isLarge ? "5px 12px" : "3px 8px",
            borderRadius: isSmall ? 6 : 8,
            backgroundColor: stateConfig.bgColor,
            color: stateConfig.textColor,
            border: `1px solid ${stateConfig.borderColor}`,
            fontSize: isSmall ? 10 : isLarge ? 13 : 11.5,
            fontWeight: 600,
            letterSpacing: 0.2,
            lineHeight: 1.2,
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          <Icon style={{ width: isSmall ? 11 : isLarge ? 15 : 13, height: isSmall ? 11 : isLarge ? 15 : 13 }} />
          <span>{stateConfig.label}</span>
        </span>
      )}

      {/* SECONDARY TAGS (Grade, SIM, Version) */}
      {showSecondaryTags && (
        <>
          {grade && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: isSmall ? "2px 5px" : isLarge ? "4px 10px" : "3px 7px",
                borderRadius: isSmall ? 6 : 8,
                backgroundColor: "#F1F5F9",
                color: "#334155",
                border: "1px solid #CBD5E1",
                fontSize: isSmall ? 9.5 : isLarge ? 12 : 11,
                fontWeight: 700,
              }}
            >
              <CheckCircle2 style={{ width: isSmall ? 10 : 12, height: isSmall ? 10 : 12, color: "#64748B" }} />
              <span>{grade}</span>
            </span>
          )}

          {simType && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: isSmall ? "2px 5px" : isLarge ? "4px 10px" : "3px 7px",
                borderRadius: isSmall ? 6 : 8,
                backgroundColor: "#F8FAFC",
                color: "#475569",
                border: "1px solid #E2E8F0",
                fontSize: isSmall ? 9.5 : isLarge ? 12 : 11,
                fontWeight: 600,
              }}
            >
              <span>{simType}</span>
            </span>
          )}

          {regionVersion && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: isSmall ? "2px 5px" : isLarge ? "4px 10px" : "3px 7px",
                borderRadius: isSmall ? 6 : 8,
                backgroundColor: "#EFF6FF",
                color: "#1D4ED8",
                border: "1px solid #BFDBFE",
                fontSize: isSmall ? 9.5 : isLarge ? 12 : 11,
                fontWeight: 700,
              }}
            >
              <Cpu style={{ width: isSmall ? 10 : 12, height: isSmall ? 10 : 12 }} />
              <span>{regionVersion}</span>
            </span>
          )}
        </>
      )}
    </div>
  );
}
