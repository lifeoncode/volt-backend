import {Router} from 'express';
import {
    createAddressCredential,
    getAllAddressCredentials,
    getSingleAddressCredential,
    updateAddressCredential,
    deleteAddressCredential
} from "../controllers/addressCredential.controller";
import {authenticate} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate)
router.post("/", createAddressCredential);
router.get('/', getAllAddressCredentials);
router.get('/:id', getSingleAddressCredential);
router.put('/:id', updateAddressCredential);
router.delete('/:id', deleteAddressCredential);

export default router;