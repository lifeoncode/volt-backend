import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helloRoute from "./routes/hello.route";
import {routeError} from "./middleware/routeError";

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/', helloRoute)

app.use(routeError);

dotenv.config();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`....Server started on ${PORT}....`))