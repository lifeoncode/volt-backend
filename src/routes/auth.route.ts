import { Router } from "express";
import { login, register, recover, validateRecovery } from "../controllers/auth.controller";
import { updateUserPassword } from "../controllers/user.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/recover", recover);
router.post("/recover/validate", validateRecovery);
router.post("/recover/reset", updateUserPassword);

export default router;
