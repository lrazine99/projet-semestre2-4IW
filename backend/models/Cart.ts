import mongoose, { Schema, Document } from 'mongoose';

interface ICartItem {
  sku: string;
  title: string;
  imageSrc: string;
  price: number;
  quantity: number;
  stock: number;
  edition: string;
  platform: string;
}

interface ICart extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  items: ICartItem[];
}

const CartItemSchema = new Schema<ICartItem>({
  sku: { type: String, required: true },
  title: { type: String, required: true },
  imageSrc: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  stock: { type: Number, required: true },
  edition: { type: String, required: true },
  platform: { type: String, required: true },
});

const CartSchema = new Schema<ICart>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: { type: [CartItemSchema], default: [] },
});

const Cart = mongoose.model<ICart>('Cart', CartSchema);
export default Cart;
