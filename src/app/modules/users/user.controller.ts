import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { userFilterableFields } from "./user.constants";
import { UserService } from "./user.service";

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.insertIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User created successfully",
        data: result
    })
})

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, userFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await UserService.getAllFromDB(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Users fetched successfully',
        meta: result.meta,
        data: result.data
    });
})

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await UserService.getByIdFromDB(id as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User fetched successfully',
        data: result
    });
})

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await UserService.updateOneInDB(id as string, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User updated successfully',
        data: result
    });
})

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await UserService.deleteByIdFromDB(id as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User deleted successfully',
        data: result
    });
})

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user || !user.userId) {
        throw new Error("User not authenticated");
    }

    const result = await UserService.getMyProfile(user.userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Profile fetched successfully',
        data: result
    });
})

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user || !user.userId) {
        throw new Error("User not authenticated");
    }

    const result = await UserService.updateMyProfile(user.userId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Profile updated successfully',
        data: result
    });
})

export const UserController = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
    getMyProfile,
    updateMyProfile
}
