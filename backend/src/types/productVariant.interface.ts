import { Schema, Document } from "mongoose";

export interface IProductVariant extends Document {
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
