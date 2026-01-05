import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface OrderDetailsViewerProps {
  data: any;
  label?: string;
  isRoot?: boolean;
  titleLink?: string;
}

export const OrderDetailsViewer = ({ data, label, isRoot = false, titleLink }: OrderDetailsViewerProps) => {
  const { t } = useTranslation(["common"]);

  if (data === null || data === undefined) return null;

  // Handle Array
  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="text-sm text-muted-foreground italic text-start">{t('empty', { defaultValue: 'Empty' })}</p>;
    
    return (
      <div className="space-y-3 w-full">
        {label && <h4 className="font-semibold text-sm text-foreground text-start">{label}</h4>}
        <div className="grid gap-3">
          {data.map((item, idx) => (
            <div key={idx} className="bg-secondary/30 rounded-lg p-3 border border-border">
              <OrderDetailsViewer data={item} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle Object
  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (entries.length === 0) return <p className="text-sm text-muted-foreground italic text-start">{t('empty', { defaultValue: 'Empty' })}</p>;

    // Special fields handling with common variations
    const name = data.name || data.title || data.productName || data.serviceName || data.service;
    const image = data.imageUrl || data.image || data.img || data.thumbnail;
    const link = data.link || data.url || data.targetUrl || data.website;
    // Use titleLink if provided, otherwise fallback to data.link
    const effectiveLink = titleLink || link;
    
    const price = data.price || data.amount || data.cost || data.total;
    const quantity = data.quantity || data.qty || data.count;
    
    // Filter out handled fields to avoid duplication
    const specialKeys = [
      'name', 'title', 'productName', 'serviceName', 'service',
      'imageUrl', 'image', 'img', 'thumbnail', 
      'link', 'url', 'targetUrl', 'website',
      'price', 'amount', 'cost', 'total',
      'quantity', 'qty', 'count'
    ];

    const ignoredKeys = ['items', 'cart'];
    
    // Case-insensitive filtering
    const otherEntries = entries.filter(([k]) => 
      !specialKeys.includes(k) && 
      !specialKeys.includes(k.toLowerCase()) &&
      !ignoredKeys.includes(k) &&
      !ignoredKeys.includes(k.toLowerCase())
    );

    const isInternalLink = effectiveLink && (effectiveLink.startsWith('/') || effectiveLink.startsWith('#'));

    return (
      <div className={`text-start w-full ${isRoot ? '' : 'text-sm'}`}>
        {/* Header section with Name and Link merged */}
        {(name || effectiveLink) && (
          <div className="mb-3">
             {name ? (
                effectiveLink ? (
                  isInternalLink ? (
                    <Link 
                      to={effectiveLink}
                      className="flex items-center gap-1.5 font-semibold text-primary hover:underline break-words"
                    >
                      <span>{name}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </Link>
                  ) : (
                    <a 
                      href={effectiveLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1.5 font-semibold text-primary hover:underline break-words"
                    >
                      <span>{name}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  )
                ) : (
                  <h4 className="font-semibold text-foreground break-words">{name}</h4>
                )
             ) : (
                // No name, just link
                <a 
                  href={effectiveLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline break-all"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  {effectiveLink}
                </a>
             )}
          </div>
        )}

        {/* Key Attributes Row (Price, Qty, etc) */}
        {(price !== undefined || quantity !== undefined) && (
          <div className="flex flex-wrap gap-3 mb-3 pb-2 border-b border-border/50">
            {price !== undefined && (
              <div className="inline-flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t('price', { defaultValue: 'Price' })}</span>
                <span className="font-medium font-mono">{(Number(price) / 100).toFixed(2)}</span>
              </div>
            )}
            {quantity !== undefined && (
              <div className="inline-flex flex-col">
                 <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t('quantity', { defaultValue: 'Quantity' })}</span>
                 <span className="font-medium">{quantity}</span>
              </div>
            )}
          </div>
        )}

        {/* Other Details List */}
        {otherEntries.length > 0 && (
          <div className="space-y-2">
            {otherEntries.map(([k, v]) => {
               if (v === null || v === undefined) return null;
               
               // Format key: camelCase to Title Case
               const displayKey = k
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();

               return (
                <div key={k} className="group w-full">
                  {typeof v === 'object' ? (
                     // Recursive callback for nested objects/arrays
                     <div className="mt-2 pt-2 border-t border-border/30">
                       <OrderDetailsViewer data={v} label={displayKey} />
                     </div>
                  ) : (
                    // Simple Key-Value row
                    <div className="flex justify-between items-start py-1.5 border-b border-border/30 last:border-0 gap-4">
                      <span className="text-xs font-medium text-muted-foreground flex-shrink-0 mt-0.5">{displayKey}</span>
                      <span className="text-sm text-foreground text-end break-words flex-1 min-w-0">{String(v)}</span>
                    </div>
                  )}
                </div>
               );
            })}
          </div>
        )}
      </div>
    );
  }

  // Fallback for primitives
  return <span className="text-sm break-words">{String(data)}</span>;
};

export default OrderDetailsViewer;
