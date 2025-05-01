import { PrismaClient } from '@prisma/client';
import { generateCode } from '../services/codeGenerator.js';
import { generateQRCode, generateVoucherPDF } from '../services/pdfService.js';
import { uploadVoucherToS3 } from '../services/s3Service.js';
import sendTemplatedEmail from '../services/emailService.js';
import verifyToken from '../services/authMiddleware.js';
import { getUserRole } from '../utils/roleUtils.js';

const prisma = new PrismaClient();

export default async function voucherRoutes(fastify) {
  // ─────────────────────────────────────────────
  // POST /vouchers → Crear voucher
  // ─────────────────────────────────────────────
  fastify.post(
    '/',
    { preHandler: verifyToken },
    async (request, reply) => {
      const role = getUserRole(request.user);
      if (role !== 'merchant') {
        return reply.status(403).send({ error: 'Solo los merchants pueden crear vouchers' });
      }

      const { customerCode, programCode, rewardCode } = request.body;

      if (!customerCode || !programCode || !rewardCode) {
        return reply.status(400).send({ error: 'Faltan campos requeridos' });
      }

      const customer = await prisma.customer.findUnique({ where: { code: customerCode } });
      if (!customer) return reply.status(404).send({ error: 'Cliente no encontrado' });

      const program = await prisma.loyaltyProgram.findUnique({
        where: { code: programCode },
        include: { merchant: true }
      });
      if (!program) return reply.status(404).send({ error: 'Programa no encontrado' });

      const reward = await prisma.reward.findUnique({ where: { code: rewardCode } });
      if (!reward) return reply.status(404).send({ error: 'Reward no encontrado' });

      const voucherCode = generateCode('VCH');

      const voucher = await prisma.voucher.create({
        data: {
          code: voucherCode,
          customerId: customer.id,
          programId: program.id,
          rewardId: reward.id,
          status: 'ACTIVE'
        },
        include: {
          program: { include: { merchant: true } },
          reward: true,
          customer: true
        }
      });

      const qrBuffer = await generateQRCode(`https://scanner.gosenku.com/redeem/${voucher.code}`);
      const pdfBuffer = await generateVoucherPDF({
        voucherCode: voucher.code,
        customerName: voucher.customer.name,
        rewardName: voucher.reward.name,
        qrBuffer
      });

      const pdfUrl = await uploadVoucherToS3(`${voucher.code}.pdf`, pdfBuffer);

      try {
        await sendTemplatedEmail({
          to: voucher.customer.email,
          templateName: 'voucher_generated',
          templateData: {
            voucher: {
              code: voucher.code,
              expiration: voucher.expiration ? voucher.expiration.toISOString().split('T')[0] : 'N/A',
              downloadLink: pdfUrl
            },
            reward: {
              name: voucher.reward.name
            },
            merchant: {
              name: voucher.program.merchant.name,
              logoUrl: voucher.program.merchant.logoUrl
            },
            customMessage: 'Escaneá el código QR o descargá el PDF para redimir tu voucher.'
          }
        });
      } catch (err) {
        fastify.log.warn(`⚠️ No se pudo enviar el correo del voucher ${voucher.code}: ${err.message}`);
      }

      return reply.send({ voucher, pdfUrl });
    }
  );

  // ─────────────────────────────────────────────
  // GET /vouchers/:voucherCode → Consultar detalle del voucher
  // ─────────────────────────────────────────────
  fastify.get('/:voucherCode', async (request, reply) => {
    const { voucherCode } = request.params;

    const voucher = await prisma.voucher.findUnique({
      where: { code: voucherCode },
      include: {
        reward: true,
        program: {
          include: { merchant: true }
        },
        customer: true
      }
    });

    if (!voucher) {
      return reply.status(404).send({ error: 'Voucher no encontrado' });
    }

    return reply.send(voucher);
  });

  // ─────────────────────────────────────────────
  // POST /vouchers/:voucherCode/redeem → Redimir voucher
  // ─────────────────────────────────────────────
  fastify.post(
    '/:voucherCode/redeem',
    { preHandler: verifyToken },
    async (request, reply) => {
      const role = getUserRole(request.user);
      if (!['merchant', 'branch'].includes(role)) {
        return reply.status(403).send({ error: 'No autorizado para redimir vouchers' });
      }

      const { voucherCode } = request.params;

      const voucher = await prisma.voucher.findUnique({ where: { code: voucherCode } });

      if (!voucher) {
        return reply.status(404).send({ error: 'Voucher no encontrado' });
      }

      if (voucher.status === 'REDEEMED') {
        return reply.status(400).send({ error: 'Este voucher ya fue redimido' });
      }

      const updatedVoucher = await prisma.voucher.update({
        where: { code: voucherCode },
        data: { status: 'REDEEMED', redeemedAt: new Date() }
      });

      return reply.send({ message: 'Voucher redimido exitosamente', voucher: updatedVoucher });
    }
  );
}
