import { z } from 'zod';

export const profileUpdateSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(200).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  acceptingQuestions: z.boolean().optional(),
  tags: z
    .array(z.string().min(2).max(20).regex(/^[a-z0-9-]+$/))
    .max(10)
    .optional(),
}).strip();
