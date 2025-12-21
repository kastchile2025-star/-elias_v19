declare module 'pdfjs-dist/build/pdf.mjs' {
  export const GlobalWorkerOptions: any
  export function getDocument(src: any): { promise: Promise<any> }
}

declare module 'pdfjs-dist/build/pdf.worker.min.mjs' {
  const workerSrc: string
  export default workerSrc
}
