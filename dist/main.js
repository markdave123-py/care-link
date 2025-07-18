"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
(0, app_1.startApp)().catch((err) => {
    console.error("Failed to start app:", err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map