'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CartItem = {
  /** رقم سطر العربة — بيفرّق بين نسختين متخصصتين من نفس المنتج. */
  id: string;
  /**
   * رقم المنتج الحقيقي في قاعدة البيانات.
   *
   * كان الطلب بيتخزّن برقم السطر المركّب (رقم المنتج + التوقيت)، فعناصر
   * الطلبات ما كانتش موصولة بالمنتجات، والخادم ما كانش يقدر يجيب السعر
   * الصح. الرقم ده هو اللي بيتبعت للخادم.
   */
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  type: 'book' | 'custom' | 'subscription' | 'package';
  /** أرقام الإضافات المختارة — السعر بيتحسب في القاعدة، مش هنا. */
  addonIds?: string[];
  /** الإضافات اللي اتطلبت بتخصيص — مجموعة فرعية من `addonIds`. */
  customizedAddonIds?: string[];
  customizationData?: any;
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  /** Emptying the cart after an order. The checkout used to carry the comment
   *  "In real app, clearCart() would be here" — so every completed order left
   *  its items in the cart, ready to be ordered again. */
  clearCart: () => void;
  itemCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
