import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin']).optional().default('user')
});

export const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;