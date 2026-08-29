import { Router } from 'express';
import * as memberController from '../controllers/member.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { createMemberSchema, updateMemberSchema, memberQuerySchema } from '../validators/member.validator';
import { idParamSchema } from '../validators/book.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate({ query: memberQuerySchema }), memberController.findAll);
router.get('/:id', validate({ params: idParamSchema }), memberController.findById);
router.post('/', validate({ body: createMemberSchema }), memberController.create);
router.put('/:id', validate({ params: idParamSchema, body: updateMemberSchema }), memberController.update);
router.delete('/:id', validate({ params: idParamSchema }), memberController.remove);

export default router;
