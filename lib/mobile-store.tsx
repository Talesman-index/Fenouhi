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
    defaultDriveHub: "Hub Principal CargoLink Akpakpa Port (Cotonou)",
  },
  {
    code: "CI",
    name: "Côte d'Ivoire",
    flag: "CI",
    currency: "FCFA",
    rateToAr: 7.5,
    defaultCity: "Abidjan",
    defaultAddress: "Cocody Angré 8e Tranche, Rue L14",
    defaultDriveHub: "Hub Logistique CargoLink Vridi Port",
  },
  {
    code: "TG",
    name: "Togo",
    flag: "TG",
    currency: "FCFA",
    rateToAr: 7.5,
    defaultCity: "Lomé",
    defaultAddress: "Boulevard du 13 Janvier, Lomé",
    defaultDriveHub: "Hub Logistique CargoLink Port de Lomé",
  },
  {
    code: "SN",
    name: "Sénégal",
    flag: "SN",
    currency: "FCFA",
    rateToAr: 7.5,
    defaultCity: "Dakar",
    defaultAddress: "Plateau, Boulevard de la République",
    defaultDriveHub: "Hub Logistique CargoLink Bel-Air",
  },
  {
    code: "CM",
    name: "Cameroun",
    flag: "CM",
    currency: "FCFA",
    rateToAr: 7.5,
    defaultCity: "Douala",
    defaultAddress: "Bonanjo, Rue de la Marine",
    defaultDriveHub: "Hub Fret CargoLink Aéroport Douala",
  },
  {
    code: "MG",
    name: "Madagascar",
    flag: "MG",
    currency: "Ar",
    rateToAr: 1,
    defaultCity: "Antananarivo",
    defaultAddress: "Ambohimanarina, Antanety Avaratra",
    defaultDriveHub: "Zoma Morarano Alarobia (Hub CargoLink)",
  },
];

const INITIAL_CART: CartItem[] = [
  {
    id: "cart-1",
    name: "Apple Watch Ultra 3 GPS + Cellular - 49mm - Boîtier Titanium",
    specs: "49mm Titanium • Bracelet Trail Loop • GPS Double Fréquence",
    category: "Téléphonie & Objets connectés",
    price: 3950000, // ~525 000 FCFA
    oldPrice: 4500000,
    quantity: 1,
    image: "/images/assets/item_1.jpg",
    deliveryRange: "Livraison Express Cotonou : 5-12 jours",
    shippingMode: "air",
  },
  {
    id: "cart-2",
    name: "APPLE - Magic Keyboard - iPad Air 13-inch (M3)",
    specs: "Pavé tactile intégré • Rétroéclairage • Port USB-C dédié",
    category: "Informatique",
    price: 1387500, // ~185 000 FCFA
    oldPrice: 1650000,
    quantity: 1,
    image: "/images/assets/item_3.jpg",
    deliveryRange: "Livraison Express Cotonou : 5-12 jours",
    shippingMode: "air",
  },
  {
    id: "cart-3",
    name: "iPhone 16e 256GB - Direct Usine Certifiée",
    specs: "256GB • Puce A18 Bionic • Écran Super Retina XDR",
    category: "Téléphonie & Objets connectés",
    price: 3375000, // ~450 000 FCFA
    oldPrice: 3900000,
    quantity: 1,
    image: "/images/assets/hero_iphone16.png",
    deliveryRange: "Livraison Express Cotonou : 5-12 jours",
    shippingMode: "air",
  },
];

const INITIAL_FAVORITES: FavoriteItem[] = [
  {
    id: "fav-1",
    name: "iPhone 16e",
    category: "Téléphonie & Objets connectés",
    price: 2966000,
    oldPrice: 3400000,
    image: "/images/assets/hero_iphone16.png",
    inStock: true,
  },
  {
    id: "fav-2",
    name: "Folio iPad Gen 10 - 10.9 - PORT DESIGNS - 201353 NOUMEA 2 Slim...",
    category: "Informatique",
    price: 199000,
    oldPrice: 250000,
    image: "/images/assets/item_2.jpg",
    inStock: true,
  },
  {
    id: "fav-3",
    name: "Apple Watch Ultra 3 GPS + Cellular - 49mm",
    category: "Téléphonie & Objets connectés",
    price: 5941000,
    oldPrice: 6800000,
    image: "/images/assets/item_1.jpg",
    inStock: true,
  },
];

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
          setCart(parsed);
        }
      }
      const savedFavs = localStorage.getItem("cargolink_favorites");
      if (savedFavs) {
        const parsed = JSON.parse(savedFavs);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
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
      return { success: true, message: "Remise CargoLink Chine appliquée (-3%) !" };
    }
    return { success: false, message: "Code promo invalide ou expiré." };
  };

  // Calculations
  const totalPanier = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((totalPanier * discountPercent) / 100);
  const finalTotal = Math.max(0, totalPanier - discountAmount);
  const installmentAmount = Math.round(finalTotal / 4);

  // Price formatting in Ar, FCFA, EUR, USD
  const formatPrice = (priceInAr: number): string => {
    if (currency === "Ar") {
      return `${priceInAr.toLocaleString("fr-FR")} Ar`;
    }
    if (currency === "FCFA") {
      const converted = Math.round(priceInAr / 7.5);
      return `${converted.toLocaleString("fr-FR")} FCFA`;
    }
    if (currency === "EUR") {
      const converted = Math.round(priceInAr / 4900);
      return `${converted.toLocaleString("fr-FR")} €`;
    }
    if (currency === "USD") {
      const converted = Math.round(priceInAr / 4500);
      return `$${converted.toLocaleString("en-US")}`;
    }
    return `${priceInAr.toLocaleString("fr-FR")} Ar`;
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
