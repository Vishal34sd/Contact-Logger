import { z } from 'zod';

export const authCallbackSchema = z.object({
  query: z.object({
    code: z.string({ required_error: 'Authorization code is required' }),
  }),
});
