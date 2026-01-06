import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiError";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import prisma from "../../../shared/prisma";
import { RedisClient } from "../../../shared/redis";
import { comparePassword } from "../../../shared/utils";
import { ILoginRequest, ILoginResponse, IRefreshTokenResponse } from "./auth.interface";

const login = async (payload: ILoginRequest): Promise<ILoginResponse> => {
    const { email, password } = payload;

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email");
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid password");
    }

    // Create JWT payload
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };

    // Generate access token
    const accessToken = jwtHelpers.createToken(
        jwtPayload,
        config.jwt.secret as Secret,
        config.jwt.expires_in as string
    );

    // Generate refresh token
    const refreshToken = jwtHelpers.createToken(
        jwtPayload,
        config.jwt.refresh_secret as Secret,
        config.jwt.refresh_expires_in as string
    );

    // Store refresh token in Redis
    // const refreshTokenKey = `refresh-token:${user.id}`;
    // const refreshTokenExpiry = 365 * 24 * 60 * 60; // 365 days in seconds
    // await RedisClient.set(refreshTokenKey, refreshToken, { EX: refreshTokenExpiry });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }
    };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
    // Verify refresh token
    let verifiedToken;
    try {
        verifiedToken = jwtHelpers.verifyToken(token, config.jwt.refresh_secret as Secret);
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }

    const { userId } = verifiedToken;

    // Check if user still exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
    }

    // Verify refresh token exists in Redis
    const refreshTokenKey = `refresh-token:${userId}`;
    const storedToken = await RedisClient.get(refreshTokenKey);

    if (!storedToken || storedToken !== token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
    }

    // Create new access token
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };

    const newAccessToken = jwtHelpers.createToken(
        jwtPayload,
        config.jwt.secret as Secret,
        config.jwt.expires_in as string
    );

    return {
        accessToken: newAccessToken
    };
};

const logout = async (userId: string): Promise<void> => {
    // Delete refresh token from Redis
    const refreshTokenKey = `refresh-token:${userId}`;
    await RedisClient.del(refreshTokenKey);
};

export const AuthService = {
    login,
    refreshToken,
    logout
};
