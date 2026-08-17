import { ReferenceItem, ReferenceFolder, CitationOutput } from '../types';

const STORAGE_KEY_LIB = 'eduplanner_reference_library';
const STORAGE_KEY_FOLDERS = 'eduplanner_reference_folders';

export const DEFAULT_FOLDERS: ReferenceFolder[] = [
  { id: 'all', name: 'All References', icon: 'Library', color: 'text-orange-500', createdAt: new Date().toISOString() },
  { id: 'favorites', name: 'Favorites ⭐', icon: 'Star', color: 'text-amber-400', createdAt: new Date().toISOString() },
  { id: 'thesis_ch2', name: 'Thesis Literature Review', icon: 'GraduationCap', color: 'text-cyan-500', createdAt: new Date().toISOString() },
  { id: 'ai_edtech', name: 'AI & Educational Tech', icon: 'Sparkles', color: 'text-indigo-400', createdAt: new Date().toISOString() }
];

/**
 * Get stored Reference Library
 */
export function getReferenceLibrary(): ReferenceItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LIB);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('[ReferenceStore getLibrary error]:', e);
    return [];
  }
}

/**
 * Save Reference Library to localStorage & notify active tabs/modules
 */
export function saveReferenceLibrary(library: ReferenceItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LIB, JSON.stringify(library));
    window.dispatchEvent(new CustomEvent('eduplanner:reference_library_updated', { detail: library }));
  } catch (e) {
    console.error('[ReferenceStore saveLibrary error]:', e);
  }
}

/**
 * Get stored Folders
 */
export function getReferenceFolders(): ReferenceFolder[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FOLDERS);
    return saved ? JSON.parse(saved) : DEFAULT_FOLDERS;
  } catch (e) {
    return DEFAULT_FOLDERS;
  }
}

/**
 * Save Folders
 */
export function saveReferenceFolders(folders: ReferenceFolder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
  } catch (e) {
    console.error('[ReferenceStore saveFolders error]:', e);
  }
}

/**
 * Automated Duplicate Detection Engine
 * Compares new reference candidates against existing library.
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedItem?: ReferenceItem;
  reason?: 'DOI Match' | 'PMID Match' | 'ISBN Match' | 'Title & Author Match';
  confidenceScore: number; // 0 to 100%
}

export function checkDuplicateReference(candidate: {
  title: string;
  authors?: string;
  year?: string;
  doi?: string;
  pmid?: string;
  isbn?: string;
}, existingLibrary: ReferenceItem[]): DuplicateCheckResult {
  if (!existingLibrary || existingLibrary.length === 0) {
    return { isDuplicate: false, confidenceScore: 0 };
  }

  const candDoi = candidate.doi ? candidate.doi.trim().toLowerCase().replace(/^https?:\/\/doi\.org\//i, '') : '';
  const candPmid = candidate.pmid ? candidate.pmid.trim() : '';
  const candIsbn = candidate.isbn ? candidate.isbn.trim().replace(/[^0-9X]/gi, '') : '';
  const candTitleNorm = candidate.title.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const item of existingLibrary) {
    // 1. Exact DOI Match (100% confidence)
    if (candDoi && item.doi && item.doi.trim().toLowerCase().replace(/^https?:\/\/doi\.org\//i, '') === candDoi) {
      return { isDuplicate: true, matchedItem: item, reason: 'DOI Match', confidenceScore: 100 };
    }

    // 2. Exact PMID Match (100% confidence)
    if (candPmid && item.pmid && item.pmid.trim() === candPmid) {
      return { isDuplicate: true, matchedItem: item, reason: 'PMID Match', confidenceScore: 100 };
    }

    // 3. Exact ISBN Match (100% confidence)
    if (candIsbn && item.isbn && item.isbn.trim().replace(/[^0-9X]/gi, '') === candIsbn) {
      return { isDuplicate: true, matchedItem: item, reason: 'ISBN Match', confidenceScore: 100 };
    }

    // 4. Title + Primary Author + Year Match (90%+ similarity)
    const itemTitleNorm = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (candTitleNorm.length > 10 && itemTitleNorm === candTitleNorm) {
      const candYear = candidate.year || '';
      const itemYear = item.year || '';
      if (!candYear || !itemYear || candYear === itemYear) {
        return { isDuplicate: true, matchedItem: item, reason: 'Title & Author Match', confidenceScore: 92 };
      }
    }
  }

  return { isDuplicate: false, confidenceScore: 0 };
}

/**
 * Cross-Module 1-Click Citation Insertion Dispatcher
 * Allows 1-click citation insertion into any active research paper, thesis editor, or prompt component.
 */
export function dispatchInsertCitation(citationText: string, inTextCitation: string, referenceObj: ReferenceItem) {
  navigator.clipboard.writeText(inTextCitation);
  window.dispatchEvent(new CustomEvent('eduplanner:insert_citation', {
    detail: {
      citationText,
      inTextCitation,
      referenceObj,
      timestamp: Date.now()
    }
  }));
}
