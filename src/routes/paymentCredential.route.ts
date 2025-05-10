import {Router} from "express";
import {
    createPaymentCredential, deletePaymentCredential,
    getAllPaymentCredentials,
    getSinglePaymentCredential, updatePaymentCredential
} from "../controllers/paymentCredential.controller";

const router = Router();

router.post("/", createPaymentCredential);
router.get("/", getAllPaymentCredentials);
router.get("/:id", getSinglePaymentCredential);
router.put("/:id", updatePaymentCredential);
router.delete("/:id", deletePaymentCredential);

export default router;