import express, { Express } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import path from "path";
const app: Express = express();

import cookieParser from "cookie-parser";
import errorhandler from "../src/middlewares/errorHandler";
import swaggerDocument from "./utils/swagger";
import swaggerUi from "swagger-ui-express";
import authRoute from "./Routes/auth.route";
import userRoute from "./Routes/user.route";
import permissionRoute from "./Routes/permission.route";
import memberRoute from "./Routes/member.route";

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://elsaqr-family-saas-web-app-56kk.vercel.app"]
    : ["http://localhost:5173"];

//1_global middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["set-cookie"],
  })
);

app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); //logger
}

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/permission", permissionRoute);
app.use("/api/v1/member", memberRoute);

app.use(errorhandler);

export default app;
