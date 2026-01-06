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
    body: z.object({
        name: z.string().min(1, 'Name cannot be empty').optional(),
    })
});

const updateProfile = z.object({
    body: z.object({
        name: z.string().min(1, 'Name cannot be empty').optional(),
    })
});

const adminUpdate = z.object({
    body: z.object({
        name: z.string().min(1, 'Name cannot be empty').optional(),
        email: z.string().email('Invalid email format').optional(),
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
    updateProfile,
    adminUpdate,
    changePassword
};
