import { z } from 'zod';

export const addNoteSchema = z.object({
  body: z.string()
    .min(1, 'Note body cannot be empty')
    .max(65536, 'Note is too long'),
});
