import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { secretValidationSchema } from "../middleware/validationSchemas";
import {
  createSecret,
  deleteAllSecrets,
  deleteSecret,
  getAllSecrets,
  getSecret,
  updateSecret,
} from "../controllers/secretController";

const router = Router();

/**
 * @routes {Secret}
 *
 * @description
 * Secret specific routing
 *
 * @requires user authentication
 */
router.use(authenticate);
router.post("/", secretValidationSchema, createSecret);
router.get("/", getAllSecrets);
router.get("/:id", getSecret);
router.put("/:id", updateSecret);
router.delete("/", deleteAllSecrets);
router.delete("/:id", deleteSecret);

export default router;
