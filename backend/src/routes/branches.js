// src/routes/branches.js

import { PrismaClient } from '@prisma/client';
import { generateCode } from '../services/codeGenerator.js';
import verifyToken from '../services/authMiddleware.js';
import { getUserRole } from '../utils/userRoleHelper.js';

const prisma = new PrismaClient();

async function branchRoutes(fastify, opts) {
  // ─────────────────────────────────────────────────────────────
  // POST /admin/branches → Crear sucursal para un comercio (merchantId desde el token)
  // ─────────────────────────────────────────────────────────────
  fastify.post(
    '/branches',
    {
      schema: {
        summary: 'Crear sucursal para un comercio',
        tags: ['Admin', 'Branches'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            name:       { type: 'string' },
            address:    { type: 'string' },
            phone:      { type: 'string' },
            latitude:   { type: 'number' },
            longitude:  { type: 'number' }
          },
          required: ['name']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              code:      { type: 'string' },
              name:      { type: 'string' },
              address:   { type: 'string' },
              phone:     { type: 'string' },
              latitude:  { type: 'number' },
              longitude: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              merchant: {
                type: 'object',
                properties: {
                  code:  { type: 'string' },
                  name:  { type: 'string' }
                }
              }
            }
          },
          400: { $ref: 'ErrorResponse#' },
          403: { $ref: 'ErrorResponse#' }
        }
      },
      preHandler: verifyToken
    },
    async (request, reply) => {
      const role = getUserRole(request.user);
      if (role !== 'merchant') {
        return reply.status(403).send({ error: 'Solo los merchants pueden crear sucursales' });
      }

      const { name, address, phone, latitude, longitude } = request.body;
      const merchantId = request.user.merchantId;

      const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
      if (!merchant) {
        return reply.status(404).send({ error: 'Comercio no encontrado' });
      }

      const branch = await prisma.branch.create({
        data: {
          code:       generateCode('BRN'),
          name,
          merchantId,
          address,
          phone,
          latitude,
          longitude
        }
      });

      return reply.send({
        code: branch.code,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        latitude: branch.latitude,
        longitude: branch.longitude,
        createdAt: branch.createdAt,
        merchant: {
          code: merchant.code,
          name: merchant.name
        }
      });
    }
  );

  // ─────────────────────────────────────────────────────────────
  // GET /admin/branches → Listar todas las sucursales del merchant autenticado
  // ─────────────────────────────────────────────────────────────
  fastify.get(
    '/branches',
    {
      schema: {
        summary: 'Listar todas las sucursales del merchant autenticado',
        tags: ['Admin', 'Branches'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                code:      { type: 'string' },
                name:      { type: 'string' },
                address:   { type: 'string' },
                phone:     { type: 'string' },
                latitude:  { type: 'number' },
                longitude: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            }
          },
          403: { $ref: 'ErrorResponse#' }
        }
      },
      preHandler: verifyToken
    },
    async (request, reply) => {
      const role = getUserRole(request.user);
      if (role !== 'merchant') {
        return reply.status(403).send({ error: 'Solo los merchants pueden listar sucursales' });
      }

      const merchantId = request.user.merchantId;

      const branches = await prisma.branch.findMany({
        where: { merchantId },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = branches.map(branch => ({
        code:      branch.code,
        name:      branch.name,
        address:   branch.address,
        phone:     branch.phone,
        latitude:  branch.latitude,
        longitude: branch.longitude,
        createdAt: branch.createdAt
      }));

      return reply.send(formatted);
    }
  );
}

export default branchRoutes;
