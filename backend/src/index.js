// src/index.js

// Core del servidor Fastify y dependencias
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import 'dotenv/config'; // Carga variables de entorno desde .env

// Importación de rutas del backend
import authRoutes            from './routes/auth.js';               // Login y registro de clientes finales por OTP
import earnRoutes            from './routes/earn.js';               // Acreditación de saldo (puntos, cashback, sellos)
import enrollmentRoutes      from './routes/enrollments.js';        // Inscripción de clientes en programas
import programRoutes         from './routes/programs.js';           // Gestión de programas (listado, detalle, etc.)
import redeemRoutes          from './routes/redeem.js';             // Redención de saldo por clientes (genera voucher)
import adminRoutes           from './routes/admin.js';              // Panel de administración general (merchants, branches)
import branchRoutes          from './routes/branches.js';           // Gestión de sucursales (branches) desde el panel admin
import voucherRoutes         from './routes/vouchers.js';           // Gestión de vouchers (crear, listar, redimir vouchers)
import testEmailRoutes       from './routes/testEmail.js';          // Ruta para pruebas de envío de correos
import rewardsRoutes         from './routes/rewards.js';            // Catálogo de premios (rewards) para programas de puntos
import authMerchantRoutes    from './routes/authMerchant.js';       // Registro y login de merchants y branches (correo + password)
import uploadRoutes from './routes/upload.js';
import passRoutes from './passes.js';
import insightsRoutes from './insights.js';

// Inicializa instancia de Fastify con logging activado
const fastify = Fastify({ logger: true });

// Schema global para respuestas de error estandarizadas
fastify.addSchema({
  $id: 'ErrorResponse',
  type: 'object',
  properties: {
    error: { type: 'string' }
  }
});

// Configuración de CORS (habilita peticiones cross-origin)
await fastify.register(cors, { origin: true, credentials: true });

// Servir archivos estáticos desde /public (opcional)
await fastify.register(fastifyStatic, {
  root: path.resolve('public'),
  prefix: '/public/'
});

// Rutas de autenticación de clientes (OTP por teléfono)
await fastify.register(authRoutes, { prefix: '/auth' });

// Rutas para la interacción de clientes finales con los programas
await fastify.register(earnRoutes,       { prefix: '/programs' });       // Acreditar saldo
await fastify.register(redeemRoutes,     { prefix: '/programs' });       // Redimir saldo
await fastify.register(enrollmentRoutes, { prefix: '/enrollments' });    // Inscripción en programas

// Rutas generales de programas (listado, detalles, etc.)
await fastify.register(programRoutes, { prefix: '/programs' });

// Rutas de administración (merchants, branches)
await fastify.register(adminRoutes,  { prefix: '/admin' });               // Admin global
await fastify.register(branchRoutes, { prefix: '/admin' });               // Gestión de sucursales

// Rutas de gestión de vouchers (crear, obtener detalle, redimir)
await fastify.register(voucherRoutes, { prefix: '/vouchers' });

// Ruta de prueba para verificación de envío de emails (SES)
await fastify.register(testEmailRoutes);

// Rutas de autenticación de merchants y branches (correo + password)
await fastify.register(authMerchantRoutes, { prefix: '/auth' });

// Rutas del catálogo de premios (rewards)
await fastify.register(rewardsRoutes, { prefix: '/rewards' });
await fastify.register(uploadRoutes, { prefix: '/uploads' });

await fastify.register(passRoutes, { prefix: '/passes' });

await fastify.register(insightsRoutes, { prefix: '/insights' });


// Inicialización del servidor y despliegue de las rutas
await fastify.ready();

console.log(fastify.printRoutes()); // Muestra las rutas registradas en consola

// Levantar servidor en puerto 4000
try {
  await fastify.listen({ port: 4000 });
  console.log('🚀 Backend corriendo en http://localhost:4000');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
