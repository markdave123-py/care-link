import { startApp } from "./app";

startApp().catch((err) => {
    console.error("Failed to start app:", err);
    process.exit(1);
  });