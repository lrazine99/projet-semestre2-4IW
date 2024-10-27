import express, { Request, Response } from "express";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import UserRoutes from "./routes/user";
import ProductRoutes from "./routes/product";
// @ts-ignore
import { xss } from "express-xss-sanitizer";
import connectDB from "./helpers/database";

const app = express();

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(express.json());
app.use(cors());
app.use(UserRoutes);
app.use(ProductRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from api server:" });
});

app.all("*", (req: Request, res: Response) => {
  res.status(404).send("Page introuvable");
});

const startServer = async () => {
  try {
    await connectDB(); // Establish the database connection

    // @ts-ignore
    const PORT = process.env.SERVER_PORT || 8080;

    app.listen(PORT, () => {
      `App listening at <http://localhost>:${PORT} `;
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit the process with failure
  }
};

startServer();

module.exports = app;
