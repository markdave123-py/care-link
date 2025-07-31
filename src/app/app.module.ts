import { createServer } from "http";

import { app } from "./app.service";
import sequelize from "../core/config/db";
import { associateModels } from "../core/models/associationModels";
import "../core/models/admin.model";
import { Rabbitmq } from "../common/rabbitmq";
import { EmailVerification } from "../common/rabbitmq/consumers/emailverification.consumer";
import { ForgotPasswordConsumer } from "../common/rabbitmq/consumers/forgotpassword.consumer";
import { InviteAdminConsumer } from "../common/rabbitmq/consumers/inviteAdmin.consumer";

export const startApp = async () => {
  // await sequelize.authenticate();
  console.log("Connected to DB");

  associateModels();

  await sequelize.sync({ alter: true });
  console.log("Models synced");

  // Initialize Rabbitmq
  try {
    await Rabbitmq.connect();
  
    await EmailVerification.consume();
    await ForgotPasswordConsumer.consume();
    await InviteAdminConsumer.consume();
  } catch (err) {
    console.error("RabbitMQ is not available, continuing without it. Will retry...", err);
    Rabbitmq.retryRabbitMQ();
  }

  const server = createServer(app);
  server.listen(3000, () => console.log("Server is running on port 3000"));
};