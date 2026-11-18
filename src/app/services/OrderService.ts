
import axios from "axios";
import { serverApi } from "../../lib/config";
import { CartItem } from "../../lib/types/search";
import { Order, OrderInquiry, OrderItemInput, OrderUpdateInput } from "../../lib/types/order";

export interface DeliveryInput {
  phone: string;
  address: string;
  note: string;
}

class OrderService {
    private readonly path: string;

    constructor() {
        this.path = serverApi;
    }

/** Checkout: the server re-prices items and checks stock */
public async createOrder(input: CartItem[], delivery: DeliveryInput, saveToProfile: boolean): Promise<Order> {
    try {
      const items: OrderItemInput[] = input.map((cartItem: CartItem) => ({
        itemQuantity: cartItem.quantity,
        itemPrice: cartItem.price,
        productId: cartItem._id,
      }));

      const url = `${this.path}/order/create`;
      const result = await axios.post(url, { items, delivery, saveToProfile }, {
        withCredentials: true
    });

      return result.data.result;
    } catch(err) {
      console.log("Error. createOrder:", err);  
      throw err;
    }
}   


public async getMyOrders(input: OrderInquiry): Promise<Order[]> {
    try {
      //axios.defaults.withCredentials = true;
      const url = `${this.path}/order/all`;
      const result = await axios.get(url, {
        params: { page: input.page, limit: input.limit, orderStatus: input.orderStatus },
        withCredentials: true,
      });

      return result.data;
    } catch(err) {
      console.log("Error. getMyOrders:", err);  
      throw err;
    }
}   

public async updateOrder(input: OrderUpdateInput): Promise<Order> {
    try {
      const url = `${this.path}/order/update`;
      const result = await axios.post(url, input, {withCredentials: true});

      return result.data;
    } catch(err) {
      console.log("Error. getMyOrders:", err);  
      throw err;
    }
}   


}

export default OrderService;