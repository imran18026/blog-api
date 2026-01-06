import { z } from 'zod';

const create = z.object({
    body: z.object({
        text: z.string().min(1, 'Comment text is required'),
        postId: z.string().min(1, 'Post ID is required'),
        parentCommentId: z.string().optional()
    })
});

const update = z.object({
    body: z.object({
        text: z.string().min(1, 'Comment text cannot be empty')
    })
});

export const CommentValidation = {
    create,
    update
};
