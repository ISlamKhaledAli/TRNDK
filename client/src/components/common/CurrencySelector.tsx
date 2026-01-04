import { useCurrency } from "@/contexts/CurrencyContext";
import { Globe } from "lucide-react";

const CurrencySelector = () => {
  const { currency, setCurrency, availableCurrencies } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-secondary  text-red-500 hover:text-red-600 transition-colors">
            <Globe className="w-3.5 h-3.5  text-red-500 hover:text-red-600 transition-colors" />
            <span>{currency}</span>
        </button>
        
        {/* Dropdown */}
        <div className="absolute top-full right-0 mt-1 w-40 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="p-1">
                {availableCurrencies.map((c) => (
                    <button
                        key={c.code}
                        onClick={() => setCurrency(c.code)}
                        className={`w-full text-start px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                            currency === c.code 
                                ? 'bg-primary/10 text-primary font-medium' 
                                : 'hover:bg-secondary text-foreground'
                        }`}
                    >
                        <span>{c.code}</span>
                        <span className="text-xs text-muted-foreground">{c.symbol}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencySelector;
