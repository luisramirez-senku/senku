// src/routes/passes.js

import { PrismaClient } from '@prisma/client';
import { generatePassBarcode } from '../services/codeGenerator.js';
import verifyToken from '../services/authMiddleware.js';
import { getUserRole } from '../utils/userRoleHelper.js';
import { sendWalletPush } from '../services/walletPushService.js';

const prisma = new PrismaClient();

export default async function passRoutes(fastify) {
  // ─────────────────────────────────────────────────────────────
  // POST /passes → Crear un nuevo pase para un cliente
  // ─────────────────────────────────────────────────────────────
  fastify.post('/passes', { preHandler: verifyToken }, async (request, reply) => {
    const role = getUserRole(request.user);
    if (role !== 'merchant' && role !== 'branch') {
      return reply.status(403).send({ error: 'No autorizado para emitir pases' });
    }

    try {
      const { customerId, programId, merchantId } = request.body;

      const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
      if (!merchant) {
        return reply.code(404).send({ error: 'Merchant no encontrado' });
      }

      const merchantKey = merchant.code.substring(0, 4);
      const barcodeValue = generatePassBarcode(merchantKey);

      // Validar si ya existe un pase activo para ese cliente y programa
      const existingPass = await prisma.pass.findFirst({
        where: {
          customerId,
          programId,
          status: 'active'
        }
      });

      if (existingPass) {
        return reply.status(400).send({ error: 'Este cliente ya tiene un pase activo en este programa.' });
      }

      const newPass = await prisma.pass.create({
        data: {
          customerId,
          programId,
          merchantId,
          code: barcodeValue,
          status: 'active'
        }
      });

      return reply.code(201).send(newPass);
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ error: 'Error al crear pase' });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // GET /passes/:customerId?status=active|inactive → Listar pases de un cliente
  // ─────────────────────────────────────────────────────────────
  fastify.get('/:customerId', { preHandler: verifyToken }, async (request, reply) => {
    const { customerId } = request.params;
    const { status } = request.query;
    const role = getUserRole(request.user);

    if (role !== 'merchant' && role !== 'branch') {
      return reply.status(403).send({ error: 'No autorizado para consultar pases' });
    }

    try {
      const where = { customerId };
      if (status && ['active', 'inactive'].includes(status)) {
        where.status = status;
      }

      const passes = await prisma.pass.findMany({
        where,
        include: {
          program: true,
          merchant: true
        }
      });

      return reply.send(passes);
    } catch (error) {
      console.error('Error obteniendo pases:', error);
      return reply.status(500).send({ error: 'Error interno del servidor' });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // PUT /passes/:passId/status → Cambiar estado del pase
  // ─────────────────────────────────────────────────────────────
  fastify.put('/:passId/status', { preHandler: verifyToken }, async (request, reply) => {
    const { passId } = request.params;
    const { status } = request.body;
    const role = getUserRole(request.user);

    if (role !== 'merchant') {
      return reply.status(403).send({ error: 'Solo los merchants pueden cambiar el estado del pase' });
    }

    if (!['active', 'inactive'].includes(status)) {
      return reply.status(400).send({ error: 'Estado inválido, debe ser active o inactive' });
    }

    try {
      const updatedPass = await prisma.pass.update({
        where: { id: passId },
        data: { status }
      });

      return reply.send(updatedPass);
    } catch (error) {
      console.error('Error actualizando estado del pase:', error);
      return reply.status(500).send({ error: 'Error actualizando estado del pase' });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // GET /passes/code/:code → Buscar pase por código
  // ─────────────────────────────────────────────────────────────
  fastify.get('/code/:code', { preHandler: verifyToken }, async (request, reply) => {
    const { code } = request.params;

    try {
      const pass = await prisma.pass.findUnique({
        where: { code },
        include: {
          program: true,
          customer: true,
          merchant: true
        }
      });

      if (!pass) {
        return reply.status(404).send({ error: 'Pase no encontrado' });
      }

      return reply.send(pass);
    } catch (error) {
      console.error('Error buscando pase por código:', error);
      return reply.status(500).send({ error: 'Error interno del servidor' });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // POST /passes/:code/push → Enviar notificación push al pase
  // ─────────────────────────────────────────────────────────────
  fastify.post('/:code/push', { preHandler: verifyToken }, async (request, reply) => {
    const { code } = request.params;
    const { title, message } = request.body;
    const role = getUserRole(request.user);

    if (role !== 'merchant' && role !== 'branch') {
      return reply.status(403).send({ error: 'No autorizado para enviar push' });
    }

    if (!title || !message) {
      return reply.status(400).send({ error: 'Faltan campos: title y message' });
    }

    try {
      const pass = await prisma.pass.findUnique({ where: { code } });
      if (!pass) {
        return reply.status(404).send({ error: 'Pase no encontrado' });
      }

      await sendWalletPush(pass.code, { title, message });

      return reply.send({ success: true, message: 'Notificación enviada al pase' });
    } catch (error) {
      console.error('Error enviando push al pase:', error);
      return reply.status(500).send({ error: 'Error enviando notificación' });
    }
  });
}
