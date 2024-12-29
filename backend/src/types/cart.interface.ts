import { Schema, Document } from "mongoose";
import { ICartItem } from ".";

export interface ICart extends Document {
  _id: typeof Schema.Types.ObjectId;
  userId: typeof Schema.Types.ObjectId;
  items: ICartItem[];
}
