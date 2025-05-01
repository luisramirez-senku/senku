import { PrismaClient } from '@prisma/client';
import verifyToken from '../services/authMiddleware.js';

const prisma = new PrismaClient();

async function authRoutes(fastify, opts) {
  // ─────────────────────────────────────────────────────────────
  // GET /auth/me → Obtener datos del usuario autenticado (cliente final)
  // ─────────────────────────────────────────────────────────────
  fastify.get('/me', {
    preHandler: verifyToken,
    schema: {
      summary: 'Obtener datos del cliente autenticado',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            phone: { type: 'string' },
            idNumber: { type: 'string' },
            name: { type: 'string' },
            verified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        404: { $ref: 'ErrorResponse#' }
      }
    }
  }, async (request, reply) => {
    const { id } = request.user;
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: { id: true, phone: true, idNumber: true, name: true, verified: true, createdAt: true }
    });
    if (!customer) return reply.status(404).send({ error: 'Cliente no encontrado' });
    return reply.send(customer);
  });

  // ─────────────────────────────────────────────────────────────
  // GET /auth/me/programs → Listar programas del cliente autenticado
  // ─────────────────────────────────────────────────────────────
  fastify.get('/me/programs', {
    preHandler: verifyToken,
    schema: {
      summary: 'Listar programas en los que está inscrito el cliente',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            programs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  programCode: { type: 'string' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  pointsBalance: { type: 'integer' },
                  cashbackBalance: { type: 'number' },
                  stampsBalance: { type: 'integer' },
                  walletPassId: { type: ['string', 'null'] },
                  walletPlatform: { type: ['string', 'null'] },
                  branchName: { type: ['string', 'null'] }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id: customerId } = request.user;
    const programs = await prisma.customerProgram.findMany({
      where: { customerId },
      include: {
        program: { select: { code: true, name: true, type: true } },
        branch: { select: { name: true } }
      }
    });
    const formatted = programs.map((entry) => ({
      programCode: entry.program.code,
      name: entry.program.name,
      type: entry.program.type,
      pointsBalance: entry.pointsBalance,
      cashbackBalance: entry.cashbackBalance,
      stampsBalance: entry.stampsBalance,
      walletPassId: entry.walletPassId,
      walletPlatform: entry.walletPlatform,
      branchName: entry.branch?.name || null
    }));
    return reply.send({ programs: formatted });
  });
}

export default authRoutes;
