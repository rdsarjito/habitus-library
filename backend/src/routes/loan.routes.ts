import { Router } from 'express';
import * as loanController from '../controllers/loan.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { createLoanSchema, returnLoanSchema, loanQuerySchema } from '../validators/loan.validator';
import { idParamSchema } from '../validators/book.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate({ query: loanQuerySchema }), loanController.findAll);
router.get('/:id', validate({ params: idParamSchema }), loanController.findById);
router.post('/', validate({ body: createLoanSchema }), loanController.create);
router.patch('/:id/return', validate({ params: idParamSchema, body: returnLoanSchema }), loanController.returnLoan);

export default router;
