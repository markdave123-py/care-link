import { randomUUID } from 'node:crypto';
import { extname }    from 'node:path';

/**
 * Creates a key like:
 *   <prefix>/2025/07/09/<uuid><ext>
 *
 * Works for images (.jpg, .png) or PDFs (.pdf).
 */
export function buildObjectKey(prefix: string, originalName: string): string {
  const datePath = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
  const ext = extname(originalName).toLowerCase() || '.bin';
  return `${prefix}/${datePath}/${randomUUID()}${ext}`;
}
