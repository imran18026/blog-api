import { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiError";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthService } from "./auth.service";

const login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.env === 'production', // Use secure cookies in production
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000 // 365 days in milliseconds
    });

    // Set access token in cookie
    // res.cookie('accessToken', result.accessToken, {
    //     httpOnly: true,
    //     secure: config.env === 'production',
    //     sameSite: 'strict',
    //     maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    // });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Login successful",
        data: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user
        }
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
    // Accept refresh token from body or cookies
    const token = req.body.refreshToken || req.cookies.refreshToken;
    console.log("Refresh Token:", token);

    if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token is required");
    }

    const result = await AuthService.refreshToken(token);

    // // Set new access token in cookie
    // res.cookie('accessToken', result.accessToken, {
    //     httpOnly: true,
    //     secure: config.env === 'production',
    //     sameSite: 'strict',
    //     maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    // });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Access token refreshed successfully",
        data: result
    });
});

const logout = catchAsync(async (req: Request, res: Response) => {
    const user = req.user; // Set by auth middleware

    if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
    }

    await AuthService.logout(user.userId);

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Logout successful",
        data: null
    });
});

export const AuthController = {
    login,
    refreshToken,
    logout
};
