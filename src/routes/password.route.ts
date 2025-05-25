import { Router } from "express";
import {
  createPasswordCredential,
  deleteAllPasswordCredentials,
  deletePasswordCredential,
  getAllPasswordCredentials,
  getSinglePasswordCredential,
  updatePasswordCredential,
} from "../controllers/password.controller";
import { authenticate } from "../middleware/auth.middleware";

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
router.post("/", createPasswordCredential);
router.get("/", getAllPasswordCredentials);
router.get("/:id", getSinglePasswordCredential);
router.put("/:id", updatePasswordCredential);
router.delete("/", deleteAllPasswordCredentials);
router.delete("/:id", deletePasswordCredential);

export default router;
