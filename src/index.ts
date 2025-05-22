import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import { routeError } from "./middleware/routeError";
import authRoutes from "./routes/auth.route";
import passwordRoutes from "./routes/password.route";
import userRoutes from "./routes/user.route";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173", "https://voltsec.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/volt/api/auth", authRoutes);
app.use("/volt/api/password", passwordRoutes);
app.use("/volt/api/user", userRoutes);

app.use(routeError);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`....Server started on ${PORT}....`));
