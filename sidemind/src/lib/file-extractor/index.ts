import { PDFPipeline } from '../context/pipelines/pdf';

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  isImage: boolean;
  base64?: string; // For images: data:image/png;base64,...
  extractedText?: string; // For text/code/PDF
  tokenEstimate?: number;
}

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB hard block

const pdfPipeline = new PDFPipeline();

export async function processFile(file: File): Promise<FileAttachment> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File "${file.name}" exceeds the 50 MB hard limit. Please select a smaller file.`);
  }

  const id = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const isImage = file.type.startsWith('image/');

  if (isImage) {
    const base64 = await readFileAsBase64(file);
    return {
      id,
      name: file.name,
      size: file.size,
      type: file.type || 'image/png',
      isImage: true,
      base64,
      tokenEstimate: 258, // Standard vision token approximation
    };
  }

  // Handle PDF files
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    try {
      const buffer = await file.arrayBuffer();
      const pdfContext = await pdfPipeline.extract({
        url: file.name,
        title: file.name,
        binaryBuffer: buffer,
      });
      const text = pdfContext.text || '';
      return {
        id,
        name: file.name,
        size: file.size,
        type: 'application/pdf',
        isImage: false,
        extractedText: text,
        tokenEstimate: Math.ceil(text.length / 4),
      };
    } catch (err) {
      console.warn('[SideMind] Failed to parse PDF with pdf.js, falling back to raw read:', err);
    }
  }

  // Handle Text, Markdown, CSV, JSON, Code files
  const text = await readFileAsText(file);
  return {
    id,
    name: file.name,
    size: file.size,
    type: file.type || 'text/plain',
    isImage: false,
    extractedText: text,
    tokenEstimate: Math.ceil(text.length / 4),
  };
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read image "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}".`));
    reader.readAsText(file);
  });
}
