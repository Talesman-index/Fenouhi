"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { DEMO_DISPUTES } from "@/lib/admin/demo-data";
import { AlertTriangle, Search, MessageSquare, CheckCircle2, ShieldAlert } from "lucide-react";

export default function DisputesManagementPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDisputes();
  }, []);

  async function fetchDisputes() {
    let completed = false;
    setLoading(true);

    const timer = setTimeout(() => {
      if (!completed) {
        setDisputes(DEMO_DISPUTES);
        setLoading(false);
      }
    }, 1500);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("disputes").select("*, order:orders(*), profile:profiles(*)").order("created_at", { ascending: false });
      completed = true;
      clearTimeout(timer);

      if (error || !data || data.length === 0) {
        setDisputes(DEMO_DISPUTES);
      } else {
        setDisputes(data);
      }
    } catch (err) {
      completed = true;
      clearTimeout(timer);
      setDisputes(DEMO_DISPUTES);
    } finally {
      setLoading(false);
    }
  }

  const filteredDisputes = disputes.filter((d) => {
    const title = (d.title || "").toLowerCase();
    const client = `${d.profile?.first_name || ""} ${d.profile?.last_name || ""}`.toLowerCase();
    const query = search.toLowerCase();
    return title.includes(query) || client.includes(query);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--orange-light)", color: "var(--orange-hover)", marginBottom: 4 }}>
            RÉCLAMATIONS & SERVICE CLIENT
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Gestion des Litiges & Reclamations
          </h1>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)" }}>
          Total : <strong>{filteredDisputes.length}</strong> litiges enregistrés
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="card" style={{ padding: 18, display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--bg-main)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "8px 12px", gap: 8 }}>
          <Search style={{ width: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher un litige par sujet, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 13.5, fontWeight: 600 }}
          />
        </div>
      </div>

      {/* DISPUTES TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Sujet du Litige</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Commande</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Client</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Priorité</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Chargement des litiges...
                  </td>
                </tr>
              ) : filteredDisputes.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Aucun litige ouvert. Tout va bien !
                  </td>
                </tr>
              ) : (
                filteredDisputes.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--navy-dark)" }}>{d.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.description}</div>
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--blue-primary)" }}>
                      {d.order?.order_number || "—"}
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                      {d.profile ? `${d.profile.first_name || ""} ${d.profile.last_name || ""}` : "Client"}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <span className="badge" style={{ background: d.priority === "high" ? "var(--orange-light)" : "var(--bg-main)", color: d.priority === "high" ? "var(--orange-hover)" : "var(--navy-dark)", fontSize: 10, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {d.priority === "high" ? <><AlertTriangle style={{ width: 12, height: 12 }} /> Élevée</> : "Moyenne"}
                      </span>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={d.status} type="order" />
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
