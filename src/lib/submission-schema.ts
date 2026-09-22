import { z } from 'zod';
const short = z.string().trim().max(500).optional();
const details = z.record(z.string().max(100), z.union([z.string().max(5000), z.boolean(), z.array(z.string().max(200)).max(30)])).optional();
export const submissionSchema = z.object({
  contact_name: z.string().trim().min(2, 'Please enter your name').max(200),
  contact_email: z.string().trim().email('Please enter a valid email').max(254),
  contact_phone: short, company_name: short,
  project_type: z.enum(['website', 'webapp', 'mobile', 'ai', 'social', 'full-package', 'contact']),
  project_description: z.string().trim().max(20000).optional(),
  budget_range: short, timeline: short, urgency: short,
  preferred_contact: short, best_time_to_call: short,
  additional_notes: z.string().max(10000).optional(),
  ai_summary: z.string().max(20000).optional(),
  website_details: details, ai_automation: details, social_media: details,
  website: z.string().max(200).optional(), // Honeypot, not a customer URL.
});
export type SubmissionInput = z.infer<typeof submissionSchema>;
