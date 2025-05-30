import express from 'express';
import { assignTask, changeStatus, myTasks } from '../controllers/task.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = express.Router();

router.route('/').post(assignTask);
router.route('/my-tasks').get(authMiddleware,myTasks);
router.route("/change-status/:id").patch(authMiddleware, changeStatus);

export default router;