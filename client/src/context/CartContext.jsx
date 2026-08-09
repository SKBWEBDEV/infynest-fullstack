// File Path: src/context/CartContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // ==========================================
  // LOAD CART FROM LOCAL STORAGE
  // ==========================================
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("shopbd_cart");

      if (!savedCart) {
        return [];
      }

      const parsedCart = JSON.parse(savedCart);

      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
      console.error("Cart load error:", error);
      return [];
    }
  });

  // ==========================================
  // SAVE CART TO LOCAL STORAGE
  // ==========================================
  useEffect(() => {
    try {
      localStorage.setItem("shopbd_cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Cart save error:", error);
    }
  }, [cart]);

  // ==========================================
  // ADD TO CART
  // ==========================================
  const addToCart = (item) => {
    if (!item) return;

    const productId = item.productId || item._id || item.product;

    if (!productId) {
      console.error("Cannot add product without product ID");
      return;
    }

    const quantity = Math.max(Number(item.quantity) || 1, 1);

    const cartId =
      item.cartId ||
      `${productId}-${item.size || "nosize"}-${item.color || "nocolor"}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (cartItem) => cartItem.cartId === cartId,
      );

      // ========================================
      // PRODUCT ALREADY EXISTS
      // ========================================
      if (existingIndex !== -1) {
        const updatedCart = [...prevCart];

        const currentQuantity =
          Number(updatedCart[existingIndex].quantity) || 0;

        const maxStock = Number(updatedCart[existingIndex].stock);

        const newQuantity = currentQuantity + quantity;

        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity:
            maxStock > 0 ? Math.min(newQuantity, maxStock) : newQuantity,
        };

        return updatedCart;
      }

      // ========================================
      // NEW PRODUCT
      // ========================================
      return [
        ...prevCart,
        {
          ...item,
          productId,
          quantity,
          cartId,
        },
      ];
    });
  };

  // ==========================================
  // REMOVE FROM CART
  // ==========================================
  const removeFromCart = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================
  const updateQuantity = (cartId, quantity) => {
    const newQuantity = Number(quantity);

    if (!Number.isFinite(newQuantity) || newQuantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.cartId !== cartId) {
          return item;
        }

        const stock = Number(item.stock);

        return {
          ...item,
          quantity: stock > 0 ? Math.min(newQuantity, stock) : newQuantity,
        };
      }),
    );
  };

  // ==========================================
  // CLEAR CART
  // ==========================================
  const clearCart = () => {
    setCart([]);
  };

  // ==========================================
  // CONTEXT
  // ==========================================
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ==========================================
// USE CART HOOK
// ==========================================
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};
