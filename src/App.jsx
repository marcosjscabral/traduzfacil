import React, { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';

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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
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
};

/* ─────────────────── TEXT CHUNKER ─────────────────── */
function splitIntoLines(text, maxChars = 95) {
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

/* ─────────────────── EXPORT TRANSLATIONS ─────────────────── */
function exportTranslations(metadata, chapters) {
  let output = `# ${metadata.title}\n## ${metadata.creator}\n\n---\n\n`;
  chapters.forEach(ch => {
    output += `### ${ch.chapterLabel}\n\n`;
    ch.paragraphs.forEach(p => {
      output += `> ${p.source}\n`;
      output += `${p.translation || '(sem tradução)'}\n\n`;
    });
    output += `---\n\n`;
  });

  const blob = new Blob([output], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}_traducao.md`;
  a.click();
  URL.revokeObjectURL(url);
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
  const [status, setStatus] = useState('Sincronizado');
  const [bookId, setBookId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [library, setLibrary] = useState([]);
  const fileInputRef = useRef(null);
  const saveTimerRef = useRef(null);

  const hasBook = chapters.length > 0;

  /* ─── Load library on mount ─── */
  useEffect(() => {
    loadAllBooks().then(setLibrary).catch(console.warn);
  }, []);

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

  /* ─── Translation change ─── */
  const handleTranslationChange = useCallback((chapterIdx, paraIdx, value) => {
    setStatus('Salvando...');

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

    // Debounced save to IndexedDB
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const ch = chapters[chapterIdx] || {};
        const p = (ch.paragraphs || [])[paraIdx];
        if (p && bookId) {
          await saveTranslation(bookId, p.id, value);
        }
      } catch (e) {
        console.warn('Falha ao salvar:', e);
      }
      setStatus('Sincronizado');
    }, 600);
  }, [bookId, chapters, computeProgress]);

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
              <button className="btn btn-ghost" onClick={() => exportTranslations(metadata, chapters)} title="Exportar tradução">
                <Icons.Download /> Exportar
              </button>
              <button className="btn btn-secondary" onClick={clearBook}>
                <Icons.Trash /> Sair
              </button>
            </>
          )}
          <div className="status-pill">
            <span className={`status-dot ${status === 'Sincronizado' ? 'synced' : 'saving'}`} />
            {status}
          </div>
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

            <div className="features-strip">
              <div className="feature-item"><Icons.Zap /> <span>Parsing offline</span></div>
              <div className="feature-item"><Icons.Shield /> <span>Dados no navegador</span></div>
              <div className="feature-item"><Icons.Save /> <span>Auto-save em tempo real</span></div>
            </div>

            {/* Library Section */}
            {library.length > 0 && (
              <div className="library-section">
                <h3 className="library-title">Sua Biblioteca</h3>
                <div className="library-grid">
                  {library.map(book => (
                    <div key={book.id} className="lib-card">
                      <div className="lib-card-info" onClick={() => handleOpenLibraryBook(book)}>
                        <h4 className="lib-title">{book.metadata.title}</h4>
                        <p className="lib-author">{book.metadata.creator}</p>
                      </div>
                      <button className="lib-delete-btn" onClick={() => handleDeleteBook(book.id)} title="Excluir livro">
                        <Icons.Trash />
                      </button>
                    </div>
                  ))}
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

      {/* ─── Floating Bar ─── */}
      {hasBook && (
        <div className="floating-bar glass">
          <Icons.Save />
          <span>Backup local ativo em tempo real</span>
        </div>
      )}
    </div>
  );
};

/* ─────────────────── TRANSLATION ROW (memoized) ─────────────────── */
const TranslationRow = React.memo(({ paragraph, onTranslationChange }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current && paragraph.translation) {
      autoResize(textareaRef.current);
    }
  }, [paragraph.translation]);

  const handleInput = (e) => {
    autoResize(e.target);
    onTranslationChange(e.target.value);
  };

  return (
    <div className="text-pair">
      <p className={`source-text ${paragraph.isHeading ? 'heading' : ''}`}>
        {paragraph.source}
      </p>
      <textarea
        ref={textareaRef}
        className={`translation-input ${paragraph.translation ? 'has-content' : ''}`}
        placeholder="Traduza aqui..."
        value={paragraph.translation}
        onInput={handleInput}
        onChange={handleInput}
        rows={1}
      />
    </div>
  );
});

TranslationRow.displayName = 'TranslationRow';

export default App;
