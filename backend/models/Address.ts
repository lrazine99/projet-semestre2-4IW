import { Schema } from "mongoose";
import { IAddress } from "../types/Address.interface";

export const AddressSchema = new Schema<IAddress>({
  number: { type: Number, required: true },
  street: { type: String, required: true },
  complement: { type: String, required: false },
  zipCode: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
});
