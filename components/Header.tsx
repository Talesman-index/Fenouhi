"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import { useMobileStore } from "@/lib/mobile-store";
import { 
  Menu, X, Search, PlusCircle, Grid, User, LogIn, UserPlus, LogOut, FileText,
  MapPin, ChevronDown, Gift, Radio, Home, Package, 
  ShoppingBag, Download, Heart, Sparkles, Check
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
                    <LogIn style={{ width: 14 }} /> <span>Sign In</span>
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

      {/* SUB NAV BAR WITH CATEGORIES & MOBILE APP BANNER */}
      <nav className="subnav-bar" style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0", padding: "10px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          
          <ul className="subnav-list" style={{ display: "flex", gap: 22, listStyle: "none", margin: 0, padding: 0, alignItems: "center" }}>
            <li>
              <Link href="/categories" style={{ fontWeight: 900, color: "#0F172A", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
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
              <Link href="/cart" style={{ fontSize: 13, fontWeight: 700, color: "#059669", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span>Panier ({totalCartItems})</span>
              </Link>
            </li>
            <li>
              <Link href="/checkout" style={{ fontSize: 13, fontWeight: 800, color: "#16A34A", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Check style={{ width: 14, height: 14 }} />
                <span>Fret & Livraison Bénin</span>
              </Link>
            </li>
            <li>
              <Link href="/catalog?cat=fashion" style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
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
      />

      <div className={`mobile-nav-drawer ${drawerOpen ? "active" : ""}`}>
        {/* DRAWER HEADER */}
        <div className="drawer-header" style={{ padding: "18px 20px", background: "#0F172A", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo light size={32} subtitleText="IMPORTATION DIRECTE ➔ AFRIQUE" href={null} onClick={toggleDrawer} />
          <button 
            onClick={toggleDrawer} 
            className="drawer-close-btn"
            style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#FFF", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X style={{ width: 18 }} />
          </button>
        </div>

        {/* LOGGED IN USER ACCOUNT CARD BANNER */}
        {isLoggedIn && (
          <Link
            href="/dashboard?tab=profile"
            onClick={toggleDrawer}
            style={{
              background: "#0F172A",
              padding: "14px 20px 18px",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              textDecoration: "none"
            }}
          >
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#F59E0B", color: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, flexShrink: 0, boxShadow: "0 4px 12px rgba(245,158,11,0.25)" }}>
              {userProfile?.initials || "CD"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {userProfile?.name || "Client Démo"}
              </div>
              <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 800 }}>
                {userProfile?.role || "Particulier"}
              </div>
              <div style={{ fontSize: 10.5, color: "#94A3B8", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {userProfile?.email || "client.demo@cargolink.africa"}
              </div>
            </div>
            <ChevronDown style={{ width: 16, color: "#94A3B8", transform: "rotate(-90deg)" }} />
          </Link>
        )}

        {/* DRAWER NAVIGATION LIST */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: "#94A3B8", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
            Navigation Principale
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>
              <Link href="/" onClick={toggleDrawer} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, color: "#0F172A", fontWeight: 800, fontSize: 13.5, textDecoration: "none", background: pathname === "/" ? "#F1F5F9" : "#FFFFFF", border: "1px solid #E2E8F0" }}>
                <Home style={{ width: 18, color: "#165491" }} /> Accueil
              </Link>
            </li>
            <li>
              <Link href="/checkout" onClick={toggleDrawer} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, color: "#0F172A", fontWeight: 800, fontSize: 13.5, textDecoration: "none", background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
                <Check style={{ width: 18, color: "#16A34A" }} />
                <span>Fret & Livraison Bénin</span>
                <span style={{ marginLeft: "auto", background: "#16A34A", color: "#FFF", fontSize: 9.5, fontWeight: 900, padding: "2px 8px", borderRadius: 9999 }}>DIRECT</span>
              </Link>
            </li>
            <li>
              <Link href="/categories" onClick={toggleDrawer} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, color: "#0F172A", fontWeight: 800, fontSize: 13.5, textDecoration: "none", background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                <Grid style={{ width: 18, color: "#165491" }} /> Univers & Catégories Usines
              </Link>
            </li>
            <li>
              <Link href="/cart" onClick={toggleDrawer} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, color: "#0F172A", fontWeight: 800, fontSize: 13.5, textDecoration: "none", background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                <ShoppingBag style={{ width: 18, color: "#059669" }} />
                <span>Mon Panier</span>
                {totalCartItems > 0 && (
                  <span style={{ marginLeft: "auto", background: "#DC2626", color: "#FFF", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 9999 }}>{totalCartItems} article{totalCartItems > 1 ? "s" : ""}</span>
                )}
              </Link>
            </li>
            <li>
              <Link href="/favorites" onClick={toggleDrawer} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, color: "#0F172A", fontWeight: 800, fontSize: 13.5, textDecoration: "none", background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                <Heart style={{ width: 18, color: "#DC2626", fill: "#DC2626" }} /> Mes Favoris Enregistrés
              </Link>
            </li>
            <li>
              <Link href="/quote-request" onClick={toggleDrawer} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, color: "#C2410C", fontWeight: 800, fontSize: 13.5, textDecoration: "none", background: "#FFF7ED", border: "1px solid #FFEDD5" }}>
                <PlusCircle style={{ width: 18, color: "#EA580C" }} /> Demander un Devis Sur-Mesure
              </Link>
            </li>
            <li style={{ marginTop: 2 }}>
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
                  borderRadius: 10,
                  color: "#FFFFFF",
                  fontWeight: 900,
                  fontSize: 13.5,
                  background: "#0F172A",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left"
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
            {isLoggedIn ? "Mon Espace Client & Suivi" : "Espace Compte & Authentification"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {isLoggedIn ? (
              <>
                <Link 
                  href="/dashboard?tab=orders" 
                  onClick={toggleDrawer}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, color: "#0F172A", fontWeight: 800, fontSize: 13.5, textDecoration: "none", background: "#FFFFFF", border: "1px solid #E2E8F0" }}
                >
                  <Package style={{ width: 18, color: "#165491", flexShrink: 0 }} />
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Mes Commandes (2)</span>
                  <span style={{ marginLeft: "auto", background: "#165491", color: "#FFF", fontSize: 10.5, fontWeight: 900, padding: "3px 10px", borderRadius: 9999, whiteSpace: "nowrap", flexShrink: 0, display: "inline-flex", alignItems: "center" }}>En cours</span>
                </Link>

                <Link 
                  href="/dashboard?tab=quotes" 
                  onClick={toggleDrawer}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, color: "#0F172A", fontWeight: 800, fontSize: 13.5, textDecoration: "none", background: "#FFFFFF", border: "1px solid #E2E8F0" }}
                >
                  <FileText style={{ width: 18, color: "#F59E0B", flexShrink: 0 }} />
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Devis à Valider (1)</span>
                  <span style={{ marginLeft: "auto", background: "#FEF3C7", color: "#92400E", fontSize: 10.5, fontWeight: 900, padding: "3px 10px", borderRadius: 9999, whiteSpace: "nowrap", flexShrink: 0, display: "inline-flex", alignItems: "center" }}>Action</span>
                </Link>

                <Link 
                  href="/dashboard?tab=profile" 
                  onClick={toggleDrawer}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, color: "#0F172A", fontWeight: 800, fontSize: 13.5, textDecoration: "none", background: "#FFFFFF", border: "1px solid #E2E8F0" }}
                >
                  <User style={{ width: 18, color: "#165491" }} />
                  <span>Profil & Adresses</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "11px 14px", borderRadius: 10, fontWeight: 800, fontSize: 13.5, background: "#FFFFFF", color: "#E11D48", border: "1px solid #FECDD3", cursor: "pointer", marginTop: 4 }}
                >
                  <LogOut style={{ width: 16 }} /> Se Déconnecter
                </button>
              </>
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
              <MapPin style={{ width: 15, color: "#165491" }} /> Bénin (Cotonou)
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
