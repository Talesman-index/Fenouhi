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
  ShoppingBag, Download, Heart, Sparkles, Check, Plane, ShieldCheck
} from "lucide-react";

export default function Header() {
  const { cart, favorites } = useMobileStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; initials: string; role: string; isAdmin?: boolean } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (q) {
      window.location.href = `/catalog?q=${encodeURIComponent(q)}`;
    } else {
      window.location.href = "/catalog";
    }
  }, [searchQuery]);

  const totalCartItems = cart && cart.length > 0 ? cart.map((i) => i.quantity || 1).reduce((a, b) => a + b, 0) : 0;

  useEffect(() => {
    const supabase = createClient();
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const emailLower = (user.email || "").toLowerCase().trim();
        let adminFlag = (
          emailLower === "ahoyoauronce@gmail.com" ||
          emailLower === "admin@cargolink.africa" ||
          emailLower === "superadmin@cargolink.africa"
        );

        try {
          const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
          if (prof) {
            if (prof.role === "admin" || prof.role === "super_admin" || prof.role === "logistics" || prof.role === "agent") {
              adminFlag = true;
            }
            const fn = prof.first_name || "";
            const ln = prof.last_name || "";
            const fullName = `${fn} ${ln}`.trim() || user.email?.split("@")[0] || "Administrateur";
            const init = `${fn[0] || ""}${ln[0] || ""}`.toUpperCase() || "AD";
            const role = adminFlag ? "Administrateur" : (prof.account_type === "business" ? "Entreprise / PME" : prof.account_type === "reseller" ? "Revendeur" : "Particulier");
            setUserProfile({
              name: fullName,
              email: prof.email || user.email || "",
              initials: init,
              role: role,
              isAdmin: adminFlag
            });
          } else {
            const email = user.email || "";
            const name = user.user_metadata?.full_name || email.split("@")[0] || "Administrateur";
            const init = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "AD";
            setUserProfile({
              name,
              email,
              initials: init,
              role: adminFlag ? "Administrateur" : "Particulier",
              isAdmin: adminFlag
            });
          }
        } catch (e) {
          setUserProfile({
            name: user.email?.split("@")[0] || "Administrateur",
            email: user.email || "",
            initials: "AD",
            role: adminFlag ? "Administrateur" : "Particulier",
            isAdmin: adminFlag
          });
        }
        setIsAdmin(adminFlag);
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserProfile(null);
      }
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkAuth();
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
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
      setIsAdmin(false);
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
      {/* MAIN NAVIGATION HEADER (EXPANDED HEIGHT & LUXURY SPACING) */}
      <header className="main-header" style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0", padding: "18px 0", minHeight: 76, position: "sticky", top: 0, zIndex: 500, display: "flex", alignItems: "center" }}>
        <div className="container" style={{ width: "100%" }}>
          
          {/* TOP ROW: LOGO, QUICK ACTIONS & PROFILE */}
          <div className="header-top-row">
            
            {/* LOGO & HAMBURGER */}
            <div className="header-logo-wrap" style={{ gap: 14 }}>
              <button className="mobile-menu-btn" onClick={toggleDrawer} aria-label="Menu Mobile" style={{ padding: 8 }}>
                <Menu style={{ width: 26, height: 26, color: "#0F172A" }} />
              </button>
              
              <Logo href="/" size={42} />
            </div>

            {/* RIGHT CONTROLS */}
            <div className="header-right-actions" style={{ gap: 16 }}>
              
              {/* LOCATION PICKER (DESKTOP ONLY) */}
              <div className="desktop-only" style={{ alignItems: "center", gap: 8, fontSize: 12.5, color: "#475569", cursor: "pointer", marginRight: 6 }}>
                <MapPin style={{ width: 17, height: 17, color: "#102A56" }} />
                <div>
                  <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 600 }}>Livraison au Bénin</div>
                  <div style={{ fontWeight: 700, color: "#0A192F" }}>Cotonou & Régions</div>
                </div>
              </div>

              {/* FAVORITES BUTTON */}
              <Link 
                href="/favorites" 
                title="Mes Favoris"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#DC2626",
                  textDecoration: "none",
                  position: "relative",
                  boxShadow: "0 2px 8px rgba(10, 25, 47, 0.03)",
                  transition: "transform 0.15s ease",
                }}
              >
                <Heart style={{ width: 19, height: 19, fill: "#DC2626" }} />
              </Link>

              {/* CART QUICK ACCESS */}
              <Link 
                href="/cart" 
                title="Mon Panier"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "#102A56",
                  color: "#FFF",
                  textDecoration: "none",
                  position: "relative",
                  boxShadow: "0 4px 12px rgba(16, 42, 86, 0.25)",
                  transition: "transform 0.15s ease",
                }}
              >
                <ShoppingBag style={{ width: 18, height: 18 }} />
                {totalCartItems > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      background: "#DC2626",
                      color: "#FFF",
                      fontSize: 10,
                      fontWeight: 800,
                      minWidth: 18,
                      height: 18,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                      boxShadow: "0 0 0 2px #FFFFFF"
                    }}
                  >
                    {totalCartItems}
                  </span>
                )}
              </Link>

              {/* USER / AUTH BUTTONS (DESKTOP ONLY) */}
              {isLoggedIn ? (
                <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Link 
                    href={isAdmin ? "/admin" : "/dashboard"} 
                    className="btn btn-pill-sm" 
                    style={{ 
                      background: isAdmin ? "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" : "#0F172A", 
                      color: "#FFF", 
                      padding: "8px 16px", 
                      fontSize: 13, 
                      fontWeight: 600, 
                      borderRadius: 9999, 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: 6,
                      border: isAdmin ? "1px solid rgba(56, 189, 248, 0.4)" : "none",
                      boxShadow: isAdmin ? "0 2px 10px rgba(15, 23, 42, 0.3)" : "none"
                    }}
                  >
                    {isAdmin ? (
                      <>
                        <ShieldCheck style={{ width: 15, color: "#38BDF8" }} /> <span>Dashboard Admin</span>
                      </>
                    ) : (
                      <>
                        <User style={{ width: 14 }} /> <span>Mon Espace</span>
                      </>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Déconnexion"
                    style={{
                      background: "rgba(220, 38, 38, 0.08)",
                      color: "#DC2626",
                      border: "1px solid rgba(220, 38, 38, 0.2)",
                      padding: "8px 14px",
                      fontSize: 12.5,
                      fontWeight: 600,
                      borderRadius: 9999,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      cursor: "pointer"
                    }}
                  >
                    <LogOut style={{ width: 14 }} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              ) : (
                <div className="desktop-only" style={{ alignItems: "center", gap: 8 }}>
                  <Link
                    href="/auth/login"
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#0F172A",
                      textDecoration: "none",
                      padding: "6px 12px"
                    }}
                  >
                    Connexion
                  </Link>

                  <Link
                    href="/auth/sign-up"
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#FFFFFF",
                      background: "#0F172A",
                      textDecoration: "none",
                      padding: "6px 14px",
                      borderRadius: 8
                    }}
                  >
                    S'inscrire
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY & SLIDING DRAWER MENU */}
      <div 
        className={`mobile-drawer-overlay ${drawerOpen ? "active" : ""}`} 
        onClick={toggleDrawer}
      />

      <div 
        className={`mobile-nav-drawer ${drawerOpen ? "active" : ""}`}
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
              {/* 1. UNIVERS & CATEGORIES */}
              <li>
                <Link 
                  href="/categories" 
                  onClick={toggleDrawer} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12, 
                    padding: "10px 10px", 
                    borderRadius: 8, 
                    color: pathname === "/categories" ? "#0D2B4D" : "#334155", 
                    fontWeight: pathname === "/categories" ? 700 : 500, 
                    fontSize: 13.5, 
                    textDecoration: "none", 
                    background: pathname === "/categories" ? "#EEF4FB" : "transparent",
                    transition: "all 0.15s ease"
                  }}
                >
                  <Grid style={{ width: 18, height: 18, color: pathname === "/categories" ? "#0D2B4D" : "#64748B", flexShrink: 0 }} />
                  <span>Univers & Catégories</span>
                </Link>
              </li>

              {/* 2. FRET & LIVRAISON */}
              <li>
                <Link 
                  href="/shipping-policy" 
                  onClick={toggleDrawer} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12, 
                    padding: "10px 10px", 
                    borderRadius: 8, 
                    color: pathname === "/shipping-policy" ? "#0D2B4D" : "#334155", 
                    fontWeight: pathname === "/shipping-policy" ? 700 : 500, 
                    fontSize: 13.5, 
                    textDecoration: "none", 
                    background: pathname === "/shipping-policy" ? "#EEF4FB" : "transparent",
                    transition: "all 0.15s ease"
                  }}
                >
                  <Plane style={{ width: 18, height: 18, color: pathname === "/shipping-policy" ? "#0D2B4D" : "#64748B", flexShrink: 0 }} />
                  <span>Fret & Livraison Bénin</span>
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
                  borderRadius: 10, 
                  color: "#FFFFFF", 
                  fontWeight: 700, 
                  fontSize: 13.5, 
                  textDecoration: "none", 
                  background: "#0D2B4D",
                  boxShadow: "0 4px 12px rgba(13, 43, 77, 0.2)",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <PlusCircle style={{ width: 17, height: 17, color: "#7CB6D9" }} />
                  <span>Devis Sur-Mesure</span>
                </div>
                <ArrowRight style={{ width: 15, height: 15, color: "#7CB6D9" }} />
              </Link>
            </div>

            <div style={{ height: 1, background: "#F1F5F9", margin: "16px 8px 12px" }} />

            {/* SECTION: ESPACE ADMIN OU CLIENT */}
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, paddingLeft: 8 }}>
              {isAdmin ? "Administration" : (isLoggedIn ? "Mon Espace Client" : "Compte")}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <div style={{ marginBottom: 6 }}>
                      <Link 
                        href="/admin" 
                        onClick={toggleDrawer}
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between",
                          gap: 10, 
                          padding: "10px 12px", 
                          borderRadius: 8, 
                          color: "#FFFFFF", 
                          fontWeight: 700, 
                          fontSize: 13, 
                          textDecoration: "none", 
                          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                          border: "1px solid rgba(56, 189, 248, 0.4)",
                          boxShadow: "0 3px 10px rgba(15, 23, 42, 0.2)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <ShieldCheck style={{ width: 17, height: 17, color: "#38BDF8" }} />
                          <span>Dashboard Admin</span>
                        </div>
                        <ArrowRight style={{ width: 14, height: 14, opacity: 0.8 }} />
                      </Link>
                    </div>
                  )}

                  <Link 
                    href="/dashboard?tab=orders" 
                    onClick={toggleDrawer}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 10px", borderRadius: 8, color: "#334155", fontWeight: 500, fontSize: 13, textDecoration: "none" }}
                  >
                    <Package style={{ width: 18, height: 18, color: "#64748B", flexShrink: 0 }} />
                    <span>Mes Commandes Client</span>
                    <span style={{ marginLeft: "auto", background: "#DC2626", color: "#FFFFFF", fontSize: 9.5, fontWeight: 600, padding: "1px 6px", borderRadius: 9999 }}>2</span>
                  </Link>

                  <Link 
                    href="/dashboard?tab=quotes" 
                    onClick={toggleDrawer}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 10px", borderRadius: 8, color: "#334155", fontWeight: 500, fontSize: 13, textDecoration: "none" }}
                  >
                    <FileText style={{ width: 18, height: 18, color: "#64748B", flexShrink: 0 }} />
                    <span>Mes Devis Client</span>
                    <span style={{ marginLeft: "auto", background: "#DC2626", color: "#FFFFFF", fontSize: 9.5, fontWeight: 700, padding: "1px 6px", borderRadius: 9999 }}>1</span>
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
              <span style={{ fontSize: 11, fontWeight: 700, color: "#102A56" }}>Installer</span>
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
