import { Router } from "express";
import { login, logout, register, recover, validateRecovery, refreshToken } from "../controllers/auth.controller";
import { resetUserPassword } from "../controllers/user.controller";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.post("/recover", recover);
router.post("/recover/validate", validateRecovery);
router.post("/recover/reset", resetUserPassword);
router.post("/refresh-token", refreshToken);

export default router;
