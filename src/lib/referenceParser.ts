export interface RawParsedReference {
  title: string;
  authors: string;
  year: string;
  journalOrPublisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  keywords?: string[];
  sourceType: 'journal' | 'book' | 'website' | 'conference' | 'dataset';
  importedFrom: 'BibTeX' | 'RIS' | 'EndNote XML' | 'Manual';
}

/**
  Unescape common LaTeX character sequences in BibTeX
 */
function cleanBibValue(val: string): string {
  if (!val) return '';
  return val
    .replace(/^["'{]+|["'}]+\$?$/g, '')
    .replace(/\\["'`^~]\{?([a-zA-Z])\}?/g, '$1')
    .replace(/\\([&%$#_{}]) /g, '$1')
    .replace(/[{}]/g, '')
    .trim();
}

/**
 * 1. BibTeX (.bib) File & Text Parser
 */
export function parseBibTeX(bibText: string): RawParsedReference[] {
  const results: RawParsedReference[] = [];
  if (!bibText || !bibText.trim()) return results;

  const entryRegex = /@([a-zA-Z]+)\s*\{\s*([^,\s]+)\s*,([\s\S]*?)(?=\n@|\n*$)/gi;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(bibText)) !== null) {
    const entryType = match[1].toLowerCase();
    const body = match[3];

    const fields: Record<string, string> = {};
    const fieldRegex = /([a-zA-Z0-9_-]+)\s*=\s*(?:\{([\s\S]*?)\}|"([\s\S]*?)"|([^\n,{}]+))/g;
    let fieldMatch: RegExpExecArray | null;

    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const key = fieldMatch[1].toLowerCase();
      const val = fieldMatch[2] ?? fieldMatch[3] ?? fieldMatch[4] ?? '';
      fields[key] = cleanBibValue(val);
    }

    const title = fields.title || fields.booktitle || 'Untitled Publication';
    let authors = fields.author || fields.authors || 'Academic Researcher';
    authors = authors.replace(/\s+and\s+/gi, '; ');

    const year = fields.year || fields.date || '2024';
    const journal = fields.journal || fields.booktitle || fields.publisher || fields.howpublished || 'Academic Journal';
    const vol = fields.volume || '';
    const issue = fields.number || fields.issue || '';
    const pages = fields.pages ? fields.pages.replace(/--/g, '-') : '';
    const doi = fields.doi || '';
    const url = fields.url || '';
    const abstract = fields.abstract || '';
    const keywords = fields.keywords ? fields.keywords.split(/[,;]/).map(k => k.trim()) : undefined;

    let sourceType: RawParsedReference['sourceType'] = 'journal';
    if (['book', 'inbook', 'manual'].includes(entryType)) sourceType = 'book';
    if (['inproceedings', 'conference'].includes(entryType)) sourceType = 'conference';
    if (['online', 'webpage'].includes(entryType)) sourceType = 'website';

    results.push({
      title,
      authors,
      year,
      journalOrPublisher: journal,
      volume: vol,
      issue,
      pages,
      publisher: fields.publisher || journal,
      doi,
      url,
      abstract,
      keywords,
      sourceType,
      importedFrom: 'BibTeX'
    });
  }

  return results;
}

/**
 * 2. RIS (.ris) File & Text Parser
 */
export function parseRIS(risText: string): RawParsedReference[] {
  const results: RawParsedReference[] = [];
  if (!risText || !risText.trim()) return results;

  const entries = risText.split(/\n\s*ER\s*-\s*\n?/gi);

  for (const entry of entries) {
    if (!entry.trim()) continue;

    const lines = entry.split(/\r?\n/);
    let title = '';
    const authors: string[] = [];
    let year = '2024';
    let journal = '';
    let volume = '';
    let issue = '';
    let startPage = '';
    let endPage = '';
    let doi = '';
    let url = '';
    let abstract = '';
    const keywords: string[] = [];
    let typeTag = 'JOUR';

    for (const line of lines) {
      const match = line.match(/^([A-Z0-9]{2})\s*-\s*(.*)$/);
      if (!match) continue;

      const tag = match[1].toUpperCase();
      const val = match[2].trim();

      if (tag === 'TY') typeTag = val.toUpperCase();
      else if (tag === 'TI' || tag === 'T1' || tag === 'CT') title = val;
      else if (tag === 'AU' || tag === 'A1' || tag === 'A2') authors.push(val);
      else if (tag === 'PY' || tag === 'Y1') year = val.match(/\d{4}/)?.[0] || val;
      else if (tag === 'JO' || tag === 'JF' || tag === 'T2' || tag === 'PB') journal = val;
      else if (tag === 'VL') volume = val;
      else if (tag === 'IS') issue = val;
      else if (tag === 'SP') startPage = val;
      else if (tag === 'EP') endPage = val;
      else if (tag === 'DO') doi = val.replace(/^https?:\/\/doi\.org\//i, '');
      else if (tag === 'UR') url = val;
      else if (tag === 'AB' || tag === 'N1') abstract = val;
      else if (tag === 'KW') keywords.push(val);
    }

    if (title || authors.length > 0) {
      let sourceType: RawParsedReference['sourceType'] = 'journal';
      if (['BOOK', 'CHAP', 'EBOOK'].includes(typeTag)) sourceType = 'book';
      if (['CONF', 'CPAPER'].includes(typeTag)) sourceType = 'conference';
      if (['ELEC', 'WEB'].includes(typeTag)) sourceType = 'website';

      results.push({
        title: title || 'Untitled Publication',
        authors: authors.length > 0 ? authors.join('; ') : 'Academic Author',
        year,
        journalOrPublisher: journal || 'Academic Publication',
        volume,
        issue,
        pages: startPage && endPage ? `${startPage}-${endPage}` : startPage || endPage,
        publisher: journal,
        doi,
        url,
        abstract,
        keywords: keywords.length > 0 ? keywords : undefined,
        sourceType,
        importedFrom: 'RIS'
      });
    }
  }

  return results;
}

/**
 * 3. EndNote XML / ENW (.xml / .enw) File & Text Parser
 */
export function parseEndNote(text: string): RawParsedReference[] {
  const results: RawParsedReference[] = [];
  if (!text || !text.trim()) return results;

  // Handle EndNote ENW tagged format (%0, %T, %A, %D, %J, %V, %N, %P, %R, %U, %K)
  if (text.includes('%0')) {
    const entries = text.split(/\n\s*\n(?=%0)/gi);
    for (const entry of entries) {
      if (!entry.includes('%0')) continue;
      const lines = entry.split(/\r?\n/);
      let title = '';
      const authors: string[] = [];
      let year = '2024';
      let journal = '';
      let volume = '';
      let issue = '';
      let pages = '';
      let doi = '';
      let url = '';

      for (const line of lines) {
        const m = line.match(/^%([0-9A-Z])\s+(.*)$/i);
        if (!m) continue;
        const code = m[1].toUpperCase();
        const val = m[2].trim();

        if (code === 'T') title = val;
        else if (code === 'A') authors.push(val);
        else if (code === 'D') year = val;
        else if (code === 'J' || code === 'I') journal = val;
        else if (code === 'V') volume = val;
        else if (code === 'N') issue = val;
        else if (code === 'P') pages = val;
        else if (code === 'R') doi = val.replace(/^https?:\/\/doi\.org\//i, '');
        else if (code === 'U') url = val;
      }

      if (title || authors.length > 0) {
        results.push({
          title: title || 'Untitled EndNote Record',
          authors: authors.length > 0 ? authors.join('; ') : 'Academic Author',
          year,
          journalOrPublisher: journal || 'Academic Publication',
          volume,
          issue,
          pages,
          doi,
          url,
          sourceType: 'journal',
          importedFrom: 'EndNote XML'
        });
      }
    }
  } else {
    // EndNote XML Format
    const recordRegex = /<record>([\s\S]*?)<\/record>/gi;
    let recMatch: RegExpExecArray | null;

    while ((recMatch = recordRegex.exec(text)) !== null) {
      const rec = recMatch[1];
      const title = rec.match(/<title><style[^>]*>([\s\S]*?)<\/style><\/title>/i)?.[1]?.trim() || 'Untitled Record';
      const year = rec.match(/<year><style[^>]*>([\s\S]*?)<\/style><\/year>/i)?.[1]?.trim() || '2024';
      const journal = rec.match(/<secondary-title><style[^>]*>([\s\S]*?)<\/style><\/secondary-title>/i)?.[1]?.trim() || 'Academic Journal';
      const volume = rec.match(/<volume><style[^>]*>([\s\S]*?)<\/style><\/volume>/i)?.[1]?.trim() || '';
      const issue = rec.match(/<number><style[^>]*>([\s\S]*?)<\/style><\/number>/i)?.[1]?.trim() || '';
      const pages = rec.match(/<pages><style[^>]*>([\s\S]*?)<\/style><\/pages>/i)?.[1]?.trim() || '';
      const doi = rec.match(/<electronic-resource-num><style[^>]*>([\s\S]*?)<\/style><\/electronic-resource-num>/i)?.[1]?.trim() || '';

      const authorMatches = rec.match(/<author><style[^>]*>([\s\S]*?)<\/style><\/author>/gi);
      const authors = authorMatches
        ? authorMatches.map(m => m.replace(/<[^>]+>/g, '').trim()).join('; ')
        : 'Academic Author';

      results.push({
        title,
        authors,
        year,
        journalOrPublisher: journal,
        volume,
        issue,
        pages,
        doi,
        sourceType: 'journal',
        importedFrom: 'EndNote XML'
      });
    }
  }

  return results;
}

/**
 * Universal File Reference Parser
 */
export async function parseReferenceFile(file: File): Promise<RawParsedReference[]> {
  const text = await file.text();
  const name = file.name.toLowerCase();

  if (name.endsWith('.bib') || text.includes('@article') || text.includes('@book')) {
    return parseBibTeX(text);
  } else if (name.endsWith('.ris') || text.includes('TY  -')) {
    return parseRIS(text);
  } else if (name.endsWith('.xml') || name.endsWith('.enw') || text.includes('%0')) {
    return parseEndNote(text);
  }

  // Fallback: try BibTeX first, then RIS
  const bib = parseBibTeX(text);
  if (bib.length > 0) return bib;
  const ris = parseRIS(text);
  if (ris.length > 0) return ris;

  return [];
}
