// src/routes/testEmail.js
import sendTemplatedEmail from '../services/emailService.js';

async function testEmailRoutes(fastify, opts) {
  fastify.post('/test/email', {
    schema: {
      summary: 'Enviar un correo de prueba con SES',
      tags: ['Testing'],
      body: {
        type: 'object',
        properties: {
          to: { type: 'string', format: 'email' },
          templateName: { type: 'string' },
          templateData: { type: 'object' }
        },
        required: ['to', 'templateName', 'templateData']
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        500: { $ref: 'ErrorResponse#' }
      }
    }
  }, async (request, reply) => {
    const { to, templateName, templateData } = request.body;

    try {
      await sendTemplatedEmail({
        to,
        templateName,
        templateData
      });
      return reply.send({ message: 'Correo de prueba enviado correctamente' });
    } catch (err) {
      fastify.log.error({
        message: '❌ Error enviando correo de prueba:',
        error: JSON.stringify(err, Object.getOwnPropertyNames(err))
      });
      return reply.status(500).send({ error: 'Error al enviar el correo de prueba' });
    }
  });
}

export default testEmailRoutes;
