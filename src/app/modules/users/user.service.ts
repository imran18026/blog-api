import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/pagination";
import prisma from "../../../shared/prisma";
import { IUserCreateData, IUserFilterRequest, IUserUpdateData } from "./user.interface";
import { userSearchableFields } from "./user.constants";
import { User, Prisma } from "@prisma/client";
import { hashPassword } from "../../../shared/utils";

const insertIntoDB = async (data: IUserCreateData): Promise<Partial<User>> => {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    });
    if (existingUser) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User with this email already exists");
    }
    // hash password before saving (Assuming a hashPassword function exists)
    data.password = await hashPassword(data.password);

    const result = await prisma.user.create({
        data,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            password: false // Don't return password
        }
    });
    return result;
};

const getAllFromDB = async (
    filters: IUserFilterRequest,
    options: IPaginationOptions
): Promise<IGenericResponse<User[]>> => {
    const { limit, page, skip } = paginationHelpers.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive'
                }
            }))
        });
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        });
    }

    const whereConditions: Prisma.UserWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                    createdAt: 'desc'
                },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            password: false // Don't return password
        }
    });

    const total = await prisma.user.count({
        where: whereConditions
    });

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result as User[]
    };
};

const getByIdFromDB = async (id: string): Promise<Partial<User> | null> => {
    const result = await prisma.user.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            password: false // Don't return password
        }
    });
    return result;
};

const updateOneInDB = async (
    id: string,
    payload: IUserUpdateData
): Promise<Partial<User> | null> => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // If email is being updated, check if it's already taken
    if (payload.email && payload.email !== user.email) {
        const existingUser = await prisma.user.findUnique({
            where: { email: payload.email }
        });

        if (existingUser) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Email already in use");
        }
    }

    // Update user
    const result = await prisma.user.update({
        where: { id },
        data: payload,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            password: false // Don't return password
        }
    });

    return result;
}

const deleteByIdFromDB = async (id: string): Promise<Partial<User>> => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const result = await prisma.user.delete({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            password: false // Don't return password
        }
    });

    return result;
};

const getMyProfile = async (userId: string): Promise<Partial<User> | null> => {
    const result = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            password: false
        }
    });

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    return result;
};

const updateMyProfile = async (
    userId: string,
    payload: IUserUpdateData
): Promise<Partial<User> | null> => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Only allow name updates for regular users through /me endpoint
    const allowedFields: Partial<IUserUpdateData> = {};
    if (payload.name) {
        allowedFields.name = payload.name;
    }

    // Prevent email and role updates through this endpoint
    if (payload.email || payload.role) {
        throw new ApiError(httpStatus.FORBIDDEN, "Only name updates are allowed through this endpoint");
    }

    // Update user
    const result = await prisma.user.update({
        where: { id: userId },
        data: allowedFields,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            password: false
        }
    });

    return result;
};

export const UserService = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
    getMyProfile,
    updateMyProfile
}
