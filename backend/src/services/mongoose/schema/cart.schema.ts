import mongoose, { Schema, Document } from "mongoose";

import { ICart } from "../../../types";
import { CartItemSchema } from "./";

export const CartSchema = new Schema<ICart>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: { type: [CartItemSchema], default: [] },
});
