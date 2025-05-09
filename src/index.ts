import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {routeError} from "./middleware/routeError";
import authRoutes from './routes/auth'

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes)

app.use(routeError);

dotenv.config();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`....Server started on ${PORT}....`))