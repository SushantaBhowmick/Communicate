import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { findUserByEmail, searchUsers, updateProfile } from "../controller/userController";

const router = Router();

router.get("/search", authMiddleware, findUserByEmail);
router.get("/search-users", authMiddleware, searchUsers);
router.put("/profile", authMiddleware, updateProfile);

export default router;
