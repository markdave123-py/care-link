"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApp = void 0;
const http_1 = require("http");
const app_service_1 = require("./app.service");
const db_1 = require("../core/config/db");
const associationModels_1 = require("../core/models/associationModels");
require("../core/models/admin.model");
const startApp = async () => {
    console.log("Connected to DB");
    (0, associationModels_1.associateModels)();
    await db_1.default.sync({ alter: true });
    console.log("Models synced");
    const server = (0, http_1.createServer)(app_service_1.app);
    server.listen(3000, () => console.log("Server is running on port 3000"));
};
exports.startApp = startApp;
//# sourceMappingURL=app.module.js.map