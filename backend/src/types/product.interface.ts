import {  Document } from "mongoose";
import { ProductVariant } from "./";

export interface IProduct extends Document {
  name: string;
  description: string;
  genres: string[];
  variants?: ProductVariant[];
  minAge: number;
  editor: string;
}
