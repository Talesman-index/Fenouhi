"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  specs?: string;
  category: string;
  price: number; // in Ariary (base currency)
  oldPrice?: number;
  quantity: number;
  image: string;
  deliveryRange: string;
  shippingMode: "air" | "sea";
}

export interface FavoriteItem {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  inStock: boolean;
}

export type CurrencyCode = "Ar" | "FCFA" | "EUR" | "USD";

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  currency: CurrencyCode;
  rateToAr: number; // Ar / local unit
  defaultCity: string;
  defaultAddress: string;
  defaultDriveHub: string;
}

export const COUNTRIES: CountryInfo[] = [
  {
    code: "BJ",
    name: "Bénin",
    flag: "BJ",
    currency: "FCFA",
    rateToAr: 7.5,
    defaultCity: "Cotonou",
    defaultAddress: "Haie Vive, Avenue Pape Jean-Paul II, Cotonou",
    defaultDriveHub: "Hub Principal FENOUHI Akpakpa Port (Cotonou)",
  },
  {
    code: "CI",
    name: "Côte d'Ivoire",
    flag: "CI",
    currency: "FCFA",
    rateToAr: 7.5,
    defaultCity: "Abidjan",
    defaultAddress: "Cocody Angré 8e Tranche, Rue L14",
    defaultDriveHub: "Hub Logistique FENOUHI Vridi Port",
  },
  {
    code: "TG",
    name: "Togo",
    flag: "TG",
    currency: "FCFA",
    rateToAr: 7.5,
    defaultCity: "Lomé",
    defaultAddress: "Boulevard du 13 Janvier, Lomé",
    defaultDriveHub: "Hub Logistique FENOUHI Port de Lomé",
  },
  {
    code: "SN",
    name: "Sénégal",
    flag: "SN",
    currency: "FCFA",
    rateToAr: 7.5,
    defaultCity: "Dakar",
    defaultAddress: "Plateau, Boulevard de la République",
    defaultDriveHub: "Hub Logistique FENOUHI Bel-Air",
  },
  {
    code: "CM",
    name: "Cameroun",
    flag: "CM",
    currency: "FCFA",
    rateToAr: 7.5,
    defaultCity: "Douala",
    defaultAddress: "Bonanjo, Rue de la Marine",
    defaultDriveHub: "Hub Fret FENOUHI Aéroport Douala",
  },
  {
    code: "MG",
    name: "Madagascar",
    flag: "MG",
    currency: "Ar",
    rateToAr: 1,
    defaultCity: "Antananarivo",
    defaultAddress: "Ambohimanarina, Antanety Avaratra",
    defaultDriveHub: "Zoma Morarano Alarobia (Hub FENOUHI)",
  },
];

const INITIAL_CART: CartItem[] = [];

const INITIAL_FAVORITES: FavoriteItem[] = [];

interface MobileStoreContextType {
  cart: CartItem[];
  favorites: FavoriteItem[];
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  country: CountryInfo;
  setCountry: (c: CountryInfo) => void;
  deliveryMode: "home" | "drive";
  setDeliveryMode: (mode: "home" | "drive") => void;
  paymentMode: "full" | "4x";
  setPaymentMode: (mode: "full" | "4x") => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
  discountPercent: number;
  promoApplied: boolean;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  acceptedTerms: boolean;
  setAcceptedTerms: (v: boolean) => void;
  
  // Cart Actions
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  
  // Favorites Actions
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;
  addAllFavoritesToCart: () => void;
  
  // Computations
  totalPanier: number; // in Ariary
  discountAmount: number;
  finalTotal: number;
  installmentAmount: number; // per month (4X)
  
  // Formatting helper
  formatPrice: (priceInAr: number) => string;
  activeScreen: "categories" | "cart" | "checkout" | "favorites";
  setActiveScreen: (screen: "categories" | "cart" | "checkout" | "favorites") => void;
}

const MobileStoreContext = createContext<MobileStoreContextType | null>(null);

export function MobileStoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(INITIAL_FAVORITES);
  const [country, setCountry] = useState<CountryInfo>(COUNTRIES[0]); // Bénin by default
  const [currency, setCurrency] = useState<CurrencyCode>("FCFA"); // FCFA by default
  const [deliveryMode, setDeliveryMode] = useState<"home" | "drive">("home");
  const [paymentMode, setPaymentMode] = useState<"full" | "4x">("full"); // Direct full payment by default
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [activeScreen, setActiveScreen] = useState<"categories" | "cart" | "checkout" | "favorites">("cart");

  // Keep currency synced when country changes if appropriate
  const handleSetCountry = (newCountry: CountryInfo) => {
    setCountry(newCountry);
    setCurrency(newCountry.currency);
  };

  // LocalStorage persistence for Cart & Favorites
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cargolink_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          // Filtrer les anciens articles de démonstration (cart-1, cart-2, 1..10)
          const cleanCart = parsed.filter(
            (item: any) =>
              item &&
              item.id &&
              !item.id.startsWith("cart-") &&
              !["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].includes(String(item.id))
          );
          setCart(cleanCart);
          localStorage.setItem("cargolink_cart", JSON.stringify(cleanCart));
        }
      }
      const savedFavs = localStorage.getItem("cargolink_favorites");
      if (savedFavs) {
        const parsed = JSON.parse(savedFavs);
        if (Array.isArray(parsed)) {
          const cleanFavs = parsed.filter(
            (item: any) =>
              item &&
              item.id &&
              !item.id.startsWith("fav-") &&
              !["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].includes(String(item.id))
          );
          setFavorites(cleanFavs);
          localStorage.setItem("cargolink_favorites", JSON.stringify(cleanFavs));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cargolink_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("cargolink_favorites", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  // Cart methods
  const addToCart = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const qtyToAdd = item.quantity && item.quantity > 0 ? item.quantity : 1;
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + qtyToAdd } : p));
      }
      return [...prev, { ...item, quantity: qtyToAdd }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) => {
          if (p.id === id) {
            const newQ = p.quantity + delta;
            return newQ > 0 ? { ...p, quantity: newQ } : null;
          }
          return p;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Favorites methods
  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  const toggleFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id)) {
        return prev.filter((f) => f.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const addAllFavoritesToCart = () => {
    favorites.forEach((fav) => {
      addToCart({
        id: `fav-cart-${fav.id}`,
        name: fav.name,
        category: fav.category,
        price: fav.price,
        oldPrice: fav.oldPrice,
        image: fav.image,
        deliveryRange: "Livré entre 12/12/2026 et 20/12/2026",
        shippingMode: "air",
      });
    });
  };

  // Promo code validation
  const applyPromoCode = (code: string) => {
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) {
      return { success: false, message: "Veuillez entrer un code promo." };
    }
    if (cleaned === "CARGO10" || cleaned === "AFRIQUE10") {
      setDiscountPercent(10);
      setPromoApplied(true);
      return { success: true, message: "Code CARGO10 appliqué : -10% sur votre commande !" };
    }
    if (cleaned === "PROMO5" || cleaned === "BIENVENUE") {
      setDiscountPercent(5);
      setPromoApplied(true);
      return { success: true, message: "Code BIENVENUE appliqué : -5% sur votre commande !" };
    }
    if (cleaned === "CHINAFREE") {
      setDiscountPercent(3);
      setPromoApplied(true);
      return { success: true, message: "Remise FENOUHI Chine appliquée (-3%) !" };
    }
    return { success: false, message: "Code promo invalide ou expiré." };
  };

  // Calculations
  const totalPanier = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((totalPanier * discountPercent) / 100);
  const finalTotal = Math.max(0, totalPanier - discountAmount);
  const installmentAmount = Math.round(finalTotal / 4);

  // Price formatting in FCFA, EUR, USD, Ar
  const formatPrice = (priceInFcfa: number): string => {
    if (!priceInFcfa || isNaN(priceInFcfa)) return "0 FCFA";
    if (currency === "FCFA") {
      return `${Math.round(priceInFcfa).toLocaleString("fr-FR")} FCFA`;
    }
    if (currency === "EUR") {
      const converted = Math.round(priceInFcfa / 655.957);
      return `${converted.toLocaleString("fr-FR")} €`;
    }
    if (currency === "USD") {
      const converted = Math.round(priceInFcfa / 600);
      return `$${converted.toLocaleString("en-US")}`;
    }
    if (currency === "Ar") {
      const converted = Math.round(priceInFcfa * 7.5);
      return `${converted.toLocaleString("fr-FR")} Ar`;
    }
    return `${Math.round(priceInFcfa).toLocaleString("fr-FR")} FCFA`;
  };

  return (
    <MobileStoreContext.Provider
      value={{
        cart,
        favorites,
        currency,
        setCurrency,
        country,
        setCountry: handleSetCountry,
        deliveryMode,
        setDeliveryMode,
        paymentMode,
        setPaymentMode,
        promoCode,
        setPromoCode,
        discountPercent,
        promoApplied,
        applyPromoCode,
        acceptedTerms,
        setAcceptedTerms,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleFavorite,
        isFavorite,
        addAllFavoritesToCart,
        totalPanier,
        discountAmount,
        finalTotal,
        installmentAmount,
        formatPrice,
        activeScreen,
        setActiveScreen,
      }}
    >
      {children}
    </MobileStoreContext.Provider>
  );
}

export function useMobileStore(): MobileStoreContextType {
  const ctx = useContext(MobileStoreContext);
  if (!ctx) {
    return {
      country: COUNTRIES[0],
      setCountry: () => {},
      currency: "FCFA",
      setCurrency: () => {},
      cart: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      promoCode: "",
      setPromoCode: () => {},
      applyPromoCode: () => ({ success: false, message: "" }),
      promoApplied: false,
      discountPercent: 0,
      deliveryMode: "home",
      setDeliveryMode: () => {},
      paymentMode: "full",
      setPaymentMode: () => {},
      acceptedTerms: true,
      setAcceptedTerms: () => {},
      favorites: [],
      toggleFavorite: () => {},
      isFavorite: () => false,
      addAllFavoritesToCart: () => {},
      totalPanier: 0,
      discountAmount: 0,
      finalTotal: 0,
      installmentAmount: 0,
      formatPrice: (amt: number) => `${amt.toLocaleString("fr-FR")} FCFA`,
      activeScreen: "cart",
      setActiveScreen: () => {},
    };
  }
  return ctx;
}
