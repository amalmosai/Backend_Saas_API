import express, { Express } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import path from "path";
const app: Express = express();

import errorhandler from "../src/middlewares/errorHandler";
import swaggerDocument from "./utils/swagger";
import swaggerUi from "swagger-ui-express";

//1_global middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(helmet());
if (process.env.NODE_ENV === "devlopment") {
  app.use(morgan("dev")); //logger
}

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorhandler);

export default app;
