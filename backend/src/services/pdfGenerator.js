import dotenv from 'dotenv';
dotenv.config();
import PDFDocument from 'pdfkit';
import { getBufferFromStream } from '../utils/streamHelpers.js';
import { PassThrough } from 'stream';

export async function generateVoucherPDF({ voucherCode, customerName, rewardName, qrBuffer }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = new PassThrough();
      doc.pipe(stream);

      // 🟢 Fondo blanco (es default, pero lo dejo claro)
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FFFFFF').fillColor('#333333');

      // 🟦 Título
      doc.fillColor('#1A73E8')
        .font('Helvetica-Bold')
        .fontSize(28)
        .text('¡Felicidades!', { align: 'center' })
        .moveDown(1.5);

      // 🟦 Subtítulo
      doc.fillColor('#333333')
        .font('Helvetica')
        .fontSize(20)
        .text(`Has redimido:`, { align: 'center' })
        .font('Helvetica-Bold')
        .text(`${rewardName}`, { align: 'center' })
        .moveDown(1.5);

      // 🟦 Código del Voucher
      doc.fillColor('#00ADEF')
        .font('Helvetica-Bold')
        .fontSize(18)
        .text(`Código del Voucher: ${voucherCode}`, { align: 'center' })
        .moveDown(2);

      // 🟦 Insertar QR
      const qrImage = doc.openImage(qrBuffer);
      doc.image(qrImage, 200, 350, { width: 200, align: 'center' });

      doc.moveDown(6);
      doc.fillColor('#333333')
        .font('Helvetica')
        .fontSize(14)
        .text(`Cliente: ${customerName}`, { align: 'center' })
        .moveDown(0.5)
        .fontSize(10)
        .text('Presenta este voucher en el negocio para canjear tu premio.', { align: 'center' });

      doc.end();

      getBufferFromStream(stream)
        .then((buffer) => resolve(buffer))
        .catch((error) => reject(error));
    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(new Error('Failed to generate voucher PDF'));
    }
  });
}
