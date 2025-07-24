import { Router } from "express";
import { login, logout, register, recover, refreshToken, verifyUserToken } from "../controllers/authController";
import { resetUserPassword } from "../controllers/userController";
import {
  loginValidationSchema,
  passwordResetValidationSchema,
  recoverValidationSchema,
  registerValidationSchema,
} from "../middleware/validationSchemas";

const router = Router();

/**
 * @routes {Login, Logout, Register, Recover, Validate, Reset, Refresh}
 *
 * @description
 * Auth related routing
 */
router.post("/login", loginValidationSchema, login);
router.post("/logout", logout);
router.post("/register", registerValidationSchema, register);
router.post("/recover", recoverValidationSchema, recover);
router.get("/verify-token", verifyUserToken);
router.post("/recover/reset", passwordResetValidationSchema, resetUserPassword);
router.post("/refresh-token", refreshToken);

export default router;
