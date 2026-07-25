"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, X, Search, ShieldCheck, Package, FileText, PlusCircle, 
  Home, Grid, Truck, Shield, Headphones, Building
} from "lucide-react";

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="top-bar">
        <div className="container top-bar-content">
          <div>
            <ShieldCheck style={{ width: 14, color: "var(--green-success)", display: "inline", marginRight: 4 }} />
            Sourcing direct usines certifiées Guangzhou & Shenzhen • Dédouanement garanti
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/dashboard?tab=orders" style={{ color: "var(--navy-dark)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <Package style={{ width: 14, color: "var(--orange-primary)" }} /> Suivi de Colis
            </Link>
            <Link href="/quote-request" style={{ color: "var(--navy-dark)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <FileText style={{ width: 14, color: "var(--orange-primary)" }} /> Obtenir un Devis
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION HEADER */}
      <header className="main-header">
        <div className="container main-header-content">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button className="mobile-menu-btn" onClick={toggleDrawer} aria-label="Menu Mobile">
              {drawerOpen ? <X style={{ width: 22, color: "var(--navy-dark)" }} /> : <Menu style={{ width: 22, color: "var(--navy-dark)" }} />}
            </button>
            <Link href="/" className="logo-box">
              <svg className="logo-img" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="#0F172A"/>
                <path d="M20 8L31 29H24.5L20 20L15.5 29H9L20 8Z" fill="#165491"/>
                <circle cx="20" cy="14" r="3" fill="#FFF"/>
              </svg>
              <div className="logo-text-wrap">
                <span className="logo-text-main">CargoLink</span>
                <span className="logo-text-sub">LOGISTIQUE CHINE - AFRIQUE</span>
              </div>
            </Link>
          </div>

          <div className="search-bar-wrap">
            <input type="text" className="search-input" placeholder="Rechercher un produit, une usine en Chine, une référence..." />
            <button className="search-submit-btn" aria-label="Rechercher">
              <Search style={{ width: 18 }} />
            </button>
          </div>

          <div className="header-actions">
            <Link href="/quote-request" className="btn btn-orange btn-pill-sm">
              <PlusCircle style={{ width: 16 }} /> Devis Gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* SUB NAV BAR */}
      <nav className="subnav-bar">
        <div className="container">
          <ul className="subnav-list">
            <li>
              <Link href="/" className={`subnav-link ${pathname === "/" ? "active" : ""}`}>
                <Home style={{ width: 16 }} /> Accueil
              </Link>
            </li>
            <li>
              <Link href="/catalog" className={`subnav-link ${pathname === "/catalog" ? "active" : ""}`}>
                <Grid style={{ width: 16 }} /> Catalogue Produits
              </Link>
            </li>
            <li>
              <Link href="/suppliers" className={`subnav-link ${pathname === "/suppliers" ? "active" : ""}`}>
                <Building style={{ width: 16 }} /> Fournisseurs Chine
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className={`subnav-link ${pathname === "/shipping-policy" ? "active" : ""}`}>
                <Truck style={{ width: 16 }} /> Fret & Expédition
              </Link>
            </li>
            <li>
              <Link href="/returns-warranty" className={`subnav-link ${pathname === "/returns-warranty" ? "active" : ""}`}>
                <Shield style={{ width: 16 }} /> Retours & Garanties
              </Link>
            </li>
            <li>
              <Link href="/contact" className={`subnav-link ${pathname === "/contact" ? "active" : ""}`}>
                <Headphones style={{ width: 16 }} /> Assistance Client
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* MOBILE DRAWER OVERLAY */}
      {drawerOpen && (
        <div className="mobile-drawer-overlay open" onClick={toggleDrawer}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 900, color: "var(--navy-dark)", fontSize: 18 }}>CargoLink</span>
              </div>
              <button onClick={toggleDrawer} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: 22 }} />
              </button>
            </div>
            <div className="mobile-drawer-body">
              <ul className="mobile-nav-list" style={{ listStyle: "none", padding: 0 }}>
                <li style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                  <Link href="/" onClick={toggleDrawer} style={{ fontWeight: 800, color: "var(--navy-dark)" }}>Accueil</Link>
                </li>
                <li style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                  <Link href="/catalog" onClick={toggleDrawer} style={{ fontWeight: 800, color: "var(--navy-dark)" }}>Catalogue Produits</Link>
                </li>
                <li style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                  <Link href="/quote-request" onClick={toggleDrawer} style={{ fontWeight: 800, color: "var(--orange-primary)" }}>Demander un Devis Sur-Mesure</Link>
                </li>
                <li style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                  <Link href="/dashboard" onClick={toggleDrawer} style={{ fontWeight: 800, color: "var(--navy-dark)" }}>Suivi de Colis & Dashboard</Link>
                </li>
                <li style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                  <Link href="/admin" onClick={toggleDrawer} style={{ fontWeight: 800, color: "var(--blue-primary)" }}>Portail Administration</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
