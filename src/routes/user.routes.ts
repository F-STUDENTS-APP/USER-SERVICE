import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', authenticate, userController.createUserProfile);
router.put('/:id', authenticate, userController.updateUserProfile);
router.delete('/:id', authenticate, userController.deleteUserProfile);

export default router;
