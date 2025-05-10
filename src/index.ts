import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {routeError} from "./middleware/routeError";
import authRoutes from './routes/auth'
import addressCredentialRoute from "./routes/addressCredential.route";
import passwordCredentialRoute from "./routes/passwordCredential.route";
import paymentCredentialRoute from "./routes/paymentCredential.route";

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4173', 'https://voltsec.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/address', addressCredentialRoute);
app.use('/api/password', passwordCredentialRoute);
app.use('/api/payment', paymentCredentialRoute);

app.use(routeError);

dotenv.config();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`....Server started on ${PORT}....`))