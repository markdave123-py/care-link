import { buildObjectKey } from './key.helper';
import { S3ObjectClient } from '../aws/s3Object.client';

const s3 = new S3ObjectClient()

export async function processFiles(
    rawFiles: Record<string, Express.Multer.File[]> | Express.Multer.File[] | undefined,
    map:      Record<string, string>,
  ) {
    const files: Record<string, Express.Multer.File[]> =
      Array.isArray(rawFiles)
        ? rawFiles.reduce<Record<string, Express.Multer.File[]>>((acc, f) => {
            (acc[f.fieldname] ??= []).push(f);
            return acc;
          }, {})
        : rawFiles ?? {};
  
    const out: Record<string, string> = {};
    const ALLOWED = ['image/', 'application/pdf'];
  
    for (const [field, prefix] of Object.entries(map)) {
      const file = files[field]?.[0];
      if (!file) continue;
  
      if (!ALLOWED.some(t => file.mimetype.startsWith(t))) {
        throw new Error(`${field} must be an image or PDF`);
      }
  
      const key     = buildObjectKey(prefix, file.originalname);
      const { url } = await s3.upload(key, file.buffer, file.mimetype);
      out[field]    = url;
    }
    return out;
}
  