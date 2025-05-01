// ─────────────────────────────────────────────────────────────
//  QR SERVICE - SENKU LOYALTY
//  Genera QR code a partir de un string (ej. voucherCode o URL)
// ─────────────────────────────────────────────────────────────

import QRCode from 'qrcode';

/**
 * Genera un QR code en formato PNG como buffer.
 * @param {string} text - El texto o URL que contendrá el QR.
 * @returns {Promise<Buffer>} - Buffer de la imagen PNG del QR.
 */
export async function generateQRCode(text) {
  try {
    const qrBuffer = await QRCode.toBuffer(text, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
      margin: 2,
    });
    return qrBuffer;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}
