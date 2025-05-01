// src/services/authMiddleware.js

import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export default async function verifyToken(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];

  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: process.env.AUTH0_AUDIENCE, // Ej: https://auth.gosenku.com/api/v2/
        issuer: `https://${process.env.AUTH0_DOMAIN}/`, // Ej: https://auth.gosenku.com/
        algorithms: ['RS256']
      },
      (err, decoded) => {
        if (err) {
          return reply.status(401).send({ error: 'Token inválido' });
        }

        // Namespace actualizado
        const ns = 'https://auth.gosenku.com/';

        request.user = {
          id: decoded.sub,
          role: decoded[`${ns}role`],
          merchantId: decoded[`${ns}merchantId`] || null,
          branchId: decoded[`${ns}branchId`] || null
        };

        resolve();
      }
    );
  });
}
