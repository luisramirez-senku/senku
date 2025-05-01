import { PrismaClient } from '@prisma/client';
import { generateCode } from '../services/codeGenerator.js';
import verifyToken from '../services/authMiddleware.js';
import { getUserRole } from '../utils/userRoleHelper.js';

const prisma = new PrismaClient();

async function programRoutes(fastify, opts) {
  // ─────────────────────────────────────────────────────────────
  // POST /programs → Crear un nuevo programa (solo merchant)
  // ─────────────────────────────────────────────────────────────
  fastify.post('/programs', { preHandler: verifyToken }, async (request, reply) => {
    const role = getUserRole(request.user);
    if (role !== 'merchant') {
      return reply.status(403).send({ error: 'Solo los merchants pueden crear programas' });
    }

    try {
      const {
        name,
        type, // 'points' | 'cashback' | 'stamps'
        backgroundColor,
        foregroundColor,
        logoUrl,
        iconUrl,
        heroImageUrl,
        description,
        status,
        pointsPerAmount,
        cashbackPercentage,
        requiredStamps
      } = request.body;

      // Validaciones específicas por tipo
      if (!name || !type || !backgroundColor || !foregroundColor) {
        return reply.code(400).send({ error: 'Campos obligatorios faltantes' });
      }

      if (type === 'points' && !pointsPerAmount) {
        return reply.code(400).send({ error: 'Debe especificar la conversión de puntos' });
      }

      if (type === 'cashback' && !cashbackPercentage) {
        return reply.code(400).send({ error: 'Debe especificar el porcentaje de cashback' });
      }

      if (type === 'stamps' && !requiredStamps) {
        return reply.code(400).send({ error: 'Debe especificar la cantidad de sellos requeridos' });
      }

      const code = generateCode('PRG', 6);

      const program = await prisma.loyaltyProgram.create({
        data: {
          merchantId: request.user.merchantId,
          name,
          type,
          backgroundColor,
          foregroundColor,
          logoUrl,
          iconUrl,
          heroImageUrl,
          description,
          status,
          code,
          pointsPerAmount,
          cashbackPercentage,
          requiredStamps
        }
      });

      return reply.code(201).send(program);
    } catch (error) {
      console.error('Error al crear programa:', error);
      return reply.code(500).send({ error: 'Error interno del servidor' });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // GET /programs → Listar todos los programas del merchant
  // ─────────────────────────────────────────────────────────────
  fastify.get('/programs', { preHandler: verifyToken }, async (request, reply) => {
    const role = getUserRole(request.user);
    if (role !== 'merchant') {
      return reply.status(403).send({ error: 'No autorizado para ver programas' });
    }

    const programs = await prisma.loyaltyProgram.findMany({
      where: { merchantId: request.user.merchantId },
      select: {
        code: true,
        type: true,
        name: true,
        backgroundColor: true,
        foregroundColor: true,
        status: true,
        createdAt: true
      }
    });

    return reply.send({ programs });
  });

  // ─────────────────────────────────────────────────────────────
  // GET /programs/:programCode → Detalle de un programa
  // ─────────────────────────────────────────────────────────────
  fastify.get('/programs/:programCode', { preHandler: verifyToken }, async (request, reply) => {
    const role = getUserRole(request.user);
    if (role !== 'merchant') {
      return reply.status(403).send({ error: 'No autorizado para ver programas' });
    }

    const { programCode } = request.params;

    const program = await prisma.loyaltyProgram.findFirst({
      where: { code: programCode, merchantId: request.user.merchantId }
    });

    if (!program) {
      return reply.status(404).send({ error: 'Programa no encontrado' });
    }

    return reply.send({ program });
  });

  // ─────────────────────────────────────────────────────────────
  // PUT /programs/:programCode → Editar programa existente
  // ─────────────────────────────────────────────────────────────
  fastify.put('/programs/:programCode', { preHandler: verifyToken }, async (request, reply) => {
    const role = getUserRole(request.user);
    if (role !== 'merchant') {
      return reply.status(403).send({ error: 'Solo los merchants pueden editar programas' });
    }

    const { programCode } = request.params;
    const updateData = request.body;

    try {
      const existing = await prisma.loyaltyProgram.findFirst({
        where: { code: programCode, merchantId: request.user.merchantId }
      });

      if (!existing) return reply.code(404).send({ error: 'Programa no encontrado' });

      const updated = await prisma.loyaltyProgram.update({
        where: { id: existing.id },
        data: updateData
      });

      return reply.send(updated);
    } catch (error) {
      console.error('Error actualizando programa:', error);
      return reply.code(500).send({ error: 'Error interno al actualizar programa' });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // DELETE /programs/:programCode → Eliminar programa
  // ─────────────────────────────────────────────────────────────
  fastify.delete('/programs/:programCode', { preHandler: verifyToken }, async (request, reply) => {
    const role = getUserRole(request.user);
    if (role !== 'merchant') {
      return reply.status(403).send({ error: 'No autorizado para eliminar programas' });
    }

    const { programCode } = request.params;

    const program = await prisma.loyaltyProgram.findFirst({
      where: { code: programCode, merchantId: request.user.merchantId }
    });

    if (!program) {
      return reply.status(404).send({ error: 'Programa no encontrado' });
    }

    await prisma.loyaltyProgram.delete({ where: { id: program.id } });

    return reply.send({ message: 'Programa eliminado correctamente' });
  });
}

export default programRoutes;
