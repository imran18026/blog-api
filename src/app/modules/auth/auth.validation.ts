import { z } from 'zod';

const login = z.object({
    body: z.object({
        email: z.string().min(1, 'Email is required').email('Invalid email format'),
        password: z.string().min(1, 'Password is required')
    })
});

const refreshToken = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required')
    }).optional(),
    cookies: z.object({
        refreshToken: z.string().optional()
    }).optional()
}).refine(
    (data) => data.body?.refreshToken || data.cookies?.refreshToken,
    {
        message: 'Refresh token is required in either body or cookies'
    }
);

export const AuthValidation = {
    login,
    refreshToken
};
