import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Config } from '../config/s3Config.js';

const s3 = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey
  }
});

export async function uploadVoucherToS3(filename, buffer) {
  const bucketName = s3Config.bucket;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: `vouchers/${filename}`,
    Body: buffer,
    ContentType: 'application/pdf'
  });

  await s3.send(command);

  return `https://${bucketName}.s3.${s3Config.region}.amazonaws.com/vouchers/${filename}`;
}
