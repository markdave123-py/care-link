import { pipeline, env as hfEnv } from '@xenova/transformers';

// cache model files under ./models
hfEnv.cacheDir = './models';

// Loads MiniLM once and returns 384-d embeddings (Float32Array).
export class LocalEmbeddings {
  /** Lazy-initialised extractor pipeline */
  private extractorPromise = pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    { quantized: true }   
  );

  async embed(text: string): Promise<number[]> {
    const extractor = await this.extractorPromise;    
    const output = await extractor(text, {
      pooling: 'mean',      // mean-pool the token embeddings
      normalize: true,      // return unit-length vector (good for cosine)
    });
    return Array.from(output.data);     
  }
}


// export class LocalEmbeddings {
//   async embed(text: string): Promise<number[]> {
//     console.warn('LocalEmbeddings is currently disabled.');
//     return [];
//   }
// }