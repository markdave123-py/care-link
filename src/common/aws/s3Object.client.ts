import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
  } from '@aws-sdk/client-s3';
  import { Upload } from '@aws-sdk/lib-storage';
  import { Readable } from 'node:stream';
  import { env } from 'src/auth';
  
  export interface UploadResult {
    key:  string;
    url:  string; 
    size: number;
    mime: string;
  }
  
  /**
   * High-level wrapper for S3 uploads/downloads.
   * Reads ALL config from env once.
   * Exposes upload() / delete().
   * Returns a permanent, publicly readable https:// URL.
   */
  export class S3ObjectClient {
    private static readonly REGION = env.AWS_REGION!;
    private static readonly BUCKET = env.AWS_S3_BUCKET!;
    private static readonly KEY_ID = env.AWS_ACCESS_KEY_ID!;
    private static readonly SECRET = env.AWS_SECRET_ACCESS_KEY!;
  
    private static readonly PUBLIC_DOMAIN =
     `${S3ObjectClient.BUCKET}.s3.${S3ObjectClient.REGION}.amazonaws.com`;
  
    // One S3Client shared across all instances (thread-safe)
    private static readonly baseClient = new S3Client({
      region: S3ObjectClient.REGION,
      credentials: {
        accessKeyId:     S3ObjectClient.KEY_ID,
        secretAccessKey: S3ObjectClient.SECRET,
      },
    });
  
    // Permanent public URL builder
    private static urlFor(key: string) {
      return `https://${S3ObjectClient.PUBLIC_DOMAIN}/${key}`;
    }
  
    /** Uploads bytes/stream and returns key + permanent URL */
    async upload(
      key:  string,
      body: Buffer | Uint8Array | Readable,
      mime: string,
    ): Promise<UploadResult> {
      await new Upload({
        client: S3ObjectClient.baseClient,
        params: {
          Bucket: S3ObjectClient.BUCKET,
          Key:    key,
          Body:   body,
          ContentType: mime,
        },
      }).done();
  
      return {
        key,
        url:  S3ObjectClient.urlFor(key),
        size: body instanceof Buffer ? body.length : 0,
        mime,
      };
    }
  
    async delete(key: string): Promise<void> {
      await S3ObjectClient.baseClient.send(
        new DeleteObjectCommand({ Bucket: S3ObjectClient.BUCKET, Key: key }),
      );
    }
  }
  