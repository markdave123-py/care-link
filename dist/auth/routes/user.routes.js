"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const userRouter = (0, express_1.Router)();
userRouter.get('/info', auth_middleware_1.default.authenticateUser, user_controller_1.default.getUser);
exports.default = userRouter;
//# sourceMappingURL=user.routes.js.map