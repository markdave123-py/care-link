"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApp = void 0;
const http_1 = require("http");
const app_service_1 = require("./app.service");
const db_1 = require("../core/config/db");
const associationModels_1 = require("../core/models/associationModels");
require("../core/models/admin.model");
const rabbitmq_1 = require("../common/rabbitmq");
const emailverification_consumer_1 = require("../common/rabbitmq/consumers/emailverification.consumer");
const forgotpassword_consumer_1 = require("../common/rabbitmq/consumers/forgotpassword.consumer");
const inviteAdmin_consumer_1 = require("../common/rabbitmq/consumers/inviteAdmin.consumer");
const db_ensureconstraints_1 = require("../core/config/db.ensureconstraints");
const startApp = async () => {
    await db_1.default.authenticate();
    console.log("Connected to DB");
    (0, associationModels_1.associateModels)();
    await db_1.default.sync({ alter: true });
    console.log("Models synced");
    await (0, db_ensureconstraints_1.ensureConstraints)();
    await rabbitmq_1.Rabbitmq.connect();
    await emailverification_consumer_1.EmailVerification.consume();
    await forgotpassword_consumer_1.ForgotPasswordConsumer.consume();
    await inviteAdmin_consumer_1.InviteAdminConsumer.consume();
    const server = (0, http_1.createServer)(app_service_1.app);
    server.listen(3000, () => console.log("Server is running on port 3000"));
};
exports.startApp = startApp;
//# sourceMappingURL=app.module.js.map