import { Router } from "express";
import { login, register, recover } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/recover", recover);

export default router;
