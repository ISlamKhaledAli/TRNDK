/**
 * client/src/contexts/CurrencyContext.tsx
 * 
 * Enforced USD Currency Context with Display Options.
 * System currency is locked to USD ($).
 * Users can select a "Display Currency" to see approximate conversions.
 */

import React, { createContext, useContext, useState, useEffect } from "react";

type CurrencyCode = "USD" | "EUR" | "GBP" | "SAR" | "AED" | "KWD" | "EGP" | "QAR" | "JOD" | "TRY" | "INR";

interface CurrencyContextType {
  currency: "USD"; // System currency is always USD
  displayCurrency: CurrencyCode;
  setDisplayCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUsd: number) => { main: string; secondary?: string };
  availableCurrencies: { code: CurrencyCode; label: string; symbol: string }[];
  loading: boolean;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const API_URL = "https://open.er-api.com/v6/latest/USD";
const CACHE_KEY = "currency_rates_v1";
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "SAR", label: "Saudi Riyal", symbol: "SAR" },
  { code: "AED", label: "UAE Dirham", symbol: "AED" },
  { code: "KWD", label: "Kuwaiti Dinar", symbol: "KWD" },
  { code: "EGP", label: "Egyptian Pound", symbol: "EGP" },
  { code: "QAR", label: "Qatari Riyal", symbol: "QAR" },
  { code: "JOD", label: "Jordanian Dinar", symbol: "JOD" },
  { code: "TRY", label: "Turkish Lira", symbol: "₺" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
];

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // System currency strictly USD
  const currency: "USD" = "USD";
  
  const [displayCurrency, setDisplayCurrencyState] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [loading, setLoading] = useState(true);

  // Load saved display currency choice
  useEffect(() => {
    const saved = localStorage.getItem("preferredDisplayCurrency");
    const isValidCurrency = CURRENCIES.some(c => c.code === saved);
    if (saved && isValidCurrency) {
      setDisplayCurrencyState(saved as CurrencyCode);
    }
  }, []);

  // Fetch rates with caching
  const fetchRates = async () => {
    setLoading(true);
    try {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setRates(data);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh rates
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (data.result === "success") {
        setRates(data.rates);
        
        // Update cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: data.rates
        }));
      }
    } catch (error) {
      console.error("Failed to fetch currency rates:", error);
      // Fallback: If cache exists (even if stale), use it
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setRates(JSON.parse(cached).data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const setDisplayCurrency = (code: CurrencyCode) => {
    setDisplayCurrencyState(code);
    localStorage.setItem("preferredDisplayCurrency", code);
  };

  const formatPrice = (amountInCents: number) => {
    // Convert cents to main currency unit (dollars)
    const amountInUsd = amountInCents / 100;
    
    // Main price is ALWAYS USD ($X.XX)
    const main = `$${amountInUsd.toFixed(2)}`;
    
    // If display is USD or rates not loaded, no secondary needed
    if (displayCurrency === "USD" || !rates[displayCurrency]) {
      return { main };
    }

    // Calculate secondary (Approximate)
    const rate = rates[displayCurrency];
    const converted = amountInUsd * rate;
    const symbol = CURRENCIES.find(c => c.code === displayCurrency)?.symbol || displayCurrency;
    
    return {
      main,
      secondary: `≈ ${symbol} ${converted.toFixed(2)}`
    };
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      displayCurrency,
      setDisplayCurrency, 
      formatPrice, 
      availableCurrencies: CURRENCIES,
      loading,
      refreshRates: fetchRates 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
