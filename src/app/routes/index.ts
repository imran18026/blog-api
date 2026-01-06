import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { userRoutes } from '../modules/users/user.routes';
import { postRoutes } from '../modules/posts/post.routes';
import { commentRoutes } from '../modules/comments/comment.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes
  },
  {
    path: '/user',
    route: userRoutes
  },
  {
    path: '/posts',
    route: postRoutes
  },
  {
    path: '/comments',
    route: commentRoutes
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
