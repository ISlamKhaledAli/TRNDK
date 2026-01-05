/**
 * client/src/contexts/CurrencyContext.tsx
 * 
 * Currency conversion context provider.
 * Fetches live exchange rates from external API, caches them locally,
 * and provides price formatting in multiple currencies (USD, SAR, AED, EUR, etc.).
 */

import React, { createContext, useContext, useState, useEffect } from "react";

type CurrencyCode = "USD" | "EUR" | "GBP" | "SAR" | "AED" | "KWD" | "EGP" | "QAR" | "JOD" | "TRY" | "INR";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
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
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [loading, setLoading] = useState(true);

  // Load saved currency choice
  useEffect(() => {
    const saved = localStorage.getItem("preferredCurrency");
    const isValidCurrency = CURRENCIES.some(c => c.code === saved);
    if (saved && isValidCurrency) {
      setCurrencyState(saved as CurrencyCode);
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

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem("preferredCurrency", code);
  };

  const formatPrice = (amountInUsd: number) => {
    // Main price is ALWAYS USD
    const main = `$${amountInUsd.toFixed(2)}`;
    
    // If selected is USD or rates not loaded, no secondary needed
    if (currency === "USD" || !rates[currency]) {
      return { main };
    }

    // Calculate secondary
    const rate = rates[currency];
    const converted = amountInUsd * rate;
    const symbol = CURRENCIES.find(c => c.code === currency)?.symbol || currency;
    
    return {
      main,
      secondary: `${symbol} ${converted.toFixed(2)}`
    };
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
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
