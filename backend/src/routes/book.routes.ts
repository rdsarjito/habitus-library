import { Router } from 'express';
import * as bookController from '../controllers/book.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { createBookSchema, updateBookSchema, bookQuerySchema, idParamSchema } from '../validators/book.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', validate({ query: bookQuerySchema }), bookController.findAll);
router.get('/categories', bookController.getCategories);
router.get('/:id', validate({ params: idParamSchema }), bookController.findById);
router.post('/', validate({ body: createBookSchema }), bookController.create);
router.put('/:id', validate({ params: idParamSchema, body: updateBookSchema }), bookController.update);
router.delete('/:id', validate({ params: idParamSchema }), bookController.remove);

export default router;
