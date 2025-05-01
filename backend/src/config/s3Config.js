// src/config/s3Config.js

export const s3Config = {
    region: process.env.S3_REGION,
    bucket: process.env.AWS_S3_BUCKET,  // Este sigue igual si tu bucket es el mismo (ajustalo si es diferente)
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  };
  