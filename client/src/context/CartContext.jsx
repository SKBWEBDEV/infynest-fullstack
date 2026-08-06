// File Path: src/context/CartContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('shopbd_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('shopbd_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const cartId = item.cartId || `${item.productId || item._id}-${item.size || 'nosize'}-${item.color || 'nocolor'}`;
      const existingIndex = prevCart.findIndex((i) => i.cartId === cartId);

      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += item.quantity;
        return updatedCart;
      } else {
        return [...prevCart, { ...item, cartId }];
      }
    });
  };

  const removeFromCart = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);