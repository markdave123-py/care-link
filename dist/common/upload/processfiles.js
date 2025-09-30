"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFiles = processFiles;
const key_helper_1 = require("./key.helper");
const s3Object_client_1 = require("../aws/s3Object.client");
const s3 = new s3Object_client_1.S3ObjectClient();
async function processFiles(rawFiles, map) {
    var _a;
    const files = Array.isArray(rawFiles)
        ? rawFiles.reduce((acc, f) => {
            var _a;
            var _b;
            ((_a = acc[_b = f.fieldname]) !== null && _a !== void 0 ? _a : (acc[_b] = [])).push(f);
            return acc;
        }, {})
        : rawFiles !== null && rawFiles !== void 0 ? rawFiles : {};
    const out = {};
    const ALLOWED = ['image/', 'application/pdf'];
    for (const [field, prefix] of Object.entries(map)) {
        const file = (_a = files[field]) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            continue;
        if (!ALLOWED.some(t => file.mimetype.startsWith(t))) {
            throw new Error(`${field} must be an image or PDF`);
        }
        const key = (0, key_helper_1.buildObjectKey)(prefix, file.originalname);
        const { url } = await s3.upload(key, file.buffer, file.mimetype);
        out[field] = url;
    }
    return out;
}
//# sourceMappingURL=processfiles.js.map