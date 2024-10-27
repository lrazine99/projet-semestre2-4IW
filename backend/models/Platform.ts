import { Schema, model, Document } from "mongoose";
import { IPlatform } from "types/Platform.interface";

const PlatformSchema = new Schema<IPlatform>({
  name: { type: String, required: true, unique: true },
});

const Platform = model<IPlatform>("Platform", PlatformSchema);

export default Platform;
