import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from api server:" });
});

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(
    `App listening at <http://localhost>:${process.env.SERVER_PORT} `
  );
});

module.exports = app;
