import { Router } from 'express';
import { listInbox, answerQuestion, updateQuestion, removeQuestion } from '../controllers/questionController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { answerSchema, updateQuestionSchema } from '../validations/questionSchema.js';

const router = Router();
router.use(auth);
router.get('/inbox', listInbox);
router.post('/:id/answer', validate(answerSchema), answerQuestion);
router.patch('/:id', validate(updateQuestionSchema), updateQuestion);
router.delete('/:id', removeQuestion);
export default router;
