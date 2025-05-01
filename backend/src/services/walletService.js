import path from 'path';
import fs from 'fs/promises';
import { Pass } from 'passkit-generator';
import { fileURLToPath } from 'url';

// Obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta a la plantilla base del pase Apple
const templatePath = path.join(__dirname, '../../walletTemplates/base.pass');

// Ruta a carpeta temporal para guardar pases generados
const tempOutputPath = path.join(__dirname, '../../tmp');

export async function generateWalletPass(data) {
  const {
    serialNumber,
    barcodeValue,
    programName,
    description,
    backgroundColor,
    foregroundColor,
    logoUrl,
    iconUrl,
    organizationName = 'Senku Loyalty'
  } = data;

  try {
    const pass = await Pass.from(templatePath, {
      serialNumber,
      description,
      organizationName,
      backgroundColor,
      foregroundColor,
      barcode: {
        message: barcodeValue,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1'
      }
    });

    if (logoUrl) await pass.images.add('logo', await fetchImageBuffer(logoUrl));
    if (iconUrl) await pass.images.add('icon', await fetchImageBuffer(iconUrl));

    pass.primaryFields.add({ key: 'program', label: 'Programa', value: programName });
    pass.backFields.add({ key: 'info', label: 'Descripción', value: description });

    const buffer = await pass.asBuffer();
    const passFilePath = path.join(tempOutputPath, `${serialNumber}.pkpass`);
    await fs.writeFile(passFilePath, buffer);

    return {
      passBuffer: buffer,
      filePath: passFilePath
    };
  } catch (error) {
    console.error('Error generando pase:', error);
    throw new Error('No se pudo generar el pase.');
  }
}

// 🔔 Enviar push update a Apple Wallet
export async function sendWalletPush(passSerial, messageData) {
  try {
    const { title, message } = messageData;

    // Aquí deberías almacenar devicePushTokens en tu base de datos al momento de registrar pases
    // y hacer un llamado a la API push de Apple con el token y serial
    console.log(`Push enviado a pase ${passSerial}: ${title} - ${message}`);
    // Lógica real de integración push con Apple Wallet iría aquí
  } catch (err) {
    console.error('Error enviando push a Wallet:', err);
  }
}

// 🟡 Placeholder para Google Wallet (próxima fase)
export async function generateGoogleWalletPass(data) {
  console.log('👉 Aquí irá la lógica para Google Wallet con JWTs firmados');
  return null;
}

// Utilidad para descargar imagen desde URL como buffer
async function fetchImageBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar imagen: ${url}`);
  return await res.arrayBuffer();
}
