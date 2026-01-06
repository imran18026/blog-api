import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/pagination";
import prisma from "../../../shared/prisma";
import { ICommentCreateData, ICommentFilterRequest, ICommentUpdateData } from "./comment.interface";
import { commentSearchableFields } from "./comment.constants";
import { comment, Prisma } from "@prisma/client";

const insertIntoDB = async (data: ICommentCreateData): Promise<comment> => {
    // Check if post exists
    const post = await prisma.post.findUnique({
        where: { id: data.postId }
    });

    if (!post) {
        throw new ApiError(httpStatus.NOT_FOUND, "Post not found");
    }

    // Check if parent comment exists (if provided)
    if (data.parentCommentId) {
        const parentComment = await prisma.comment.findUnique({
            where: { id: data.parentCommentId }
        });

        if (!parentComment) {
            throw new ApiError(httpStatus.NOT_FOUND, "Parent comment not found");
        }

        // Ensure parent comment belongs to the same post
        if (parentComment.postId !== data.postId) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Parent comment must belong to the same post");
        }
    }

    const result = await prisma.comment.create({
        data,
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            },
            parentComment: true,
            replies: true
        }
    });

    return result;
};

const getAllFromDB = async (
    filters: ICommentFilterRequest,
    options: IPaginationOptions
): Promise<IGenericResponse<comment[]>> => {
    const { limit, page, skip } = paginationHelpers.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            OR: commentSearchableFields.map((field) => ({
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

    const whereConditions: Prisma.commentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.comment.findMany({
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
            post: {
                select: {
                    id: true,
                    title: true
                }
            },
            parentComment: true,
            replies: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });

    const total = await prisma.comment.count({
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

const getByIdFromDB = async (id: string): Promise<comment | null> => {
    const result = await prisma.comment.findUnique({
        where: {
            id
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            },
            parentComment: true,
            replies: {
                orderBy: {
                    createdAt: 'asc'
                },
                include: {
                    replies: true
                }
            }
        }
    });

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Comment not found");
    }

    return result;
};

const getCommentsByPostId = async (
    postId: string,
    options: IPaginationOptions
): Promise<IGenericResponse<comment[]>> => {
    const { limit, page, skip } = paginationHelpers.calculatePagination(options);

    // Get only top-level comments (no parent)
    const result = await prisma.comment.findMany({
        where: {
            postId,
            parentCommentId: null
        },
        skip,
        take: limit,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            replies: {
                orderBy: {
                    createdAt: 'asc'
                },
                include: {
                    replies: true
                }
            }
        }
    });

    const total = await prisma.comment.count({
        where: {
            postId,
            parentCommentId: null
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

const updateOneInDB = async (
    id: string,
    payload: ICommentUpdateData
): Promise<comment | null> => {
    const comment = await prisma.comment.findUnique({
        where: { id }
    });

    if (!comment) {
        throw new ApiError(httpStatus.NOT_FOUND, "Comment not found");
    }

    const result = await prisma.comment.update({
        where: { id },
        data: payload,
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            },
            parentComment: true,
            replies: true
        }
    });

    return result;
};

const deleteByIdFromDB = async (id: string): Promise<comment> => {
    const comment = await prisma.comment.findUnique({
        where: { id },
        include: {
            replies: true
        }
    });

    if (!comment) {
        throw new ApiError(httpStatus.NOT_FOUND, "Comment not found");
    }

    // Delete all nested replies first
    if (comment.replies && comment.replies.length > 0) {
        await prisma.comment.deleteMany({
            where: {
                parentCommentId: id
            }
        });
    }

    const result = await prisma.comment.delete({
        where: { id }
    });

    return result;
};

export const CommentService = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    getCommentsByPostId,
    updateOneInDB,
    deleteByIdFromDB
};
