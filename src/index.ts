import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { routeError } from "./middleware/routeError";
import authRoutes from "./routes/auth";
import addressCredentialRoutes from "./routes/addressCredential.route";
import passwordCredentialRoutes from "./routes/passwordCredential.route";
import paymentCredentialRoutes from "./routes/paymentCredential.route";
import userRoutes from "./routes/user.route";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173", "https://voltsec.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

app.use("/volt/api/auth", authRoutes);
app.use("/volt/api/address", addressCredentialRoutes);
app.use("/volt/api/password", passwordCredentialRoutes);
app.use("/volt/api/payment", paymentCredentialRoutes);
app.use("/volt/api/user", userRoutes);

app.use(routeError);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`....Server started on ${PORT}....`));
