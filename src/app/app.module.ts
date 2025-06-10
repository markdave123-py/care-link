import { createServer } from "http";

import { app } from "./app.service";
import sequelize from "src/auth/utils/db";
import { associateModels } from "src/core/models/associationModels";

export const startApp = async () => {
  await sequelize.authenticate();
  console.log("Connected to DB");

  associateModels();

  await sequelize.sync({ alter: true });
  console.log("Models synced");

  const server = createServer(app);
  server.listen(3000, () => console.log("Server is running on port 3000"));
};