import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PostController } from './post.controller';
import { PostValidation } from './post.validation';

const router = express.Router();

// My posts route (must come before /:id routes)
router.get(
    '/my-posts',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    PostController.getMyPosts
);

// General post routes
router.get('/', PostController.getAllFromDB);
router.get('/:id', PostController.getByIdFromDB);

router.post(
    '/',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    validateRequest(PostValidation.create),
    PostController.insertIntoDB
);

router.patch(
    '/:id',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    validateRequest(PostValidation.update),
    PostController.updateOneInDB
);

router.delete(
    '/:id',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    PostController.deleteByIdFromDB
);

export const postRoutes = router;
