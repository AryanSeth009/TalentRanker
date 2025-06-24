declare module 'pdf-parse' {
  import { Buffer } from 'buffer';
  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text: string;
  }
  function pdfParse(buffer: Buffer | Uint8Array | ArrayBuffer): Promise<PDFParseResult>;
  export = pdfParse;
} 