import { z } from 'zod';

export const getContactsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    sort: z.string().optional(),
    search: z.string().optional(),
  }),
});
