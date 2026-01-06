import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validations';

const router = express.Router();

// Profile routes (must come before /:id routes)
router.get(
    '/me',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    UserController.getMyProfile
);

router.patch(
    '/me',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    validateRequest(UserValidation.updateProfile),
    UserController.updateMyProfile
);

// General user routes
router.get('/', UserController.getAllFromDB);
router.get('/:id', UserController.getByIdFromDB);

router.post(
    '/',
    validateRequest(UserValidation.create),
    UserController.insertIntoDB
);

router.patch(
    '/:id',
    auth(ENUM_USER_ROLE.ADMIN),
    validateRequest(UserValidation.adminUpdate),
    UserController.updateOneInDB
);

router.delete(
    '/:id',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    UserController.deleteByIdFromDB
);

export const userRoutes = router;
