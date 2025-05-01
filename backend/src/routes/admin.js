// src/routes/admin.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { generateCode } from '../services/codeGenerator.js';
import verifyToken from '../services/authMiddleware.js';

async function adminRoutes(fastify, opts) {
  // GET /admin/merchants
  fastify.get(
    '/merchants',
    {
      schema: {
        summary: 'Listar todos los comercios',
        tags: ['Admin','Merchants'],
        security: [{ bearerAuth: [] }],
        response: { 200: { type: 'array', items: { type: 'object', properties: { code:{type:'string'}, name:{type:'string'}, email:{type:'string'}, phone:{type:'string'} } } } }
      },
      preHandler: verifyToken
    },
    async (request, reply) => {
      const merchants = await prisma.merchant.findMany({ orderBy: { createdAt: 'desc' } });
      return reply.send(merchants);
    }
  );

  // GET /admin/merchants/:code
  fastify.get(
    '/merchants/:code',
    {
      schema: {
        summary: 'Obtener detalle de un comercio por code',
        tags: ['Admin','Merchants'],
        security: [{ bearerAuth: [] }],
        params: { type: 'object', properties: { code: { type: 'string' } }, required: ['code'] },
        response: { 200: { type: 'object' }, 404: { $ref: 'ErrorResponse#' } }
      },
      preHandler: verifyToken
    },
    async (request, reply) => {
      const { code } = request.params;
      const merchant = await prisma.merchant.findUnique({
        where: { code },
        include: {
          programs: { select: { code: true, name: true, type: true, createdAt: true } },
          rewards: { select: { code: true, name: true, cost: true } },
          customers: { select: { id: true } }
        }
      });
      if (!merchant) return reply.status(404).send({ error: 'Comercio no encontrado' });
      return reply.send({ 
        code: merchant.code,
        name: merchant.name,
        email: merchant.email,
        phone: merchant.phone,
        logoUrl: merchant.logoUrl,
        primaryColor: merchant.primaryColor,
        createdAt: merchant.createdAt,
        programs: merchant.programs,
        rewards: merchant.rewards,
        totalCustomers: merchant.customers.length 
      });
    }
  );

  // GET /admin/programs
  fastify.get(
    '/programs',
    {
      schema: {
        summary: 'Listar programas de lealtad',
        tags: ['Admin','Programs'],
        security: [{ bearerAuth: [] }],
        response: { 200:{ type:'array', items:{ type:'object' } } }
      },
      preHandler: verifyToken
    },
    async (request, reply) => {
      const programs = await prisma.loyaltyProgram.findMany({ orderBy:{ createdAt:'desc' }, include:{ merchant:{ select:{ code:true,name:true } } } });
      const simplified = programs.map(p=>({ code:p.code,name:p.name,type:p.type,merchant:p.merchant,createdAt:p.createdAt }));
      return reply.send(simplified);
    }
  );

  // GET /admin/rewards
  fastify.get(
    '/rewards',
    {
      schema: {
        summary: 'Listar rewards por programCode',
        tags: ['Admin','Rewards'],
        security: [{ bearerAuth: [] }],
        querystring: { type:'object', properties:{ programCode:{type:'string'} }, required:['programCode'] },
        response:{ 200:{ type:'array', items:{ type:'object' } },400:{$ref:'ErrorResponse#'},404:{$ref:'ErrorResponse#'} }
      },
      preHandler: verifyToken
    },
    async(request, reply)=>{
      const { programCode }=request.query;
      const program=await prisma.loyaltyProgram.findUnique({ where:{ code:programCode } });
      if(!program) return reply.status(404).send({ error:'Programa no encontrado' });
      const rewards=await prisma.reward.findMany({ where:{ programId:program.id }, orderBy:{ createdAt:'desc' } });
      return reply.send(rewards);
    }
  );
}

export default adminRoutes;
