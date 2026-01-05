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
  price: number;
  quantity: number;
  link: string;
  imageUrl?: string;
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

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.serviceId === newItem.serviceId && item.link === newItem.link);
      if (existing) {
        return prev.map((item) =>
          item.serviceId === newItem.serviceId && item.link === newItem.link
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, { ...newItem, id: Date.now() }];
    });
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
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
  const totalPrice = items.reduce((sum, item) => sum + (item.price / 100) * (item.quantity / 1000), 0);

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
