// src/routes/earn.js

import { PrismaClient } from '@prisma/client';
import { generateCode } from '../services/codeGenerator.js';
import verifyToken from '../services/authMiddleware.js';
import { getUserRole } from '../utils/userRoleHelper.js';

const prisma = new PrismaClient();

async function earnRoutes(fastify, opts) {
  fastify.post(
    '/:programCode/earn',
    {
      schema: {
        summary: 'Acumula puntos, cashback o sellos para un cliente en un programa',
        tags: ['Programs'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { programCode: { type: 'string', description: 'Código del programa' } },
          required: ['programCode']
        },
        body: {
          type: 'object',
          properties: {
            customerCode: { type: 'string', description: 'Código del cliente' },
            amount: { type: 'number', description: 'Monto de la transacción para cálculo' }
          },
          required: ['customerCode', 'amount']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              saldoActual: { type: 'object' },
              transaccion: { type: 'object' }
            }
          },
          400: { $ref: 'ErrorResponse#' },
          403: { $ref: 'ErrorResponse#' },
          404: { $ref: 'ErrorResponse#' }
        }
      },
      preHandler: verifyToken
    },
    async (request, reply) => {
      const role = getUserRole(request.user);
      if (role !== 'merchant' && role !== 'branch') {
        return reply.status(403).send({ error: 'No autorizado para acreditar recompensas' });
      }

      const { programCode } = request.params;
      const { customerCode, amount } = request.body;

      if (!customerCode || amount == null) {
        return reply.status(400).send({ error: 'customerCode y amount son requeridos' });
      }

      const program = await prisma.loyaltyProgram.findUnique({ where: { code: programCode } });
      if (!program) {
        return reply.status(404).send({ error: 'Programa no encontrado' });
      }

      const customer = await prisma.customer.findUnique({ where: { code: customerCode } })
        || await prisma.customer.findUnique({ where: { phone: customerCode } });
      if (!customer) {
        return reply.status(404).send({ error: 'Cliente no encontrado' });
      }

      const customerProgram = await prisma.customerProgram.findFirst({
        where: { customerId: customer.id, programId: program.id }
      });
      if (!customerProgram) {
        return reply.status(404).send({ error: 'Cliente no inscrito en este programa' });
      }

      let updateData = {};
      let transactionAmount = 0;
      switch (program.type) {
        case 'POINTS': {
          const rate = program.config?.pointsPerColones ?? 1000;
          const points = Math.floor(amount / rate);
          updateData.pointsBalance = customerProgram.pointsBalance + points;
          transactionAmount = points;
          break;
        }
        case 'CASHBACK': {
          const pct = program.config?.cashbackPercentage ?? 5;
          const cashback = (amount * pct) / 100;
          updateData.cashbackBalance = customerProgram.cashbackBalance + cashback;
          transactionAmount = cashback;
          break;
        }
        case 'STAMPS': {
          updateData.stampsBalance = customerProgram.stampsBalance + 1;
          transactionAmount = 1;
          break;
        }
        default:
          return reply.status(400).send({ error: 'Tipo de programa no soportado' });
      }

      await prisma.customerProgram.update({ where: { id: customerProgram.id }, data: updateData });

      const transaction = await prisma.transaction.create({
        data: {
          code: generateCode('TRX'),
          customerProgramId: customerProgram.id,
          type: 'EARN',
          amount: transactionAmount
        }
      });

      return reply.send({ message: 'Recompensa aplicada', saldoActual: updateData, transaccion: transaction });
    }
  );
}

export default earnRoutes;
