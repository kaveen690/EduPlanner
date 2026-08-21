import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedFileResult {
  success: boolean;
  fileName: string;
  fileSizeFormatted: string;
  fileSizeRawBytes: number;
  fileType: string;
  extractedText: string;
  wordCount: number;
  structuredRows?: any[];
  error?: string;
}

/**
 * Format raw bytes into human-readable size string
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Helper to dynamically load script from CDN if not already loaded
 */
function loadExternalScript(src: string, globalCheck: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any)[globalCheck]) {
      return resolve((window as any)[globalCheck]);
    }
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any)[globalCheck]));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve((window as any)[globalCheck]);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Extract clean text from PDF using PDF.js with pure-text fallback
 */
async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const pdfjsLib = await loadExternalScript(
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
      'pdfjsLib'
    );
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      if (pageText.trim()) {
        fullText += pageText + '\n\n';
      }
    }

    if (fullText.trim()) {
      return fullText;
    }
  } catch (err) {
    console.warn('[PDF.js CDN Extract Warning, using fallback]:', err);
  }

  // Fallback PDF text stream parser: filter binary objects & stream markers
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  const rawString = textDecoder.decode(arrayBuffer);

  // Extract text blocks inside Tj or TJ operators
  const textBlocks: string[] = [];
  const matches = rawString.match(/\(([^)]+)\)\s*Tj/gi) || rawString.match(/T[jJ]\s*\((.*?)\)/gi);

  if (matches && matches.length > 0) {
    matches.forEach(m => {
      const cleaned = m.replace(/[()Tj]/g, '').trim();
      if (cleaned.length > 2 && !/^\d+\s+\d+$/.test(cleaned)) {
        textBlocks.push(cleaned);
      }
    });
  }

  if (textBlocks.length > 0) {
    return textBlocks.join(' ');
  }

  // Pure regex cleanup: strip binary headers like %PDF-1.5, objects, fonts, xrefs
  return rawString
    .replace(/%PDF-[\d.]+/gi, '')
    .replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/gi, '')
    .replace(/stream[\s\S]*?endstream/gi, '')
    .replace(/xref[\s\S]*?trailer/gi, '')
    .replace(/[^\x20-\x7E\x0A\x0D\u0600-\u06FF\u0750-\u077F]/g, ' ')
    .replace(/\b(obj|endobj|stream|endstream|Filter|FlateDecode|Length|Type|Font|Page|Catalog|Parent|Resources|MediaBox|Contents)\b/gi, '')
    .replace(/\b\d+\s+\d+\b/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Extract clean text from DOCX using JSZip
 */
async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const JSZip = await loadExternalScript(
      'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
      'JSZip'
    );
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXmlFile = zip.file('word/document.xml');

    if (docXmlFile) {
      const xmlText = await docXmlFile.async('text');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const paragraphs = Array.from(xmlDoc.getElementsByTagName('w:p'));

      const extractedParagraphs: string[] = [];
      paragraphs.forEach(p => {
        const textNodes = Array.from(p.getElementsByTagName('w:t'));
        const pText = textNodes.map(t => t.textContent || '').join('');
        if (pText.trim()) {
          extractedParagraphs.push(pText.trim());
        }
      });

      if (extractedParagraphs.length > 0) {
        return extractedParagraphs.join('\n\n');
      }
    }
  } catch (err) {
    console.warn('[JSZip DOCX Extract Warning, using fallback]:', err);
  }

  // Fallback XML Tag Stripper for DOCX
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  const rawString = textDecoder.decode(arrayBuffer);
  const matches = rawString.match(/<w:t[^>]*>(.*?)<\/w:t>/gi);

  if (matches && matches.length > 0) {
    return matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
  }

  return rawString
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\x20-\x7E\x0A\x0D\u0600-\u06FF\u0750-\u077F]/g, ' ');
}

/**
 * Clean & normalize extracted text
 */
function cleanExtractedText(raw: string): string {
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      if (!line) return false;
      // Filter out raw PDF/XML binary artifacts
      if (/^%PDF/i.test(line)) return false;
      if (/^\d+\s+\d+\s+obj/i.test(line)) return false;
      if (/^<<\/.*>>$/.test(line)) return false;
      if (/^PK\x03\x04/i.test(line)) return false;
      return true;
    })
    .join('\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Main Multi-Format File Text & Data Extraction Engine
 */
export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const fileName = file.name;
  const fileSizeRawBytes = file.size;
  const fileSizeFormatted = formatBytes(file.size);
  const ext = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();

  try {
    let extractedText = '';
    let structuredRows: any[] | undefined = undefined;

    // 1. CSV (.csv) Parsing via PapaParse
    if (ext === 'csv') {
      const textContent = await file.text();
      const parsed = Papa.parse(textContent, { header: true, skipEmptyLines: true });
      structuredRows = parsed.data;

      if (parsed.data && parsed.data.length > 0) {
        const headers = Object.keys(parsed.data[0] as object);
        const headerRow = `| ${headers.join(' | ')} |`;
        const dividerRow = `| ${headers.map(() => '---').join(' | ')} |`;
        const dataRows = parsed.data.slice(0, 100).map((row: any) =>
          `| ${headers.map(h => row[h] ?? '').join(' | ')} |`
        );

        extractedText = `Dataset Preview (${parsed.data.length} Total Rows):\n\n${headerRow}\n${dividerRow}\n${dataRows.join('\n')}`;
      } else {
        extractedText = textContent;
      }
    }
    // 2. Excel (.xlsx, .xls) Parsing via SheetJS (XLSX)
    else if (ext === 'xlsx' || ext === 'xls') {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetNames = workbook.SheetNames;

      const sheetsText: string[] = [];
      sheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const csvText = XLSX.utils.sheet_to_csv(worksheet);
        if (csvText.trim()) {
          sheetsText.push(`--- Sheet: ${sheetName} ---\n${csvText}`);
        }
      });

      extractedText = sheetsText.join('\n\n');
    }
    // 3. Word Document (.docx, .doc) Parsing
    else if (ext === 'docx' || ext === 'doc') {
      const arrayBuffer = await file.arrayBuffer();
      extractedText = await extractTextFromDocx(arrayBuffer);
    }
    // 4. PDF (.pdf) Parsing via PDF.js
    else if (ext === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      extractedText = await extractTextFromPdf(arrayBuffer);
    }
    // 5. Plain Text (.txt, .md, .json)
    else {
      extractedText = await file.text();
    }

    const cleanedText = cleanExtractedText(extractedText);
    const words = cleanedText.trim() ? cleanedText.split(/\s+/).length : 0;

    return {
      success: true,
      fileName,
      fileSizeFormatted,
      fileSizeRawBytes,
      fileType: ext.toUpperCase(),
      extractedText: cleanedText || `[Extracted Content from ${fileName} - ${words} words parsed]`,
      wordCount: words,
      structuredRows
    };
  } catch (err: any) {
    console.error('[File Parser Error]:', err);
    return {
      success: false,
      fileName,
      fileSizeFormatted,
      fileSizeRawBytes,
      fileType: ext.toUpperCase(),
      extractedText: '',
      wordCount: 0,
      error: err?.message || 'Failed to extract text from file.'
    };
  }
}
