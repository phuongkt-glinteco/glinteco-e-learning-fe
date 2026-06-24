import { z } from 'zod';

export const documentKindSchema = z.enum(['Guide', 'Reference', 'Runbook', 'Tutorial', 'Link']);
export const tagColorSchema = z.enum(['accent', 'info', 'warn', 'danger', 'muted']);

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: tagColorSchema,
});

export const documentSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  kind: documentKindSchema,
  tags: z.array(z.string()),
  updatedAt: z.string().datetime(),
  bookmarked: z.boolean(),
});

export const createDocumentSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  url: z.string().min(1, { message: 'URL is required' }),
  kind: documentKindSchema,
  tags: z.array(z.string()).optional().default([]),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1, { message: 'Title cannot be empty' }).optional(),
  url: z.string().min(1, { message: 'URL cannot be empty' }).optional(),
  kind: documentKindSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, { message: 'Tag name is required' }),
});

export type Tag = z.infer<typeof tagSchema>;
export type Document = z.infer<typeof documentSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
