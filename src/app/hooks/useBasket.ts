import { useEffect, useState } from "react";
import { CartItem } from "../../lib/types/search";

const STORAGE_KEY = "cartData";

const readCart = (): CartItem[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Cart kept in localStorage. Every change uses a functional update, so several
 * changes in one tick (e.g. "order again" adding many books) all apply.
 */
const useBasket = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(readCart);

  useEffect(() => {
    try {
      if (cartItems.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage full or blocked: cart still works for this visit */
    }
  }, [cartItems]);

  /** +1 copy of an item (adds it when missing) */
  const onAdd = (input: CartItem) => addMany(input, 1);

  /** −1 copy; removes the line at zero */
  const onRemove = (input: CartItem) =>
    setCartItems((items) =>
      items.flatMap((item) =>
        item._id !== input._id ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []
      )
    );

  const onDelete = (input: CartItem) => setCartItems((items) => items.filter((item) => item._id !== input._id));

  /** Add `quantity` copies; keeps one line per book and refreshes its price */
  const addMany = (input: CartItem, quantity: number) =>
    setCartItems((items) =>
      items.some((item) => item._id === input._id)
        ? items.map((item) =>
            item._id === input._id ? { ...item, quantity: item.quantity + quantity, price: input.price } : item
          )
        : [...items, { ...input, quantity }]
    );

  const onDeleteAll = () => setCartItems([]);

  return { cartItems, onAdd, onRemove, onDelete, onDeleteAll, addMany };
};

export default useBasket;
