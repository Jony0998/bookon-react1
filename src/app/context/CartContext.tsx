import React, { createContext, useContext, useState } from "react";
import useBasket from "../hooks/useBasket";
import { CartItem } from "../../lib/types/search";
import { Product } from "../../lib/types/product";
import { effectivePrice } from "../../lib/format";

type Basket = ReturnType<typeof useBasket>;

interface CartValue extends Basket {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isInCart: (productId: string) => boolean;
  /** Adds copies of a product (default one), charging its sale price when it has one */
  addProduct: (product: Product, quantity?: number) => void;
}

const CartContext = createContext<CartValue | undefined>(undefined);

export const toCartItem = (product: Product): CartItem => ({
  _id: product._id,
  quantity: 1,
  name: product.productName,
  price: effectivePrice(product),
  image: product.productImages?.[0] ?? "",
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const basket = useBasket();
  const [isOpen, setOpen] = useState(false);

  const value: CartValue = {
    ...basket,
    isOpen,
    openCart: () => setOpen(true),
    closeCart: () => setOpen(false),
    isInCart: (productId) => basket.cartItems.some((item) => item._id === productId),
    addProduct: (product, quantity = 1) => basket.addMany(toCartItem(product), quantity),
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};
