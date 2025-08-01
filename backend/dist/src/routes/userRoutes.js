"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const userController_1 = require("../controller/userController");
const router = (0, express_1.Router)();
router.get("/search", authMiddleware_1.authMiddleware, userController_1.findUserByEmail);
router.get("/search-users", authMiddleware_1.authMiddleware, userController_1.searchUsers);
router.put("/profile", authMiddleware_1.authMiddleware, userController_1.updateProfile);
router.put("/push-token", authMiddleware_1.authMiddleware, userController_1.updateFCMToken);
exports.default = router;
