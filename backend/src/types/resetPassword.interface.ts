import { Schema, Document } from "mongoose";

export interface IResetPassword extends Document {
    user: Schema.Types.ObjectId;
    resetPasswordToken: string;
    resetPasswordExpires: Date;
  }
  