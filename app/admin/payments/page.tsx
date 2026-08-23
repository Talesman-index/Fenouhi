"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { DEMO_PAYMENTS } from "@/lib/admin/demo-data";
import { CreditCard, Search, DollarSign, CheckCircle2, Clock, AlertTriangle, Smartphone, Landmark } from "lucide-react";

export default function PaymentsManagementPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("payments").select("*, order:orders(*), profile:profiles(*)").order("created_at", { ascending: false });

      if (error || !data) {
        setPayments([]);
      } else {
        setPayments(data);
      }
    } catch (err) {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredPayments = payments.filter((p) => {
    const tx = (p.transaction_id || "").toLowerCase();
    const client = `${p.profile?.first_name || ""} ${p.profile?.last_name || ""}`.toLowerCase();
    const orderNum = (p.order?.order_number || "").toLowerCase();
    const query = search.toLowerCase();
    return tx.includes(query) || client.includes(query) || orderNum.includes(query);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", marginBottom: 4 }}>
            TRANSACTIONS & RÈGLEMENTS
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--navy-dark)", margin: 0 }}>
            Gestion des Paiements Clients
          </h1>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>
          Total : <strong>{filteredPayments.length}</strong> paiements enregistrés
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="card" style={{ padding: 18, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", background: "var(--bg-main)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "8px 12px", gap: 8 }}>
          <Search style={{ width: 16, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher par N° transaction, client, N° commande..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 13.5, fontWeight: 600 }}
          />
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>N° Transaction</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Commande</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Client</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Montant</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Mode de Paiement</th>
                <th style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 11.5 }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Chargement des paiements...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    Aucun paiement trouvé.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--navy-dark)", fontFamily: "monospace" }}>
                      {p.transaction_id || "En attente"}
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--blue-primary)" }}>
                      {p.order?.order_number || "—"}
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                      {p.profile ? `${p.profile.first_name || ""} ${p.profile.last_name || ""}` : "Client"}
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--navy-dark)", fontSize: 14 }}>
                      {(p.amount || 0).toLocaleString()} {p.currency || "FCFA"}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <span className="badge" style={{ background: "var(--bg-main)", color: "var(--navy-dark)", border: "1px solid var(--border-light)", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {p.method === "mobile_money" ? (
                          <><Smartphone style={{ width: 12, height: 12 }} /> Mobile Money</>
                        ) : (
                          <><Landmark style={{ width: 12, height: 12 }} /> Virement Bancaire</>
                        )}
                      </span>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={p.status} type="order" />
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
