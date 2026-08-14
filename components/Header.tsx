"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import { useMobileStore } from "@/lib/mobile-store";
import { 
  Menu, X, Search, PlusCircle, Grid, User, LogIn, UserPlus, LogOut, FileText,
  MapPin, ChevronDown, ChevronRight, ArrowRight, Gift, Radio, Home, Package, 
  ShoppingBag, Download, Heart, Sparkles, Check, Plane
} from "lucide-react";

export default function Header() {
  const { cart, favorites } = useMobileStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; initials: string; role: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (q) router.push(`/catalog?q=${encodeURIComponent(q)}`);
    else router.push("/catalog");
  }, [searchQuery, router]);

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
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Rechercher un produit ou une usine en Chine..." 
                className="clean-search-input"
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", boxShadow: "none", fontSize: 13, fontWeight: 600, color: "#0F172A" }}
              />
              <button
                onClick={handleSearch}
                className="search-submit-btn" 
                aria-label="Rechercher" 
                style={{ width: 34, height: 34, background: "#0F172A", color: "#FFF", borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Search style={{ width: 14 }} />
              </button>
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
            <div className="mobile-search-bar-wrapper search-pill-wrapper" style={{ display: "flex", alignItems: "center", background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: 9999, padding: "7px 8px 7px 16px", width: "100%", transition: "all 0.2s ease" }}>
              <span style={{ color: "#38BDF8", marginRight: 8, fontSize: 15 }}>✦</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Rechercher un produit ou une usine en Chine..." 
                className="clean-search-input"
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", boxShadow: "none", fontSize: 13, fontWeight: 600, color: "#0F172A" }}
              />
              <button
                onClick={handleSearch}
                style={{ width: 32, height: 32, background: "#0F172A", color: "#FFF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}
                aria-label="Rechercher"
              >
                <Search style={{ width: 14 }} />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* SUB NAV BAR WITH SOFT CATEGORIES & DEALS */}
      <nav className="subnav-bar" style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0", padding: "10px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          
          <ul className="subnav-list" style={{ display: "flex", gap: 18, listStyle: "none", margin: 0, padding: 0, alignItems: "center", overflowX: "auto" }}>
            <li>
              <Link href="/categories" style={{ fontWeight: 900, color: "#0F172A", fontSize: 12.5, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                <Grid style={{ width: 14 }} /> toutes les catégories <ChevronDown style={{ width: 12 }} />
              </Link>
            </li>
            <li style={{ borderLeft: "1px solid #E2E8F0", height: 16, margin: "0 2px" }} />
            <li>
              <Link href="/catalog?cat=electronics" style={{ fontSize: 12.5, fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
                Électronique
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=fashion" style={{ fontSize: 12.5, fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
                Mode
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=womens" style={{ fontSize: 12.5, fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
                Mode Femme
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=kids" style={{ fontSize: 12.5, fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
                Mode Enfant
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=beauty" style={{ fontSize: 12.5, fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
                Beauté & Santé
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=pharmacy" style={{ fontSize: 12.5, fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
                Pharmacie
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=groceries" style={{ fontSize: 12.5, fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
                Épicerie
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=luxury" style={{ fontSize: 12.5, fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
                Articles de Luxe
              </Link>
            </li>
          </ul>

          <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12.5, fontWeight: 800, flexShrink: 0 }}>
            <Link href="/catalog?deals=true" style={{ color: "#165491", display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
              <Gift style={{ width: 14, height: 14 }} /> Offres Exclusives
            </Link>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#F1F5F9", padding: "4px 10px", borderRadius: 9999, fontSize: 11.5, color: "#0F172A" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#DC2626", display: "inline-block" }} />
              <span style={{ fontWeight: 900 }}>CargoLink</span>
              <span style={{ fontWeight: 600, color: "#64748B" }}>Live</span>
            </div>
          </div>

        </div>
      </nav>

      {/* MOBILE DRAWER OVERLAY & SLIDING DRAWER MENU */}
      <div 
        className={`mobile-drawer-overlay ${drawerOpen ? "active" : ""}`} 
        onClick={toggleDrawer}
        style={{ backdropFilter: "blur(4px)" }}
      />

      <div 
        className={`mobile-nav-drawer ${drawerOpen ? "active" : ""}`}
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #F1F5F9",
          boxShadow: "16px 0 48px rgba(15, 23, 42, 0.12)",
          display: "flex",
          flexDirection: "column",
          width: 290,
          maxWidth: "82vw",
          height: "100vh",
        }}
      >
        {/* CLEAN DRAWER HEADER */}
        <div 
          className="drawer-header" 
          style={{ 
            padding: "16px 20px", 
            background: "#FFFFFF", 
            borderBottom: "1px solid #F1F5F9", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between" 
          }}
        >
          <Logo size={28} subtitleText="IMPORTATION DIRECTE BÉNIN" href={null} onClick={toggleDrawer} />
          <button 
            onClick={toggleDrawer} 
            className="drawer-close-btn"
            aria-label="Fermer le menu"
            style={{ 
              background: "transparent", 
              border: "none", 
              color: "#64748B", 
              width: 32, 
              height: 32, 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              cursor: "pointer",
              transition: "color 0.2s ease",
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* LOGGED IN USER ACCOUNT ROW */}
        {isLoggedIn && (
          <Link
            href="/dashboard?tab=profile"
            onClick={toggleDrawer}
            style={{
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: "1px solid #F1F5F9",
              textDecoration: "none"
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#0F172A", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {userProfile?.initials || "CD"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {userProfile?.name || "Client Démo"}
              </div>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>
                {userProfile?.role || "Particulier"}
              </div>
            </div>
            <ChevronRight style={{ width: 14, color: "#CBD5E1" }} />
          </Link>
        )}

        {/* DRAWER CONTENT SCROLL AREA */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          
          <div>
            {/* SECTION: NAVIGATION */}
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 8 }}>
              Navigation
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              {/* 1. ACCUEIL */}
              <li>
                <Link 
                  href="/" 
                  onClick={toggleDrawer} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12, 
                    padding: "9px 10px", 
                    borderRadius: 8, 
                    color: pathname === "/" ? "#165491" : "#334155", 
                    fontWeight: pathname === "/" ? 700 : 500, 
                    fontSize: 13.5, 
                    textDecoration: "none", 
                    background: pathname === "/" ? "#F0F7FF" : "transparent",
                    transition: "all 0.15s ease"
                  }}
                >
                  <Home style={{ width: 18, height: 18, color: pathname === "/" ? "#165491" : "#64748B", flexShrink: 0 }} />
                  <span>Accueil</span>
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
                    padding: "9px 10px", 
                    borderRadius: 8, 
                    color: pathname === "/checkout" ? "#165491" : "#334155", 
                    fontWeight: pathname === "/checkout" ? 700 : 500, 
                    fontSize: 13.5, 
                    textDecoration: "none", 
                    background: pathname === "/checkout" ? "#F0F7FF" : "transparent",
                    transition: "all 0.15s ease"
                  }}
                >
                  <Plane style={{ width: 18, height: 18, color: pathname === "/checkout" ? "#165491" : "#64748B", flexShrink: 0 }} />
                  <span>Fret & Livraison Bénin</span>
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
                    padding: "9px 10px", 
                    borderRadius: 8, 
                    color: pathname === "/categories" ? "#165491" : "#334155", 
                    fontWeight: pathname === "/categories" ? 700 : 500, 
                    fontSize: 13.5, 
                    textDecoration: "none", 
                    background: pathname === "/categories" ? "#F0F7FF" : "transparent",
                    transition: "all 0.15s ease"
                  }}
                >
                  <Grid style={{ width: 18, height: 18, color: pathname === "/categories" ? "#165491" : "#64748B", flexShrink: 0 }} />
                  <span>Univers & Catégories</span>
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
                    padding: "9px 10px", 
                    borderRadius: 8, 
                    color: pathname === "/cart" ? "#165491" : "#334155", 
                    fontWeight: pathname === "/cart" ? 700 : 500, 
                    fontSize: 13.5, 
                    textDecoration: "none", 
                    background: pathname === "/cart" ? "#F0F7FF" : "transparent",
                    transition: "all 0.15s ease"
                  }}
                >
                  <ShoppingBag style={{ width: 18, height: 18, color: pathname === "/cart" ? "#165491" : "#64748B", flexShrink: 0 }} />
                  <span>Mon Panier</span>
                  {totalCartItems > 0 && (
                    <span style={{ marginLeft: "auto", background: "#DC2626", color: "#FFF", fontSize: 10, fontWeight: 800, padding: "1px 7px", borderRadius: 9999 }}>{totalCartItems}</span>
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
                    padding: "9px 10px", 
                    borderRadius: 8, 
                    color: pathname === "/favorites" ? "#165491" : "#334155", 
                    fontWeight: pathname === "/favorites" ? 700 : 500, 
                    fontSize: 13.5, 
                    textDecoration: "none", 
                    background: pathname === "/favorites" ? "#F0F7FF" : "transparent",
                    transition: "all 0.15s ease"
                  }}
                >
                  <Heart style={{ width: 18, height: 18, color: pathname === "/favorites" ? "#165491" : "#64748B", flexShrink: 0 }} />
                  <span>Mes Favoris</span>
                </Link>
              </li>
            </ul>

            {/* HIGHLIGHTED SINGLE CTA: DEVIS SUR-MESURE */}
            <div style={{ marginTop: 12, padding: "0 2px" }}>
              <Link 
                href="/quote-request" 
                onClick={toggleDrawer} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  gap: 10, 
                  padding: "10px 14px", 
                  borderRadius: 8, 
                  color: "#FFFFFF", 
                  fontWeight: 700, 
                  fontSize: 13.5, 
                  textDecoration: "none", 
                  background: "#0F172A",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <PlusCircle style={{ width: 17, height: 17, color: "#F97316" }} />
                  <span>Devis Sur-Mesure</span>
                </div>
                <ArrowRight style={{ width: 15, height: 15, opacity: 0.8 }} />
              </Link>
            </div>

            <div style={{ height: 1, background: "#F1F5F9", margin: "16px 8px 12px" }} />

            {/* SECTION: ESPACE CLIENT */}
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, paddingLeft: 8 }}>
              {isLoggedIn ? "Mon Espace Client" : "Compte"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {isLoggedIn ? (
                <>
                  <Link 
                    href="/dashboard?tab=orders" 
                    onClick={toggleDrawer}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 10px", borderRadius: 8, color: "#334155", fontWeight: 500, fontSize: 13, textDecoration: "none" }}
                  >
                    <Package style={{ width: 18, height: 18, color: "#64748B", flexShrink: 0 }} />
                    <span>Mes Commandes</span>
                    <span style={{ marginLeft: "auto", background: "#DC2626", color: "#FFFFFF", fontSize: 9.5, fontWeight: 800, padding: "1px 6px", borderRadius: 9999 }}>2</span>
                  </Link>

                  <Link 
                    href="/dashboard?tab=quotes" 
                    onClick={toggleDrawer}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 10px", borderRadius: 8, color: "#334155", fontWeight: 500, fontSize: 13, textDecoration: "none" }}
                  >
                    <FileText style={{ width: 18, height: 18, color: "#64748B", flexShrink: 0 }} />
                    <span>Mes Devis</span>
                    <span style={{ marginLeft: "auto", background: "#DC2626", color: "#FFFFFF", fontSize: 9.5, fontWeight: 900, padding: "1px 6px", borderRadius: 9999 }}>1</span>
                  </Link>

                  <button 
                    onClick={handleLogout}
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "9px 10px", borderRadius: 8, fontWeight: 500, fontSize: 12.5, color: "#94A3B8", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", marginTop: 4 }}
                  >
                    <LogOut style={{ width: 16, height: 16 }} /> Se déconnecter
                  </button>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                  <Link 
                    href="/auth/login" 
                    onClick={toggleDrawer}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", borderRadius: 8, fontWeight: 700, fontSize: 13, background: "#F8FAFC", color: "#0F172A", textDecoration: "none", border: "1px solid #E2E8F0" }}
                  >
                    <LogIn style={{ width: 15 }} /> Connexion
                  </Link>
                  <Link 
                    href="/auth/sign-up" 
                    onClick={toggleDrawer}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", borderRadius: 8, fontWeight: 700, fontSize: 13, background: "#0F172A", color: "#FFF", textDecoration: "none" }}
                  >
                    <UserPlus style={{ width: 15 }} /> S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM DISCREET AREA */}
          <div style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: 10 }}>
            {/* PWA INSTALL ITEM (DISCREET) */}
            <button
              onClick={() => {
                toggleDrawer();
                window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#64748B", fontWeight: 500 }}>
                <Download style={{ width: 16, height: 16, color: "#64748B" }} />
                <span>Installer l'application</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#165491" }}>Installer</span>
            </button>

            {/* LOCATION & CURRENCY (VERY DISCREET) */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#94A3B8", paddingLeft: 10 }}>
              <MapPin style={{ width: 13, height: 13, color: "#94A3B8" }} />
              <span>Bénin (Cotonou) • FCFA</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
