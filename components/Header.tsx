"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import { useMobileStore } from "@/lib/mobile-store";
import { 
  Menu, X, Search, PlusCircle, Grid, User, LogIn, UserPlus, LogOut, FileText,
  MapPin, ChevronDown, ChevronRight, Gift, Radio, Home, Package, 
  ShoppingBag, Download, Heart, Sparkles, Check, Plane
} from "lucide-react";

export default function Header() {
  const { cart, favorites } = useMobileStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; initials: string; role: string } | null>(null);
  const pathname = usePathname();

  const totalCartItems = cart && cart.length > 0 ? cart.map((i) => i.quantity || 1).reduce((a, b) => a + b, 0) : 0;

  useEffect(() => {
    const supabase = createClient();
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        try {
          const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
          if (prof) {
            const fn = prof.first_name || "";
            const ln = prof.last_name || "";
            const fullName = `${fn} ${ln}`.trim() || user.email?.split("@")[0] || "Client Démo";
            const init = `${fn[0] || ""}${ln[0] || ""}`.toUpperCase() || "CD";
            const role = prof.account_type === "business" ? "Entreprise / PME" : prof.account_type === "reseller" ? "Revendeur" : "Particulier";
            setUserProfile({
              name: fullName,
              email: prof.email || user.email || "client.demo@cargolink.africa",
              initials: init,
              role: role
            });
          } else {
            const email = user.email || "client.demo@cargolink.africa";
            const name = user.user_metadata?.full_name || email.split("@")[0] || "Client Démo";
            const init = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "CD";
            setUserProfile({
              name,
              email,
              initials: init,
              role: "Particulier"
            });
          }
        } catch (e) {
          setUserProfile({
            name: user.email?.split("@")[0] || "Client Démo",
            email: user.email || "client.demo@cargolink.africa",
            initials: "CD",
            role: "Particulier"
          });
        }
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkAuth();
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      if (drawerOpen) setDrawerOpen(false);
      window.location.href = "/";
    } catch (e) {
      console.error("Logout error", e);
    }
  };

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
                placeholder="Rechercher un produit ou une usine en Chine..." 
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
                  <div style={{ fontSize: 9, color: "#94A3B8" }}>Livraison au Bénin</div>
                  <div style={{ fontWeight: 800, color: "#0F172A" }}>Cotonou & Régions</div>
                </div>
              </div>

              {/* FAVORITES BUTTON (NEW) */}
              <Link 
                href="/favorites" 
                title="Mes Favoris"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#DC2626",
                  textDecoration: "none",
                  position: "relative"
                }}
              >
                <Heart style={{ width: 17, height: 17, fill: "#DC2626" }} />
              </Link>

              {/* CART QUICK ACCESS (NEW) */}
              <Link 
                href="/cart" 
                title="Mon Panier"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#0F172A",
                  color: "#FFF",
                  textDecoration: "none",
                  position: "relative"
                }}
              >
                <ShoppingBag style={{ width: 16, height: 16 }} />
                {totalCartItems > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      background: "#DC2626",
                      color: "#FFF",
                      fontSize: 9.5,
                      fontWeight: 900,
                      minWidth: 16,
                      height: 16,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 2px",
                      boxShadow: "0 0 0 1.5px #FFFFFF"
                    }}
                  >
                    {totalCartItems}
                  </span>
                )}
              </Link>

              {/* USER / AUTH BUTTONS (DESKTOP ONLY) */}
              {isLoggedIn ? (
                <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Link href="/dashboard" className="btn btn-pill-sm" style={{ background: "#0F172A", color: "#FFF", padding: "8px 16px", fontSize: 13, fontWeight: 800, borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <User style={{ width: 14 }} /> <span>Mon Espace</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn btn-pill-sm"
                    title="Se déconnecter"
                    style={{ background: "rgba(220, 38, 38, 0.08)", color: "#DC2626", border: "1px solid rgba(220, 38, 38, 0.2)", padding: "8px 14px", fontSize: 12.5, fontWeight: 800, borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer" }}
                  >
                    <LogOut style={{ width: 14 }} /> <span>Déconnexion</span>
                  </button>
                </div>
              ) : (
                <div className="desktop-only" style={{ gap: 6, alignItems: "center" }}>
                  <Link href="/auth/login" className="btn btn-pill-sm" style={{ background: "rgba(15,23,42,0.06)", color: "#0F172A", padding: "8px 16px", fontSize: 13, fontWeight: 800, borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                    <LogIn style={{ width: 14 }} /> <span>Connexion</span>
                  </Link>
                  <Link href="/auth/sign-up" className="btn btn-pill-sm" style={{ background: "#0F172A", color: "#FFF", padding: "8px 16px", fontSize: 13, fontWeight: 800, borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                    <UserPlus style={{ width: 14 }} /> <span>S'inscrire</span>
                  </Link>
                </div>
              )}

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
                placeholder="Rechercher un produit ou une usine en Chine..." 
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

      {/* SUB NAV BAR WITH CATEGORIES & USEFUL FRENCH LINKS */}
      <nav className="subnav-bar" style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0", padding: "10px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          
          <ul className="subnav-list" style={{ display: "flex", gap: 22, listStyle: "none", margin: 0, padding: 0, alignItems: "center" }}>
            <li>
              <Link href="/categories" style={{ fontWeight: 900, color: "#0F172A", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <Grid style={{ width: 15 }} /> Toutes les Catégories <ChevronDown style={{ width: 13 }} />
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=electronics" style={{ fontSize: 13, fontWeight: 700, color: pathname === "/catalog" ? "#165491" : "#475569" }}>
                Électronique & High-Tech
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=fashion" style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                Mode & Chaussures
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=home" style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                Maison & Électroménager
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=machinery" style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                Machines & Outillage PME
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=beauty" style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                Beauté & Cosmétiques
              </Link>
            </li>
            <li>
              <Link href="/checkout" style={{ fontSize: 13, fontWeight: 800, color: "#16A34A", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Check style={{ width: 14, height: 14 }} />
                <span>Fret & Livraison Bénin</span>
              </Link>
            </li>
          </ul>

          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 13, fontWeight: 800 }}>
            <Link href="/quote-request" style={{ color: "var(--orange-primary)", display: "flex", alignItems: "center", gap: 4 }}>
              <Gift style={{ width: 15 }} /> Demander un Devis
            </Link>
          </div>

        </div>
      </nav>

      {/* MOBILE DRAWER OVERLAY & SLIDING DRAWER MENU */}
      <div 
        className={`mobile-drawer-overlay ${drawerOpen ? "active" : ""}`} 
        onClick={toggleDrawer}
        style={{ backdropFilter: "blur(6px)" }}
      />

      <div 
        className={`mobile-nav-drawer ${drawerOpen ? "active" : ""}`}
        style={{
          background: "#FAF7F2",
          borderRight: "1px solid #EAE5DC",
          boxShadow: "20px 0 50px rgba(15, 23, 42, 0.12)",
          display: "flex",
          flexDirection: "column",
          width: 320,
          maxWidth: "86vw",
          height: "100vh",
        }}
      >
        {/* SOFT DRAWER HEADER */}
        <div 
          className="drawer-header" 
          style={{ 
            padding: "16px 18px", 
            background: "#FFFFFF", 
            borderBottom: "1px solid #EAE5DC", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between" 
          }}
        >
          <Logo size={32} subtitleText="IMPORTATION DIRECTE BÉNIN" href={null} onClick={toggleDrawer} />
          <button 
            onClick={toggleDrawer} 
            className="drawer-close-btn"
            aria-label="Fermer le menu"
            style={{ 
              background: "#F1F5F9", 
              border: "1px solid #E2E8F0", 
              color: "#0F172A", 
              width: 34, 
              height: 34, 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
          >
            <X style={{ width: 17, height: 17 }} />
          </button>
        </div>

        {/* LOGGED IN USER ACCOUNT CARD BANNER */}
        {isLoggedIn && (
          <Link
            href="/dashboard?tab=profile"
            onClick={toggleDrawer}
            style={{
              background: "#FFFFFF",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: "1px solid #EAE5DC",
              textDecoration: "none"
            }}
          >
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#0F172A", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, flexShrink: 0, boxShadow: "0 3px 10px rgba(15,23,42,0.15)" }}>
              {userProfile?.initials || "CD"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 13.5, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {userProfile?.name || "Client Démo"}
              </div>
              <div style={{ fontSize: 11, color: "#059669", fontWeight: 800 }}>
                {userProfile?.role || "Particulier"}
              </div>
            </div>
            <ChevronRight style={{ width: 15, color: "#94A3B8" }} />
          </Link>
        )}

        {/* DRAWER NAVIGATION LIST */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 24px" }}>
          
          {/* SECTION: NAVIGATION PRINCIPALE */}
          <div style={{ fontSize: 10.5, fontWeight: 900, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, paddingLeft: 4 }}>
            Navigation & Services
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {/* 1. ACCUEIL */}
            <li>
              <Link 
                href="/" 
                onClick={toggleDrawer} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  padding: "10px 12px", 
                  borderRadius: 14, 
                  color: "#0F172A", 
                  fontWeight: pathname === "/" ? 900 : 700, 
                  fontSize: 13.5, 
                  textDecoration: "none", 
                  background: pathname === "/" ? "#FFFFFF" : "rgba(255, 255, 255, 0.6)", 
                  border: pathname === "/" ? "1px solid #CBD5E1" : "1px solid rgba(226, 232, 240, 0.8)",
                  boxShadow: pathname === "/" ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
                  transition: "all 0.18s ease"
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Home style={{ width: 17, height: 17 }} />
                </div>
                <span>Accueil</span>
                <ChevronRight style={{ width: 14, height: 14, color: "#CBD5E1", marginLeft: "auto" }} />
              </Link>
            </li>

            {/* 2. FRET & LIVRAISON */}
            <li>
              <Link 
                href="/checkout" 
                onClick={toggleDrawer} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  padding: "10px 12px", 
                  borderRadius: 14, 
                  color: "#0F172A", 
                  fontWeight: pathname === "/checkout" ? 900 : 700, 
                  fontSize: 13.5, 
                  textDecoration: "none", 
                  background: "#FFFFFF", 
                  border: "1px solid #E2E8F0",
                  transition: "all 0.18s ease"
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Plane style={{ width: 17, height: 17 }} />
                </div>
                <span>Fret & Livraison Bénin</span>
                <span style={{ marginLeft: "auto", background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0", fontSize: 10, fontWeight: 900, padding: "2px 7px", borderRadius: 9999 }}>DIRECT</span>
              </Link>
            </li>

            {/* 3. UNIVERS & CATEGORIES */}
            <li>
              <Link 
                href="/categories" 
                onClick={toggleDrawer} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  padding: "10px 12px", 
                  borderRadius: 14, 
                  color: "#0F172A", 
                  fontWeight: pathname === "/categories" ? 900 : 700, 
                  fontSize: 13.5, 
                  textDecoration: "none", 
                  background: "#FFFFFF", 
                  border: "1px solid #E2E8F0",
                  transition: "all 0.18s ease"
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Grid style={{ width: 17, height: 17 }} />
                </div>
                <span>Univers & Catégories</span>
                <ChevronRight style={{ width: 14, height: 14, color: "#CBD5E1", marginLeft: "auto" }} />
              </Link>
            </li>

            {/* 4. MON PANIER */}
            <li>
              <Link 
                href="/cart" 
                onClick={toggleDrawer} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  padding: "10px 12px", 
                  borderRadius: 14, 
                  color: "#0F172A", 
                  fontWeight: pathname === "/cart" ? 900 : 700, 
                  fontSize: 13.5, 
                  textDecoration: "none", 
                  background: "#FFFFFF", 
                  border: "1px solid #E2E8F0",
                  transition: "all 0.18s ease"
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#F1F5F9", color: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ShoppingBag style={{ width: 17, height: 17 }} />
                </div>
                <span>Mon Panier</span>
                {totalCartItems > 0 ? (
                  <span style={{ marginLeft: "auto", background: "#DC2626", color: "#FFF", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 9999 }}>{totalCartItems}</span>
                ) : (
                  <ChevronRight style={{ width: 14, height: 14, color: "#CBD5E1", marginLeft: "auto" }} />
                )}
              </Link>
            </li>

            {/* 5. MES FAVORIS */}
            <li>
              <Link 
                href="/favorites" 
                onClick={toggleDrawer} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  padding: "10px 12px", 
                  borderRadius: 14, 
                  color: "#0F172A", 
                  fontWeight: pathname === "/favorites" ? 900 : 700, 
                  fontSize: 13.5, 
                  textDecoration: "none", 
                  background: "#FFFFFF", 
                  border: "1px solid #E2E8F0",
                  transition: "all 0.18s ease"
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#FFF1F2", color: "#E11D48", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Heart style={{ width: 16, height: 16, fill: "#E11D48" }} />
                </div>
                <span>Mes Favoris</span>
                <ChevronRight style={{ width: 14, height: 14, color: "#CBD5E1", marginLeft: "auto" }} />
              </Link>
            </li>

            {/* 6. DEVIS SUR-MESURE */}
            <li>
              <Link 
                href="/quote-request" 
                onClick={toggleDrawer} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  padding: "10px 12px", 
                  borderRadius: 14, 
                  color: "#0F172A", 
                  fontWeight: 800, 
                  fontSize: 13.5, 
                  textDecoration: "none", 
                  background: "#FFFBEB", 
                  border: "1px solid #FDE68A",
                  transition: "all 0.18s ease"
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <PlusCircle style={{ width: 17, height: 17 }} />
                </div>
                <span>Devis Sur-Mesure</span>
                <span style={{ marginLeft: "auto", background: "#F59E0B", color: "#FFFFFF", fontSize: 9.5, fontWeight: 900, padding: "2px 7px", borderRadius: 9999 }}>PRO</span>
              </Link>
            </li>

            {/* 7. INSTALLER PWA */}
            <li>
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
                  padding: "10px 12px",
                  borderRadius: 14,
                  color: "#0F172A",
                  fontWeight: 800,
                  fontSize: 13.5,
                  background: "#F0F9FF",
                  border: "1px solid #BAE6FD",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.18s ease"
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#E0F2FE", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Download style={{ width: 17, height: 17 }} />
                </div>
                <span>Installer l'App</span>
                <span style={{ marginLeft: "auto", background: "#0284C7", color: "#FFFFFF", fontSize: 9.5, fontWeight: 900, padding: "2px 7px", borderRadius: 9999 }}>PWA</span>
              </button>
            </li>
          </ul>

          <div style={{ height: 1, background: "#EAE5DC", margin: "18px 0 14px" }} />

          {/* SECTION: COMPTE & AUTH */}
          <div style={{ fontSize: 10.5, fontWeight: 900, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, paddingLeft: 4 }}>
            {isLoggedIn ? "Mon Espace Client" : "Espace Compte"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {isLoggedIn ? (
              <>
                <Link 
                  href="/dashboard?tab=orders" 
                  onClick={toggleDrawer}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, color: "#0F172A", fontWeight: 700, fontSize: 13, textDecoration: "none", background: "#FFFFFF", border: "1px solid #E2E8F0" }}
                >
                  <Package style={{ width: 16, color: "#165491", flexShrink: 0 }} />
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Mes Commandes</span>
                  <span style={{ marginLeft: "auto", background: "#EFF6FF", color: "#1D4ED8", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 9999 }}>2</span>
                </Link>

                <Link 
                  href="/dashboard?tab=quotes" 
                  onClick={toggleDrawer}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, color: "#0F172A", fontWeight: 700, fontSize: 13, textDecoration: "none", background: "#FFFFFF", border: "1px solid #E2E8F0" }}
                >
                  <FileText style={{ width: 16, color: "#D97706", flexShrink: 0 }} />
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Mes Devis</span>
                  <span style={{ marginLeft: "auto", background: "#FEF3C7", color: "#92400E", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 9999 }}>1</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px 12px", borderRadius: 12, fontWeight: 800, fontSize: 12.5, background: "rgba(225, 29, 72, 0.06)", color: "#E11D48", border: "1px solid rgba(225, 29, 72, 0.18)", cursor: "pointer", marginTop: 2 }}
                >
                  <LogOut style={{ width: 15 }} /> Se Déconnecter
                </button>
              </>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Link 
                  href="/auth/login" 
                  onClick={toggleDrawer}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 8px", borderRadius: 12, fontWeight: 800, fontSize: 12.5, background: "#FFFFFF", color: "#0F172A", textDecoration: "none", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
                >
                  <LogIn style={{ width: 15 }} /> Connexion
                </Link>
                <Link 
                  href="/auth/sign-up" 
                  onClick={toggleDrawer}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 8px", borderRadius: 12, fontWeight: 800, fontSize: 12.5, background: "#0F172A", color: "#FFF", textDecoration: "none", boxShadow: "0 2px 8px rgba(15,23,42,0.15)" }}
                >
                  <UserPlus style={{ width: 15 }} /> S'inscrire
                </Link>
              </div>
            )}
          </div>

          <div style={{ height: 1, background: "#EAE5DC", margin: "16px 0" }} />

          {/* DESTINATION PILL */}
          <div style={{ background: "#FFFFFF", padding: "10px 14px", borderRadius: 12, border: "1px solid #EAE5DC", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800, color: "#0F172A" }}>
              <MapPin style={{ width: 15, color: "#165491" }} /> Bénin (Cotonou)
            </div>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#16A34A", background: "#ECFDF5", padding: "2px 8px", borderRadius: 9999 }}>FCFA</span>
          </div>
        </div>

        {/* SOFT DRAWER FOOTER */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #EAE5DC", background: "#FFFFFF", textAlign: "center", fontSize: 11, fontWeight: 600, color: "#94A3B8" }}>
          © CargoLink Africa — Importation Directe
        </div>
      </div>
    </>
  );
}
