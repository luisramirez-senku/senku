// src/utils/codeGenerator.js

// Generador general de códigos (ej: MER-4829-1947)
export function generateCode(prefix, length = 8) {
  const randomDigits = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  const part1 = randomDigits.slice(0, length / 2);
  const part2 = randomDigits.slice(length / 2);
  return `${prefix}-${part1}-${part2}`;
}

// Generador específico para vouchers (ej: VCH-849105)
export function generateVoucherCode() {
  return `VCH-${Math.floor(100000 + Math.random() * 900000)}`;
}

// 🚀 Nuevo: Generador específico para pases (ej: 1234-56789)
export function generatePassBarcode(merchantCode) {
  const merchantKey = merchantCode.slice(0, 4); // primeros 4 caracteres del merchant.code
  const randomPart = Math.floor(10000 + Math.random() * 90000); // 5 dígitos random
  return `${merchantKey}-${randomPart}`;
}

// Validadores de formato
const patterns = {
  merchantCode: /^MER-\d{4}-\d{4}$/,
  branchCode:   /^BRN-\d{3}-\d{3}$/,
  programCode:  /^PRG-\d{3}-\d{3}$/,
  rewardCode:   /^RWD-\d{3}-\d{3}$/,
  voucherCode:  /^VCH-\d{6}$/,
  customerCode: /^CUS-\d{4}-\d{4}$/,
  transactionCode: /^TRX-\d{8}$/,
  passBarcode: /^.{4}-\d{5}$/ // 4 caracteres + '-' + 5 dígitos
};

export function validateCode(type, code) {
  const pattern = patterns[type];
  if (!pattern) throw new Error(`Tipo de código desconocido: ${type}`);
  return pattern.test(code);
}
