import { Schema } from "mongoose";

export interface Address {
  street: String;
  zipCode: String;
  city: String;
}

export const AddressSchema = new Schema({
  street: { type: String, required: true },
  zipCode: { type: String, required: true },
  city: { type: String, required: true },
});
