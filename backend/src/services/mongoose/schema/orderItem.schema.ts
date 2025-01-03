import { Schema } from "mongoose";
import { IOrderItems } from "../../../types";

export const OrderItemSchema = new Schema<IOrderItems>({
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    productSku: { type: String, required: true },
    productImage: { type: String, required: true },
});