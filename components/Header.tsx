"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import { 
  Menu, X, Search, PlusCircle, Grid, User, LogIn, UserPlus,
  MapPin, ChevronDown, Gift, Radio, Home, Package, ShieldCheck, 
  HelpCircle, Building2, ShoppingBag, Download
} from "lucide-react";

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    }
    checkAuth();
  }, [pathname]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [drawerOpen]);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <>
      {/* MAIN NAVIGATION HEADER (SPACIOUS 14PX VERTICAL PADDING) */}
      <header className="main-header" style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0", padding: "14px 0", position: "sticky", top: 0, zIndex: 500 }}>
        <div className="container">
          
          {/* TOP ROW: LOGO, SEARCH (DESKTOP) & ACTIONS */}
          <div className="header-top-row">
            
            {/* LOGO & HAMBURGER */}
            <div className="header-logo-wrap">
              <button className="mobile-menu-btn" onClick={toggleDrawer} aria-label="Menu Mobile">
                <Menu style={{ width: 24, height: 24, color: "#0F172A" }} />
              </button>
              
              <Logo href="/" size={38} />
            </div>

            {/* SEARCH BAR (DESKTOP ONLY - HIDDEN ON MOBILE/TABLET STRICTLY) */}
            <div className="header-search-bar desktop-only">
              <span style={{ color: "#38BDF8", marginRight: 8, display: "flex", alignItems: "center", fontSize: 15 }}>✦</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for any product or factory in China..." 
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, fontWeight: 600, color: "#0F172A" }}
              />
              <Link 
                href={`/quote-request?url=${encodeURIComponent(searchQuery)}`}
                className="search-submit-btn" 
                aria-label="Rechercher" 
                style={{ width: 34, height: 34, background: "#0F172A", color: "#FFF", borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", textDecoration: "none" }}
              >
                <Search style={{ width: 14 }} />
              </Link>
            </div>

            {/* RIGHT CONTROLS (ONLY DEVIS GRATUIT ON MOBILE) */}
            <div className="header-right-actions">
              
              {/* LOCATION PICKER (DESKTOP ONLY) */}
              <div className="desktop-only" style={{ alignItems: "center", gap: 6, fontSize: 12, color: "#475569", cursor: "pointer" }}>
                <MapPin style={{ width: 15, color: "#0F172A" }} />
                <div>
                  <div style={{ fontSize: 9, color: "#94A3B8" }}>Delivering to</div>
                  <div style={{ fontWeight: 800, color: "#0F172A" }}>Cotonou, Bénin</div>
                </div>
              </div>

              {/* CURRENCY SELECTOR (DESKTOP ONLY) */}
              <div className="desktop-only" style={{ alignItems: "center", gap: 4, fontSize: 12, fontWeight: 800, color: "#0F172A", cursor: "pointer" }}>
                <span>🇧🇯 FCFA</span>
                <ChevronDown style={{ width: 13 }} />
              </div>

              {/* USER / AUTH BUTTONS (DESKTOP ONLY) */}
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn btn-pill-sm desktop-only" style={{ background: "#0F172A", color: "#FFF", padding: "8px 16px", fontSize: 13, fontWeight: 800, borderRadius: 9999, alignItems: "center", gap: 6 }}>
                  <User style={{ width: 14 }} /> <span>Mon Espace</span>
                </Link>
              ) : (
                <div className="desktop-only" style={{ gap: 6, alignItems: "center" }}>
                  <Link href="/auth/login" className="btn btn-pill-sm" style={{ background: "rgba(15,23,42,0.06)", color: "#0F172A", padding: "8px 16px", fontSize: 13, fontWeight: 800, borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                    <LogIn style={{ width: 14 }} /> <span>Sign In</span>
                  </Link>
                  <Link href="/auth/sign-up" className="btn btn-pill-sm" style={{ background: "#0F172A", color: "#FFF", padding: "8px 16px", fontSize: 13, fontWeight: 800, borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                    <UserPlus style={{ width: 14 }} /> <span>S'inscrire</span>
                  </Link>
                </div>
              )}

              {/* DEVIS GRATUIT BUTTON (ALWAYS VISIBLE - DESKTOP & MOBILE) */}
              <Link href="/quote-request" className="btn btn-orange header-devis-btn">
                <PlusCircle className="header-devis-icon" /> <span>Devis Gratuit</span>
              </Link>
            </div>
          </div>

          {/* MOBILE SEARCH ROW (SINGLE SEARCH BAR WITH ELEGANT PADDING < 1025PX) */}
          <div className="mobile-search-row" style={{ marginTop: 14, marginBottom: 2 }}>
            <div style={{ display: "flex", alignItems: "center", background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: 9999, padding: "7px 8px 7px 16px", width: "100%" }}>
              <span style={{ color: "#38BDF8", marginRight: 8, fontSize: 15 }}>✦</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for any product or factory in China..." 
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, fontWeight: 600, color: "#0F172A" }}
              />
              <Link 
                href={`/quote-request?url=${encodeURIComponent(searchQuery)}`}
                style={{ width: 32, height: 32, background: "#0F172A", color: "#FFF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}
              >
                <Search style={{ width: 14 }} />
              </Link>
            </div>
          </div>

        </div>
      </header>

      {/* SUB NAV BAR WITH CATEGORIES & DEALS */}
      <nav className="subnav-bar" style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0", padding: "10px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          
          <ul className="subnav-list" style={{ display: "flex", gap: 22, listStyle: "none", margin: 0, padding: 0, alignItems: "center" }}>
            <li>
              <Link href="/catalog" style={{ fontWeight: 900, color: "#0F172A", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <Grid style={{ width: 15 }} /> All Categories <ChevronDown style={{ width: 13 }} />
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=electronics" style={{ fontSize: 13, fontWeight: 700, color: pathname === "/catalog" ? "#165491" : "#475569" }}>
                Electronics
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=fashion" style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                Fashion
              </Link>
            </li>
            <li>
              <Link href="/suppliers" style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                Women's
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                Kids' Fashion
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=beauty" style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                Healthy & Beauty
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=agro" style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                Groceries
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=wholesale" style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                Luxury Item
              </Link>
            </li>
          </ul>

          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, fontWeight: 800 }}>
            <Link href="/quote-request" style={{ color: "var(--orange-primary)", display: "flex", alignItems: "center", gap: 4 }}>
              <Gift style={{ width: 15 }} /> Best Deals
            </Link>
            <Link href="/dashboard" style={{ color: "#165491", display: "flex", alignItems: "center", gap: 4 }}>
              <Radio style={{ width: 15, color: "#EF4444" }} /> CargoLink Live 🔴
            </Link>
          </div>

        </div>
      </nav>

      {/* MOBILE DRAWER OVERLAY & SLIDING DRAWER MENU */}
      <div 
        className={`mobile-drawer-overlay ${drawerOpen ? "active" : ""}`} 
        onClick={toggleDrawer}
      />

      <div className={`mobile-nav-drawer ${drawerOpen ? "active" : ""}`}>
        {/* DRAWER HEADER */}
        <div className="drawer-header" style={{ padding: "18px 20px", background: "#0F172A", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo light size={32} subtitleText="CHINE ➔ AFRIQUE" href={null} onClick={toggleDrawer} />
          <button 
            onClick={toggleDrawer} 
            className="drawer-close-btn"
            style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#FFF", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X style={{ width: 18 }} />
          </button>
        </div>

        {/* DRAWER SEARCH BAR */}
        <div style={{ padding: "14px 16px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "center", background: "#FFF", border: "1px solid #CBD5E1", borderRadius: 9999, padding: "6px 12px" }}>
            <span style={{ color: "#38BDF8", marginRight: 6 }}>✦</span>
            <input 
              type="text" 
              placeholder="Rechercher produit ou usine..." 
              style={{ width: "100%", border: "none", outline: "none", fontSize: 12.5, fontWeight: 600 }}
            />
            <Search style={{ width: 15, color: "#64748B" }} />
          </div>
        </div>

        {/* DRAWER NAVIGATION LIST */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: "#94A3B8", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
            Navigation Principale
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <li>
              <Link href="/" onClick={toggleDrawer} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, color: "#0F172A", fontWeight: 800, fontSize: 14, textDecoration: "none", background: pathname === "/" ? "#F1F5F9" : "transparent" }}>
                <Home style={{ width: 18, color: "#165491" }} /> Accueil
              </Link>
            </li>
            <li>
              <Link href="/catalog" onClick={toggleDrawer} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, color: "#0F172A", fontWeight: 800, fontSize: 14, textDecoration: "none", background: pathname === "/catalog" ? "#F1F5F9" : "transparent" }}>
                <ShoppingBag style={{ width: 18, color: "#165491" }} /> Catalogue Produits Usines
              </Link>
            </li>
            <li>
              <Link href="/quote-request" onClick={toggleDrawer} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, color: "var(--orange-hover)", fontWeight: 800, fontSize: 14, textDecoration: "none", background: "var(--orange-light)" }}>
                <PlusCircle style={{ width: 18, color: "var(--orange-primary)" }} /> Demander un Devis Sur-Mesure
              </Link>
            </li>
            <li>
              <Link href="/dashboard" onClick={toggleDrawer} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, color: "#0F172A", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>
                <Package style={{ width: 18, color: "#165491" }} /> Suivi de Colis & Dashboard
              </Link>
            </li>
            <li>
              <Link href="/suppliers" onClick={toggleDrawer} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, color: "#0F172A", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>
                <Building2 style={{ width: 18, color: "#165491" }} /> Usines Partenaires Chine
              </Link>
            </li>
            <li style={{ marginTop: 6 }}>
              <button
                onClick={() => {
                  toggleDrawer();
                  window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: 12,
                  color: "#FFFFFF",
                  fontWeight: 900,
                  fontSize: 13.5,
                  background: "linear-gradient(135deg, #0F172A 0%, #165491 100%)",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.15)"
                }}
              >
                <Download style={{ width: 18, color: "#38BDF8" }} />
                <span>Installer l'App Mobile</span>
                <span style={{ marginLeft: "auto", background: "#38BDF8", color: "#0F172A", fontSize: 9.5, fontWeight: 900, padding: "2px 8px", borderRadius: 9999 }}>PWA</span>
              </button>
            </li>
          </ul>

          <div style={{ height: 1, background: "#E2E8F0", margin: "16px 0" }} />

          <div style={{ fontSize: 10, fontWeight: 900, color: "#94A3B8", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
            Espace Compte & Authentification
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isLoggedIn ? (
              <Link 
                href="/dashboard" 
                onClick={toggleDrawer}
                className="btn btn-primary"
                style={{ width: "100%", padding: 12, borderRadius: 10, textAlign: "center", fontWeight: 800, fontSize: 13.5, background: "#0F172A", color: "#FFF", textDecoration: "none" }}
              >
                Mon Espace Client
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  onClick={toggleDrawer}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: 12, borderRadius: 10, fontWeight: 800, fontSize: 13.5, background: "#F1F5F9", color: "#0F172A", textDecoration: "none", border: "1px solid #E2E8F0" }}
                >
                  <LogIn style={{ width: 16 }} /> Se Connecter
                </Link>
                <Link 
                  href="/auth/sign-up" 
                  onClick={toggleDrawer}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: 12, borderRadius: 10, fontWeight: 800, fontSize: 13.5, background: "#0F172A", color: "#FFF", textDecoration: "none" }}
                >
                  <UserPlus style={{ width: 16 }} /> Créer un Compte Client
                </Link>
              </>
            )}
          </div>

          <div style={{ height: 1, background: "#E2E8F0", margin: "16px 0" }} />

          <div style={{ background: "#F8FAFC", padding: 12, borderRadius: 12, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800, color: "#0F172A" }}>
              <MapPin style={{ width: 15, color: "#165491" }} /> 🇧🇯 Bénin (Cotonou)
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>FCFA</span>
          </div>
        </div>

        {/* DRAWER FOOTER */}
        <div style={{ padding: 16, borderTop: "1px solid #E2E8F0", background: "#F8FAFC", textAlign: "center", fontSize: 11, color: "#94A3B8" }}>
          © CargoLink Africa — Logistique Directe Chine
        </div>
      </div>
    </>
  );
}
