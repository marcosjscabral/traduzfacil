// TraduzFacil - Core Logic
// Using EPUBjs for parsing and IndexedDB for persistence

/** 
 * DESAFIO TÉCNICO: EPUBs são complexos. 
 * Vamos focar em extrair o conteúdo textual de cada capítulo e "quebrar" em parágrafos.
 */

class TraduzFacil {
    constructor() {
        this.db = null;
        this.currentBook = null;
        this.bookId = null;
        this.autoSaveTimer = null;
        
        this.elements = {
            uploadInput: document.getElementById('epub-upload'),
            dropZone: document.getElementById('drop-zone'),
            welcomeScreen: document.getElementById('welcome-screen'),
            loader: document.getElementById('loader'),
            editorContainer: document.getElementById('editor-container'),
            translationList: document.getElementById('translation-list'),
            bookTitle: document.getElementById('current-book-name'),
            progressBar: document.getElementById('progress-bar'),
            saveStatus: document.getElementById('save-btn')
        };

        this.initDB();
        this.attachEvents();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('TraduzFacilDB', 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('translations')) {
                    const store = db.createObjectStore('translations', { keyPath: 'id' });
                    store.createIndex('bookId', 'bookId', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Database initialized');
                resolve();
            };

            request.onerror = (event) => reject(event.target.error);
        });
    }

    attachEvents() {
        this.elements.uploadInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));
        
        this.elements.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.dropZone.classList.add('dragover');
        });

        this.elements.dropZone.addEventListener('dragleave', () => {
            this.elements.dropZone.classList.remove('dragover');
        });

        this.elements.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.dropZone.classList.remove('dragover');
            this.handleFile(e.dataTransfer.files[0]);
        });

        // Click on drop zone to trigger input
        this.elements.dropZone.addEventListener('click', () => this.elements.uploadInput.click());
    }

    async handleFile(file) {
        if (!file || !file.name.endsWith('.epub')) {
            alert('Por favor, selecione um arquivo EPUB válido.');
            return;
        }

        this.showLoader(true);
        this.bookId = btoa(file.name); // Simple ID based on name

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                this.currentBook = ePub(arrayBuffer);
                const metadata = await this.currentBook.loaded.metadata;
                this.elements.bookTitle.innerText = metadata.title;
                
                await this.processBook();
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error(err);
            alert('Erro ao carregar o livro.');
            this.showLoader(false);
        }
    }

    async processBook() {
        const spine = await this.currentBook.loaded.spine;
        const sections = spine.items;
        
        this.elements.translationList.innerHTML = '';
        
        // Iterar pelos capítulos
        for (const section of sections) {
            try {
                const doc = await section.load(this.currentBook.load.bind(this.currentBook));
                const paragraphs = doc.querySelectorAll('p, h1, h2, h3, li');
                
                paragraphs.forEach((p, index) => {
                    const text = p.innerText.trim();
                    if (text.length > 5) { // Ignorar fragmentos muito pequenos
                        const lineId = `${this.bookId}_${section.index}_${index}`;
                        this.renderLine(lineId, text);
                    }
                });
                
                section.unload();
            } catch (e) {
                console.warn('Erro ao processar seção:', e);
            }
        }

        this.showLoader(false);
        this.elements.welcomeScreen.classList.add('hidden');
        this.elements.editorContainer.classList.remove('hidden');
        
        // Load existing translations
        this.loadSavedTranslations();
    }

    renderLine(id, text) {
        const div = document.createElement('div');
        div.className = 'text-pair';
        div.dataset.id = id;
        
        div.innerHTML = `
            <div class="source-text">${text}</div>
            <textarea 
                class="translation-input" 
                placeholder="Sua tradução aqui..."
                data-id="${id}"
                oninput="app.triggerAutoSave('${id}', this.value)"
            ></textarea>
        `;
        
        this.elements.translationList.appendChild(div);
    }

    async triggerAutoSave(id, text) {
        this.elements.saveStatus.innerHTML = '<span class="status-dot" style="background: #f59e0b; box-shadow: 0 0 10px #f59e0b"></span> Estado: Salvando...';
        
        if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
        
        this.autoSaveTimer = setTimeout(async () => {
            await this.saveTranslation(id, text);
            this.elements.saveStatus.innerHTML = '<span class="status-dot"></span> Estado: Sincronizado';
            this.updateProgress();
        }, 500);
    }

    async saveTranslation(id, text) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['translations'], 'readwrite');
            const store = transaction.objectStore('translations');
            store.put({ id, bookId: this.bookId, text, timestamp: Date.now() });
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject();
        });
    }

    async loadSavedTranslations() {
        const transaction = this.db.transaction(['translations'], 'readonly');
        const store = transaction.objectStore('translations');
        const index = store.index('bookId');
        const request = index.getAll(this.bookId);

        request.onsuccess = () => {
            const results = request.result;
            results.forEach(item => {
                const textarea = document.querySelector(`textarea[data-id="${item.id}"]`);
                if (textarea) textarea.value = item.text;
            });
            this.updateProgress();
        };
    }

    updateProgress() {
        const allInputs = document.querySelectorAll('.translation-input');
        const filledInputs = Array.from(allInputs).filter(input => input.value.trim().length > 0);
        const percentage = (filledInputs.length / allInputs.length) * 100 || 0;
        this.elements.progressBar.style.width = `${percentage}%`;
    }

    showLoader(show) {
        if (show) {
            this.elements.loader.classList.remove('hidden');
            this.elements.welcomeScreen.classList.add('hidden');
        } else {
            this.elements.loader.classList.add('hidden');
        }
    }
}

// Global instance
const app = new TraduzFacil();
window.app = app;
