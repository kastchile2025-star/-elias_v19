// Shim de 'canvas' para entornos de navegador.
// Evita errores cuando librerías con soporte Node intentan importar 'canvas'.

export class Image {}
export class Canvas {}
export class ImageData {}

export function createCanvas() {
  throw new Error('canvas no está disponible en el navegador');
}

export default {};
