import { z } from 'zod';

const create = z.object({
    body: z.object({
        email: z.string().min(1, 'Email is required').email('Invalid email format'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        name: z.string().min(1, 'Name is required'),
        role: z.enum(['ADMIN', 'USER']).optional().default('USER')
    })
});

const login = z.object({
    body: z.object({
        email: z.string().min(1, 'Email is required').email('Invalid email format'),
        password: z.string().min(1, 'Password is required')
    })
});

const update = z.object({
    params: z.object({
        id: z.string().min(1, 'User ID is required')
    }),
    body: z.object({
        email: z.string().email('Invalid email format').optional(),
        name: z.string().min(1, 'Name cannot be empty').optional(),
        role: z.enum(['ADMIN', 'USER']).optional()
    })
});

const changePassword = z.object({
    body: z.object({
        oldPassword: z.string().min(1, 'Old password is required'),
        newPassword: z.string().min(6, 'New password must be at least 6 characters')
    })
});

export const UserValidation = {
    create,
    login,
    update,
    changePassword
};
