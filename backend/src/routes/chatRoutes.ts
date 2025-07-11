import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createChat, getChatById, getuserChats, InviteToChat, startDirectChart } from "../controller/chatController";

const router = Router();

router.route('/').post(authMiddleware,createChat)
router.route('/').get(authMiddleware,getuserChats)
router.route('/:chatId/invite').post(authMiddleware,InviteToChat)
router.route('/direct').post(authMiddleware,startDirectChart)
router.route('/:chatId').get(authMiddleware,getChatById)

export default router