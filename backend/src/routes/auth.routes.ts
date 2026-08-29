import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', validate({ body: loginSchema }), authController.login);
router.get('/profile', authenticate, authController.getProfile);

export default router;
