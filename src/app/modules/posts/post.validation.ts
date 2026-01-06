import { z } from 'zod';

const create = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        content: z.string().optional(),
        published: z.boolean().optional().default(false)
    })
});

const update = z.object({
    body: z.object({
        title: z.string().min(1, 'Title cannot be empty').optional(),
        content: z.string().optional(),
        published: z.boolean().optional()
    })
});

export const PostValidation = {
    create,
    update
};
