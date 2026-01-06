import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.post(
    '/login',
    validateRequest(AuthValidation.login),
    AuthController.login
);

router.post(
    '/refresh-token',
    // validateRequest(AuthValidation.refreshToken),
    AuthController.refreshToken
);

router.post(
    '/logout',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    AuthController.logout
);

export const AuthRoutes = router;
