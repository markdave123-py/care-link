"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildObjectKey = buildObjectKey;
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
function buildObjectKey(prefix, originalName) {
    const datePath = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
    const ext = (0, node_path_1.extname)(originalName).toLowerCase() || '.bin';
    return `${prefix}/${datePath}/${(0, node_crypto_1.randomUUID)()}${ext}`;
}
//# sourceMappingURL=key.helper.js.map