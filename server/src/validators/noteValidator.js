import { z } from 'zod';

export const createNoteSchema = z.object({
  body: z.object({
    body: z.string({ required_error: 'Note body is required' })
      .min(1, 'Note body cannot be empty')
      .max(65536, 'Note is too long'),
  }),
  params: z.object({
    id: z.string({ required_error: 'Contact ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Contact ID format'),
  }),
});

export const getNotesQuerySchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Contact ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Contact ID format'),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    sort: z.string().optional().default('-createdAt'),
  }),
});
