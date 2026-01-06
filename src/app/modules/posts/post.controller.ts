import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { postFilterableFields } from "./post.constants";
import { PostService } from "./post.service";

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user || !user.userId) {
        throw new Error("User not authenticated");
    }

    const result = await PostService.insertIntoDB(user.userId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Post created successfully",
        data: result
    });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, postFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await PostService.getAllFromDB(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Posts fetched successfully',
        meta: result.meta,
        data: result.data
    });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PostService.getByIdFromDB(id as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post fetched successfully',
        data: result
    });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    if (!user || !user.userId) {
        throw new Error("User not authenticated");
    }

    const result = await PostService.updateOneInDB(
        id as string,
        user.userId,
        user.role,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post updated successfully',
        data: result
    });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    if (!user || !user.userId) {
        throw new Error("User not authenticated");
    }

    const result = await PostService.deleteByIdFromDB(
        id as string,
        user.userId,
        user.role
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post deleted successfully',
        data: result
    });
});

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user || !user.userId) {
        throw new Error("User not authenticated");
    }

    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await PostService.getMyPosts(user.userId, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'My posts fetched successfully',
        meta: result.meta,
        data: result.data
    });
});

export const PostController = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
    getMyPosts
};
