import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { findUserByEmail } from "../controller/userController";

const router = Router();

router.get("/search", authMiddleware, findUserByEmail);

export default router;
