import React, { createContext, useContext, useState, useCallback } from 'react';

const BasketContext = createContext(null);

export function BasketProvider({ children }) {
  const [items, setItems] = useState({});
  const [notes, setNotes] = useState('');

  const setQuantity = useCallback((productId, quantity) => {
    setItems((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = quantity;
      }
      return next;
    });
  }, []);

  const increment = useCallback((productId) => {
    setItems((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  }, []);

  const decrement = useCallback((productId) => {
    setItems((prev) => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: current - 1 };
    });
  }, []);

  const clearBasket = useCallback(() => {
    setItems({});
    setNotes('');
  }, []);

  const loadItems = useCallback((newItems) => {
    const mapped = {};
    for (const item of newItems) {
      mapped[item.productId] = item.quantity;
    }
    setItems(mapped);
  }, []);

  const totalItems = Object.values(items).reduce((s, q) => s + q, 0);
  const itemCount = Object.keys(items).length;

  return (
    <BasketContext.Provider value={{
      items,
      notes,
      setNotes,
      setQuantity,
      increment,
      decrement,
      clearBasket,
      loadItems,
      totalItems,
      itemCount,
    }}>
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error('useBasket must be used within BasketProvider');
  return ctx;
}
