import { createServer } from "http";

import { app } from "./app.service";
import sequelize from "../core/config/db";
import { associateModels } from "../core/models/associationModels";
import "../core/models/admin.model";
import { Rabbitmq } from "../common/rabbitmq";
// import { EmailVerification } from "../common/rabbitmq/consumers/emailverification.consumer";
// import { ForgotPasswordConsumer } from "../common/rabbitmq/consumers/forgotpassword.consumer";
// import { InviteAdminConsumer } from "../common/rabbitmq/consumers/inviteAdmin.consumer";
import { ensureConstraints } from "src/core/config/db.ensureconstraints";

export const startApp = async () => {
  try {
    console.log("Starting Healthcare Scheduler Backend...");
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    // Debug: Log the database URL (without sensitive parts)
    const dbUrl = process.env.POSTGRES_URI || 'NOT SET';
    const maskedUrl = dbUrl.replace(/:[^:]+@/, ':****@');
    console.log(`Database URL: ${maskedUrl}`);

    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL database successfully");

    await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector');
    console.log("Vector extension ready");

    associateModels();
    await sequelize.sync({ alter: true });
    console.log("Database models synchronized");

    await ensureConstraints();
    console.log("Database constraints ensured");

    // Initialize RabbitMQ (with proper error handling)
    try {
      console.log("Initializing RabbitMQ...");
      await Rabbitmq.connect();
      await Rabbitmq.safeStartConsumers(); // This handles all consumers internally
      console.log("RabbitMQ initialized successfully");
    } catch (err) {
      console.error("RabbitMQ initialization failed:", err.message);
      console.log("Continuing without RabbitMQ. Email features will not work.");
      console.log("To fix: Check your RABBITMQ_URL and ensure RabbitMQ server is running");
    }

    // Start HTTP server
    const server = createServer(app);
    const port = parseInt(process.env.PORT!) || 3000;
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

    server.listen(port, host, () => {
      console.log(`Server running on http://${host}:${port}`);
      console.log(`Started at: ${new Date().toISOString()}`);
    });

  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
};