// src/routes/rewards.js

import { PrismaClient } from '@prisma/client';
import verifyToken from '../services/authMiddleware.js';
import { generateCode } from '../services/codeGenerator.js';
import { getUserRole } from '../utils/userRoleHelper.js';

const prisma = new PrismaClient();

async function rewardsRoutes(fastify, opts) {
  // ─────────────────────────────────────────────────────────────
  // GET /rewards/:programCode → Listar rewards de un programa de puntos
  // ─────────────────────────────────────────────────────────────
  fastify.get('/:programCode', async (request, reply) => {
    const { programCode } = request.params;
  
    try {
      const program = await prisma.loyaltyProgram.findUnique({
        where: { code: programCode },
      });
  
      if (!program || program.type !== 'POINTS') {
        return reply.status(404).send({ error: 'Programa no encontrado o no es de tipo puntos' });
      }
  
      const rewards = await prisma.reward.findMany({
        where: { programId: program.id },
        orderBy: { cost: 'asc' },
      });
  
      return reply.send(rewards);
    } catch (error) {
      console.error('Error al obtener recompensas:', error);
      return reply.status(500).send({ error: 'Error al obtener recompensas' });
    }
  });
  

  // ─────────────────────────────────────────────────────────────
  // POST /rewards/:programCode → Crear un nuevo reward (solo merchants)
  // ─────────────────────────────────────────────────────────────
  fastify.post(
    '/:programCode',
    { preHandler: verifyToken },
    async (request, reply) => {
      const role = getUserRole(request.user);
      if (role !== 'merchant') {
        return reply.status(403).send({ error: 'Solo los merchants pueden crear rewards' });
      }

      const { programCode } = request.params;
      const { name, description, imageUrl, cost } = request.body;

      if (!name || !cost) {
        return reply.status(400).send({ error: 'Nombre y costo son requeridos' });
      }

      if (typeof cost !== 'number' || cost <= 0) {
        return reply.status(400).send({ error: 'El costo debe ser un número positivo' });
      }

      if (imageUrl && typeof imageUrl !== 'string') {
        return reply.status(400).send({ error: 'URL de imagen inválida' });
      }

      const program = await prisma.loyaltyProgram.findUnique({
        where: { code: programCode },
        include: { merchant: true }
      });

      if (!program || program.type !== 'POINTS') {
        return reply.status(404).send({ error: 'Programa no encontrado o no es de tipo puntos' });
      }

      // Generar código único
      let rewardCode;
      let attempts = 0;
      do {
        rewardCode = generateCode('RWD');
        const exists = await prisma.reward.findUnique({ where: { code: rewardCode } });
        if (!exists) break;
        attempts++;
      } while (attempts < 5);

      if (attempts === 5) {
        return reply.status(500).send({ error: 'No se pudo generar un código único para el reward' });
      }

      const reward = await prisma.reward.create({
        data: {
          code: rewardCode,
          name,
          description,
          imageUrl,
          cost,
          programId: program.id,
          merchantId: program.merchantId
        }
      });

      return reply.code(201).send(reward);
    }
  );

  // ─────────────────────────────────────────────────────────────
  // PATCH /rewards/:rewardCode → Editar un reward (solo merchants)
  // ─────────────────────────────────────────────────────────────
  fastify.patch(
    '/:rewardCode',
    { preHandler: verifyToken },
    async (request, reply) => {
      const role = getUserRole(request.user);
      if (role !== 'merchant') {
        return reply.status(403).send({ error: 'Solo los merchants pueden editar rewards' });
      }

      const { rewardCode } = request.params;
      const { name, description, imageUrl, cost } = request.body;

      const reward = await prisma.reward.findUnique({
        where: { code: rewardCode },
        include: { program: true }
      });

      if (!reward) {
        return reply.status(404).send({ error: 'Reward no encontrado' });
      }

      const updatedReward = await prisma.reward.update({
        where: { code: rewardCode },
        data: { name, description, imageUrl, cost }
      });

      return reply.send(updatedReward);
    }
  );

  // ─────────────────────────────────────────────────────────────
  // DELETE /rewards/:rewardCode → Eliminar un reward (solo merchants)
  // ─────────────────────────────────────────────────────────────
  fastify.delete(
    '/:rewardCode',
    { preHandler: verifyToken },
    async (request, reply) => {
      const role = getUserRole(request.user);
      if (role !== 'merchant') {
        return reply.status(403).send({ error: 'Solo los merchants pueden eliminar rewards' });
      }

      const { rewardCode } = request.params;

      const reward = await prisma.reward.findUnique({ where: { code: rewardCode } });
      if (!reward) {
        return reply.status(404).send({ error: 'Reward no encontrado' });
      }

      await prisma.reward.delete({ where: { code: rewardCode } });

      return reply.send({ message: 'Reward eliminado correctamente' });
    }
  );

  fastify.post('/redeem', async (request, reply) => {
    const { customerId, rewardCode } = request.body;
  
    if (!customerId || !rewardCode) {
      return reply.status(400).send({ error: 'Faltan campos requeridos' });
    }
  
    try {
      const reward = await prisma.reward.findUnique({
        where: { code: rewardCode },
        include: { program: true }
      });
  
      if (!reward) {
        return reply.status(404).send({ error: 'Recompensa no encontrada' });
      }
  
      const pass = await prisma.pass.findFirst({
        where: {
          customerId,
          programId: reward.programId,
          status: 'active'
        }
      });
  
      if (!pass) {
        return reply.status(404).send({ error: 'El cliente no tiene un pase activo en este programa' });
      }
  
      if (pass.points < reward.cost) {
        return reply.status(400).send({ error: 'El cliente no tiene suficientes puntos' });
      }
  
      const updatedPass = await prisma.pass.update({
        where: { id: pass.id },
        data: {
          points: { decrement: reward.cost }
        }
      });
  
      const voucher = await prisma.voucher.create({
        data: {
          code: generateVoucherCode(),
          customerId,
          rewardId: reward.id,
          status: 'active'
        }
      });
  
      return reply.send({ message: 'Recompensa canjeada exitosamente', voucher });
    } catch (error) {
      console.error('Error al canjear recompensa:', error);
      return reply.status(500).send({ error: 'Error al canjear recompensa' });
    }
  });
  
}

export default rewardsRoutes;
