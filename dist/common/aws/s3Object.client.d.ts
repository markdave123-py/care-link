import type { Readable } from 'node:stream';
export interface UploadResult {
    key: string;
    url: string;
    size: number;
    mime: string;
}
export declare class S3ObjectClient {
    private static readonly REGION;
    private static readonly BUCKET;
    private static readonly KEY_ID;
    private static readonly SECRET;
    private static readonly PUBLIC_DOMAIN;
    private static readonly baseClient;
    private static urlFor;
    upload(key: string, body: Buffer | Uint8Array | Readable, mime: string): Promise<UploadResult>;
    delete(key: string): Promise<void>;
}
