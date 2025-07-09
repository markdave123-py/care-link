import OpenAI from 'openai';
import { QueryTypes, Op } from 'sequelize';
import { HealthPractitioner, sequelize, LocalEmbeddings } from 'src/core';

const localEmb = new LocalEmbeddings();

export interface HPTypeMatch {
    id: string;
    name: string;
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
    return localEmb.embed(text.trim())
  }

  private async getSymptomMatch(symptom: string): Promise<HPTypeMatch[]>{

    const embedding = await this.getEmbedding(symptom)
    const embLiteral = `[${embedding.join(',')}]`;          

    const matches = await sequelize.query<HPTypeMatch>(
        `SELECT id, name, embedding <-> :emb::vector AS distance
            FROM "HPTypes" 
            ORDER BY distance  
            LIMIT 1`,
            {
                replacements: {emb: embLiteral},
                type: QueryTypes.SELECT
            }
    );
    console.log(matches)
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
      // is_verified: true,
      // email_verified: true,
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

