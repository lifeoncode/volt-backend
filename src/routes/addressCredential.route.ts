import {Router} from 'express';
import {createAddressCredential, getAllAddressCredentials, getSingleAddressCredential, updateAddressCredential, deleteAddressCredential} from "../controllers/addressCredential.controller";

const router = Router();

router.post("/", createAddressCredential);
router.get('/', getAllAddressCredentials);
router.get('/:id', getSingleAddressCredential);
router.put('/:id', updateAddressCredential);
router.delete('/:id', deleteAddressCredential);

export default router;