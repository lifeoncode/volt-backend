import { Router } from "express";
import {
  createPaymentCredential,
  deletePaymentCredential,
  getAllPaymentCredentials,
  getSinglePaymentCredential,
  updatePaymentCredential,
} from "../controllers/paymentCredential.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @routes {PaymentCredential}
 *
 * @description
 * PaymentCredential specific routing
 *
 * @requires user authentication
 */
router.use(authenticate);
router.post("/", createPaymentCredential);
router.get("/", getAllPaymentCredentials);
router.get("/:id", getSinglePaymentCredential);
router.put("/:id", updatePaymentCredential);
router.delete("/:id", deletePaymentCredential);

export default router;
