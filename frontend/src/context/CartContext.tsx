'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  cartId: string;
  packageId: string;
  packageName: string;
  diamonds: string | number;
  price: number;
  shellCost: number;
  playerUid: string;
  quantity: number;
  image?: string;
  isWeeklyPass?: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartId'>) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  updatePlayerUid: (cartId: string, newUid: string) => void;
  clearCart: () => void;
  totalCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shadow_store_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [cartItems, isLoaded]);

  const addToCart = (item: Omit<CartItem, 'cartId'>) => {
    setCartItems((prev) => {
      // Check if item with same packageId & playerUid already exists
      const existingIndex = prev.findIndex(
        (i) => i.packageId === item.packageId && i.playerUid === item.playerUid
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity || 1;
        return updated;
      } else {
        const newItem: CartItem = {
          ...item,
          cartId: `${item.packageId}_${item.playerUid || 'guest'}_${Date.now()}`,
          quantity: item.quantity || 1,
        };
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
    );
  };

  const updatePlayerUid = (cartId: string, newUid: string) => {
    setCartItems((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, playerUid: newUid } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updatePlayerUid,
        clearCart,
        totalCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
