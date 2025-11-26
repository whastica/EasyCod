import { useState } from "react";
import * as api from "../services/api";
import { toast } from "sonner";
import { MESSAGES } from "../constants/messages";

export default function useCart(initial = { items: [], subtotal: 0, total_commission: 0, total_handling: 0, total_cod_price: 0 }) {
  const [cart, setCart] = useState(initial);

  const addToCart = async (product) => {
    try {
      const existing = cart.items.find((i) => i.asin === product.asin);
      const newItems = existing
        ? cart.items.map((item) => (item.asin === product.asin ? { ...item, quantity: item.quantity + 1 } : item))
        : [...cart.items, { asin: product.asin, quantity: 1 }];

      const data = await api.updateCart(newItems);
      setCart(data);
      toast.success(MESSAGES.ADD_TO_CART_SUCCESS);
    } catch (err) {
      toast.error(MESSAGES.ADD_TO_CART_FAIL);
    }
  };

  const updateQuantity = async (asin, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(asin);
      return;
    }

    try {
      const newItems = cart.items.map((item) => (item.asin === asin ? { ...item, quantity: newQuantity } : item));
      const data = await api.updateCart(newItems);
      setCart(data);
    } catch (err) {
      toast.error(MESSAGES.UPDATE_QUANTITY_FAIL);
    }
  };

  const removeFromCart = async (asin) => {
    try {
      const newItems = cart.items.filter((item) => item.asin !== asin);
      const data = await api.updateCart(newItems);
      setCart(data);
      toast.success(MESSAGES.REMOVE_ITEM_SUCCESS);
    } catch (err) {
      toast.error(MESSAGES.REMOVE_ITEM_FAIL);
    }
  };

  const placeOrder = async (orderData) => {
    try {
      const data = await api.placeOrder(orderData);
      // reset cart after placing order
      setCart({ items: [], subtotal: 0, total_commission: 0, total_handling: 0, total_cod_price: 0 });
      toast.success(MESSAGES.ORDER_PLACED);
      return data;
    } catch (err) {
      toast.error(MESSAGES.ORDER_FAILED);
      throw err;
    }
  };

  return { cart, setCart, addToCart, updateQuantity, removeFromCart, placeOrder };
}
