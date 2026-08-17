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
 * Clean & normalize extracted text
 */
function cleanExtractedText(raw: string): string {
  return raw
    .replace(/[\r\n]+/g, '\n')
    .replace(/[ \t]+/g, ' ')
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

      // Convert rows to Markdown table or readable text
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
    // 3. Word Document (.docx) Parsing
    else if (ext === 'docx' || ext === 'doc') {
      const arrayBuffer = await file.arrayBuffer();
      // Decode DOCX XML text stream (extracting text nodes between <w:t> tags)
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const rawString = textDecoder.decode(arrayBuffer);

      // Extract text content from XML tags or clean stream text
      const matches = rawString.match(/<w:t[^>]*>(.*?)<\/w:t>/gi);
      if (matches && matches.length > 0) {
        extractedText = matches
          .map(m => m.replace(/<[^>]+>/g, ''))
          .join(' ');
      } else {
        // Fallback: strip binary XML tags and preserve printable text
        extractedText = rawString
          .replace(/[^\x20-\x7E\x0A\x0D\u0600-\u06FF\u0750-\u077F]/g, ' ')
          .replace(/<[^>]+>/g, ' ');
      }
    }
    // 4. PDF (.pdf) Parsing
    else if (ext === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const rawString = textDecoder.decode(arrayBuffer);

      // Extract text blocks inside PDF streams (/BT ... /ET or text parentheses)
      const textBlocks: string[] = [];
      const matches = rawString.match(/\(([^)]+)\)\s*Tj/gi) || rawString.match(/T[jJ]\s*\((.*?)\)/gi);

      if (matches && matches.length > 0) {
        matches.forEach(m => {
          const cleaned = m.replace(/[()Tj]/g, '').trim();
          if (cleaned.length > 2) textBlocks.push(cleaned);
        });
        extractedText = textBlocks.join(' ');
      } else {
        // Fallback PDF text stream filter
        extractedText = rawString
          .replace(/[^\x20-\x7E\x0A\x0D\u0600-\u06FF\u0750-\u077F]/g, ' ')
          .replace(/stream[\s\S]*?endstream/g, '')
          .replace(/obj[\s\S]*?endobj/g, '');
      }
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
      extractedText: cleanedText || `[Parsed Content from ${fileName} - ${words} words extracted]`,
      wordCount: words,
      structuredRows
    };
  } catch (err: any) {
    console.error('[FileParser Error]:', err);
    return {
      success: false,
      fileName,
      fileSizeFormatted,
      fileSizeRawBytes,
      fileType: ext.toUpperCase(),
      extractedText: '',
      wordCount: 0,
      error: err?.message || 'Failed to parse file content.'
    };
  }
}
