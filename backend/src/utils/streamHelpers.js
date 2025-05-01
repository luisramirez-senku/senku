// ─────────────────────────────────────────────────────────────
//  STREAM HELPERS - SENKU LOYALTY
//  Convierte un stream en un buffer
// ─────────────────────────────────────────────────────────────

export function getBufferFromStream(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });
  }
  