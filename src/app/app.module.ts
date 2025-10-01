import { createServer } from "http";

import { app } from "./app.service";
import sequelize from "../core/config/db";
import { associateModels } from "../core/models/associationModels";
import "../core/models/admin.model";
import { Rabbitmq } from "../common/rabbitmq";
import { EmailVerification } from "../common/rabbitmq/consumers/emailverification.consumer";
import { ForgotPasswordConsumer } from "../common/rabbitmq/consumers/forgotpassword.consumer";
import { InviteAdminConsumer } from "../common/rabbitmq/consumers/inviteAdmin.consumer";
import { ensureConstraints } from "src/core/config/db.ensureconstraints";
import { env } from "src/auth";
import { Mailer } from "src/core";

export const startApp = async () => {
  console.log("i am here")
  await sequelize.authenticate();
  console.log("Connected to DB");

  await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector');
  
  associateModels();

  await sequelize.sync({ alter: true });
  console.log("Models synced");

  await ensureConstraints();

  // Initialize Rabbitmq
  try {
    // await Rabbitmq.connect();
  
    // await EmailVerification.consume();
    // await ForgotPasswordConsumer.consume();
    // await InviteAdminConsumer.consume();
    await new Mailer().verify()
    await Rabbitmq.safeStartConsumers();
  } catch (err) {
    console.error("RabbitMQ is not available, continuing without it. Will retry...", err);
    // Rabbitmq.();
  }

  const server = createServer(app);
  const port = parseInt(env.PORT!) || 3000;
  server.listen(port, () => console.log("Server is running on port 3000"));
};