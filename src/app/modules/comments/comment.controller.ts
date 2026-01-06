import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { commentFilterableFields } from "./comment.constants";
import { CommentService } from "./comment.service";

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
    const result = await CommentService.insertIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Comment created successfully",
        data: result
    });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, commentFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await CommentService.getAllFromDB(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Comments fetched successfully',
        meta: result.meta,
        data: result.data
    });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CommentService.getByIdFromDB(id as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Comment fetched successfully',
        data: result
    });
});

const getCommentsByPostId = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await CommentService.getCommentsByPostId(postId as string, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post comments fetched successfully',
        meta: result.meta,
        data: result.data
    });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CommentService.updateOneInDB(id as string, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Comment updated successfully',
        data: result
    });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CommentService.deleteByIdFromDB(id as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Comment deleted successfully',
        data: result
    });
});

export const CommentController = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    getCommentsByPostId,
    updateOneInDB,
    deleteByIdFromDB
};
