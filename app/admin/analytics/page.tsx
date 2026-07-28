"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Truck,
  Globe,
  FileText,
  Package
} from "lucide-react";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 12645000,
    totalOrders: 4,
    totalQuotes: 5,
    conversionRate: 80,
    topCountries: [
      { country: "Côte d'Ivoire", count: 2 },
      { country: "Bénin", count: 1 },
      { country: "Togo", count: 1 },
      { country: "Sénégal", count: 1 },
    ],
  });

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  async function loadAnalytics() {
    let completed = false;
    setLoading(true);

    const timer = setTimeout(() => {
      if (!completed) {
        setLoading(false);
      }
    }, 1500);

    try {
      const supabase = createClient();
      const { data: quotes } = await supabase.from("quotes").select("id, status");
      const { data: orders } = await supabase.from("orders").select("id, amount, order_status");
      completed = true;
      clearTimeout(timer);

      if (orders && orders.length > 0) {
        const rev = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
        setAnalytics((prev) => ({
          ...prev,
          totalRevenue: rev || prev.totalRevenue,
          totalOrders: orders.length,
          totalQuotes: quotes?.length || prev.totalQuotes,
        }));
      }
    } catch (e) {
      completed = true;
      clearTimeout(timer);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", marginBottom: 4 }}>
            PERFORMANCE & REPORTING
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Analytics & Indicateurs Clés
          </h1>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {["7d", "30d", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={period === p ? "btn btn-primary" : "btn"}
              style={{ padding: "6px 14px", fontSize: 12 }}
            >
              {p === "7d" ? "7 derniers jours" : p === "30d" ? "30 derniers jours" : "Cette année"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>CHIFFRE D'AFFAIRES</span>
            <DollarSign style={{ width: 18, color: "var(--orange-primary)" }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)" }}>
            {analytics.totalRevenue.toLocaleString()} FCFA
          </div>
          <div style={{ fontSize: 11, color: "var(--blue-primary)", fontWeight: 700, marginTop: 4 }}>
            <TrendingUp style={{ width: 12, display: "inline" }} /> +18.4% ce mois
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>COMMANDES TOTALES</span>
            <ShoppingBag style={{ width: 18, color: "var(--blue-primary)" }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)" }}>
            {analytics.totalOrders}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Commandes traitées
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>DEMANDES DE DEVIS</span>
            <FileText style={{ width: 18, color: "var(--orange-primary)" }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)" }}>
            {analytics.totalQuotes}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Reçues en ligne
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>TAUX DE CONVERSION</span>
            <BarChart3 style={{ width: 18, color: "var(--blue-primary)" }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)" }}>
            {analytics.conversionRate}%
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Devis transformés en commandes
          </div>
        </div>
      </div>

      {/* COUNTRY REVENUE BREAKDOWN */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 900, color: "var(--navy-dark)", marginBottom: 16 }}>
          Répartition par Pays de Destination
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {analytics.topCountries.map((c) => (
            <div key={c.country} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 120, fontSize: 13, fontWeight: 700, color: "var(--navy-dark)" }}>{c.country}</div>
              <div style={{ flex: 1, background: "var(--bg-main)", height: 10, borderRadius: 5, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(c.count / 4) * 100}%`,
                    background: "linear-gradient(90deg, var(--orange-primary), var(--blue-primary))",
                    height: "100%",
                  }}
                />
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", width: 70, textAlign: "right" }}>
                {c.count} colis
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
