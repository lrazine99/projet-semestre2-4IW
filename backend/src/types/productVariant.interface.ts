import { Schema, Document } from "mongoose";

export interface ProductVariant extends Document {
  _id: Schema.Types.ObjectId,
  sku: string;
  platform: Schema.Types.ObjectId;
  name: string;
  edition: string;
  price: number;
  stock: number;
  releaseDate: Date;
  images: string[];
  barcode: string;
}
