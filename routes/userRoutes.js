import { Router } from 'express';
import { getPublicProfile, updateMe } from '../controllers/userController.js';
import { sendQuestion, listPublicFeed } from '../controllers/questionController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { profileUpdateSchema } from '../validations/userSchema.js';
import { createQuestionSchema } from '../validations/questionSchema.js';

const router = Router();
router.get('/me', auth, (req, res) => res.status(200).json(req.user.toJSON()));
router.patch('/me', auth, validate(profileUpdateSchema), updateMe);
router.get('/:username', getPublicProfile);
router.post('/:username/questions', rateLimit({ max: 10 }), validate(createQuestionSchema), sendQuestion);
router.get('/:username/questions', listPublicFeed);
export default router;
