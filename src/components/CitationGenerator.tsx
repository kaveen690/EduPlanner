import React, { useState, useEffect } from 'react';
import {
  Quote,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  Globe,
  RefreshCw,
  AlertCircle,
  Download,
  Trash2,
  Plus,
  FileText,
  ListOrdered,
  Search,
  Link,
  Barcode,
  CheckCircle2,
  FileCode,
  History,
  Layers,
  HelpCircle,
  ExternalLink,
  Sliders,
  X,
  FolderOpen,
  FolderPlus,
  Star,
  Tag,
  FileUp,
  Filter,
  ArrowUpDown,
  BookMarked,
  Info,
  Send,
  Edit3,
  Wand2,
  ShieldCheck,
  Brain,
  FileDown,
  Clock,
  CheckSquare,
  Square
} from 'lucide-react';
import { ReferenceItem, ReferenceFolder, CitationOutput, Language, ProjectItem, AcademicSearchResultItem } from '../types';
import { aiService } from '../services/aiService';
import {
  exportBibliographyToWord,
  exportBibliographyToPdf,
  exportLibraryToBibtex,
  exportLibraryToRis,
  exportLibraryToEndnoteXml,
  exportLibraryToWord,
  exportLibraryToPdf,
  exportLibraryToCsv
} from '../lib/exportUtils';
import { isRTL } from '../lib/i18n';
import { parseReferenceFile, parseBibTeX, parseRIS, parseEndNote, RawParsedReference } from '../lib/referenceParser';
import {
  getReferenceLibrary,
  saveReferenceLibrary,
  getReferenceFolders,
  saveReferenceFolders,
  checkDuplicateReference,
  dispatchInsertCitation
} from '../lib/referenceStore';

interface CitationGeneratorProps {
  lang: Language;
  onSaveProject: (item: ProjectItem) => void;
}

export const CitationGenerator: React.FC<CitationGeneratorProps> = ({
  lang,
  onSaveProject
}) => {
  // Library & Folders State
  const [library, setLibrary] = useState<ReferenceItem[]>(() => getReferenceLibrary());
  const [folders, setFolders] = useState<ReferenceFolder[]>(() => getReferenceFolders());
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');

  // New Folder Modal State
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Selected Reference Item for Inspector / Detail View
  const [selectedReference, setSelectedReference] = useState<ReferenceItem | null>(null);

  // Citation Active Style Tab (APA 7, MLA, IEEE, Chicago, Harvard, Vancouver)
  const [activeStyleTab, setActiveStyleTab] = useState<'apa7' | 'apa6' | 'mla9' | 'chicago17' | 'harvard' | 'ieee' | 'vancouver'>('apa7');

  // Identifier Resolver & Quick Input State
  const [identifierInput, setIdentifierInput] = useState('');
  const [identifierType, setIdentifierType] = useState<'Auto' | 'DOI' | 'PMID' | 'ISBN' | 'URL' | 'CrossRef'>('Auto');
  const [resolving, setResolving] = useState(false);

  // Manual Reference Creation Form Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthors, setManualAuthors] = useState('');
  const [manualYear, setManualYear] = useState(new Date().getFullYear().toString());
  const [manualJournal, setManualJournal] = useState('');
  const [manualVolume, setManualVolume] = useState('');
  const [manualIssue, setManualIssue] = useState('');
  const [manualPages, setManualPages] = useState('');
  const [manualDoi, setManualDoi] = useState('');
  const [manualIsbn, setManualIsbn] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualAbstract, setManualAbstract] = useState('');
  const [manualSourceType, setManualSourceType] = useState<'journal' | 'book' | 'website' | 'conference' | 'dataset'>('journal');

  // File / Raw Text Import Modal State (BibTeX, RIS, EndNote XML)
  const [showImportModal, setShowImportModal] = useState(false);
  const [rawImportText, setRawImportText] = useState('');
  const [importSourceType, setImportSourceType] = useState<'BibTeX' | 'RIS' | 'EndNote XML' | 'Auto'>('Auto');

  // Google Scholar Live Search Modal State
  const [showScholarModal, setShowScholarModal] = useState(false);
  const [scholarQuery, setScholarQuery] = useState('');
  const [scholarYear, setScholarYear] = useState('2024');
  const [searchingScholar, setSearchingScholar] = useState(false);
  const [scholarResults, setScholarResults] = useState<AcademicSearchResultItem[]>([]);
  const [scholarError, setScholarError] = useState<string | null>(null);

  // AI Helper Features State (Verify DOI, Missing Metadata, Suggest Related)
  const [verifyingDoi, setVerifyingDoi] = useState(false);
  const [findingMetadata, setFindingMetadata] = useState(false);
  const [suggestingRelated, setSuggestingRelated] = useState(false);
  const [showSuggestedModal, setShowSuggestedModal] = useState(false);
  const [suggestedPapers, setSuggestedPapers] = useState<AcademicSearchResultItem[]>([]);

  // Duplicate Detection Resolution State
  const [pendingDuplicates, setPendingDuplicates] = useState<{ candidate: ReferenceItem; existing: ReferenceItem; reason: string }[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dateDesc' | 'dateAsc' | 'titleAsc' | 'authorAsc' | 'yearDesc'>('dateDesc');

  // Inspector Editing State (Notes & Tags)
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  // Selection & Feedback States
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedInTextKey, setCopiedInTextKey] = useState<string | null>(null);
  const [insertedCitationKey, setInsertedCitationKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outputLang, setOutputLang] = useState<Language>(lang);

  const rtl = isRTL(outputLang);

  // Sync Library & Folders to localStorage
  useEffect(() => {
    saveReferenceLibrary(library);
  }, [library]);

  useEffect(() => {
    saveReferenceFolders(folders);
  }, [folders]);

  // Set default selected reference if none selected
  useEffect(() => {
    if (!selectedReference && library.length > 0) {
      setSelectedReference(library[0]);
      setNotesText(library[0].notes || '');
    }
  }, [library]);

  // --- Folder Management Handlers ---
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: ReferenceFolder = {
      id: `folder_${Date.now()}`,
      name: newFolderName.trim(),
      icon: 'Folder',
      color: 'text-orange-400',
      createdAt: new Date().toISOString()
    };
    setFolders(prev => [...prev, newFolder]);
    setSelectedFolderId(newFolder.id);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (folderId === 'all' || folderId === 'favorites' || folderId === 'recent') return;
    setFolders(prev => prev.filter(f => f.id !== folderId));
    setLibrary(prev => prev.map(item => item.folderId === folderId ? { ...item, folderId: 'all' } : item));
    if (selectedFolderId === folderId) setSelectedFolderId('all');
  };

  // --- Reference Insertion & Duplicate Detection Handler ---
  const addReferencesToLibrary = (candidates: ReferenceItem[]) => {
    const dups: { candidate: ReferenceItem; existing: ReferenceItem; reason: string }[] = [];
    const cleanItems: ReferenceItem[] = [];

    candidates.forEach(cand => {
      const dupCheck = checkDuplicateReference(cand, library);
      if (dupCheck.isDuplicate && dupCheck.matchedItem) {
        dups.push({
          candidate: cand,
          existing: dupCheck.matchedItem,
          reason: dupCheck.reason || 'Duplicate Detected'
        });
      } else {
        cleanItems.push(cand);
      }
    });

    if (cleanItems.length > 0) {
      setLibrary(prev => [...cleanItems, ...prev]);
      if (!selectedReference && cleanItems.length > 0) {
        setSelectedReference(cleanItems[0]);
        setNotesText(cleanItems[0].notes || '');
      }
    }

    if (dups.length > 0) {
      setPendingDuplicates(dups);
      setShowDuplicateModal(true);
    }
  };

  // Duplicate Resolution Actions
  const handleResolveDuplicate = (action: 'merge' | 'keep' | 'skip', candidate: ReferenceItem, existing: ReferenceItem) => {
    if (action === 'keep') {
      const copyItem = { ...candidate, id: `ref_${Date.now()}_${Math.random().toString(36).substring(7)}`, title: `${candidate.title} (Copy)` };
      setLibrary(prev => [copyItem, ...prev]);
    } else if (action === 'merge') {
      setLibrary(prev => prev.map(item => {
        if (item.id === existing.id) {
          return {
            ...item,
            doi: candidate.doi || item.doi,
            pmid: candidate.pmid || item.pmid,
            isbn: candidate.isbn || item.isbn,
            abstract: candidate.abstract || item.abstract,
            keywords: Array.from(new Set([...(item.keywords || []), ...(candidate.keywords || [])])),
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      }));
    }

    setPendingDuplicates(prev => prev.filter(d => d.candidate.id !== candidate.id));
    if (pendingDuplicates.length <= 1) setShowDuplicateModal(false);
  };

  // Manual Scan for Library Duplicates
  const handleScanDuplicates = () => {
    const dups: { candidate: ReferenceItem; existing: ReferenceItem; reason: string }[] = [];
    const seenIds = new Set<string>();

    for (let i = 0; i < library.length; i++) {
      for (let j = i + 1; j < library.length; j++) {
        const itemA = library[i];
        const itemB = library[j];
        if (seenIds.has(itemB.id)) continue;

        if (itemA.doi && itemB.doi && itemA.doi.toLowerCase().trim() === itemB.doi.toLowerCase().trim()) {
          dups.push({ candidate: itemB, existing: itemA, reason: 'Identical DOI Match' });
          seenIds.add(itemB.id);
        } else if (itemA.title.toLowerCase().trim() === itemB.title.toLowerCase().trim()) {
          dups.push({ candidate: itemB, existing: itemA, reason: 'Exact Publication Title Match' });
          seenIds.add(itemB.id);
        }
      }
    }

    if (dups.length > 0) {
      setPendingDuplicates(dups);
      setShowDuplicateModal(true);
    } else {
      setScanMessage('No duplicate references detected in your library!');
      setTimeout(() => setScanMessage(null), 3000);
    }
  };

  // --- Manual Reference Creation Handler ---
  const handleCreateManualReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualAuthors.trim()) return;

    const PrimarySurname = manualAuthors.trim().split(' ')[0] || 'Author';
    const yearStr = manualYear.trim() || new Date().getFullYear().toString();
    const journalStr = manualJournal.trim() || 'Academic Publication';

    const apa7 = `${manualAuthors} (${yearStr}). ${manualTitle}. *${journalStr}*${manualVolume ? `, ${manualVolume}` : ''}${manualPages ? `, pp. ${manualPages}` : ''}.${manualDoi ? ` https://doi.org/${manualDoi}` : ''}`;
    const apa6 = `${manualAuthors} (${yearStr}). ${manualTitle}. *${journalStr}*${manualVolume ? `, ${manualVolume}` : ''}.${manualDoi ? ` doi:${manualDoi}` : ''}`;
    const mla9 = `${manualAuthors}. "${manualTitle}." *${journalStr}*, ${yearStr}${manualPages ? `, pp. ${manualPages}` : ''}.`;
    const chicago17 = `${manualAuthors}. "${manualTitle}." *${journalStr}* (${yearStr}).`;
    const harvard = `${manualAuthors}, ${yearStr}. ${manualTitle}. *${journalStr}*.`;
    const ieee = `${manualAuthors}, "${manualTitle}," *${journalStr}*, ${yearStr}.`;
    const vancouver = `${manualAuthors}. ${manualTitle}. ${journalStr}. ${yearStr}.`;
    const bibtex = `@article{manual_${Date.now()},\n  author = {${manualAuthors}},\n  title = {${manualTitle}},\n  journal = {${journalStr}},\n  year = {${yearStr}}\n}`;

    const newRef: ReferenceItem = {
      id: `ref_manual_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title: manualTitle.trim(),
      authors: manualAuthors.trim(),
      year: yearStr,
      journalOrPublisher: journalStr,
      volume: manualVolume.trim(),
      issue: manualIssue.trim(),
      pages: manualPages.trim(),
      doi: manualDoi.trim(),
      isbn: manualIsbn.trim(),
      publisherUrl: manualUrl.trim(),
      abstract: manualAbstract.trim(),
      folderId: selectedFolderId === 'favorites' || selectedFolderId === 'recent' ? 'all' : selectedFolderId,
      tags: ['Manual Entry', manualSourceType.toUpperCase()],
      sourceType: manualSourceType,
      importedFrom: 'Manual',
      citations: { apa7, apa6, mla9, chicago17, harvard, ieee, vancouver, bibtex },
      inTextCitations: {
        apa7Parenthetical: `(${PrimarySurname} et al., ${yearStr})`,
        apa7Narrative: `${PrimarySurname} et al. (${yearStr})`,
        mla9: `(${PrimarySurname} ${manualPages ? manualPages.split('-')[0] : ''})`,
        chicago17: `(${PrimarySurname} ${yearStr})`,
        harvard: `(${PrimarySurname} et al., ${yearStr})`,
        ieee: `[1]`,
        vancouver: `(1)`
      },
      exports: {
        ris: `TY  - JOUR\nTI  - ${manualTitle}\nAU  - ${manualAuthors}\nPY  - ${yearStr}\nER  - \n`,
        bibtex,
        endnote: `%0 Journal Article\n%T ${manualTitle}\n%A ${manualAuthors}\n%D ${yearStr}\n`
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addReferencesToLibrary([newRef]);

    // Reset Form
    setManualTitle('');
    setManualAuthors('');
    setManualJournal('');
    setManualVolume('');
    setManualIssue('');
    setManualPages('');
    setManualDoi('');
    setManualIsbn('');
    setManualUrl('');
    setManualAbstract('');
    setShowManualModal(false);

    onSaveProject({
      id: newRef.id,
      type: 'citation',
      title: `Manual Ref: ${newRef.title}`,
      language: outputLang,
      date: newRef.createdAt,
      data: newRef
    });
  };

  // --- Live Identifier Resolver (DOI, PMID, ISBN, URL, CrossRef) ---
  const handleResolveIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifierInput.trim()) return;

    setResolving(true);
    setError(null);

    try {
      const data: CitationOutput = await aiService.resolveIdentifier({
        identifier: identifierInput.trim(),
        type: identifierType,
        language: outputLang
      });

      const refItem: ReferenceItem = {
        id: data.id || `ref_${Date.now()}`,
        title: data.title,
        authors: data.authors,
        year: data.year,
        journalOrPublisher: data.journalOrPublisher,
        volume: data.volume,
        issue: data.issue,
        pages: data.pages,
        publisher: data.publisher,
        publisherUrl: data.publisherUrl,
        doi: data.doi,
        pmid: data.pmid,
        isbn: data.isbn,
        abstract: data.abstract,
        keywords: data.keywords,
        folderId: selectedFolderId === 'favorites' || selectedFolderId === 'recent' ? 'all' : selectedFolderId,
        tags: ['Imported', data.identifierType || 'Resolved'],
        sourceType: (data.sourceType as any) || 'journal',
        importedFrom: (data.identifierType as any) || 'DOI',
        citations: {
          apa7: data.citations.apa7 || data.citations.apa || '',
          apa6: data.citations.apa6 || '',
          mla9: data.citations.mla9 || data.citations.mla || '',
          chicago17: data.citations.chicago17 || data.citations.chicago || '',
          harvard: data.citations.harvard || '',
          ieee: data.citations.ieee || '',
          vancouver: data.citations.vancouver || '',
          bibtex: data.citations.bibtex || ''
        },
        inTextCitations: data.inTextCitations,
        exports: data.exports,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      addReferencesToLibrary([refItem]);
      setIdentifierInput('');

      onSaveProject({
        id: refItem.id,
        type: 'citation',
        title: `Ref: ${refItem.title}`,
        language: outputLang,
        date: refItem.createdAt,
        data: refItem
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Failed to resolve metadata for "${identifierInput}". Please verify identifier.`);
    } finally {
      setResolving(false);
    }
  };

  // --- Multi-Format File & Text Stream Import Handler (BibTeX, RIS, EndNote XML) ---
  const handleImportTextOrFile = async (rawText?: string) => {
    const content = rawText || rawImportText;
    if (!content || !content.trim()) return;

    let parsedList: RawParsedReference[] = [];
    if (importSourceType === 'BibTeX' || content.includes('@article')) {
      parsedList = parseBibTeX(content);
    } else if (importSourceType === 'RIS' || content.includes('TY  -')) {
      parsedList = parseRIS(content);
    } else if (importSourceType === 'EndNote XML' || content.includes('%0') || content.includes('<record>')) {
      parsedList = parseEndNote(content);
    } else {
      parsedList = [...parseBibTeX(content), ...parseRIS(content), ...parseEndNote(content)];
    }

    if (parsedList.length === 0) {
      setError('No valid BibTeX, RIS, or EndNote XML reference structures found in input text/file.');
      return;
    }

    const convertedItems: ReferenceItem[] = parsedList.map((raw, idx) => {
      const PrimarySurname = raw.authors.split(' ')[0] || 'Author';
      const apa7 = `${raw.authors} (${raw.year}). ${raw.title}. *${raw.journalOrPublisher || 'Journal'}*${raw.volume ? `, ${raw.volume}` : ''}${raw.pages ? `, pp. ${raw.pages}` : ''}.${raw.doi ? ` https://doi.org/${raw.doi}` : ''}`;
      const apa6 = `${raw.authors} (${raw.year}). ${raw.title}. *${raw.journalOrPublisher || 'Journal'}*${raw.volume ? `, ${raw.volume}` : ''}.${raw.doi ? ` doi:${raw.doi}` : ''}`;
      const mla9 = `${raw.authors}. "${raw.title}." *${raw.journalOrPublisher || 'Journal'}*, ${raw.year}${raw.pages ? `, pp. ${raw.pages}` : ''}.`;
      const chicago17 = `${raw.authors}. "${raw.title}." *${raw.journalOrPublisher || 'Journal'}* (${raw.year}).`;
      const harvard = `${raw.authors}, ${raw.year}. ${raw.title}. *${raw.journalOrPublisher || 'Journal'}*.`;
      const ieee = `${raw.authors}, "${raw.title}," *${raw.journalOrPublisher || 'Journal'}*, ${raw.year}.`;
      const vancouver = `${raw.authors}. ${raw.title}. ${raw.journalOrPublisher || 'Journal'}. ${raw.year}.`;
      const bibtex = `@article{ref_${idx}_${Date.now()},\n  author = {${raw.authors}},\n  title = {${raw.title}},\n  journal = {${raw.journalOrPublisher || 'Journal'}},\n  year = {${raw.year}}\n}`;

      return {
        id: `ref_${Date.now()}_${idx}_${Math.random().toString(36).substring(7)}`,
        title: raw.title,
        authors: raw.authors,
        year: raw.year,
        journalOrPublisher: raw.journalOrPublisher,
        volume: raw.volume,
        issue: raw.issue,
        pages: raw.pages,
        publisher: raw.publisher,
        publisherUrl: raw.url,
        doi: raw.doi,
        abstract: raw.abstract,
        keywords: raw.keywords,
        folderId: selectedFolderId === 'favorites' || selectedFolderId === 'recent' ? 'all' : selectedFolderId,
        tags: [raw.importedFrom, 'Imported'],
        sourceType: raw.sourceType,
        importedFrom: raw.importedFrom,
        citations: { apa7, apa6, mla9, chicago17, harvard, ieee, vancouver, bibtex },
        inTextCitations: {
          apa7Parenthetical: `(${PrimarySurname} et al., ${raw.year})`,
          apa7Narrative: `${PrimarySurname} et al. (${raw.year})`,
          mla9: `(${PrimarySurname} ${raw.pages ? raw.pages.split('-')[0] : ''})`,
          chicago17: `(${PrimarySurname} ${raw.year})`,
          harvard: `(${PrimarySurname} et al., ${raw.year})`,
          ieee: `[1]`,
          vancouver: `(1)`
        },
        exports: {
          ris: `TY  - JOUR\nTI  - ${raw.title}\nAU  - ${raw.authors}\nPY  - ${raw.year}\nER  - \n`,
          bibtex,
          endnote: `%0 Journal Article\n%T ${raw.title}\n%A ${raw.authors}\n%D ${raw.year}\n`
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    addReferencesToLibrary(convertedItems);
    setRawImportText('');
    setShowImportModal(false);
  };

  const handleImportFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const parsedList = await parseReferenceFile(file);
      if (parsedList.length > 0) {
        const text = await file.text();
        handleImportTextOrFile(text);
      } else {
        setError(`Unable to parse reference records from file ${file.name}.`);
      }
    }
  };

  // --- Google Scholar Search & Import Handler ---
  const handleScholarSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scholarQuery.trim()) return;

    setSearchingScholar(true);
    setScholarError(null);

    try {
      const res = await aiService.searchAcademicPapers({
        query: scholarQuery.trim(),
        year: scholarYear,
        language: outputLang
      });

      if (res && res.results && res.results.length > 0) {
        setScholarResults(res.results);
      } else {
        setScholarError(`No publications found matching "${scholarQuery}". Try refining search term.`);
      }
    } catch (err: any) {
      setScholarError(err?.message || 'Academic search failed.');
    } finally {
      setSearchingScholar(false);
    }
  };

  const handleImportScholarPaper = (item: AcademicSearchResultItem) => {
    const authorsStr = Array.isArray(item.authors) ? item.authors.join('; ') : item.authors;
    const PrimarySurname = authorsStr.split(' ')[0] || 'Author';

    const refItem: ReferenceItem = {
      id: `scholar_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title: item.title,
      authors: authorsStr,
      year: String(item.year || 2024),
      journalOrPublisher: item.journalOrConference || 'Google Scholar Index',
      doi: item.doi,
      publisherUrl: item.url,
      abstract: item.abstract,
      keywords: [item.source, 'Google Scholar'],
      folderId: selectedFolderId === 'favorites' || selectedFolderId === 'recent' ? 'all' : selectedFolderId,
      tags: ['Scholar Import', item.source],
      sourceType: 'journal',
      importedFrom: 'Google Scholar',
      citations: {
        apa7: `${authorsStr} (${item.year}). ${item.title}. *${item.journalOrConference}*.${item.doi ? ` https://doi.org/${item.doi}` : ''}`,
        apa6: `${authorsStr} (${item.year}). ${item.title}. *${item.journalOrConference}*.`,
        mla9: `${authorsStr}. "${item.title}." *${item.journalOrConference}*, ${item.year}.`,
        chicago17: `${authorsStr}. "${item.title}." *${item.journalOrConference}* (${item.year}).`,
        harvard: `${authorsStr}, ${item.year}. ${item.title}. *${item.journalOrConference}*.`,
        ieee: `${authorsStr}, "${item.title}," *${item.journalOrConference}*, ${item.year}.`,
        vancouver: `${authorsStr}. ${item.title}. ${item.journalOrConference}. ${item.year}.`,
        bibtex: `@article{scholar_${Date.now()},\n  author = {${authorsStr}},\n  title = {${item.title}},\n  journal = {${item.journalOrConference}},\n  year = {${item.year}}\n}`
      },
      inTextCitations: {
        apa7Parenthetical: `(${PrimarySurname} et al., ${item.year})`,
        apa7Narrative: `${PrimarySurname} et al. (${item.year})`,
        mla9: `(${PrimarySurname})`,
        chicago17: `(${PrimarySurname} ${item.year})`,
        harvard: `(${PrimarySurname} et al., ${item.year})`,
        ieee: `[1]`,
        vancouver: `(1)`
      },
      exports: {
        ris: `TY  - JOUR\nTI  - ${item.title}\nAU  - ${authorsStr}\nPY  - ${item.year}\nER  - \n`,
        bibtex: `@article{scholar_${Date.now()},\n  author = {${authorsStr}},\n  title = {${item.title}},\n  year = {${item.year}}\n}`,
        endnote: `%0 Journal Article\n%T ${item.title}\n%A ${authorsStr}\n%D ${item.year}\n`
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addReferencesToLibrary([refItem]);
  };

  // --- AI Feature Handlers (Verify DOI, Missing Metadata, Suggest Related) ---
  const handleVerifyDoi = async (ref: ReferenceItem) => {
    if (!ref.doi) return;
    setVerifyingDoi(true);
    try {
      const res = await aiService.lookupDoi(ref.doi);
      if (res && res.result) {
        setLibrary(prev => prev.map(item => item.id === ref.id ? {
          ...item,
          title: res.result.title || item.title,
          authors: Array.isArray(res.result.authors) ? res.result.authors.join('; ') : (res.result.authors || item.authors),
          year: String(res.result.year || item.year),
          journalOrPublisher: res.result.journalOrConference || item.journalOrPublisher,
          abstract: res.result.abstract || item.abstract,
          tags: Array.from(new Set([...(item.tags || []), 'Verified DOI'])),
          updatedAt: new Date().toISOString()
        } : item));

        if (selectedReference?.id === ref.id) {
          setSelectedReference(prev => prev ? {
            ...prev,
            title: res.result.title || prev.title,
            tags: Array.from(new Set([...(prev.tags || []), 'Verified DOI']))
          } : null);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setVerifyingDoi(false);
    }
  };

  const handleFindMissingMetadata = async (ref: ReferenceItem) => {
    setFindingMetadata(true);
    try {
      const res = await aiService.resolveIdentifier({
        identifier: ref.doi || ref.title,
        type: ref.doi ? 'DOI' : 'Auto',
        language: outputLang
      });

      setLibrary(prev => prev.map(item => item.id === ref.id ? {
        ...item,
        volume: item.volume || res.volume,
        issue: item.issue || res.issue,
        pages: item.pages || res.pages,
        abstract: item.abstract || res.abstract,
        publisher: item.publisher || res.publisher,
        publisherUrl: item.publisherUrl || res.publisherUrl,
        tags: Array.from(new Set([...(item.tags || []), 'AI Enriched'])),
        updatedAt: new Date().toISOString()
      } : item));

      if (selectedReference?.id === ref.id) {
        setSelectedReference(prev => prev ? {
          ...prev,
          volume: prev.volume || res.volume,
          issue: prev.issue || res.issue,
          pages: prev.pages || res.pages,
          abstract: prev.abstract || res.abstract,
          tags: Array.from(new Set([...(prev.tags || []), 'AI Enriched']))
        } : null);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setFindingMetadata(false);
    }
  };

  const handleSuggestRelatedReferences = async (ref: ReferenceItem) => {
    setSuggestingRelated(true);
    try {
      const query = `${ref.title} ${ref.journalOrPublisher || ''}`;
      const res = await aiService.searchAcademicPapers({ query, language: outputLang });
      if (res && res.results && res.results.length > 0) {
        setSuggestedPapers(res.results.filter(p => p.title.toLowerCase() !== ref.title.toLowerCase()).slice(0, 5));
        setShowSuggestedModal(true);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setSuggestingRelated(false);
    }
  };

  // --- Reference Inspector Actions ---
  const handleToggleFavorite = (refId: string) => {
    setLibrary(prev => prev.map(item => item.id === refId ? { ...item, isFavorite: !item.isFavorite } : item));
    if (selectedReference && selectedReference.id === refId) {
      setSelectedReference(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const handleAddTag = (refId: string) => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().replace(/^#/, '');
    setLibrary(prev => prev.map(item => {
      if (item.id === refId) {
        const existingTags = item.tags || [];
        if (!existingTags.includes(cleanTag)) {
          return { ...item, tags: [...existingTags, cleanTag] };
        }
      }
      return item;
    }));

    if (selectedReference && selectedReference.id === refId) {
      const currentTags = selectedReference.tags || [];
      if (!currentTags.includes(cleanTag)) {
        setSelectedReference({ ...selectedReference, tags: [...currentTags, cleanTag] });
      }
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (refId: string, tagToRemove: string) => {
    setLibrary(prev => prev.map(item => item.id === refId ? { ...item, tags: (item.tags || []).filter(t => t !== tagToRemove) } : item));
    if (selectedReference && selectedReference.id === refId) {
      setSelectedReference({ ...selectedReference, tags: (selectedReference.tags || []).filter(t => t !== tagToRemove) });
    }
  };

  const handleSaveNotes = (refId: string) => {
    setLibrary(prev => prev.map(item => item.id === refId ? { ...item, notes: notesText } : item));
    if (selectedReference && selectedReference.id === refId) {
      setSelectedReference({ ...selectedReference, notes: notesText });
    }
    setEditingNotes(false);
  };

  const handleDeleteReference = (refId: string) => {
    setLibrary(prev => prev.filter(item => item.id !== refId));
    if (selectedReference && selectedReference.id === refId) {
      setSelectedReference(library.find(i => i.id !== refId) || null);
    }
  };

  // 1-Click Citation Insertion Action
  const handleInsertCitationToPaper = (ref: ReferenceItem) => {
    const inText = ref.inTextCitations[activeStyleTab === 'apa7' || activeStyleTab === 'apa6' ? 'apa7Parenthetical' : activeStyleTab] || ref.inTextCitations.apa7Parenthetical;
    const refText = ref.citations[activeStyleTab] || ref.citations.apa7;

    dispatchInsertCitation(refText, inText, ref);
    setInsertedCitationKey(ref.id);
    setTimeout(() => setInsertedCitationKey(null), 2500);
  };

  // Multi-Select Item Toggle
  const toggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAllFiltered = () => {
    if (selectedItemIds.length === filteredLibrary.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredLibrary.map(i => i.id));
    }
  };

  // --- Filtering & Sorting Calculations ---
  const allTags = Array.from(new Set(library.flatMap(i => i.tags || [])));

  const filteredLibrary = library.filter(item => {
    // 1. Folder filter
    if (selectedFolderId === 'favorites' && !item.isFavorite) return false;
    if (selectedFolderId === 'recent') {
      const now = new Date().getTime();
      const itemTime = new Date(item.createdAt).getTime();
      if (now - itemTime > 7 * 24 * 60 * 60 * 1000) return false; // Within 7 days
    }
    if (selectedFolderId !== 'all' && selectedFolderId !== 'favorites' && selectedFolderId !== 'recent' && item.folderId !== selectedFolderId) return false;

    // 2. Tag filter
    if (selectedTagFilter !== 'all' && !(item.tags || []).includes(selectedTagFilter)) return false;

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(q);
      const authorMatch = item.authors.toLowerCase().includes(q);
      const journalMatch = (item.journalOrPublisher || '').toLowerCase().includes(q);
      const yearMatch = item.year.includes(q);
      const doiMatch = (item.doi || '').toLowerCase().includes(q);
      const notesMatch = (item.notes || '').toLowerCase().includes(q);
      return titleMatch || authorMatch || journalMatch || yearMatch || doiMatch || notesMatch;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'titleAsc') return a.title.localeCompare(b.title);
    if (sortBy === 'authorAsc') return a.authors.localeCompare(b.authors);
    if (sortBy === 'yearDesc') return b.year.localeCompare(a.year);
    if (sortBy === 'dateAsc') return a.createdAt.localeCompare(b.createdAt);
    return b.createdAt.localeCompare(a.createdAt); // dateDesc
  });

  const getStyleDisplayName = (styleKey: string) => {
    switch (styleKey) {
      case 'apa7': return 'APA 7th Edition';
      case 'apa6': return 'APA 6th Edition';
      case 'mla9': return 'MLA 9th Edition';
      case 'chicago17': return 'Chicago 17th Notes';
      case 'harvard': return 'Harvard Style';
      case 'ieee': return 'IEEE Standard';
      case 'vancouver': return 'Vancouver Numeric';
      default: return 'APA 7th Edition';
    }
  };

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-orange-950 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-xl border border-orange-800/50">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold">
            <BookMarked className="w-4 h-4 text-orange-400" /> AI Academic Reference & Citation Manager Studio
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">
            Reference & Citation Workbench
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Organize doctoral literature libraries, resolve DOIs, import BibTeX, RIS & EndNote XML, detect duplicate citations, verify metadata with AI, and export in 6 academic standards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowManualModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-orange-400" /> Manual Entry
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FileUp className="w-4 h-4" /> Import BibTeX / RIS
          </button>
          <button
            onClick={() => setShowScholarModal(true)}
            className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Globe className="w-4 h-4" /> Scholar Search
          </button>
          <button
            onClick={handleScanDuplicates}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <ShieldCheck className="w-4 h-4" /> Scan Duplicates
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Workspace Grid (Folders Sidebar + Reference Table + Metadata Inspector) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Folders & Custom Collections */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-orange-500" /> Reference Library
              </span>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="text-orange-600 dark:text-orange-400 hover:underline text-xs font-bold flex items-center gap-1"
                title="Create New Custom Collection Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" /> New
              </button>
            </div>

            <div className="space-y-1">
              {/* Preset Folder: All References */}
              <div
                onClick={() => setSelectedFolderId('all')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer transition-all ${
                  selectedFolderId === 'all'
                    ? 'bg-orange-600 text-white shadow-sm font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>All References</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedFolderId === 'all' ? 'bg-orange-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {library.length}
                </span>
              </div>

              {/* Preset Folder: Favorites */}
              <div
                onClick={() => setSelectedFolderId('favorites')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer transition-all ${
                  selectedFolderId === 'favorites'
                    ? 'bg-orange-600 text-white shadow-sm font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Starred Favorites</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedFolderId === 'favorites' ? 'bg-orange-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {library.filter(i => i.isFavorite).length}
                </span>
              </div>

              {/* Preset Folder: Recently Used */}
              <div
                onClick={() => setSelectedFolderId('recent')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer transition-all ${
                  selectedFolderId === 'recent'
                    ? 'bg-orange-600 text-white shadow-sm font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recently Added</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedFolderId === 'recent' ? 'bg-orange-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {library.filter(i => {
                    const now = new Date().getTime();
                    return now - new Date(i.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
                  }).length}
                </span>
              </div>

              {/* Custom User Folders */}
              {folders.filter(f => f.id !== 'all' && f.id !== 'favorites' && f.id !== 'recent').map(folder => {
                const count = library.filter(i => i.folderId === folder.id).length;
                const isSelected = selectedFolderId === folder.id;

                return (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-orange-600 text-white shadow-sm font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span className="truncate">{folder.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected ? 'bg-orange-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {count}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                        title="Delete Folder"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tag Filter Section */}
            {allTags.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Filter by Tag:</span>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedTagFilter('all')}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedTagFilter === 'all' ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                  >
                    All Tags
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTagFilter(tag)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedTagFilter === tag ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export Suite Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Download className="w-4 h-4 text-orange-500" /> Export Library Suite
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => exportLibraryToBibtex(filteredLibrary)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-1 transition-all border border-slate-200 dark:border-slate-700"
              >
                <FileCode className="w-3.5 h-3.5 text-orange-500" /> BibTeX
              </button>
              <button
                onClick={() => exportLibraryToRis(filteredLibrary)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-1 transition-all border border-slate-200 dark:border-slate-700"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" /> RIS
              </button>
              <button
                onClick={() => exportLibraryToEndnoteXml(filteredLibrary)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-1 transition-all border border-slate-200 dark:border-slate-700"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-500" /> EndNote XML
              </button>
              <button
                onClick={() => exportLibraryToCsv(filteredLibrary)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-1 transition-all border border-slate-200 dark:border-slate-700"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-500" /> CSV Table
              </button>
              <button
                onClick={() => exportLibraryToWord(filteredLibrary, getStyleDisplayName(activeStyleTab))}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1 transition-all shadow-sm"
              >
                <FileDown className="w-3.5 h-3.5" /> DOCX
              </button>
              <button
                onClick={() => exportLibraryToPdf(filteredLibrary, getStyleDisplayName(activeStyleTab))}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1 transition-all shadow-sm"
              >
                <FileDown className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* Center & Right Panel Grid */}
        <div className="md:col-span-9 space-y-4">
          
          {/* Quick Identifier Resolver & Search Header Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
            <form onSubmit={handleResolveIdentifier} className="flex flex-col sm:flex-row gap-2">
              <select
                value={identifierType}
                onChange={e => setIdentifierType(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold text-orange-600 dark:text-orange-400 shrink-0"
              >
                <option value="Auto">Auto Detect</option>
                <option value="DOI">DOI (10.xxxx/...)</option>
                <option value="PMID">PubMed (PMID)</option>
                <option value="ISBN">ISBN Book Code</option>
                <option value="URL">Web Article URL</option>
                <option value="CrossRef">CrossRef Query</option>
              </select>

              <input
                type="text"
                value={identifierInput}
                onChange={e => setIdentifierInput(e.target.value)}
                placeholder="Paste DOI, PubMed PMID, ISBN, or Web URL to auto-extract citation..."
                className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />

              <button
                type="submit"
                disabled={resolving || !identifierInput.trim()}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 shrink-0"
              >
                {resolving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Auto Resolve
              </button>
            </form>

            {/* Search, Filter & Sort Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search title, author, year, DOI, abstract, or research notes..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                >
                  <option value="dateDesc">Newest Added</option>
                  <option value="yearDesc">Publication Year</option>
                  <option value="titleAsc">Title (A-Z)</option>
                  <option value="authorAsc">Author (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reference Items Table List & Metadata Inspector Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* References Table List (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm max-h-[72vh] overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button onClick={handleSelectAllFiltered} className="text-slate-400 hover:text-slate-600">
                    {selectedItemIds.length === filteredLibrary.length && filteredLibrary.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <span className="font-semibold">Showing {filteredLibrary.length} references</span>
                </div>

                {selectedItemIds.length > 0 && (
                  <button
                    onClick={() => {
                      exportLibraryToWord(library.filter(i => selectedItemIds.includes(i.id)), getStyleDisplayName(activeStyleTab));
                    }}
                    className="text-orange-600 dark:text-orange-400 font-bold hover:underline"
                  >
                    Export Selected ({selectedItemIds.length})
                  </button>
                )}
              </div>

              {filteredLibrary.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p>No references found in this library filter. Resolve a DOI or click "+ Manual Entry" to add papers.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLibrary.map(item => {
                    const isSelected = selectedReference?.id === item.id;
                    const isChecked = selectedItemIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedReference(item);
                          setNotesText(item.notes || '');
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                          isSelected
                            ? 'bg-orange-50/80 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleSelectItem(item.id); }}
                              className="mt-0.5 text-slate-400 hover:text-orange-600"
                            >
                              {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-orange-600" /> : <Square className="w-3.5 h-3.5" />}
                            </button>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                              {item.title}
                            </h4>
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(item.id); }}
                            className="p-1 text-slate-400 hover:text-amber-400 shrink-0"
                          >
                            <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.authors}</span> &bull; ({item.year}) &bull; <span className="italic">{item.journalOrPublisher}</span>
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pl-5 pt-1">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold">
                              {item.importedFrom || 'Reference'}
                            </span>
                            {item.tags?.map(t => (
                              <span key={t} className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-[9px]">
                                #{t}
                              </span>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleInsertCitationToPaper(item); }}
                            className="px-2.5 py-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm"
                            title="1-Click Insert Citation into Active Paper"
                          >
                            {insertedCitationKey === item.id ? <Check className="w-3 h-3 text-emerald-300" /> : <Send className="w-3 h-3" />}
                            {insertedCitationKey === item.id ? 'Inserted' : 'Insert Citation'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Panel: Metadata & Inspector + Live Formatted List (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-5 shadow-sm max-h-[72vh] overflow-y-auto">
              {selectedReference ? (
                <div className="space-y-4 text-xs">
                  
                  {/* Selected Reference Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                        {selectedReference.sourceType.toUpperCase()} REFERENCE INSPECTOR
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        {selectedReference.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDeleteReference(selectedReference.id)}
                      className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 shrink-0"
                      title="Delete Reference"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Metadata Attributes */}
                  <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    <p><span className="font-bold text-slate-900 dark:text-slate-100">Authors:</span> {selectedReference.authors}</p>
                    <p><span className="font-bold text-slate-900 dark:text-slate-100">Publication Year:</span> {selectedReference.year}</p>
                    <p><span className="font-bold text-slate-900 dark:text-slate-100">Journal / Publisher:</span> {selectedReference.journalOrPublisher}</p>
                    {selectedReference.volume && <p><span className="font-bold text-slate-900 dark:text-slate-100">Volume / Issue:</span> Vol. {selectedReference.volume}, No. {selectedReference.issue || 'N/A'}</p>}
                    {selectedReference.pages && <p><span className="font-bold text-slate-900 dark:text-slate-100">Pages:</span> {selectedReference.pages}</p>}
                    {selectedReference.doi && (
                      <p><span className="font-bold text-slate-900 dark:text-slate-100">DOI:</span> <a href={`https://doi.org/${selectedReference.doi}`} target="_blank" rel="noreferrer" className="text-cyan-600 hover:underline font-mono">{selectedReference.doi}</a></p>
                    )}
                  </div>

                  {/* AI Quick Actions Suite */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px] block">
                      AI Reference Assistants:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleVerifyDoi(selectedReference)}
                        disabled={verifyingDoi || !selectedReference.doi}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950 text-slate-800 dark:text-slate-200 text-[10px] font-bold flex flex-col items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                      >
                        {verifyingDoi ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                        <span>Verify DOI</span>
                      </button>

                      <button
                        onClick={() => handleFindMissingMetadata(selectedReference)}
                        disabled={findingMetadata}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950 text-slate-800 dark:text-slate-200 text-[10px] font-bold flex flex-col items-center justify-center gap-1 border border-slate-200 dark:border-slate-700"
                      >
                        {findingMetadata ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" /> : <Brain className="w-3.5 h-3.5 text-purple-500" />}
                        <span>Find Metadata</span>
                      </button>

                      <button
                        onClick={() => handleSuggestRelatedReferences(selectedReference)}
                        disabled={suggestingRelated}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950 text-slate-800 dark:text-slate-200 text-[10px] font-bold flex flex-col items-center justify-center gap-1 border border-slate-200 dark:border-slate-700"
                      >
                        {suggestingRelated ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" /> : <Wand2 className="w-3.5 h-3.5 text-cyan-500" />}
                        <span>Suggest Related</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Formatted Reference & Style Switcher Panel */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px]">
                        Live Citation Preview ({activeStyleTab.toUpperCase()}):
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: 'apa7', label: 'APA 7' },
                        { id: 'mla9', label: 'MLA' },
                        { id: 'ieee', label: 'IEEE' },
                        { id: 'chicago17', label: 'Chicago' },
                        { id: 'harvard', label: 'Harvard' },
                        { id: 'vancouver', label: 'Vancouver' }
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => setActiveStyleTab(st.id as any)}
                          className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
                            activeStyleTab === st.id
                              ? 'bg-orange-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    {/* Formatted Full Citation Box */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-serif text-[11px] leading-relaxed text-slate-900 dark:text-slate-100">
                      {selectedReference.citations[activeStyleTab] || selectedReference.citations.apa7}
                    </div>

                    {/* Formatted In-Text Citation Box */}
                    <div className="p-2.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 space-y-1">
                      <span className="text-[10px] font-bold text-orange-800 dark:text-orange-300 uppercase">In-Text Citation:</span>
                      <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                        {selectedReference.inTextCitations[activeStyleTab === 'apa7' || activeStyleTab === 'apa6' ? 'apa7Parenthetical' : activeStyleTab] || selectedReference.inTextCitations.apa7Parenthetical}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedReference.citations[activeStyleTab] || selectedReference.citations.apa7);
                          setCopiedKey(selectedReference.id);
                          setTimeout(() => setCopiedKey(null), 2000);
                        }}
                        className="flex-1 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1"
                      >
                        {copiedKey === selectedReference.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === selectedReference.id ? 'Copied' : 'Copy Reference'}
                      </button>

                      <button
                        onClick={() => {
                          const cit = selectedReference.inTextCitations[activeStyleTab === 'apa7' || activeStyleTab === 'apa6' ? 'apa7Parenthetical' : activeStyleTab] || selectedReference.inTextCitations.apa7Parenthetical;
                          navigator.clipboard.writeText(cit);
                          setCopiedInTextKey(selectedReference.id);
                          setTimeout(() => setCopiedInTextKey(null), 2000);
                        }}
                        className="flex-1 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1"
                      >
                        {copiedInTextKey === selectedReference.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        {copiedInTextKey === selectedReference.id ? 'Copied In-Text' : 'Copy In-Text'}
                      </button>
                    </div>
                  </div>

                  {/* Research Tags Editor */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px] block">
                      Research Tags & Categories:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedReference.tags?.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-[10px] font-bold flex items-center gap-1">
                          #{t}
                          <button onClick={() => handleRemoveTag(selectedReference.id, t)} className="hover:text-rose-500">&times;</button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-1 pt-1">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={e => setNewTagInput(e.target.value)}
                        placeholder="Add tag (e.g. Empirical)..."
                        className="flex-1 p-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                      <button
                        onClick={() => handleAddTag(selectedReference.id)}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs rounded-xl"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Personal Research Notes Editor */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px]">
                        Personal Research Notes:
                      </span>
                      <button
                        onClick={() => setEditingNotes(!editingNotes)}
                        className="text-orange-600 font-bold hover:underline text-[10px] flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> {editingNotes ? 'Close' : 'Edit Notes'}
                      </button>
                    </div>

                    {editingNotes ? (
                      <div className="space-y-2">
                        <textarea
                          rows={4}
                          value={notesText}
                          onChange={e => setNotesText(e.target.value)}
                          placeholder="Add personal notes, methodology critique, or thesis chapter observations..."
                          className="w-full p-2.5 text-xs rounded-2xl border border-orange-300 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />
                        <button
                          onClick={() => handleSaveNotes(selectedReference.id)}
                          className="px-3 py-1 bg-orange-600 text-white font-bold text-xs rounded-xl"
                        >
                          Save Notes
                        </button>
                      </div>
                    ) : (
                      <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 italic text-[11px]">
                        {selectedReference.notes || 'No research notes added for this reference. Click "Edit Notes" to record observations.'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Select a reference item from the library table to view complete metadata, live formatted citations, and AI assistants.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-500" />
                <h3 className="text-sm font-extrabold">Add Reference Manually</h3>
              </div>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualReference} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Source Type</label>
                  <select
                    value={manualSourceType}
                    onChange={e => setManualSourceType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value="journal">Journal Article</option>
                    <option value="book">Book / Monograph</option>
                    <option value="conference">Conference Proceeding</option>
                    <option value="website">Website / Report</option>
                    <option value="dataset">Dataset / Code</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Publication Year *</label>
                  <input
                    type="text"
                    value={manualYear}
                    onChange={e => setManualYear(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Publication Title *</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={e => setManualTitle(e.target.value)}
                  placeholder="e.g. Deep Learning Applications in Higher Education"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Authors (Semicolon separated) *</label>
                <input
                  type="text"
                  value={manualAuthors}
                  onChange={e => setManualAuthors(e.target.value)}
                  placeholder="e.g. Al-Duhoki, A. K.; Smith, J. M."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Journal / Publisher Name</label>
                <input
                  type="text"
                  value={manualJournal}
                  onChange={e => setManualJournal(e.target.value)}
                  placeholder="e.g. Journal of Academic Research"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Volume</label>
                  <input
                    type="text"
                    value={manualVolume}
                    onChange={e => setManualVolume(e.target.value)}
                    placeholder="e.g. 14"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Issue</label>
                  <input
                    type="text"
                    value={manualIssue}
                    onChange={e => setManualIssue(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pages</label>
                  <input
                    type="text"
                    value={manualPages}
                    onChange={e => setManualPages(e.target.value)}
                    placeholder="e.g. 102-120"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">DOI (10.xxxx/...)</label>
                  <input
                    type="text"
                    value={manualDoi}
                    onChange={e => setManualDoi(e.target.value)}
                    placeholder="10.1016/j.edu.2024.01"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ISBN / URL</label>
                  <input
                    type="text"
                    value={manualUrl}
                    onChange={e => setManualUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Abstract</label>
                <textarea
                  rows={3}
                  value={manualAbstract}
                  onChange={e => setManualAbstract(e.target.value)}
                  placeholder="Optional summary abstract..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowManualModal(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-orange-600 text-white font-bold rounded-xl shadow-md">
                  Save Reference to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Detection Alert Modal */}
      {showDuplicateModal && pendingDuplicates.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-2 text-amber-600 border-b border-slate-100 dark:border-slate-800 pb-3">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-sm font-extrabold tracking-tight">
                Duplicate Reference Detected ({pendingDuplicates.length} Records)
              </h3>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              {pendingDuplicates.map(({ candidate, existing, reason }) => (
                <div key={candidate.id} className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider text-[10px]">
                      Reason: {reason}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-slate-800 dark:text-slate-200 font-serif">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="font-bold text-slate-500 text-[10px] uppercase block">Existing Record:</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{existing.title}</p>
                      <p className="text-[10px] text-slate-500">{existing.authors} ({existing.year})</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900 space-y-1">
                      <span className="font-bold text-orange-600 text-[10px] uppercase block">Incoming Candidate:</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{candidate.title}</p>
                      <p className="text-[10px] text-slate-500">{candidate.authors} ({candidate.year})</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleResolveDuplicate('skip', candidate, existing)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 font-bold"
                    >
                      Skip Duplicate
                    </button>
                    <button
                      onClick={() => handleResolveDuplicate('keep', candidate, existing)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-bold"
                    >
                      Keep Both
                    </button>
                    <button
                      onClick={() => handleResolveDuplicate('merge', candidate, existing)}
                      className="px-4 py-1.5 rounded-xl bg-orange-600 text-white font-bold shadow-sm"
                    >
                      Merge & Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Multi-Format File & Text Import Modal (BibTeX, RIS, EndNote XML) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-orange-500" />
                <h3 className="text-sm font-extrabold">Import BibTeX, RIS & EndNote XML</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select File Format</label>
                <select
                  value={importSourceType}
                  onChange={e => setImportSourceType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  <option value="Auto">Auto Detect (.bib, .ris, .xml, .enw)</option>
                  <option value="BibTeX">BibTeX (.bib)</option>
                  <option value="RIS">RIS (.ris)</option>
                  <option value="EndNote XML">EndNote XML (.xml / .enw)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Upload Reference File</label>
                <input
                  type="file"
                  accept=".bib,.ris,.xml,.enw,.txt"
                  onChange={handleImportFileUpload}
                  className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold">Or Paste Raw Reference Text</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <textarea
                rows={6}
                value={rawImportText}
                onChange={e => setRawImportText(e.target.value)}
                placeholder="Paste raw @article{...} BibTeX or TY  - JOUR RIS text stream..."
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowImportModal(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                <button
                  onClick={() => handleImportTextOrFile()}
                  disabled={!rawImportText.trim()}
                  className="px-5 py-2 bg-orange-600 text-white font-bold rounded-xl shadow-sm disabled:opacity-50"
                >
                  Parse & Import References
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Scholar Search Modal */}
      {showScholarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-extrabold">Google Scholar Live Paper Import</h3>
              </div>
              <button onClick={() => setShowScholarModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              <form onSubmit={handleScholarSearch} className="flex gap-2">
                <input
                  type="text"
                  value={scholarQuery}
                  onChange={e => setScholarQuery(e.target.value)}
                  placeholder="Enter topic, author, or paper title..."
                  className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={searchingScholar}
                  className="px-5 py-2 bg-cyan-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  {searchingScholar ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search Scholar
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {scholarError && <div className="p-3 text-xs text-rose-500">{scholarError}</div>}
              {scholarResults.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                      <p className="text-[10px] text-slate-500">{Array.isArray(item.authors) ? item.authors.join(', ') : item.authors} ({item.year}) &bull; {item.journalOrConference}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImportScholarPaper(item)}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to Library
                    </button>
                  </div>
                  <p className="text-[11px] font-serif text-slate-600 dark:text-slate-400 line-clamp-2">{item.abstract}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Suggested Related References Modal */}
      {showSuggestedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 bg-gradient-to-r from-orange-950 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-extrabold">AI Suggested Related Papers</h3>
              </div>
              <button onClick={() => setShowSuggestedModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {suggestedPapers.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                      <p className="text-[10px] text-slate-500">{Array.isArray(item.authors) ? item.authors.join(', ') : item.authors} ({item.year}) &bull; {item.journalOrConference}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleImportScholarPaper(item);
                        setShowSuggestedModal(false);
                      }}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to Library
                    </button>
                  </div>
                  <p className="text-[11px] font-serif text-slate-600 dark:text-slate-400 line-clamp-2">{item.abstract}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Folder Creation Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Create New Collection Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="e.g. Thesis Chapter 2 Literature..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewFolderModal(false)} className="px-3 py-1.5 text-xs text-slate-500 font-bold">Cancel</button>
              <button onClick={handleCreateFolder} className="px-4 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm">Create Folder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
