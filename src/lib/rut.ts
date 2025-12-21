// Chilean RUT validation and utilities
// Format expected: digits + '-' + check digit (0-9 or K)

export function cleanRut(input: string): string {
  return (input || '').replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
}

export function validateRut(input: string): boolean {
  const rut = cleanRut(input);
  const match = rut.match(/^(\d+)-([0-9K])$/);
  if (!match) return false;
  const body = match[1];
  const dv = match[2];
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  const dvCalc = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
  return dvCalc === dv;
}

export function formatRut(input: string): string {
  const rut = cleanRut(input);
  const match = rut.match(/^(\d+)-([0-9K])$/);
  if (!match) return input;
  // Optionally add thousand separators; for now, return as cleaned
  return `${match[1]}-${match[2]}`;
}
