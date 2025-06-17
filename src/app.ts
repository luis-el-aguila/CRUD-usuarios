import express, { Application, Request, Response } from "express";
import userRoutes from "./routes/userRoutes";
import logger from "./middleware/logger";

const app: Application = express();

app.use(express.json());
app.use(logger);

app.get("/", (req: Request, res: Response) => {
  res.send("user API width firebase is running");
});

app.use("/users", userRoutes);

export default app;
