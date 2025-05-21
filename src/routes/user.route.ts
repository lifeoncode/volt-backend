import { Router } from "express";
import { deleteUser, getUser, updateUser } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @routes {User}
 *
 * @description
 * User specific routing
 *
 * @requires user authentication
 */
router.use(authenticate);
router.get("/", getUser);
router.put("/", updateUser);
router.delete("/", deleteUser);

export default router;
