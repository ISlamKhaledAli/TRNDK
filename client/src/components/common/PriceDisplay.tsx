import { useCurrency } from "@/contexts/CurrencyContext";

interface PriceDisplayProps {
  amount: number;
  className?: string;
  isBold?: boolean;
}

const PriceDisplay = ({ amount, className = "", isBold = false }: PriceDisplayProps) => {
  const { formatPrice } = useCurrency();
  const { main, secondary } = formatPrice(amount);

  return (
    <div className={`flex flex-col items-start ${className}`}>
        <span className={`${isBold ? 'font-bold' : ''} text-primary`}>{main}</span>
        {secondary && (
            <span className="text-[0.7em] text-muted-foreground font-normal">
                (~{secondary})
            </span>
        )}
    </div>
  );
};

export default PriceDisplay;
