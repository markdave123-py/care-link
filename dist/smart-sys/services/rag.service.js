"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const sequelize_1 = require("sequelize");
const core_1 = require("../../core");
class Rag {
    constructor(apiKey = process.env.OPENAI_APIKEY, model = process.env.OPENAI_MODEL) {
        if (!apiKey)
            throw new Error('OPENAI_API_KEY is missing');
        this.openai = new openai_1.default({ apiKey });
        this.model = model;
    }
    async getEmbedding(text) {
        const { data } = await this.openai.embeddings.create({
            model: this.model,
            input: text.trim(),
        });
        return data[0].embedding;
    }
    async getSymptomMatch(symptom) {
        const embedding = await this.getEmbedding(symptom);
        const matches = await core_1.sequelize.query(`SELECT id, embedding <-> :emb AS distance
            FROM "HPTypes" 
            ORDER BY distance  
            LIMIT 2`, {
            replacements: { emb: embedding },
            type: sequelize_1.QueryTypes.SELECT
        });
        return matches;
    }
    async getHPsbySymptom(symptom) {
        const hpMatches = await this.getSymptomMatch(symptom);
        if (hpMatches.length === 0) {
            return [];
        }
        const typeIds = hpMatches.map(m => m.id);
        const practitioner = await core_1.HealthPractitioner.findAll({
            where: { hp_type_id: { [sequelize_1.Op.in]: typeIds, },
                is_verified: true,
                email_verified: true,
            },
            attributes: [
                'id',
                'email',
                'firstname',
                'company_name',
                'profile_picture',
            ],
            raw: true
        });
        return practitioner;
    }
}
exports.default = Rag;
//# sourceMappingURL=rag.service.js.map