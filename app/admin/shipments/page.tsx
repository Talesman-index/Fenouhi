"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { DEMO_SHIPMENTS } from "@/lib/admin/demo-data";
import { Search } from "lucide-react";
import type { Shipment } from "@/types/supabase";

export default function ShipmentsManagementPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchShipments();
  }, []);

  async function fetchShipments() {
    let completed = false;
    setLoading(true);

    const timer = setTimeout(() => {
      if (!completed) {
        setShipments(DEMO_SHIPMENTS);
        setLoading(false);
      }
    }, 1500);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("shipments").select("*").order("created_at", { ascending: false });
      completed = true;
      clearTimeout(timer);

      if (error || !data || data.length === 0) {
        setShipments(DEMO_SHIPMENTS);
      } else {
        setShipments(data as Shipment[]);
      }
    } catch (err) {
      completed = true;
      clearTimeout(timer);
      setShipments(DEMO_SHIPMENTS);
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 4 }}>
            SUIVI CARGO & EXPÉDITIONS
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Gestion des Expéditions (Cargo & Fret)
          </h1>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)" }}>
          Total : <strong>{filteredShipments.length}</strong> expéditions
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="card" style={{ padding: 18, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", background: "var(--bg-main)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "8px 12px", gap: 8 }}>
          <Search style={{ width: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher par N° tracking, transporteur, destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 13.5, fontWeight: 600 }}
          />
        </div>
      </div>

      {/* SHIPMENTS TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Tracking #</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Transporteur & Mode</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Destination</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Poids / Volume</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Livraison Est.</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Chargement des expéditions...
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Aucune expédition trouvée.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--blue-primary)", fontFamily: "monospace" }}>
                      {s.tracking_number || "En attente"}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--navy-dark)" }}>{s.carrier || "CargoLink Direct"}</div>
                      <span className="badge" style={{ background: s.shipping_mode === "air" ? "var(--orange-light)" : "var(--blue-light)", color: s.shipping_mode === "air" ? "var(--orange-hover)" : "var(--blue-primary)", fontSize: 10 }}>
                        {s.shipping_mode === "air" ? "✈️ Fret Aérien" : "🚢 Fret Maritime"}
                      </span>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700 }}>{s.destination_city}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.destination_country}</div>
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                      {s.weight ? `${s.weight} kg` : "—"}
                      {s.volume ? ` • ${s.volume} m³` : ""}
                    </td>

                    <td style={{ padding: "14px 16px", fontSize: 12, fontWeight: 600 }}>
                      {s.estimated_arrival ? new Date(s.estimated_arrival).toLocaleDateString("fr-FR") : "—"}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
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
