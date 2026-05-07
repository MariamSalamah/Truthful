import { z } from 'zod';

export const createQuestionSchema = z.object({
  body: z.string().min(1).max(500),
});

export const answerSchema = z.object({
  answer: z.string().min(1).max(1000),
  visibility: z.enum(['public', 'private']).optional(),
});

export const updateQuestionSchema = z.object({
  status: z.enum(['pending', 'answered', 'ignored']).optional(),
  answer: z.string().min(1).max(1000).optional(),
  visibility: z.enum(['public', 'private']).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: 'At least one field required' });
