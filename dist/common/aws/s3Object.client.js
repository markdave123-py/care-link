"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3ObjectClient = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const auth_1 = require("../../auth");
class S3ObjectClient {
    static urlFor(key) {
        return `https://${S3ObjectClient.PUBLIC_DOMAIN}/${key}`;
    }
    async upload(key, body, mime) {
        await new lib_storage_1.Upload({
            client: S3ObjectClient.baseClient,
            params: {
                Bucket: S3ObjectClient.BUCKET,
                Key: key,
                Body: body,
                ContentType: mime,
            },
        }).done();
        return {
            key,
            url: S3ObjectClient.urlFor(key),
            size: body instanceof Buffer ? body.length : 0,
            mime,
        };
    }
    async delete(key) {
        await S3ObjectClient.baseClient.send(new client_s3_1.DeleteObjectCommand({ Bucket: S3ObjectClient.BUCKET, Key: key }));
    }
}
exports.S3ObjectClient = S3ObjectClient;
S3ObjectClient.REGION = auth_1.env.AWS_REGION;
S3ObjectClient.BUCKET = auth_1.env.AWS_S3_BUCKET;
S3ObjectClient.KEY_ID = auth_1.env.AWS_ACCESS_KEY_ID;
S3ObjectClient.SECRET = auth_1.env.AWS_SECRET_ACCESS_KEY;
S3ObjectClient.PUBLIC_DOMAIN = `${S3ObjectClient.BUCKET}.s3.${S3ObjectClient.REGION}.amazonaws.com`;
S3ObjectClient.baseClient = new client_s3_1.S3Client({
    region: S3ObjectClient.REGION,
    credentials: {
        accessKeyId: S3ObjectClient.KEY_ID,
        secretAccessKey: S3ObjectClient.SECRET,
    },
});
//# sourceMappingURL=s3Object.client.js.map