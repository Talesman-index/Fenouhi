"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { DEMO_SHIPMENTS } from "@/lib/admin/demo-data";
import { Search, Plane, Ship } from "lucide-react";
import type { Shipment } from "@/types/supabase";

export default function ShipmentsManagementPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchShipments();
  }, []);

  async function fetchShipments() {
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("shipments").select("*").order("created_at", { ascending: false });

      if (error || !data) {
        setShipments([]);
      } else {
        setShipments(data as Shipment[]);
      }
    } catch (err) {
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredShipments = shipments.filter((s) => {
    const tracking = (s.tracking_number || "").toLowerCase();
    const carrier = (s.carrier || "").toLowerCase();
    const dest = (s.destination_city || "").toLowerCase();
    const query = search.toLowerCase();
    return tracking.includes(query) || carrier.includes(query) || dest.includes(query);
  });

  // Summary stats
  const totalShipmentsCount = shipments.length;
  const airCount = shipments.filter((s) => s.shipping_mode === "air").length;
  const seaCount = shipments.filter((s) => s.shipping_mode === "sea").length;
  const deliveredShipmentsCount = shipments.filter((s) => s.status === "delivered").length;

  return (
    <div style={{ padding: "20px 0 60px", maxWidth: 1280, margin: "0 auto" }}>
      {/* 1. HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(234, 88, 12, 0.08)", color: "#EA580C", padding: "4px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
            <Plane style={{ width: 14, height: 14 }} /> LOGISTIQUE TRANSFRONTALIÈRE ASIE-AFRIQUE
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Gestion des Expéditions (Cargo & Fret)
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
            Supervisez les départs de conteneurs maritimes et vols cargo depuis Guangzhou, Shenzhen et Yiwu.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchShipments}
          className="btn"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569", borderRadius: 12, fontWeight: 600, fontSize: 13, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}
        >
          <Plane style={{ width: 15 }} /> Actualiser
        </button>
      </div>

      {/* 2. SUMMARY KPI STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Total Expéditions</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{totalShipmentsCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plane style={{ width: 18 }} />
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Fret Aérien Express</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#EA580C", marginTop: 2 }}>{airCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FFF7ED", color: "#EA580C", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plane style={{ width: 18 }} />
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Fret Maritime Groupage</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0284C7", marginTop: 2 }}>{seaCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F0F9FF", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ship style={{ width: 18 }} />
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Livrées à Destination</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#16A34A", marginTop: 2 }}>{deliveredShipmentsCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F0FDF4", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plane style={{ width: 18 }} />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS TOOLBAR */}
      <div
        style={{
          background: "#FFFFFF",
          padding: "16px 20px",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 460 }}>
          <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, color: "#94A3B8" }} />
          <input
            type="text"
            placeholder="Rechercher par N° tracking, transporteur, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              borderRadius: 10,
              border: "1.5px solid #E2E8F0",
              outline: "none",
              fontSize: 13,
              fontWeight: 500,
              background: "#F8FAFC",
              color: "#0F172A"
            }}
          />
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", background: "#F1F5F9", padding: "6px 12px", borderRadius: 999 }}>
          {filteredShipments.length} expédition{filteredShipments.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* 4. BALANCED SHIPMENTS TABLE */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 18,
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
          overflow: "hidden"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0" }}>
                <th style={{ padding: "14px 18px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tracking Logistique</th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Transporteur & Mode</th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Destination</th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Poids / Volume</th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Arrivée Estimée</th>
                <th style={{ padding: "14px 18px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#64748B" }}>
                    <Plane style={{ width: 26, height: 26, margin: "0 auto 10px", color: "#165491" }} />
                    <div style={{ fontWeight: 600 }}>Chargement des expéditions...</div>
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#64748B" }}>
                    <Plane style={{ width: 40, height: 40, margin: "0 auto 10px", color: "#CBD5E1" }} />
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>Aucune expédition trouvée</div>
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s, idx) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: "1px solid #F1F5F9",
                      background: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                      transition: "background-color 0.15s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F8FAFC"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA"; }}
                  >
                    <td style={{ padding: "14px 18px", fontWeight: 700, color: "#165491", fontFamily: "monospace" }}>
                      {s.tracking_number || "CLA-TRANSIT-PENDING"}
                    </td>

                    <td style={{ padding: "14px 14px" }}>
                      <div style={{ fontWeight: 700, color: "#0F172A" }}>{s.carrier || "CargoLink Direct Partner"}</div>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 6,
                          marginTop: 3,
                          background: s.shipping_mode === "air" ? "#FFF7ED" : "#EFF6FF",
                          color: s.shipping_mode === "air" ? "#EA580C" : "#2563EB"
                        }}
                      >
                        {s.shipping_mode === "air" ? (
                          <><Plane style={{ width: 12, height: 12 }} /> Fret Aérien</>
                        ) : (
                          <><Ship style={{ width: 12, height: 12 }} /> Fret Maritime</>
                        )}
                      </span>
                    </td>

                    <td style={{ padding: "14px 14px" }}>
                      <div style={{ fontWeight: 700, color: "#0F172A" }}>{s.destination_city || "Cotonou"}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{s.destination_country || "Bénin"}</div>
                    </td>

                    <td style={{ padding: "14px 14px", fontWeight: 700, color: "#0F172A" }}>
                      {s.weight ? `${s.weight} kg` : "—"}
                      {s.volume ? ` • ${s.volume} m³` : ""}
                    </td>

                    <td style={{ padding: "14px 14px", fontSize: 12.5, fontWeight: 600, color: "#475569" }}>
                      {s.estimated_arrival ? new Date(s.estimated_arrival).toLocaleDateString("fr-FR") : "En transit"}
                    </td>

                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <StatusBadge status={s.status} type="order" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
