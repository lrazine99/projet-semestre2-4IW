import {  Document } from "mongoose";
import { IProductVariant } from "./";

export interface IProduct extends Document {
  name: string;
  description: string;
  genres: string[];
  variants: IProductVariant[];
  minAge: number;
  editor: string;
}
