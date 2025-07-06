import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { rateLimit } from "express-rate-limit";
import { errorHandler, NotFoundError } from "./middleware/errors";
import statusRoute from "./routes/statusRoute";
import authRoutes from "./routes/authRoute";
import secretRoute from "./routes/secretRoute";
import userRoutes from "./routes/userRoute";

export const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://voltsec.vercel.app",
      "https://voltpassword.xyz",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

const limiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 100 });
app.use(limiter);

app.use("/volt/api/status", statusRoute);
app.use("/volt/api/auth", authRoutes);
app.use("/volt/api/secret", secretRoute);
app.use("/volt/api/user", userRoutes);

app.use(() => {
  throw new NotFoundError("Route not found");
});
app.use(errorHandler);
