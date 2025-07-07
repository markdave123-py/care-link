import OpenAI from 'openai';
import { QueryTypes, Op } from 'sequelize';
import { HealthPractitioner, sequelize } from '../../core';


export interface HPTypeMatch {
    id: string;
    distance: number;          // cosine distance (smaller = closer)
}

export default class Rag {

  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(
    apiKey = process.env.OPENAI_APIKEY!,  
    model = process.env.OPENAI_MODEL!,              
  ) {
    if (!apiKey) throw new Error('OPENAI_API_KEY is missing');
    this.openai = new OpenAI({ apiKey });
    this.model = model;
  }

  /**
   * Get a 768-dimensional embedding for the given text.
   * @param text Free-form input to embed.
   */
  async getEmbedding(text: string): Promise<number[]> {
    const { data } = await this.openai.embeddings.create({
      model: this.model,
      input: text.trim(),
    });
    return data[0].embedding;
  }

  private async getSymptomMatch(symptom: string): Promise<HPTypeMatch[]>{

    const embedding = await this.getEmbedding(symptom)

    const matches = await sequelize.query<HPTypeMatch>(
        `SELECT id, embedding <-> :emb AS distance
            FROM "HPTypes" 
            ORDER BY distance  
            LIMIT 2`,
            {
                replacements: {emb: embedding},
                type: QueryTypes.SELECT
            }
    );

    return matches
  }

  async getHPsbySymptom(symptom: string): Promise<HealthPractitioner[]>{

    const hpMatches: HPTypeMatch[] = await this.getSymptomMatch(symptom)
    if (hpMatches.length === 0){
        return []
    }
    const typeIds = hpMatches.map(m => m.id);

    const practitioner = await HealthPractitioner.findAll({
      where: {hp_type_id: {[Op.in]: typeIds, },
      is_verified: true,
      email_verified: true,
    },
      attributes:[
        'id',
        'email',
        'firstname',
        'company_name',
        'profile_picture',
      ],
      raw: true
    });

    // if (practitioner.length === 0){ // get general 

    // }

    return practitioner
  }
}

