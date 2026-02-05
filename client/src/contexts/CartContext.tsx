/**
 * client/src/contexts/CartContext.tsx
 * 
 * Shopping cart and wishlist context provider.
 * Manages cart items, wishlist, quantities, and persists data to localStorage.
 * Provides cart operations (add, remove, update, clear) and price calculations.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: number;
  serviceId: number;
  name: string;
  nameEn?: string;
  price: number;
  quantity: number;
  link: string;
  imagePath?: string;
  category?: string;
}

interface CartContextType {
  items: CartItem[];
  wishlist: number[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (serviceId: number) => void;
  isInWishlist: (serviceId: number) => boolean;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [wishlist, setWishlist] = useState<number[]>(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // Sanitize existing cart items on mount
  useEffect(() => {
    const hasInvalidItems = items.some(
      (item) => item.category !== "Growth Services" && item.quantity !== 1
    );

    if (hasInvalidItems) {
      setItems((prev) =>
        prev.map((item) =>
          item.category !== "Growth Services" && item.quantity !== 1
            ? { ...item, quantity: 1 }
            : item
        )
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addItem = (newItem: CartItem) => {
    // Force quantity to 1 for all categories except Growth Services
    const enforcedQuantity = newItem.category === "Growth Services" ? newItem.quantity : 1;
    const itemToAdd = { ...newItem, quantity: enforcedQuantity };

    setItems((prev) => {
      const existing = prev.find((item) => item.serviceId === itemToAdd.serviceId && item.link === itemToAdd.link);
      if (existing) {
        return prev.map((item) =>
          item.serviceId === itemToAdd.serviceId && item.link === itemToAdd.link
            ? { ...item, quantity: item.category === "Growth Services" ? item.quantity + itemToAdd.quantity : 1, name: itemToAdd.name, nameEn: itemToAdd.nameEn }
            : item
        );
      }
      return [...prev, { ...itemToAdd, id: Date.now() }];
    });
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // Prevent manual modification for non-Growth items
          if (item.category !== "Growth Services") return { ...item, quantity: 1 };
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  const toggleWishlist = (serviceId: number) => {
    setWishlist((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const isInWishlist = (serviceId: number) => wishlist.includes(serviceId);

  const totalItems = items.reduce((sum, item) => sum + 1, 0);
  
  // New pricing logic: (price * quantity) / 1000 for Growth, else just price
  const totalPrice = items.reduce((sum, item) => {
    const itemPrice = item.category === "Growth Services" 
      ? (item.price * item.quantity) / 1000 
      : item.price;
    return sum + itemPrice;
  }, 0);

  return (
    <CartContext.Provider
      value={ {
        items,
        wishlist,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        totalItems,
        totalPrice,
      } }
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
