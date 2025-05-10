import {Router} from "express";
import {
    createPasswordCredential, deletePasswordCredential,
    getAllPasswordCredentials, getSinglePasswordCredential,
    updatePasswordCredential
} from "../controllers/passwordCredential.controller";

const router = Router();

router.post("/", createPasswordCredential);
router.get("/", getAllPasswordCredentials);
router.get("/:id", getSinglePasswordCredential);
router.put("/:id", updatePasswordCredential);
router.delete("/:id", deletePasswordCredential);

export default router;