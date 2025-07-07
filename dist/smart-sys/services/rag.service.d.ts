import { HealthPractitioner } from '../../core';
export interface HPTypeMatch {
    id: string;
    distance: number;
}
export default class Rag {
    private readonly openai;
    private readonly model;
    constructor(apiKey?: string, model?: string);
    getEmbedding(text: string): Promise<number[]>;
    private getSymptomMatch;
    getHPsbySymptom(symptom: string): Promise<HealthPractitioner[]>;
}
