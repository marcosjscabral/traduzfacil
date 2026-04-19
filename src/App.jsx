import React, { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { supabase } from './supabaseClient';

/* ─────────────────── SVG ICON COMPONENTS ─────────────────── */
const Icons = {
  Globe: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  ),
  Book: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
  ),
  Save: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.222 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7.778a2 2 0 0 0-.586-1.414l-3.778-3.778a2 2 0 0 0-1.414-.586Z"/>
      <path d="M15 2v5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V2"/>
      <path d="M17 22v-8a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v8"/>
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  Hash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  ),
  Library: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
  ),
  Globe2: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><circle cx="12" cy="12" r="10"/></svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
};

/* ─────────────────── MOCK MARKETPLACE (SUPABASE PREVIEW) ─────────────────── */
const MOCK_MARKETPLACE = [
  {
    id: 'm1',
    title: 'Dracula',
    author: 'Bram Stoker',
    difficulty: 'Avançado',
    epub_url: 'https://raw.githubusercontent.com/IDPF/epub3-samples/master/30/dracula/dracula.epub', // Only generic links work depending on CORS
    cover_url: 'https://m.media-amazon.com/images/I/71B6uEITaWL._AC_UF1000,1000_QL80_.jpg',
    free: true
  },
  {
    id: 'm2',
    title: 'Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    difficulty: 'Intermediário',
    epub_url: '',
    cover_url: 'https://m.media-amazon.com/images/I/81B+GVD0tVL._AC_UF1000,1000_QL80_.jpg',
    free: true
  },
  {
    id: 'm3',
    title: 'Alice in Wonderland',
    author: 'Lewis Carroll',
    difficulty: 'Iniciante',
    epub_url: '',
    cover_url: 'https://m.media-amazon.com/images/I/91tZzI+2YhL._AC_UF1000,1000_QL80_.jpg',
    free: true
  },
  {
    id: 'm4',
    title: 'Moby Dick',
    author: 'Herman Melville',
    difficulty: 'Avançado',
    epub_url: '',
    cover_url: 'https://m.media-amazon.com/images/I/81fH+x4A1GL._AC_UF1000,1000_QL80_.jpg',
    free: false // Premium
  }
];

/* ─────────────────── TEXT CHUNKER ─────────────────── */
function splitIntoLines(text, maxChars = 100) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    if (currentLine.length + word.length + 1 > maxChars) {
      if (currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
        currentLine = '';
      }
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines.length > 0 ? lines : [text];
}

/* ─────────────────── EPUB PARSER (via JSZip) ─────────────────── */
async function parseEpub(arrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer);

  // 0. Check for TraduzFacil restore state!
  const stateFile = zip.file('META-INF/traduzfacil.json');
  if (stateFile) {
    const jsonStr = await stateFile.async('text');
    try {
      const stateData = JSON.parse(jsonStr);
      if (stateData.metadata && stateData.chapters) {
        return stateData;
      }
    } catch(e) { console.warn("Falha ao ler o backup do projeto no epub."); }
  }

  // 1. Find the container.xml to locate the .opf file
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) throw new Error('EPUB inválido: container.xml não encontrado');

  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, 'application/xml');
  const rootfilePath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');
  if (!rootfilePath) throw new Error('EPUB inválido: rootfile não encontrado');

  // Base directory for resolving relative paths
  const opfDir = rootfilePath.includes('/') ? rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1) : '';

  // 2. Parse the OPF to find metadata and spine order
  const opfText = await zip.file(rootfilePath)?.async('text');
  if (!opfText) throw new Error('EPUB inválido: OPF não encontrado');
  const opfDoc = parser.parseFromString(opfText, 'application/xml');

  // Metadata
  const titleEl = opfDoc.querySelector('metadata title, metadata dc\\:title');
  const creatorEl = opfDoc.querySelector('metadata creator, metadata dc\\:creator');
  const metadata = {
    title: titleEl?.textContent || 'Título Desconhecido',
    creator: creatorEl?.textContent || 'Autor Desconhecido',
  };

  // Build manifest map: id -> href
  const manifest = {};
  opfDoc.querySelectorAll('manifest item').forEach(item => {
    manifest[item.getAttribute('id')] = item.getAttribute('href');
  });

  // Spine order
  const spineItems = Array.from(opfDoc.querySelectorAll('spine itemref')).map(ref => ref.getAttribute('idref'));

  // 3. Extract text paragraphs from each spine document
  const allParagraphs = [];
  let chapterIndex = 0;

  for (const idref of spineItems) {
    const href = manifest[idref];
    if (!href) continue;

    const fullPath = opfDir + href;
    const fileEntry = zip.file(fullPath);
    if (!fileEntry) continue;

    const htmlText = await fileEntry.async('text');
    const doc = parser.parseFromString(htmlText, 'application/xhtml+xml');
    const body = doc.querySelector('body');
    if (!body) continue;

    // Get all content nodes and split into sentences
    const nodes = body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');
    const chapterParagraphs = [];
    const seenTexts = new Set();
    let sentenceCounter = 0;

    nodes.forEach((node) => {
      const fullText = (node.textContent || '').trim();
      if (fullText.length < 3) return;

      const tag = node.tagName.toLowerCase();
      const isHeading = tag.startsWith('h');

      // Split paragraph into physical-length lines (approx 95 chars)
      const textLines = splitIntoLines(fullText);

      textLines.forEach((lineText) => {
        const clean = lineText.trim();
        if (clean.length > 2 && !seenTexts.has(clean)) {
          seenTexts.add(clean);
          chapterParagraphs.push({
            id: `ch${chapterIndex}_s${sentenceCounter}`,
            source: clean,
            translation: '',
            isHeading,
          });
          sentenceCounter++;
        }
      });
    });

    if (chapterParagraphs.length > 0) {
      allParagraphs.push({
        chapterIndex,
        chapterLabel: `Capítulo ${chapterIndex + 1}`,
        paragraphs: chapterParagraphs,
      });
      chapterIndex++;
    }
  }

  return { metadata, chapters: allParagraphs };
}

/* ─────────────────── IndexedDB Helpers ─────────────────── */
const DB_NAME = 'TraduzFacilDB';
const DB_VERSION = 3;
const STORE_NAME = 'translations';
const BOOKS_STORE = 'books';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('bookId', 'bookId', { unique: false });
      }
      if (!db.objectStoreNames.contains(BOOKS_STORE)) {
        db.createObjectStore(BOOKS_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveBookData(bookId, metadata, chapters) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readwrite');
    tx.objectStore(BOOKS_STORE).put({ id: bookId, metadata, chapters, lastAccessed: Date.now() });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function loadAllBooks() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readonly');
    const req = tx.objectStore(BOOKS_STORE).getAll();
    req.onsuccess = () => {
      resolve(req.result.sort((a, b) => b.lastAccessed - a.lastAccessed));
    };
    req.onerror = () => reject(req.error);
  });
}

async function deleteBookData(bookId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
     const tx = db.transaction([BOOKS_STORE, STORE_NAME], 'readwrite');
     tx.objectStore(BOOKS_STORE).delete(bookId);
     const idx = tx.objectStore(STORE_NAME).index('bookId');
     const req = idx.getAllKeys(bookId);
     req.onsuccess = () => {
       req.result.forEach(key => tx.objectStore(STORE_NAME).delete(key));
     };
     tx.oncomplete = resolve;
     tx.onerror = () => reject(tx.error);
  });
}

async function saveTranslation(bookId, paragraphId, text) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ id: `${bookId}__${paragraphId}`, bookId, paragraphId, text, ts: Date.now() });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function loadTranslations(bookId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const idx = tx.objectStore(STORE_NAME).index('bookId');
    const req = idx.getAll(bookId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/* ─────────────────── EXPORT TRANSLATIONS AS EPUB ─────────────────── */
async function exportAsEpub(metadata, chapters) {
  const zip = new JSZip();

  // Mimetype must be uncompressed
  zip.file("mimetype", "application/epub+zip");

  // META-INF
  zip.folder("META-INF").file("container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  // INJECT APP STATE TO ALLOW CONTINUING FROM OTHER COMPUTER
  zip.folder("META-INF").file("traduzfacil.json", JSON.stringify({ metadata, chapters }));

  // OEBPS Content
  const oebps = zip.folder("OEBPS");
  let manifestItems = '';
  let spineItems = '';

  chapters.forEach((ch, idx) => {
    let xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${ch.chapterLabel}</title></head>
<body><h2>${ch.chapterLabel}</h2>`;

    ch.paragraphs.forEach(p => {
      // Use translation if filled, else fallback to source
      // This is what renders when they read it normally on a Kindle/App
      const text = p.translation && p.translation.trim() ? p.translation : p.source;
      if (p.isHeading) {
        xhtml += `<h3>${text}</h3>`;
      } else {
        xhtml += `<p>${text}</p>`;
      }
    });

    xhtml += `</body></html>`;
    oebps.file(`chapter_${idx}.xhtml`, xhtml);
    manifestItems += `<item id="ch_${idx}" href="chapter_${idx}.xhtml" media-type="application/xhtml+xml"/>\n`;
    spineItems += `<itemref idref="ch_${idx}"/>\n`;
  });

  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${metadata.title} (Traduzido)</dc:title>
    <dc:creator>${metadata.creator}</dc:creator>
    <dc:language>pt</dc:language>
  </metadata>
  <manifest>
    ${manifestItems}
  </manifest>
  <spine>
    ${spineItems}
  </spine>
</package>`;

  oebps.file("content.opf", opf);

  const content = await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = `${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}_traduzido.epub`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ─────────────────── AUTO-RESIZE TEXTAREA ─────────────────── */
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const App = () => {
  const [chapters, setChapters] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Salvo');
  const [bookId, setBookId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [library, setLibrary] = useState([]);
  const [activeHomeTab, setActiveHomeTab] = useState('library'); // 'library' | 'marketplace'
  const [autoSaveInterval, setAutoSaveInterval] = useState(1);
  const [marketplaceBooks, setMarketplaceBooks] = useState([]);
  const fileInputRef = useRef(null);

  const hasBook = chapters.length > 0;

  /* ─── Load library on mount ─── */
  useEffect(() => {
    loadAllBooks().then(setLibrary).catch(console.warn);
  }, []);

  /* ─── Fetch Supabase Catalog ─── */
  useEffect(() => {
    if (activeHomeTab === 'marketplace') {
      const fetchCatalog = async () => {
        try {
          // Busca os livros do Supabase! (E ignora erro caso a tabela esteja vazia)
          const { data, error } = await supabase.from('catalog').select('*');
          if (error) throw error;
          if (data) setMarketplaceBooks(data);
        } catch (e) {
          console.error('Erro ao buscar o catálogo:', e);
        }
      };
      fetchCatalog();
    }
  }, [activeHomeTab]);

  /* ─── Compute progress ─── */
  const computeProgress = useCallback((chs) => {
    let total = 0, done = 0;
    chs.forEach(ch => {
      ch.paragraphs.forEach(p => {
        total++;
        if (p.translation && p.translation.trim().length > 0) done++;
      });
    });
    setProgress(total > 0 ? Math.round((done / total) * 100) : 0);
  }, []);

  /* ─── Load state safely ─── */
  const applyBookState = useCallback(async (id, meta, chs) => {
    setBookId(id);
    setMetadata(meta);

    // Load saved translations
    try {
      const saved = await loadTranslations(id);
      const map = new Map(saved.map(s => [s.paragraphId, s.text]));
      chs.forEach(ch => {
        ch.paragraphs.forEach(p => {
          const t = map.get(p.id);
          if (t) p.translation = t;
        });
      });
    } catch (e) {
      console.warn('Erro ao carregar traduções salvas:', e);
    }

    setChapters(chs);
    computeProgress(chs);
    
    // Update Library State
    await saveBookData(id, meta, chs);
    const newLib = await loadAllBooks();
    setLibrary(newLib);
  }, [computeProgress]);

  /* ─── Handle Open Existing Book ─── */
  const handleOpenLibraryBook = useCallback(async (book) => {
    setLoading(true);
    try {
      await applyBookState(book.id, book.metadata, book.chapters);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar o livro salvo.');
    } finally {
      setLoading(false);
    }
  }, [applyBookState]);

  /* ─── Handle Download from Public Library (Supabase Mock) ─── */
  const handleDownloadMarketplaceEpub = useCallback(async (book) => {
    if (!book.free) {
      alert('Este livro é um conteúdo Premium. Futuramente você poderá assinar para desbloquear!');
      return;
    }
    if (!book.epub_url) {
      alert('O URL deste EPUB ainda não foi configurado no banco de dados (Supabase Demo).');
      return;
    }
    setLoading(true);
    try {
      // Faz o download real do bucket do Supabase (ou url publico)
      const res = await fetch(book.epub_url);
      if (!res.ok) throw new Error('Falha no download. O arquivo pode não existir no Storage ou há erro de CORS.');
      const arrayBuffer = await res.arrayBuffer();
      
      const { metadata: meta, chapters: chs } = await parseEpub(arrayBuffer);
      // Forçar o titulo lindo do marketplace
      meta.title = book.title;

      const id = btoa(unescape(encodeURIComponent(meta.title + '||' + meta.creator))).replace(/[^a-zA-Z0-9]/g, '');
      await applyBookState(id, meta, chs);
    } catch (err) {
      console.error(err);
      alert('Erro ao baixar livro: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [applyBookState]);

  /* ─── Handle file ─── */
  const handleFile = useCallback(async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.epub')) {
      alert('Por favor, selecione um arquivo .epub válido.');
      return;
    }

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { metadata: meta, chapters: chs } = await parseEpub(arrayBuffer);

      const id = btoa(unescape(encodeURIComponent(meta.title + '||' + meta.creator))).replace(/[^a-zA-Z0-9]/g, '');
      await applyBookState(id, meta, chs);
    } catch (err) {
      console.error('Erro ao processar EPUB:', err);
      alert('Não foi possível carregar este EPUB. Verifique se o arquivo é válido.');
    } finally {
      setLoading(false);
    }
  }, [applyBookState]);

  /* ─── Manual Save Logic ─── */
  const chaptersRef = useRef(chapters);
  useEffect(() => { chaptersRef.current = chapters; }, [chapters]);

  const handleManualSave = useCallback(async () => {
    if (!bookId) return;
    setStatus('Salvando...');
    try {
      await saveBookData(bookId, metadata, chaptersRef.current);
      setStatus('Salvo');
    } catch (e) {
      console.error('Falha ao salvar:', e);
      setStatus('Modificado');
    }
  }, [bookId, metadata]);

  /* ─── Auto-Save Interval ─── */
  useEffect(() => {
    if (autoSaveInterval === 0 || status === 'Salvo') return;
    const interval = setInterval(() => {
      if (status === 'Modificado') handleManualSave();
    }, autoSaveInterval * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoSaveInterval, status, handleManualSave]);

  /* ─── Publish to Supabase Public Library ─── */
  const publishToPublicLibrary = useCallback(async () => {
    if (!metadata || chapters.length === 0) return;
    setStatus('Publicando...');
    
    try {
      // 1. Inserir Livro na tabela 'books'
      const { data: bookData, error: bookErr } = await supabase
        .from('books')
        .insert([{
          title: metadata.title,
          author: metadata.creator || 'Desconhecido'
        }])
        .select()
        .single();
        
      if (bookErr) throw bookErr;
      const supabaseBookId = bookData.id;

      // 2. Preparar todas as linhas para inserção
      const translationsToInsert = [];
      let globalIndex = 0;
      
      chapters.forEach(ch => {
        ch.paragraphs.forEach(p => {
          translationsToInsert.push({
            book_id: supabaseBookId,
            section_index: globalIndex,
            source_text: p.source,
            translated_text: p.translation || null,
            status: p.translation && p.translation.trim() ? 'translated' : 'pending'
          });
          globalIndex++;
        });
      });

      // 3. Inserir linhas em lotes para não sobrecarregar a requisição
      const BATCH_SIZE = 500;
      for (let i = 0; i < translationsToInsert.length; i += BATCH_SIZE) {
        const batch = translationsToInsert.slice(i, i + BATCH_SIZE);
        const { error: txtErr } = await supabase.from('translations').insert(batch);
        if (txtErr) throw txtErr;
      }
      
      setStatus('Salvo');
      alert('Livro publicado com sucesso na Biblioteca Pública (Supabase)!');
    } catch (e) {
      console.error('Falha ao publicar:', e);
      alert('Erro ao publicar na nuvem: ' + e.message);
      setStatus('Modificado');
    }
  }, [metadata, chapters]);

  /* ─── Translation change ─── */
  const handleTranslationChange = useCallback((chapterIdx, paraIdx, value) => {
    setStatus('Modificado');
    setChapters(prev => {
      const next = prev.map((ch, ci) => {
        if (ci !== chapterIdx) return ch;
        return {
          ...ch,
          paragraphs: ch.paragraphs.map((p, pi) => {
            if (pi !== paraIdx) return p;
            return { ...p, translation: value };
          }),
        };
      });
      computeProgress(next);
      return next;
    });
  }, [computeProgress]);

  /* ─── Drag & Drop ─── */
  const onDragOver = useCallback((e) => { e.preventDefault(); setDragActive(true); }, []);
  const onDragLeave = useCallback(() => setDragActive(false), []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  /* ─── Clear book ─── */
  const clearBook = useCallback(() => {
    setChapters([]);
    setMetadata(null);
    setBookId(null);
    setProgress(0);
    // Refresh library when returning to home screen
    loadAllBooks().then(setLibrary).catch(console.warn);
  }, []);

  /* ─── Delete book ─── */
  const handleDeleteBook = useCallback(async (id) => {
    if (window.confirm('Tem certeza que deseja apagar este livro e todo o progresso de tradução?')) {
      await deleteBookData(id);
      const newLib = await loadAllBooks();
      setLibrary(newLib);
    }
  }, []);

  /* ─── Count total paragraphs ─── */
  const totalParagraphs = chapters.reduce((sum, ch) => sum + ch.paragraphs.length, 0);

  /* ═══════════════════ RENDER ═══════════════════ */

  // Loading
  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <div className="spinner-ring" />
          <p>Extraindo páginas do livro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">

      {/* ─── Header ─── */}
      <header className="app-header">
        <div className="header-brand">
          <Icons.Globe />
          <h1 className="gradient-text">TraduzFácil<span>Pro</span></h1>
        </div>
        <div className="header-actions">
          {hasBook && (
            <>
              <select 
                value={autoSaveInterval} 
                onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                className="auto-save-select"
                title="Intervalo de salvamento automático"
              >
                <option value={0}>Auto-save: Desligado</option>
                <option value={1}>Auto-save: 1 min</option>
                <option value={2}>Auto-save: 2 min</option>
                <option value={5}>Auto-save: 5 min</option>
                <option value={10}>Auto-save: 10 min</option>
              </select>
              <button 
                className={`btn btn-ghost manual-save-btn ${status === 'Modificado' ? 'is-modified' : ''}`} 
                onClick={handleManualSave} 
                disabled={status === 'Salvo' || status === 'Salvando...'}
                title={status === 'Modificado' ? "Salvar alterações" : "Tudo salvo"}
              >
                <Icons.Save /> {status === 'Modificado' ? 'Salvar' : status}
              </button>
              <button 
                className="btn btn-ghost" 
                onClick={publishToPublicLibrary} 
                disabled={status === 'Publicando...'}
                title="Publicar este livro na biblioteca online"
              >
                <Icons.Globe2 /> Publicar na Nuvem
              </button>
              <button className="btn btn-ghost" onClick={() => exportAsEpub(metadata, chapters)} title="Exportar novo EPUB">
                <Icons.Download /> Exportar EPUB
              </button>
              <button className="btn btn-secondary" onClick={clearBook}>
                <Icons.Trash /> Sair
              </button>
            </>
          )}
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="app-main">
        {!hasBook ? (
          /* ─── Welcome Screen ─── */
          <section className="welcome-section">
            <h2>
              Transforme sua leitura em{' '}
              <span className="gradient-text">trabalho criativo.</span>
            </h2>
            <p>
              Carregue seu arquivo EPUB e comece a traduzir instantaneamente.
              Todo o seu progresso é salvo offline no seu navegador.
            </p>

            {/* ─── Tabs Navigation ─── */}
            <div className="home-tabs">
              <button 
                className={`home-tab ${activeHomeTab === 'library' ? 'active' : ''}`}
                onClick={() => setActiveHomeTab('library')}
              >
                <Icons.Library /> Minha Biblioteca e Uploads
              </button>
              <button 
                className={`home-tab ${activeHomeTab === 'marketplace' ? 'active' : ''}`}
                onClick={() => setActiveHomeTab('marketplace')}
              >
                <Icons.Globe2 /> Biblioteca Pública (Explorar)
              </button>
            </div>

            {/* ─── Tab Content: LIBRARY & UPLOAD ─── */}
            {activeHomeTab === 'library' && (
              <div className="tab-pane fade-in">
                <div
                  className={`drop-zone ${dragActive ? 'dragover' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                >
                  <div className="drop-icon">
                    <Icons.Upload />
                  </div>
                  <span className="drop-text-main">Arraste seu EPUB ou clique aqui</span>
                  <span className="drop-text-sub">Aceitamos apenas arquivos .epub</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".epub"
                    hidden
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>

                {library.length > 0 && (
                  <div className="library-section">
                    <h3 className="library-title">Sua Biblioteca Local</h3>
                    <div className="library-grid">
                      {library.map(book => (
                        <div key={book.id} className="lib-card">
                          <div className="lib-card-info" onClick={() => handleOpenLibraryBook(book)}>
                            <h4 className="lib-title">{book.metadata.title}</h4>
                            <p className="lib-author">{book.metadata.creator}</p>
                          </div>
                          <button className="lib-delete-btn" onClick={() => handleDeleteBook(book.id)} title="Excluir livro e traduções">
                            <Icons.Trash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Tab Content: MARKETPLACE / PUBLIC ─── */}
            {activeHomeTab === 'marketplace' && (
              <div className="tab-pane fade-in">
                <div className="marketplace-header">
                  <h3>Descubra Clássicos</h3>
                  <p>Inicie agora mesmo sua jornada de tradução sem precisar fazer download de nada.</p>
                </div>
                
                <div className="marketplace-grid">
                  {marketplaceBooks.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.6, gridColumn: '1 / -1' }}>Carregando catálogo da nuvem ou nenhum livro disponível...</p>
                  ) : (
                    marketplaceBooks.map(book => (
                      <div key={book.id} className="mk-card">
                        <div className="mk-cover" style={{ backgroundImage: `url(${book.cover_url || ''})` }}>
                          {!book.free && (
                            <div className="mk-premium-badge">
                              <Icons.Lock /> Premium
                            </div>
                          )}
                        </div>
                        <div className="mk-info">
                          <span className={`mk-diff mode-${(book.difficulty || 'iniciante').toLowerCase()}`}>
                            {book.difficulty || 'Iniciante'}
                          </span>
                          <h4>{book.title}</h4>
                          <p>{book.author}</p>
                          <button 
                            className={`btn ${book.free ? 'btn-primary' : 'btn-secondary'} mk-action-btn`}
                            onClick={() => handleDownloadMarketplaceEpub(book)}
                          >
                            {book.free ? 'Começar a Traduzir' : 'Desbloquear'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        ) : (
          /* ─── Editor ─── */
          <section className="editor-section">
            {/* Book Card */}
            <div className="book-card glass">
              <div className="book-cover-placeholder">
                <Icons.Book />
              </div>
              <div className="book-info">
                <h3>{metadata?.title}</h3>
                <p className="author">por {metadata?.creator || 'Autor Desconhecido'}</p>
                <div className="book-stats">
                  <span className="stat-chip"><Icons.Hash /> {totalParagraphs} linhas</span>
                  <span className="stat-chip"><Icons.Book /> {chapters.length} capítulos</span>
                </div>
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Progresso da Tradução</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Translation List */}
            <div className="translation-list">
              {chapters.map((ch, ci) => (
                <React.Fragment key={ci}>
                  <div className="chapter-divider">
                    <span className="chapter-label">{ch.chapterLabel}</span>
                  </div>
                  {ch.paragraphs.map((p, pi) => (
                    <TranslationRow
                      key={p.id}
                      paragraph={p}
                      onTranslationChange={(val) => handleTranslationChange(ci, pi, val)}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ─── Floating Bar (Removed due to header manual save config) ─── */}
    </div>
  );
};

/* ─────────────────── TRANSLATION ROW (memoized) ─────────────────── */
const TranslationRow = React.memo(({ paragraph, onTranslationChange }) => {
  const textareaRef = useRef(null);
  const [localVal, setLocalVal] = useState(paragraph.translation || '');

  // Synchronize local state if parent changes (e.g. loading a new book)
  useEffect(() => {
    setLocalVal(paragraph.translation || '');
  }, [paragraph.translation]);

  // Adjust height on mount/update
  useEffect(() => {
    if (textareaRef.current) {
      autoResize(textareaRef.current);
    }
  }, [localVal]);

  const handleInput = (e) => {
    const val = e.target.value;
    setLocalVal(val);
    autoResize(e.target);
  };

  const handleBlur = () => {
    if (localVal !== paragraph.translation) {
      onTranslationChange(localVal);
    }
  };

  return (
    <div className="text-pair">
      <p className={`source-text ${paragraph.isHeading ? 'heading' : ''}`}>
        {paragraph.source}
      </p>
      <textarea
        ref={textareaRef}
        className={`translation-input ${localVal ? 'has-content' : ''}`}
        placeholder="Traduza aqui..."
        value={localVal}
        onInput={handleInput}
        onChange={handleInput}
        onBlur={handleBlur}
        rows={1}
      />
    </div>
  );
});

TranslationRow.displayName = 'TranslationRow';

export default App;
