import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CommentController } from './comment.controller';
import { CommentValidation } from './comment.validation';

const router = express.Router();

// Get comments by post ID (must come before /:id route)
router.get('/post/:postId', CommentController.getCommentsByPostId);

// General comment routes
router.get('/', CommentController.getAllFromDB);
router.get('/:id', CommentController.getByIdFromDB);

router.post(
    '/',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    validateRequest(CommentValidation.create),
    CommentController.insertIntoDB
);

router.patch(
    '/:id',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    validateRequest(CommentValidation.update),
    CommentController.updateOneInDB
);

router.delete(
    '/:id',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    CommentController.deleteByIdFromDB
);

export const commentRoutes = router;
