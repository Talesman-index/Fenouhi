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

  // Summary stats
  const totalPaymentsCount = payments.length;
  const paidCount = payments.filter((p) => p.status === "paid" || p.status === "completed" || p.status === "successful").length;
  const pendingCount = payments.filter((p) => p.status === "pending" || p.status === "processing").length;
  const totalPaidSum = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div style={{ padding: "20px 0 60px", maxWidth: 1280, margin: "0 auto" }}>
      {/* 1. HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(22, 163, 74, 0.08)", color: "#16A34A", padding: "4px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
            <CreditCard style={{ width: 14, height: 14 }} /> TRANSACTIONS FINANCIÈRES & ENCAISSEMENTS
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Gestion des Paiements & Règlements
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
            Vérifiez les paiements Mobile Money (MTN, Moov, Wave, Orange Money) et virements bancaires.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPayments}
          className="btn"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569", borderRadius: 12, fontWeight: 600, fontSize: 13, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}
        >
          <CreditCard style={{ width: 15 }} /> Actualiser
        </button>
      </div>

      {/* 2. SUMMARY KPI STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Total Transactions</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{totalPaymentsCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard style={{ width: 18 }} />
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Paiements Validés</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#16A34A", marginTop: 2 }}>{paidCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F0FDF4", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 style={{ width: 18 }} />
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>En Attente / Revue</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#EA580C", marginTop: 2 }}>{pendingCount}</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FFF7ED", color: "#EA580C", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock style={{ width: 18 }} />
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "14px 18px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(15,23,42,0.03)" }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Total Encaissé</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{totalPaidSum.toLocaleString()} FCFA</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DollarSign style={{ width: 18 }} />
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
            placeholder="Rechercher par N° transaction, client, commande..."
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
          {filteredPayments.length} paiement{filteredPayments.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* 4. BALANCED PAYMENTS TABLE */}
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
                <th style={{ padding: "14px 18px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>N° Transaction</th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Commande Associée</th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Client</th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Montant Réglé</th>
                <th style={{ padding: "14px 14px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mode de Paiement</th>
                <th style={{ padding: "14px 18px", fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#64748B" }}>
                    <CreditCard style={{ width: 26, height: 26, margin: "0 auto 10px", color: "#165491" }} />
                    <div style={{ fontWeight: 600 }}>Chargement des transactions financières...</div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#64748B" }}>
                    <CreditCard style={{ width: 40, height: 40, margin: "0 auto 10px", color: "#CBD5E1" }} />
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>Aucun paiement trouvé</div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p, idx) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #F1F5F9",
                      background: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                      transition: "background-color 0.15s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F8FAFC"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA"; }}
                  >
                    <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0F172A", fontFamily: "monospace" }}>
                      {p.transaction_id || "TX-PENDING"}
                    </td>

                    <td style={{ padding: "14px 14px", fontWeight: 700, color: "#165491" }}>
                      {p.order?.order_number || "—"}
                    </td>

                    <td style={{ padding: "14px 14px" }}>
                      <div style={{ fontWeight: 700, color: "#0F172A" }}>
                        {p.profile ? `${p.profile.first_name || ""} ${p.profile.last_name || ""}` : "Client Inconnu"}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{p.profile?.email}</div>
                    </td>

                    <td style={{ padding: "14px 14px", fontWeight: 800, color: "#0F172A", fontSize: 14 }}>
                      {(Number(p.amount) || 0).toLocaleString()} {p.currency || "FCFA"}
                    </td>

                    <td style={{ padding: "14px 14px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 8,
                          background: "#EFF6FF",
                          color: "#1D4ED8",
                          border: "1px solid #DBEAFE"
                        }}
                      >
                        {p.method === "mobile_money" ? (
                          <><Smartphone style={{ width: 12, height: 12 }} /> Mobile Money</>
                        ) : (
                          <><Landmark style={{ width: 12, height: 12 }} /> Virement / Carte</>
                        )}
                      </span>
                    </td>

                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
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
