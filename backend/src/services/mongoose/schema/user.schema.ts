import { Schema, model, Document } from "mongoose";
import { UserRole, IUser } from "../../../types";
import { AddressSchema } from "./address.schema";

export const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/,
    unique: true,
  },
  address: {
    type: AddressSchema, // Use the schema as a type
    required: false,
  },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  birthDate: { type: Date, required: true },
  token: { type: String, required: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  confirmationToken: { type: String, required: false },
  confirmationTokenExpires: { type: Date, required: false },
});
