"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const express_1 = require("express");
const core_1 = require("../core");
const core_2 = require("../core");
exports.appRouter = (0, express_1.Router)();
exports.appRouter.get("/health", (_, res) => {
    return core_2.responseHandler.success(res, core_1.HttpStatus.OK, "Server is running");
});
//# sourceMappingURL=app.router.js.map