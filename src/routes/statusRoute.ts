import { Router } from "express";
import { serverStatus } from "../controllers/statusController";
const router = Router();

/**
 * @routes {status}
 *
 * @description
 * Server status check
 */
router.get("/", serverStatus);

export default router;
