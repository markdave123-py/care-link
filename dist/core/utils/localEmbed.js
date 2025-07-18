"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalEmbeddings = void 0;
const transformers_1 = require("@xenova/transformers");
transformers_1.env.cacheDir = './models';
class LocalEmbeddings {
    constructor() {
        this.extractorPromise = (0, transformers_1.pipeline)('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });
    }
    async embed(text) {
        const extractor = await this.extractorPromise;
        const output = await extractor(text, {
            pooling: 'mean',
            normalize: true,
        });
        return Array.from(output.data);
    }
}
exports.LocalEmbeddings = LocalEmbeddings;
//# sourceMappingURL=localEmbed.js.map