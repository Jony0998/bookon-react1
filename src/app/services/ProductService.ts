
import axios from "axios";
import { serverApi } from "../../lib/config";
import { Product, ProductInquiry } from "../../lib/types/product";

class ProductService {
    private readonly path: string;

    constructor() {
        this.path = serverApi;
    }
    
 public async getProducts(input: ProductInquiry): Promise<Product[]> {
   try {
 
     const params: Record<string, string | number> = {
       order: input.order,
       page: input.page,
       limit: input.limit,
     };
     if (input.productCollection) params.productCollection = input.productCollection;
     if (input.search) params.search = input.search;

     // axios encodes params, so "&", "#" or "+" in a search term are safe
     const result = await axios.get(`${this.path}/product/all`, { params });
     return result.data;
   } catch(err) {
      console.log("Error, getProduct:", err)
      throw err; 
   }
 }

 public async getProduct(productId: string): Promise<Product> {
     try {
       const url = `${this.path}/product/${productId}`;
       const result = await axios.get(url, {withCredentials: true });
       return result.data;
     } catch(err) {
        console.log("Error, getProduct:", err);
        throw err;
     }
 }

 public async checkLiked(productId: string): Promise<boolean> {
   try {
     const url = `${this.path}/product/like-check`;
     const result = await axios.get(url, { params: { productId }, withCredentials: true });
     return result.data.liked;
   } catch(err) {
     return false;
   }
 }

 public async likeProduct(productId: string): Promise<Product> {
   try {
     const url = `${this.path}/product/like`;
     const result = await axios.post(url, { productId }, { withCredentials: true });
     return result.data;
   } catch(err) {
     console.log("Error, likeProduct:", err);
     throw err;
   }
 }

};


export default ProductService;