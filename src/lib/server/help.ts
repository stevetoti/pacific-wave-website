import 'server-only';
import { z } from 'zod';
export const articleFields = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().min(1).max(100000),
  category: z.string().trim().min(1).max(100),
  tags: z.array(z.string().max(80)).max(30).optional(),
  related_feature: z.string().max(200).nullable().optional(),
  is_published: z.boolean().optional(),
  siteId: z.literal('pwd').optional(),
});
export const articleColumns = 'id,site_id,title,slug,content,category,tags,related_feature,is_published,view_count,helpful_yes,helpful_no,created_at,updated_at';
export const slugify = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
