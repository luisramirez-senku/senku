// routes/notifications.js

import { sendWalletUpdate } from '../services/walletPushService.js';

fastify.post('/notifications', async (request, reply) => {
  const { programCode, type, message } = request.body;

  try {
    // 1. Buscar los pases activos de ese programa
    const passes = await prisma.pass.findMany({
      where: {
        program: { code: programCode },
        status: 'active'
      },
      include: { customer: true }
    });

    // 2. Lógica de segmentación si aplica (top clientes, inactivos, etc.)
    // Por ahora simple: todos los clientes del programa

    // 3. Llamar servicio que actualiza los pases y genera la push vía Wallet
    for (const pass of passes) {
      await sendWalletUpdate(pass, message); // <- aquí se actualiza passkit/google wallet
    }

    reply.send({ success: true, total: passes.length });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Error al enviar notificación push' });
  }
});
