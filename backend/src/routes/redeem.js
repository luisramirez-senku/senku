// src/routes/redeem.js

import { PrismaClient } from '@prisma/client';
import { generateCode } from '../services/codeGenerator.js';
import verifyToken from '../services/authMiddleware.js';
import sendTemplatedEmail from '../services/emailService.js';
import { generateQRCode } from '../services/qrService.js';
import { generateVoucherPDF } from '../services/pdfGenerator.js';
import { uploadVoucherToS3 } from '../services/s3Service.js';
import { getUserRole } from '../utils/userRoleHelper.js';

const prisma = new PrismaClient();

async function redeemRoutes(fastify, opts) {
  fastify.post(
    '/:programCode/redeem',
    {
      schema: {
        summary: 'Redimir saldo de un cliente en un programa',
        tags: ['Programs'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { programCode: { type: 'string' } },
          required: ['programCode']
        },
        body: {
          type: 'object',
          properties: {
            customerCode: { type: 'string' },
            amount: { type: 'number' }
          },
          required: ['customerCode', 'amount']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              nuevoSaldo: { type: 'object' },
              transaccion: { type: 'object' },
              voucherUrl: { type: 'string' }
            }
          },
          400: { $ref: 'ErrorResponse#' },
          404: { $ref: 'ErrorResponse#' }
        }
      },
      preHandler: verifyToken
    },
    async (request, reply) => {
      const role = getUserRole(request.user);
      if (role !== 'merchant' && role !== 'branch') {
        return reply.status(403).send({ error: 'No autorizado para redimir vouchers' });
      }

      const { programCode } = request.params;
      const { customerCode, amount } = request.body;

      const program = await prisma.loyaltyProgram.findUnique({ where: { code: programCode } });
      if (!program) return reply.status(404).send({ error: 'Programa no encontrado' });

      const customer = await prisma.customer.findUnique({ where: { code: customerCode } })
        || await prisma.customer.findUnique({ where: { phone: customerCode } });
      if (!customer) return reply.status(404).send({ error: 'Cliente no encontrado' });

      const cp = await prisma.customerProgram.findFirst({
        where: { customerId: customer.id, programId: program.id }
      });
      if (!cp) return reply.status(404).send({ error: 'Cliente no inscrito en este programa' });

      const updateData = {};
      if (program.type === 'POINTS' && cp.pointsBalance >= amount) {
        updateData.pointsBalance = cp.pointsBalance - amount;
      } else if (program.type === 'CASHBACK' && cp.cashbackBalance >= amount) {
        updateData.cashbackBalance = cp.cashbackBalance - amount;
      } else if (program.type === 'STAMPS' && cp.stampsBalance >= 1) {
        updateData.stampsBalance = cp.stampsBalance - 1;
      } else {
        return reply.status(400).send({ error: 'Saldo insuficiente o tipo de programa no soportado' });
      }

      await prisma.customerProgram.update({ where: { id: cp.id }, data: updateData });

      const transaction = await prisma.transaction.create({
        data: {
          code: generateCode('TRX'),
          customerProgramId: cp.id,
          type: 'REDEEM',
          amount
        }
      });

      const voucherCode = generateCode('VCH');
      const qrBuffer = await generateQRCode(`https://scanner.gosenku.com/redeem/${voucherCode}`);
      const merchant = await prisma.merchant.findUnique({ where: { id: program.merchantId } });

      const pdfBuffer = await generateVoucherPDF({
        voucherCode,
        customerName: customer.name,
        rewardName: `${amount} ${program.type === 'POINTS' ? 'Puntos' : program.type === 'CASHBACK' ? 'Cashback' : 'Sellos'}`,
        qrBuffer
      });

      const voucherPdfUrl = await uploadVoucherToS3(`${voucherCode}.pdf`, pdfBuffer);

      await prisma.voucher.create({
        data: {
          code: voucherCode,
          customerId: customer.id,
          programId: program.id,
          transactionId: transaction.id,
          pdfUrl: voucherPdfUrl,
          status: 'pending'
        }
      });

      const templateMapping = {
        POINTS: 'points_redeemed',
        CASHBACK: 'cashback_redeemed',
        STAMPS: 'stamps_redeemed'
      };

      const templateName = templateMapping[program.type];

      try {
        await sendTemplatedEmail({
          to: customer.email,
          templateName,
          templateData: {
            amount,
            customer_name: customer.name,
            program_name: program.name,
            branch_name: 'N/A',
            merchant_name: merchant?.name || 'Senku',
            voucher_code: voucherCode,
            voucher_pdf_url: voucherPdfUrl
          }
        });
      } catch (err) {
        fastify.log.warn(`⚠️ No se pudo enviar el correo de redención al cliente ${customer.code}: ${err.message}`);
      }

      return reply.send({
        message: 'Recompensa redimida',
        nuevoSaldo: updateData,
        transaccion: transaction,
        voucherUrl: voucherPdfUrl
      });
    }
  );
}

export default redeemRoutes;
