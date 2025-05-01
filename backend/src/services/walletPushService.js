// src/services/walletPushService.js

import { sendWalletPush } from './walletService.js';

/**
 * Envia notificaciones a pases registrados, según el tipo de targeting.
 *
 * @param {Object} options
 * @param {'individual'|'segment'|'geo'} options.type - Tipo de targeting.
 * @param {string[]} options.target - Códigos de pase a notificar (solo si type = 'individual').
 * @param {Object} options.message - Objeto con title y message.
 */
export async function sendWalletNotification({ type, target, message }) {
  try {
    let passesToUpdate = [];

    if (type === 'individual' && Array.isArray(target)) {
      passesToUpdate = target;
    } else if (type === 'segment') {
      console.warn('Segment targeting aún no implementado');
      return [];
    } else if (type === 'geo') {
      console.warn('GeoPush aún no implementado');
      return [];
    } else {
      console.warn('Tipo de notificación no soportado');
      return [];
    }

    const results = [];

    for (const passCode of passesToUpdate) {
      try {
        await sendWalletPush(passCode, message);
        results.push({ passCode, status: 'OK' });
      } catch (err) {
        console.error(`Error enviando push a ${passCode}:`, err.message);
        results.push({ passCode, status: 'ERROR', error: err.message });
      }
    }

    return results;
  } catch (error) {
    console.error('Error general en notificaciones push:', error);
    throw new Error('Falló el envío de notificaciones push');
  }
}
