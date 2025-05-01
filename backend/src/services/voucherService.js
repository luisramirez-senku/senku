// src/services/voucherService.js
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

/**
 * Genera el PDF del voucher, incluyendo un código QR.
 */
export async function generateVoucherPdf(voucher) {
  const doc = new PDFDocument();
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  doc.fontSize(20).text(`Voucher: ${voucher.code}`, { align: 'center' });
  doc.moveDown();

  const qrDataUrl = await QRCode.toDataURL(voucher.code);
  const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  const qrBuffer = Buffer.from(base64Data, 'base64');
  doc.image(qrBuffer, { fit: [150, 150], align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
}
