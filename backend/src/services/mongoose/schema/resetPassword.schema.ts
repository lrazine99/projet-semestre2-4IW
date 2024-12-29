import { Schema } from "mongoose";
import { IResetPassword } from "../../../types";

export const ResetPasswordSchema = new Schema<IResetPassword>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});


