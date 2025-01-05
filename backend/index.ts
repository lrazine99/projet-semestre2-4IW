// @ts-ignore
import { xss } from "express-xss-sanitizer";
import express, { Request, Response } from "express";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import errorHandler from "./src/middlewares/errorHandler"; // Import the error handler middleware
import { AuthController } from "./src/controllers/auth.controller";
import { CartController } from "./src/controllers/cart.controller";
import { ProductController } from "./src/controllers/product.controller";
import { StatsController } from "./src/controllers/stats.controller";
import { OrderController } from "./src/controllers/order.controller";

const app = express();

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(express.json());
app.use(cors());

const authController = new AuthController();
const cartController = new CartController();
const productController = new ProductController();
const statsController = new StatsController();
const orderController = new OrderController();

app.use('/user', authController.buildRouter());
app.use('/cart', cartController.buildRouter());
app.use('/product', productController.buildRouter());
app.use('/admin/stats', statsController.buildRouter());
app.use('/order', orderController.buildRouter());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from api server :" });
});

app.all("*", (req: Request, res: Response) => {
  res.status(404).send("Page introuvable");
});

app.use(errorHandler);

const startServer = async () => {
  try {
    // await connectDB();

    // @ts-ignore
    const PORT = process.env.SERVER_PORT || 8080;
    // const PORT =  8080;

    app.listen(PORT, () => {
      `App listening at <http://localhost>:${PORT} `;
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
