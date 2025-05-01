import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { generateCode } from './codeGenerator.js';

const prisma = new PrismaClient();

// Obtener Management API token
async function getManagementToken() {
  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE } = process.env;

  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !AUTH0_AUDIENCE) {
    throw new Error('❌ Faltan variables de entorno para Auth0 (revisá AUTH0_DOMAIN, CLIENT_ID, CLIENT_SECRET y AUDIENCE)');
  }

  const res = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
    client_id: AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
    audience: AUTH0_AUDIENCE,
    grant_type: 'client_credentials'
  });

  return res.data.access_token;
}

// Actualizar metadata de un usuario en Auth0
export async function updateUserMetadata({ auth0UserId, role, merchantId, branchId = null }) {
  const token = await getManagementToken();

  const metadata = {
    role,
    merchantId,
    ...(branchId && { branchId }) // Solo incluye branchId si existe
  };

  await axios.patch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(auth0UserId)}`,
    { app_metadata: metadata },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// Registro de merchant (negocio)
export async function registerMerchant({ auth0UserId, email, name, phone }) {
  const existing = await prisma.merchant.findUnique({ where: { email } });
  if (existing) throw new Error('Este correo ya está registrado como merchant');

  const merchantCode = generateCode('MER');

  await updateUserMetadata({
    auth0UserId,
    role: 'merchant',
    merchantId: merchantCode
  });

  const merchant = await prisma.merchant.create({
    data: {
      code: merchantCode,
      email,
      name,
      phone,
      auth0Id: auth0UserId
    }
  });

  return merchant;
}

// Registro de branch (sucursal)
export async function registerBranch({ auth0UserId, email, name, phone, merchantId }) {
  const existing = await prisma.branch.findUnique({ where: { email } });
  if (existing) throw new Error('Este correo ya está registrado como branch');

  const branchCode = generateCode('BRN');

  await updateUserMetadata({
    auth0UserId,
    role: 'branch',
    merchantId,
    branchId: branchCode
  });

  const branch = await prisma.branch.create({
    data: {
      code: branchCode,
      email,
      name,
      phone,
      auth0Id: auth0UserId,
      merchantId
    }
  });

  return branch;
}
