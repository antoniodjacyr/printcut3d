"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  title: string;
  priceUsd: number;
  imageUrl: string | null;
  quantity: number;
  customizationText: string;
};

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  addItem: (item: Omit<CartItem, "quantity" | "customizationText">) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  updateCustomization: (productId: string, text: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "printcut3d.cart";
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const addItem: CartContextType["addItem"] = (item) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.productId === item.productId);
      if (existing) {
        return prev.map((p) => (p.productId === item.productId ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...item, quantity: 1, customizationText: "" }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    const next = Math.max(1, Math.floor(qty || 1));
    setItems((prev) => prev.map((p) => (p.productId === productId ? { ...p, quantity: next } : p)));
  };

  const updateCustomization = (productId: string, text: string) => {
    setItems((prev) => prev.map((p) => (p.productId === productId ? { ...p, customizationText: text } : p)));
  };

  const clear = () => setItems([]);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({ items, itemCount, addItem, removeItem, updateQty, updateCustomization, clear }),
    [items, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
