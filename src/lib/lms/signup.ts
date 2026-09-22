import { z } from 'zod';
export const signupSchema = z.object({
  mode: z.literal('signup'),
  email: z.email().max(254).transform(value => value.trim().toLowerCase()),
  password: z.string().min(10).max(128),
  name: z.string().trim().min(2, 'Please enter your full name.').max(120),
  phone: z.string().trim().min(5, 'Please enter your phone number.').max(40).regex(/^\+?[\d\s().-]+$/, 'Please enter a valid phone number.').refine(value => value.replace(/\D/g, '').length >= 5, 'Please enter a valid phone number.'),
  location: z.string().trim().min(2, 'Please enter your town or island.').max(100),
  attendance: z.enum(['online', 'in_person', 'mixed']),
  acknowledged: z.literal(true),
  course: z.string().regex(/^[a-z0-9-]+$/).max(100).optional(),
});
export const accountSchema = z.discriminatedUnion("mode", [signupSchema, z.object({
  mode: z.literal('recovery'), email: z.email().max(254),
  course: z.string().regex(/^[a-z0-9-]+$/).max(100).optional(),
})]);
