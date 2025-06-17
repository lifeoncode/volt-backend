import { Router } from "express";
import {
  createPasswordCredential,
  deleteAllPasswordCredentials,
  deletePasswordCredential,
  getAllPasswordCredentials,
  getSinglePasswordCredential,
  updatePasswordCredential,
} from "../controllers/passwordController";
import { authenticate } from "../middleware/authMiddleware";
import { passwordCredentialValidationSchema } from "../middleware/validationSchemas";

const router = Router();

/**
 * @routes {PasswordCredential}
 *
 * @description
 * PasswordCredential specific routing
 *
 * @requires user authentication
 */
router.use(authenticate);
router.post("/", passwordCredentialValidationSchema, createPasswordCredential);
router.get("/", getAllPasswordCredentials);
router.get("/:id", getSinglePasswordCredential);
router.put("/:id", updatePasswordCredential);
router.delete("/", deleteAllPasswordCredentials);
router.delete("/:id", deletePasswordCredential);

export default router;
