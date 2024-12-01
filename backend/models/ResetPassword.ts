import { Schema, model, Document } from "mongoose";

interface IResetPassword extends Document {
  user: Schema.Types.ObjectId;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
}

const ResetPasswordSchema = new Schema<IResetPassword>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

const ResetPassword = model<IResetPassword>("ResetPassword", ResetPasswordSchema);

export default ResetPassword;
