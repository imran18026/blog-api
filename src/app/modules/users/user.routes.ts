import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validations';

const router = express.Router();

router.get('/', UserController.getAllFromDB);
router.get('/:id', UserController.getByIdFromDB);

router.post(
    '/',
    validateRequest(UserValidation.create),
    UserController.insertIntoDB
);

router.patch(
    '/:id',
    validateRequest(UserValidation.update),
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    UserController.updateOneInDB
);

router.delete(
    '/:id',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    UserController.deleteByIdFromDB
);

export const userRoutes = router;
