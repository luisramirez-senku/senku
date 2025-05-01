import { generateQRCode } from '../src/services/qrService.js';
import { generateVoucherPDF } from '../src/services/pdfGenerator.js';
import { uploadVoucherToS3 } from '../src/services/s3Service.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTestVoucher() {
  const voucherCode = 'VCH-TEST123';
  const customerName = 'Juan Pérez';
  const rewardName = '10% de descuento';
  const merchantLogoUrl = 'https://gosenku.com/assets/logo.png'; // Reemplazalo por algún logo válido

  try {
    // 🟢 Generar QR
    const qrBuffer = await generateQRCode(`https://scanner.gosenku.com/redeem/${voucherCode}`);
    console.log('✅ QR generado');

    // 🟢 Generar PDF
    const pdfBuffer = await generateVoucherPDF({
      voucherCode,
      customerName,
      rewardName,
      qrBuffer,
      merchantLogoUrl
    });
    console.log('✅ PDF generado');

    // 🟢 Subir a S3
    const pdfUrl = await uploadVoucherToS3(`${voucherCode}.pdf`, pdfBuffer);
    console.log('✅ PDF subido a S3:', pdfUrl);

  } catch (error) {
    console.error('❌ Error creando voucher de prueba:', error);
  }
}

createTestVoucher();
