import { Mongoose, connect } from "mongoose";
import {
  UserService,
  CartService,
  PlatformService,
  ProductService,
  ResetPasswordService
} from "./models";

export class MongooseService {
  private static instance?: MongooseService;

  readonly mongoose: Mongoose;
  readonly userService: UserService;
  readonly platformService: PlatformService;
  readonly productService: ProductService;
  readonly resetPasswordService: ResetPasswordService;
  readonly cartService: CartService;

  private constructor(mongoose: Mongoose) {
    this.mongoose = mongoose;
    this.userService = new UserService(this);
    this.platformService = new PlatformService(this);
    this.productService = new ProductService(this);
    this.resetPasswordService = new ResetPasswordService(this);
    this.cartService = new CartService(this);
  }

  public static async get(): Promise<MongooseService> {
    if (this.instance !== undefined) {
      return this.instance;
    }
    const connection = await this.openConnection();
    this.instance = new MongooseService(connection);
    return this.instance;
  }

  private static async openConnection(): Promise<Mongoose> {
    const connection = await connect(process.env.MONGODB_URI as string, {
      auth: {
        username: process.env.MONGODB_USERNAME,
        password: process.env.MONGODB_PASSWORD,
      },
      authSource: "admin",
      dbName: process.env.DATABASE_NAME,
    });
    return connection;
  }
}