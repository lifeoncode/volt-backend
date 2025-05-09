import {Router} from 'express';
import {hello} from '../controllers/hello.controller'

const router = Router();

router.get('/', hello)

export default router;