import { registerMerchant, registerBranch } from '../services/auth0UserManager.js';

async function authMerchantRoutes(fastify, opts) {
  // ─────────────────────────────────────────────────────────────
  // POST /auth/merchant/register → Registrar un nuevo merchant
  // ─────────────────────────────────────────────────────────────
  fastify.post('/merchant/register', {
    schema: {
      summary: 'Registrar nuevo merchant (negocio)',
      tags: ['Auth'],
      body: {
        type: 'object',
        properties: {
          auth0UserId: { type: 'string' }, // ← Recibimos el user_id generado en el frontend
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          phone: { type: 'string' }
        },
        required: ['auth0UserId', 'email', 'name', 'phone']
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' }, merchantCode: { type: 'string' } } },
        400: { $ref: 'ErrorResponse#' },
        409: { $ref: 'ErrorResponse#' }
      }
    }
  }, async (request, reply) => {
    try {
      const { auth0UserId, email, name, phone } = request.body;
      const merchant = await registerMerchant({ auth0UserId, email, name, phone });
      return reply.send({ message: 'Merchant registrado exitosamente', merchantCode: merchant.code });
    } catch (err) {
      if (err.message.includes('ya está registrado')) {
        return reply.status(409).send({ error: err.message });
      }
      request.log.error(err);
      return reply.status(400).send({ error: 'Error al registrar merchant' });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // POST /auth/branch/register → Registrar un nuevo branch (sucursal)
  // ─────────────────────────────────────────────────────────────
  fastify.post('/branch/register', {
    schema: {
      summary: 'Registrar nuevo branch (sucursal)',
      tags: ['Auth'],
      body: {
        type: 'object',
        properties: {
          auth0UserId: { type: 'string' }, // ← Recibimos el user_id generado en el frontend
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          phone: { type: 'string' },
          merchantId: { type: 'string' }
        },
        required: ['auth0UserId', 'email', 'name', 'phone', 'merchantId']
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' }, branchCode: { type: 'string' } } },
        400: { $ref: 'ErrorResponse#' },
        409: { $ref: 'ErrorResponse#' }
      }
    }
  }, async (request, reply) => {
    try {
      const { auth0UserId, email, name, phone, merchantId } = request.body;
      const branch = await registerBranch({ auth0UserId, email, name, phone, merchantId });
      return reply.send({ message: 'Branch registrado exitosamente', branchCode: branch.code });
    } catch (err) {
      if (err.message.includes('ya está registrado')) {
        return reply.status(409).send({ error: err.message });
      }
      request.log.error(err);
      return reply.status(400).send({ error: 'Error al registrar branch' });
    }
  });
}

export default authMerchantRoutes;
