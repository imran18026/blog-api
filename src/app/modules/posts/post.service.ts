import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/pagination";
import prisma from "../../../shared/prisma";
import { IPostCreateData, IPostFilterRequest, IPostUpdateData } from "./post.interface";
import { postSearchableFields } from "./post.constants";
import { Post, Prisma } from "@prisma/client";

const insertIntoDB = async (authorId: string, data: IPostCreateData): Promise<Post> => {
    const postData = {
        ...data,
        authorId
    };

    const result = await prisma.post.create({
        data: postData,
        include: {
            author: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true
                }
            }
        }
    });

    return result;
};

const getAllFromDB = async (
    filters: IPostFilterRequest,
    options: IPaginationOptions
): Promise<IGenericResponse<Post[]>> => {
    const { limit, page, skip } = paginationHelpers.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            OR: postSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive'
                }
            }))
        });
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                if (key === 'published') {
                    return {
                        [key]: {
                            equals: (filterData as any)[key] === 'true'
                        }
                    };
                }
                return {
                    [key]: {
                        equals: (filterData as any)[key]
                    }
                };
            })
        });
    }

    const whereConditions: Prisma.PostWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.post.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                    createdAt: 'desc'
                },
        include: {
            author: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true
                }
            }
        }
    });

    const total = await prisma.post.count({
        where: whereConditions
    });

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    };
};

const getByIdFromDB = async (id: string): Promise<Post | null> => {
    const result = await prisma.post.findUnique({
        where: {
            id
        },
        include: {
            author: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true
                }
            },
            comments: {
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Post not found");
    }

    return result;
};

const updateOneInDB = async (
    id: string,
    userId: string,
    userRole: string,
    payload: IPostUpdateData
): Promise<Post | null> => {
    const post = await prisma.post.findUnique({
        where: { id }
    });

    if (!post) {
        throw new ApiError(httpStatus.NOT_FOUND, "Post not found");
    }

    if (post.authorId !== userId && userRole !== 'ADMIN') {
        throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to update this post");
    }

    const result = await prisma.post.update({
        where: { id },
        data: payload,
        include: {
            author: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true
                }
            }
        }
    });

    return result;
};

const deleteByIdFromDB = async (id: string, userId: string, userRole: string): Promise<Post> => {
    const post = await prisma.post.findUnique({
        where: { id }
    });

    if (!post) {
        throw new ApiError(httpStatus.NOT_FOUND, "Post not found");
    }

    if (post.authorId !== userId && userRole !== 'ADMIN') {
        throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to delete this post");
    }

    const result = await prisma.post.delete({
        where: { id },
        include: {
            author: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true
                }
            }
        }
    });

    return result;
};

const getMyPosts = async (
    userId: string,
    options: IPaginationOptions
): Promise<IGenericResponse<Post[]>> => {
    const { limit, page, skip } = paginationHelpers.calculatePagination(options);

    const result = await prisma.post.findMany({
        where: {
            authorId: userId
        },
        skip,
        take: limit,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            author: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true
                }
            }
        }
    });

    const total = await prisma.post.count({
        where: {
            authorId: userId
        }
    });

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    };
};

export const PostService = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
    getMyPosts
};
