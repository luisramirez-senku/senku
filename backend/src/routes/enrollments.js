// src/routes/enrollments.js

import { PrismaClient } from '@prisma/client';
import verifyToken from '../services/authMiddleware.js';
import { getUserRole } from '../utils/userRoleHelper.js';

const prisma = new PrismaClient();

async function enrollmentRoutes(fastify, opts) {
  fastify.post(
    '/',
    {
      schema: {
        summary: 'Inscribir un cliente en un programa de lealtad',
        tags: ['Enrollments'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            phone: { type: 'string', description: 'Número de teléfono E.164 del cliente' },
            programCode: { type: 'string', description: 'Código del programa de lealtad' },
            branchCode: { type: 'string', description: 'Código de la sucursal donde se inscribe' }
          },
          required: ['phone', 'programCode', 'branchCode']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              enrollment: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  customerId: { type: 'string' },
                  programCode: { type: 'string' },
                  branchCode: { type: 'string' },
                  pointsBalance: { type: 'integer' },
                  cashbackBalance: { type: 'number' },
                  stampsBalance: { type: 'integer' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          },
          400: { $ref: 'ErrorResponse#' },
          403: { $ref: 'ErrorResponse#' },
          404: { $ref: 'ErrorResponse#' },
          409: { $ref: 'ErrorResponse#' }
        }
      },
      preHandler: verifyToken
    },
    async (request, reply) => {
      const role = getUserRole(request.user);
      if (role !== 'merchant' && role !== 'branch') {
        return reply.status(403).send({ error: 'No autorizado para inscribir clientes en programas' });
      }

      const { phone, programCode, branchCode } = request.body;

      const customer = await prisma.customer.findUnique({ where: { phone } });
      if (!customer) {
        return reply.status(404).send({ error: 'Cliente no encontrado' });
      }

      const program = await prisma.loyaltyProgram.findUnique({ where: { code: programCode } });
      if (!program) {
        return reply.status(404).send({ error: 'Programa no encontrado' });
      }

      const branch = await prisma.branch.findUnique({ where: { code: branchCode } });
      if (!branch || branch.merchantId !== program.merchantId) {
        return reply.status(400).send({ error: 'Sucursal inválida para este programa' });
      }

      const existing = await prisma.customerProgram.findFirst({
        where: {
          customerId: customer.id,
          programId: program.id
        }
      });
      if (existing) {
        return reply.status(409).send({ error: 'El cliente ya está inscrito en este programa' });
      }

      const enrollment = await prisma.customerProgram.create({
        data: {
          customerId: customer.id,
          programId: program.id,
          branchId: branch.id
        }
      });

      return reply.send({
        message: 'Inscripción completada',
        enrollment: {
          id: enrollment.id,
          customerId: customer.id,
          programCode: program.code,
          branchCode: branch.code,
          pointsBalance: enrollment.pointsBalance,
          cashbackBalance: enrollment.cashbackBalance,
          stampsBalance: enrollment.stampsBalance,
          createdAt: enrollment.createdAt
        }
      });
    }
  );
}

export default enrollmentRoutes;
