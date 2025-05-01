// src/services/emailService.js

import { SESClient, SendTemplatedEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';
dotenv.config();

// Configuración del SES Client
const sesClient = new SESClient({
  region: "us-east-2",
  credentials: {
    accessKeyId:"AKIAVRZE3PYMDNSOF4GF",
    secretAccessKey:"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"
  }
});

/**
 * Envía un correo utilizando las plantillas de Amazon SES.
 * @param {Object} options
 * @param {string} options.to - Correo del destinatario.
 * @param {string} options.templateId - Nombre de la plantilla en SES.
 * @param {Object} options.variables - Variables dinámicas para los placeholders de la plantilla.
 */
async function sendTemplatedEmail({ to, templateName, templateData }) {
  if (!to || !templateName || !templateData) {
    throw new Error('❌ Faltan parámetros para enviar el correo (to, templateName, templateData)');
  }

  const params = {
    Destination: { ToAddresses: [to] },
    Source: process.env.SES_FROM_EMAIL,
    Template: templateName,
    TemplateData: JSON.stringify(templateData)
  };

  const command = new SendTemplatedEmailCommand(params);
  await sesClient.send(command);
}

export default sendTemplatedEmail;