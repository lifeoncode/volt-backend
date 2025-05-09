import {Router} from 'express';
import {login} from '../../controllers/login.controller'
import {register} from '../../controllers/register.controller'
import {recover} from '../../controllers/recover.controller'

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/recover', recover);

export default router;