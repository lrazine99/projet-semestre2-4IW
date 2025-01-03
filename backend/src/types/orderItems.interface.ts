import { Document } from 'mongoose';

export interface IOrderItems extends Document {
  productName: string;
  quantity: number;
  price: number;
  productSku: string;
  productImage: string;
}
