import { Model } from "mongoose";
import { MongooseService } from "../mongoose.service";
import { PlatformSchema } from "../schema";
import { IPlatform, IUser } from "../../../types";

export class PlatformService {
  readonly mongooseService: MongooseService;
  readonly model: Model<IPlatform>;

  constructor(mongooseService: MongooseService) {
    this.mongooseService = mongooseService;
    const mongoose = this.mongooseService.mongoose;
    this.model = mongoose.model("Platform", PlatformSchema);
  }
}
