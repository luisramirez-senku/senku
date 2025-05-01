// src/routes/upload.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import verifyToken from '../services/authMiddleware.js';

const s3 = new S3Client({ region: 'us-east-2' }); // Ajustá tu región

async function uploadRoutes(fastify, opts) {
  fastify.post('/upload-url', { preHandler: verifyToken }, async (request, reply) => {
    const { fileName, fileType } = request.body;

    if (!fileName || !fileType) {
      return reply.status(400).send({ error: 'Faltan parámetros fileName o fileType' });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `uploads/${Date.now()}-${fileName}`,
      ContentType: fileType,
    };

    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 minutos de expiración

    return reply.send({ uploadUrl: signedUrl, filePath: params.Key });
  });
}

export default uploadRoutes;
