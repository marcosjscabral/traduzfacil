import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, BookOpen, Save, CheckCircle, Loader2, Globe, Trash2 } from 'lucide-react';
import ePub from 'epubjs';
import Dexie from 'dexie';

// --- Database Setup ---
const db = new Dexie('TraduzFacilPro');
db.version(1).stores({
  translations: 'id, bookId, text, timestamp'
});

const App = () => {
  const [book, setBook] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [paragraphs, setParagraphs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Sincronizado');
  const [bookId, setBookId] = useState(null);
  const [progress, setProgress] = useState(0);

  // --- Handlers ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result;
        const newBook = ePub(arrayBuffer);
        const meta = await newBook.loaded.metadata;
        const id = btoa(meta.title + meta.creator);

        setBook(newBook);
        setMetadata(meta);
        setBookId(id);

        await extractContent(newBook, id);
      } catch (err) {
        console.error("Erro ao carregar EPUB:", err);
        alert("Não foi possível carregar este EPUB. Verifique se o arquivo não está corrompido.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const extractContent = async (epub, id) => {
    const spine = await epub.loaded.spine;
    const allParagraphs = [];
    
    // Carregar todas as traduções existentes de uma vez para performance
    const savedStates = await db.translations.where('bookId').equals(id).toArray();
    const translationMap = new Map(savedStates.map(s => [s.id, s.text]));

    // Spine traverse
    for (const section of spine.items) {
      try {
        const resources = await section.load(epub.load.bind(epub));
        const body = resources.querySelector('body');
        
        // Estratégia de extração ultra-robusta
        // Pegamos todos os elementos que possuem texto direto e não são apenas containers vazios
        const nodes = Array.from(body.querySelectorAll('p, h1, h2, h3, li, blockquote, div'));
        
        nodes.forEach((node, idx) => {
          // Apenas elementos que possuem texto e cujo texto não é idêntico ao de um filho (para não duplicar divs que contêm p)
          const text = node.innerText?.trim();
          const hasDirectText = Array.from(node.childNodes).some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
          
          if (text && text.length > 5 && (hasDirectText || node.tagName === 'P')) {
            const lineId = `${id}_${section.index}_${idx}`;
            // Evitar duplicatas exatas de texto na mesma seção (comum em EPUBs mal estruturados)
            if (!allParagraphs.some(p => p.source === text && p.id.startsWith(`${id}_${section.index}`))) {
              allParagraphs.push({
                id: lineId,
                source: text,
                translation: translationMap.get(lineId) || ''
              });
            }
          }
        });
        
        section.unload();
      } catch (e) {
        console.warn(`Seção ${section.href} falhou ao carregar:`, e);
      }
    }

    setParagraphs(allParagraphs);
    updateProgress(allParagraphs);
  };

  const handleTranslationChange = async (id, value) => {
    setStatus('Salvando...');
    
    // Update local state for immediate feedback
    setParagraphs(prev => {
      const fresh = prev.map(p => p.id === id ? { ...p, translation: value } : p);
      updateProgress(fresh);
      return fresh;
    });

    // Persist to DB
    await db.translations.put({
      id,
      bookId,
      text: value,
      timestamp: Date.now()
    });

    // Debounced status update
    setTimeout(() => setStatus('Sincronizado'), 800);
  };

  const updateProgress = (list) => {
    const total = list.length;
    const translated = list.filter(p => p.translation.trim().length > 0).length;
    setProgress(total > 0 ? (translated / total) * 100 : 0);
  };

  const clearCurrentBook = () => {
    if (confirm("Deseja sair deste livro? O progresso salvo continuará no seu dispositivo.")) {
      setBook(null);
      setMetadata(null);
      setParagraphs([]);
      setBookId(null);
    }
  };

  // --- Render Sections ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
        <p className="font-medium text-text-secondary animate-pulse">Descompactando páginas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep text-primary font-inter">
      {/* Header */}
      <header className="sticky top-0 z-50 h-20 px-8 flex items-center justify-between glass-morphism border-b">
        <div className="flex items-center gap-3">
          <Globe className="text-accent w-8 h-8" />
          <h1 className="text-2xl font-bold gradient-text font-outfit">TraduzFacil<span className="text-text-primary ml-1">Pro</span></h1>
        </div>

        <div className="flex items-center gap-4">
          {book && (
            <button onClick={clearCurrentBook} className="btn btn-secondary text-sm">
              <Trash2 className="w-4 h-4" /> Sair
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/5 text-sm">
            <span className={`w-2 h-2 rounded-full ${status === 'Sincronizado' ? 'bg-success' : 'bg-yellow-500 animate-pulse'}`}></span>
            {status}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <AnimatePresence mode="wait">
          {!book ? (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-20 text-center"
            >
              <h2 className="text-5xl font-bold font-outfit mb-6">Transforme sua leitura em <span className="gradient-text">trabalho criativo.</span></h2>
              <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
                Carregue seu arquivo EPUB e comece a traduzir instantaneamente. 
                Todo o seu progresso é salvo offline no seu navegador.
              </p>

              <div 
                className="group relative max-w-xl mx-auto h-64 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-accent transition-all cursor-pointer bg-bg-card/50"
                onClick={() => document.getElementById('file-upload').click()}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">Arraste seu EPUB ou clique aqui</p>
                  <p className="text-sm text-text-dim">Aceitamos apenas arquivos .epub</p>
                </div>
                <input id="file-upload" type="file" accept=".epub" hidden onChange={handleFileUpload} />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Profile Card */}
              <div className="flex items-start gap-8 p-8 rounded-3xl glass-morphism">
                <div className="w-32 h-44 bg-bg-dark rounded-xl flex items-center justify-center border border-border shadow-2xl">
                  <BookOpen className="w-12 h-12 text-text-dim" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold font-outfit mb-2">{metadata?.title}</h3>
                  <p className="text-accent font-medium mb-6">Por {metadata?.creator || 'Autor Desconhecido'}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Progresso da Tradução</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-accent shadow-[0_0_15px_var(--accent-glow)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Translation List */}
              <div className="space-y-8 pb-32">
                {paragraphs.map((p) => (
                  <div key={p.id} className="group flex flex-col gap-4 p-6 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                    <div className="flex gap-3">
                      <div className="w-1 h-auto bg-accent rounded-full opacity-30 group-hover:opacity-100 transition-opacity"></div>
                      <p className="text-lg leading-relaxed text-text-primary/90">{p.source}</p>
                    </div>
                    <textarea 
                      value={p.translation}
                      onChange={(e) => handleTranslationChange(p.id, e.target.value)}
                      placeholder="Traduza aqui..."
                      className="w-full min-h-[60px] p-4 rounded-xl bg-black/40 border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none text-lg text-white placeholder:text-text-dim/50 resize-y transition-all"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Shortcut */}
      {book && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-full glass-morphism border shadow-2xl">
          <Save className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Backup local ativo em tempo real</span>
        </div>
      )}
    </div>
  );
};

export default App;
