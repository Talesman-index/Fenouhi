"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Truck,
  Globe,
  Clock,
  FileText,
  Package,
  Star
} from "lucide-react";

type Period = "today" | "7d" | "30d" | "3m" | "year" | "custom";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalQuotes: number;
  acceptedQuotes: number;
  avgOrderValue: number;
  cancelledOrders: number;
  totalOrdered: number;
  topCountries: { country: string; count: number }[];
  ordersByMonth: { month: string; count: number; revenue: number }[];
  conversionRate: number;
  avgDeliveryDays: number;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const supabase = createClient();

      let startDate: Date;
      const now = new Date();

      switch (period) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "3m":
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Fetch Orders for period
      const { data: ordersData } = await supabase
        .from("orders")
        .select("amount, order_status, destination_country")
        .gte("created_at", startDate.toISOString());

      const orders = ordersData || [];
      const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
      const totalOrders = orders.length;
      const cancelledOrders = orders.filter((o) => o.order_status === "cancelled").length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Country breakdown
      const countryMap: Record<string, number> = {};
      orders.forEach((o) => {
        const c = o.destination_country || "Bénin";
        countryMap[c] = (countryMap[c] || 0) + 1;
      });
      const topCountries = Object.entries(countryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([country, count]) => ({ country, count }));

      // Fetch Quotes
      const { data: quotesData } = await supabase
        .from("quotes")
        .select("status")
        .gte("created_at", startDate.toISOString());

      const quotes = quotesData || [];
      const totalQuotes = quotes.length;
      const acceptedQuotes = quotes.filter((q) => q.status === "accepted").length;
      const conversionRate = totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;

      // Monthly chart data (last 7 months)
      const ordersByMonth = await buildMonthlyData(supabase);

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalQuotes,
        acceptedQuotes,
        avgOrderValue,
        cancelledOrders,
        totalOrdered: totalOrders,
        topCountries,
        ordersByMonth,
        conversionRate,
        avgDeliveryDays: 18,
      });
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  async function buildMonthlyData(supabase: any) {
    const months = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString("fr-FR", { month: "short", year: "2-digit" });
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const { data } = await supabase
        .from("orders")
        .select("amount")
        .gte("created_at", d.toISOString())
        .lt("created_at", nextMonth.toISOString());

      const count = data?.length || 0;
      const revenue = (data || []).reduce((s: number, o: any) => s + (Number(o.amount) || 0), 0);
      months.push({ month: monthLabel, count, revenue });
    }
    return months;
  }

  const PERIODS = [
    { value: "today", label: "Aujourd'hui" },
    { value: "7d", label: "7 derniers jours" },
    { value: "30d", label: "30 derniers jours" },
    { value: "3m", label: "3 derniers mois" },
    { value: "year", label: "Année en cours" },
  ];

  const maxMonthCount = Math.max(...(analytics?.ordersByMonth.map((m) => m.count) || [1]));
  const maxMonthRevenue = Math.max(...(analytics?.ordersByMonth.map((m) => m.revenue) || [1]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="badge" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", marginBottom: 4 }}>
            TABLEAU DE BORD ANALYTIQUE
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy-dark)", margin: 0 }}>
            Analytics & Rapports
          </h1>
        </div>

        {/* PERIOD SELECTOR */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value as Period)}
              className="btn"
              style={{
                padding: "7px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                background: period === p.value ? "var(--navy-dark)" : "#FFF",
                color: period === p.value ? "#FFF" : "var(--navy-dark)",
                border: "1px solid var(--border-light)"
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          Calcul des statistiques de la plateforme...
        </div>
      ) : analytics ? (
        <>
          {/* KPI ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 6 }}>CHIFFRE D'AFFAIRES</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--green-success)" }}>
                {analytics.totalRevenue.toLocaleString()} FCFA
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Sur la période sélectionnée</div>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 6 }}>COMMANDES REÇUES</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--navy-dark)" }}>{analytics.totalOrders}</div>
              <div style={{ fontSize: 11, color: "#DC2626", marginTop: 4 }}>{analytics.cancelledOrders} annulées</div>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 6 }}>TAUX DE CONVERSION DEVIS</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: analytics.conversionRate > 50 ? "var(--green-success)" : "#D97706" }}>
                {analytics.conversionRate}%
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                {analytics.acceptedQuotes} acceptés / {analytics.totalQuotes} soumis
              </div>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 6 }}>PANIER MOYEN</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--navy-dark)" }}>
                {analytics.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} FCFA
              </div>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 6 }}>DÉLAI MOYEN LIVRAISON</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--blue-primary)" }}>
                {analytics.avgDeliveryDays} jours
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Chine ➔ Cotonou</div>
            </div>
          </div>

          {/* CHARTS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {/* ORDERS BY MONTH CHART */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--navy-dark)", margin: "0 0 16px" }}>
                Commandes par Mois
              </h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
                {analytics.ordersByMonth.map((bar, idx) => (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "var(--navy-dark)" }}>{bar.count}</span>
                    <div
                      style={{
                        width: "100%",
                        height: maxMonthCount > 0 ? `${(bar.count / maxMonthCount) * 130}px` : "4px",
                        minHeight: 4,
                        borderRadius: "4px 4px 0 0",
                        background: idx === analytics.ordersByMonth.length - 1 ? "var(--orange-primary)" : "var(--blue-primary)"
                      }}
                    />
                    <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* REVENUE BY MONTH CHART */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--navy-dark)", margin: "0 0 16px" }}>
                Revenus par Mois (FCFA)
              </h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
                {analytics.ordersByMonth.map((bar, idx) => (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "var(--green-success)" }}>
                      {bar.revenue > 0 ? `${(bar.revenue / 1000000).toFixed(1)}M` : "0"}
                    </span>
                    <div
                      style={{
                        width: "100%",
                        height: maxMonthRevenue > 0 ? `${(bar.revenue / maxMonthRevenue) * 130}px` : "4px",
                        minHeight: 4,
                        borderRadius: "4px 4px 0 0",
                        background: "var(--green-success)"
                      }}
                    />
                    <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TOP COUNTRIES */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--navy-dark)", margin: "0 0 16px" }}>
              Top Pays Clients
            </h3>
            {analytics.topCountries.length === 0 ? (
              <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 20 }}>Aucune donnée disponible</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {analytics.topCountries.map((c, idx) => {
                  const pct = analytics.totalOrders > 0 ? (c.count / analytics.totalOrders) * 100 : 0;
                  return (
                    <div key={c.country} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)", width: 20 }}>{idx + 1}.</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, color: "var(--navy-dark)", fontSize: 14 }}>{c.country}</span>
                          <span style={{ fontWeight: 800, color: "var(--blue-primary)", fontSize: 13 }}>{c.count} commandes ({pct.toFixed(1)}%)</span>
                        </div>
                        <div style={{ height: 6, background: "var(--bg-main)", borderRadius: 9999 }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: "var(--blue-primary)", borderRadius: 9999 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
