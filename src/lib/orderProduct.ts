import { serverApi } from "./config";
import { Order, OrderItem } from "./types/order";

const FALLBACK_IMAGE = "/icons/books-icon.png";

/** Product of an order line; falls back safely if the product was deleted */
export const findOrderProduct = (order: Order, item: OrderItem) => {
  const product = order.productData?.find((ele) => ele._id === item.productId);
  return {
    productName: product?.productName ?? "Unavailable book",
    imagePath: product?.productImages?.[0]
      ? `${serverApi}/${product.productImages[0]}`
      : FALLBACK_IMAGE,
  };
};
