"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const AdminRouter = (0, express_1.Router)();
AdminRouter.post('/register', controllers_1.AdminController.register);
AdminRouter.post('/login', controllers_1.AdminController.login);
AdminRouter.post('/refresh-access-token', auth_middleware_1.default.authenticateUser, controllers_1.AdminController.refreshAccessToken);
AdminRouter.post('/request-admin', auth_middleware_1.default.authenticateAdmin, controllers_1.AdminController.requestAdmin);
AdminRouter.post('/invite-admin', controllers_1.AdminController.inviteAdmin);
AdminRouter.post('/logout', controllers_1.AdminController.logout);
exports.default = AdminRouter;
//# sourceMappingURL=admin.routes.js.map