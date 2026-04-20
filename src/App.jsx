import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
  LogOut: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  ),
  ChevronLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  ),
  ChevronDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
  ),
  AlertCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  ),
  Cloud: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Crown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18"/></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  ),
  Star: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  CreditCard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
  ),
  Google: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
  Smartphone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
  ),
  Infinity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"/></svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  ),
};

/* ─────────────────── ADMIN CONFIG ─────────────────── */
// Add your admin email(s) here
const ADMIN_EMAILS = ['marcosjscabral@gmail.com'];

/* ─────────────────── MOCK MARKETPLACE (SUPABASE PREVIEW) ─────────────────── */
const MOCK_MARKETPLACE = [
  {
    id: 'm1',
    title: 'Dracula',
    author: 'Bram Stoker',
    difficulty: 'Advanced',
    epub_url: 'https://raw.githubusercontent.com/IDPF/epub3-samples/master/30/dracula/dracula.epub',
    cover_url: 'https://m.media-amazon.com/images/I/71B6uEITaWL._AC_UF1000,1000_QL80_.jpg',
    free: false,
    price_cents: 500,
    stripe_price_id: 'price_1TOIaIF0lxCQwtFqj99VXrl0',
    Language: 'English'
  },
  {
    id: 'm2',
    title: 'Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    difficulty: 'Intermediate',
    epub_url: 'https://raw.githubusercontent.com/IDPF/epub3-samples/master/30/moby-dick/moby-dick.epub',
    cover_url: 'https://m.media-amazon.com/images/I/81B+GVD0tVL._AC_UF1000,1000_QL80_.jpg',
    free: false,
    price_cents: 500,
    stripe_price_id: 'price_1TOIaIF0lxCQwtFq9YDWh6dz',
    Language: 'English'
  },
  {
    id: 'm3',
    title: 'Alice in Wonderland',
    author: 'Lewis Carroll',
    difficulty: 'Beginner',
    epub_url: 'https://raw.githubusercontent.com/IDPF/epub3-samples/master/30/alice/alice.epub',
    cover_url: 'https://m.media-amazon.com/images/I/91tZzI+2YhL._AC_UF1000,1000_QL80_.jpg',
    free: true,
    Language: 'English'
  },
  {
    id: 'm4',
    title: 'Moby Dick',
    author: 'Herman Melville',
    difficulty: 'Advanced',
    epub_url: 'https://raw.githubusercontent.com/IDPF/epub3-samples/master/30/moby-dick/moby-dick.epub',
    cover_url: 'https://m.media-amazon.com/images/I/81fH+x4A1GL._AC_UF1000,1000_QL80_.jpg',
    free: false,
    price_cents: 500,
    stripe_price_id: 'price_1TOIaIF0lxCQwtFqj99VXrl0',
    Language: 'English'
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
    } catch(e) { console.warn("Failed to read project backup in the epub."); }
  }

  // 1. Find the container.xml to locate the .opf file
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) throw new Error('Invalid EPUB: container.xml not found');

  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, 'application/xml');
  const rootfilePath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');
  if (!rootfilePath) throw new Error('Invalid EPUB: rootfile not found');

  // Base directory for resolving relative paths
  const opfDir = rootfilePath.includes('/') ? rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1) : '';

  // 2. Parse the OPF to find metadata and spine order
  const opfText = await zip.file(rootfilePath)?.async('text');
  if (!opfText) throw new Error('Invalid EPUB: OPF not found');
  const opfDoc = parser.parseFromString(opfText, 'application/xml');

  // Metadata
  const titleEl = opfDoc.querySelector('metadata title, metadata dc\\:title');
  const creatorEl = opfDoc.querySelector('metadata creator, metadata dc\\:creator');
  const metadata = {
    title: titleEl?.textContent || 'Unknown Title',
    creator: creatorEl?.textContent || 'Unknown Author',
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
        chapterLabel: `Chapter ${chapterIndex + 1}`,
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
async function exportAsEpub(metadata, chapters, userEmail = 'Anonymous') {
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
      const text = p.translation && p.translation.trim() ? p.translation : p.source;
      if (p.isHeading) {
        xhtml += `<h3>${text}</h3>`;
      } else {
        xhtml += `<p>${text}</p>`;
      }
    });

    // MANIFESTO: Criar assinatura no documento ao baixar
    xhtml += `<hr/><p style="font-size: 0.8em; color: gray;">Translated by ${userEmail} via Traxbook - ${new Date().toLocaleDateString()}</p>`;
    xhtml += `</body></html>`;
    oebps.file(`chapter_${idx}.xhtml`, xhtml);
    manifestItems += `<item id="ch_${idx}" href="chapter_${idx}.xhtml" media-type="application/xhtml+xml"/>\n`;
    spineItems += `<itemref idref="ch_${idx}"/>\n`;
  });

  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${metadata.title} (Translated)</dc:title>
    <dc:creator>${metadata.creator}</dc:creator>
    <dc:language>en</dc:language>
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
  a.download = `${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}_translated.epub`;
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
  /* ─── Existing State ─── */
  const [chapters, setChapters] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Saved');
  const [bookId, setBookId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [library, setLibrary] = useState([]);
  const [activeHomeTab, setActiveHomeTab] = useState('library');
  const [myFlashcards, setMyFlashcards] = useState([]);
  const [editingCard, setEditingCard] = useState(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState(1);
  const [marketplaceBooks, setMarketplaceBooks] = useState([]);
  const [catalogError, setCatalogError] = useState(null);
  const fileInputRef = useRef(null);
  const [currentChapter, setCurrentChapter] = useState(0);

  /* ─── Auth & Views State ─── */
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'editor' | 'pricing' | 'admin'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [flashcardModal, setFlashcardModal] = useState({ show: false, source: '', translation: '', success: false, originId: null });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, confirmText: 'Confirm' });
  const [cloudBooks, setCloudBooks] = useState([]);

  /* ─── Admin State ─── */
  const [adminCatalog, setAdminCatalog] = useState([]);
  const [adminEditingBook, setAdminEditingBook] = useState(null);
  const [adminNewBook, setAdminNewBook] = useState({ title: '', author: '', difficulty: 'Beginner', epub_url: '', cover_url: '', free: true, price_cents: 0, stripe_price_id: '', Language: 'English' });

  const hasBook = chapters.length > 0;
  const isAdmin = useMemo(() => user && ADMIN_EMAILS.includes(user.email), [user]);
  const isPremium = useMemo(() => isAdmin || profile?.is_premium === true, [profile, isAdmin]);

  /* ═══════════════════ AUTH EFFECTS ═══════════════════ */

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Clean URL hash after OAuth redirect
      if (window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch/create profile when user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const fetchOrCreateProfile = async () => {
      try {
        // Try to fetch existing profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const newProfile = {
            id: user.id,
            email: user.email,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url || null,
            is_premium: false,
            is_admin: ADMIN_EMAILS.includes(user.email),
            stripe_customer_id: null,
          };
          const { data: created, error: createErr } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (createErr) {
            console.warn('Could not create profile (table may not exist yet):', createErr);
            // Use local fallback profile
            setProfile(newProfile);
          } else {
            setProfile(created);
          }
        } else if (data) {
          setProfile(data);
        }
      } catch (e) {
        console.warn('Profile fetch error:', e);
        // Fallback profile from auth data
        setProfile({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.full_name || 'User',
          avatar_url: user.user_metadata?.avatar_url || null,
          is_premium: false,
          is_admin: ADMIN_EMAILS.includes(user.email),
        });
      }
    };

    fetchOrCreateProfile();
  }, [user]);

  /* ─── Load library on mount ─── */
  useEffect(() => {
    loadAllBooks().then(setLibrary).catch(console.warn);
  }, []);

  /* ─── Fetch Supabase Catalog ─── */
  useEffect(() => {
    if (activeHomeTab === 'marketplace') {
      const fetchCatalog = async () => {
        try {
          setCatalogError(null);
          const { data, error } = await supabase.from('catalog').select('*');
          if (error) throw error;
          if (data && data.length > 0) {
            setMarketplaceBooks(data);
          } else {
            setMarketplaceBooks(MOCK_MARKETPLACE);
          }
        } catch (e) {
          console.error('Error fetching catalog, using mock:', e);
          setMarketplaceBooks(MOCK_MARKETPLACE);
          // Only show error if the user is admin and might need to fix DB
          if (isAdmin) setCatalogError(e.message || JSON.stringify(e));
        }
      };
      fetchCatalog();
    }
  }, [activeHomeTab]);

  /* ─── Fetch Cloud Drive Books ─── */
  useEffect(() => {
    if (activeHomeTab === 'library' && user && isPremium) {
      const fetchCloudDrive = async () => {
        try {
          // Select only ID and title and date to save bandwidth
          const { data, error } = await supabase
            .from('traxbook_drive')
            .select('id, book_title, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });
          if (!error && data) {
            setCloudBooks(data);
          }
        } catch (e) {
          console.error('Failed to load cloud drive books:', e);
        }
      };
      fetchCloudDrive();
    }
  }, [activeHomeTab, user, isPremium]);

  /* ─── Fetch Flashcards Globally ─── */
  useEffect(() => {
    if (user) {
      const fetchCards = async () => {
        try {
          const { data, error } = await supabase.from('flashcards').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          if (!error) setMyFlashcards(data || []);
        } catch (e) {
          console.error(e);
        }
      };
      fetchCards();
    } else {
      setMyFlashcards([]);
    }
  }, [user]);

  /* ═══════════════════ AUTH HANDLERS ═══════════════════ */

  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google sign-in error:', err);
      alert('Could not sign in with Google. Please try again.');
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCurrentView('home');
  }, []);

  /* ═══════════════════ EXISTING HANDLERS ═══════════════════ */

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
      console.warn('Error loading saved translations:', e);
    }

    setChapters(chs);
    computeProgress(chs);
    
    const savedChapterStr = localStorage.getItem(`traxbook_chapter_${id}`);
    const savedChapter = savedChapterStr ? parseInt(savedChapterStr, 10) : 0;
    setCurrentChapter(savedChapter < chs.length ? savedChapter : 0);
    
    setCurrentView('editor');
    
    // Update Library State
    await saveBookData(id, meta, chs);
    const newLib = await loadAllBooks();
    setLibrary(newLib);
  }, [computeProgress]);

  // Save current chapter to localStorage automatically
  useEffect(() => {
    if (bookId) {
      localStorage.setItem(`traxbook_chapter_${bookId}`, currentChapter);
    }
  }, [bookId, currentChapter]);

  /* ─── Handle Open Existing Book ─── */
  const handleOpenLibraryBook = useCallback(async (book) => {
    setLoading(true);
    try {
      await applyBookState(book.id, book.metadata, book.chapters);
    } catch (err) {
      console.error(err);
      alert('Error loading the saved book.');
    } finally {
      setLoading(false);
    }
  }, [applyBookState]);

  /* ─── Handle Download from Public Library (Supabase Mock) ─── */
  const handleDownloadMarketplaceEpub = useCallback(async (book) => {
    if (!book.free) {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      if (!isPremium) {
        setShowUpgradeModal(true);
        return;
      }
    }
    if (!book.epub_url) {
      alert('The URL of this EPUB has not been configured in the database (Supabase Demo) yet.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(book.epub_url);
      if (!res.ok) throw new Error('Download failed. The file may not exist in Storage or there is a CORS error.');
      const arrayBuffer = await res.arrayBuffer();
      
      const { metadata: meta, chapters: chs } = await parseEpub(arrayBuffer);
      meta.title = book.title;
      meta.cover_url = book.cover_url;

      const id = btoa(unescape(encodeURIComponent(meta.title + '||' + meta.creator))).replace(/[^a-zA-Z0-9]/g, '');
      await applyBookState(id, meta, chs);
    } catch (err) {
      console.error(err);
      alert('Error downloading book: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [applyBookState, user, isPremium]);

  /* ─── Handle file ─── */
  const handleFile = useCallback(async (file) => {
    // MANIFESTO: Aceitar upload apenas de arquivos .epub
    if (!file || !file.name.toLowerCase().endsWith('.epub')) {
      alert('Only .epub files are accepted.');
      return;
    }

    // MANIFESTO: Pessoas logadas: Upload 1 arquivo / 7 days
    if (user && !isPremium) {
      const lastUpload = profile?.last_upload_at;
      if (lastUpload) {
        const lastDate = new Date(lastUpload);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        if (lastDate > sevenDaysAgo) {
          alert('Logged-in users can only upload 1 file every 7 days. Upgrade to Premium for infinite uploads!');
          return;
        }
      }
    }

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { metadata: meta, chapters: chs } = await parseEpub(arrayBuffer);

      const id = btoa(unescape(encodeURIComponent(meta.title + '||' + meta.creator))).replace(/[^a-zA-Z0-9]/g, '');
      await applyBookState(id, meta, chs);

      // Update last upload date for logged users
      if (user) {
        await supabase
          .from('profiles')
          .update({ last_upload_at: new Date().toISOString() })
          .eq('id', user.id);
      }
    } catch (err) {
      console.error('Error processing EPUB:', err);
      alert('Could not load this EPUB. Make sure the file is valid.');
    } finally {
      setLoading(false);
    }
  }, [applyBookState, user, isPremium, profile]);

  /* ─── Manual Save Logic ─── */
  const chaptersRef = useRef(chapters);
  useEffect(() => { chaptersRef.current = chapters; }, [chapters]);

  const handleManualSave = useCallback(async () => {
    if (!bookId) return;
    setStatus('Saving...');
    try {
      await saveBookData(bookId, metadata, chaptersRef.current);
      setStatus('Saved');
    } catch (e) {
      console.error('Failed to save:', e);
      setStatus('Modified');
    }
  }, [bookId, metadata]);



  /* ─── Save to Cloud (Premium-Gated) ─── */
  const handleSaveToCloud = useCallback(async (isSilent = false) => {
    if (!user) {
      if (!isSilent) setShowAuthModal(true);
      return;
    }
    if (!isPremium) {
      if (!isSilent) setShowUpgradeModal(true);
      return;
    }

    if (!metadata || chaptersRef.current.length === 0) return;
    setStatus('Saving...');
    
    try {
      const drivePayload = {
        user_id: user.id,
        book_title: metadata.title,
        book_data: { metadata, chapters: chaptersRef.current, currentChapter },
        updated_at: new Date().toISOString()
      };

      // Check if entry exists for this book & user
      const { data: existing, error: searchErr } = await supabase
        .from('traxbook_drive')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_title', metadata.title);
        
      if (searchErr) throw searchErr;

      if (existing && existing.length > 0) {
        const { error: updateErr } = await supabase
          .from('traxbook_drive')
          .update(drivePayload)
          .eq('id', existing[0].id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('traxbook_drive')
          .insert([drivePayload]);
        if (insertErr) throw insertErr;
      }
      
      setStatus('Saved');
      if (!isSilent) {
        setConfirmModal({
          show: true,
          title: 'Traxbook Drive Synced!',
          message: 'Your progress is safely stored in the cloud. You can sync from any device logged into this Google account.',
          confirmText: 'OK',
          onConfirm: () => {}
        });
      }
    } catch (e) {
      console.error('Failed to save to cloud:', e);
      if (!isSilent) alert('Cloud Sync Error: ' + e.message);
      setStatus('Modified');
    }
  }, [metadata, currentChapter, user, isPremium]);

  /* ─── Auto-Save Interval ─── */
  useEffect(() => {
    if (autoSaveInterval === 0 || status === 'Saved') return;
    const interval = setInterval(() => {
      if (status === 'Modified') {
        if (isPremium) {
          handleSaveToCloud(true);
        } else {
          handleManualSave();
        }
      }
    }, autoSaveInterval * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoSaveInterval, status, isPremium, handleSaveToCloud, handleManualSave]);

  /* ─── Translation change ─── */
  const handleTranslationChange = useCallback((chapterIdx, paraIdx, value) => {
    setStatus('Modified');
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
    setCurrentChapter(0);
    setCurrentView('home');
    loadAllBooks().then(setLibrary).catch(console.warn);
  }, []);

  /* ─── Chapter navigation ─── */
  const goToPrevChapter = useCallback(() => {
    setCurrentChapter(prev => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToNextChapter = useCallback(() => {
    setCurrentChapter(prev => Math.min(chapters.length - 1, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chapters.length]);

  const goToChapter = useCallback((idx) => {
    setCurrentChapter(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenCloudBook = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('traxbook_drive')
        .select('book_data')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!data || !data.book_data) throw new Error("No book data found.");
      
      const parsedData = typeof data.book_data === 'string' ? JSON.parse(data.book_data) : data.book_data;
      
      setMetadata(parsedData.metadata);
      setChapters(parsedData.chapters);
      setCurrentChapter(parsedData.currentChapter || 0);
      computeProgress(parsedData.chapters);
      setCurrentView('editor');
    } catch (e) {
      console.error('Failed to open cloud book:', e);
      alert('Error fetching book from cloud: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [computeProgress]);

  /* ─── Delete book ─── */
  const handleDeleteBook = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this book and all translation progress?')) {
      await deleteBookData(id);
      const newLib = await loadAllBooks();
      setLibrary(newLib);
    }
  }, []);
  /* ═══════════════════ FLASHCARDS HANDLERS ═══════════════════ */
  const handleEditorMouseUp = useCallback(() => {
    // MANIFESTO: Pessoas Premium: Create flashcard to Anki
    if (!isPremium) return; 

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;
    const text = selection.toString().trim();
    if (text.length > 0) {
      setFlashcardModal({ show: true, source: text, translation: '', success: false });
    }
  }, [isPremium]);

  const handleSaveFlashcard = async () => {
    if (!user) {
      alert('Sign in to save flashcards.');
      setShowAuthModal(true);
      return;
    }
    if (!flashcardModal.translation.trim()) {
      alert('Please enter a translation.');
      return;
    }
    // setLoading(true); // Removed to prevent whole-app unmount & scroll reset
    try {
      const { error, data } = await supabase.from('flashcards').insert([{
        user_id: user.id,
        source_text: flashcardModal.source,
        translated_text: flashcardModal.translation,
        origin_id: flashcardModal.originId // New column for targeted highlighting
      }]).select();
      if (error) {
         if (error.code === '42P01') throw new Error("The 'flashcards' table doesn't exist yet on Supabase. Please create it!");
         throw error;
      }
      if (data && data.length > 0) {
        setMyFlashcards(prev => [data[0], ...prev]);
      }
      setFlashcardModal(p => ({ ...p, success: true }));
      setTimeout(() => {
        setFlashcardModal({ show: false, source: '', translation: '', success: false, originId: null });
        window.getSelection()?.removeAllRanges();
      }, 1500);
    } catch (err) {
      alert('Error saving flashcard: ' + err.message);
    }
  };

  const handleDownloadCSV = async () => {
    if (!user) {
      alert('Sign in to download your flashcards.');
      setShowAuthModal(true);
      return;
    }
    // MANIFESTO: Pessoas Premium: Create flashcard to Anki
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.from('flashcards').select('source_text, translated_text').eq('user_id', user.id);
      if (error) throw error;
      if (!data || data.length === 0) {
        alert('No flashcards found.');
        return;
      }
      // Anki specific headers for better compatibility
      let csvContent = "#separator:Comma\n#html:true\n"; 
      data.forEach(row => {
        const src = `"${row.source_text.replace(/"/g, '""')}"`;
        const tr = `"${row.translated_text.replace(/"/g, '""')}"`;
        csvContent += `${src},${tr}\n`;
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const fileName = metadata?.title 
        ? `flashcards_${metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`
        : 'flashcards_anki.csv';
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading CSV: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ═══════════════════ ADMIN HANDLERS ═══════════════════ */

  const fetchAdminCatalog = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('catalog').select('*').order('id', { ascending: true });
      if (error) throw error;
      setAdminCatalog(data || []);
    } catch (e) {
      console.error('Admin catalog fetch error:', e);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'admin' && isAdmin) {
      fetchAdminCatalog();
    }
  }, [currentView, isAdmin, fetchAdminCatalog]);

  const handleAdminAddBook = useCallback(async () => {
    if (!adminNewBook.title.trim()) return alert('Title is required');
    try {
      const { error } = await supabase.from('catalog').insert([{
        title: adminNewBook.title,
        author: adminNewBook.author,
        difficulty: adminNewBook.difficulty,
        epub_url: adminNewBook.epub_url,
        cover_url: adminNewBook.cover_url,
        free: adminNewBook.free,
        price_cents: adminNewBook.price_cents || 0,
        stripe_price_id: adminNewBook.stripe_price_id || null,
        Language: adminNewBook.Language || 'English',
      }]);
      if (error) throw error;
      setAdminNewBook({ title: '', author: '', difficulty: 'Beginner', epub_url: '', cover_url: '', free: true, price_cents: 0, stripe_price_id: '', Language: 'English' });
      fetchAdminCatalog();
      alert('Book added to catalog!');
    } catch (e) {
      alert('Error adding book: ' + e.message);
    }
  }, [adminNewBook, fetchAdminCatalog]);

  const handleAdminUpdateBook = useCallback(async (book) => {
    try {
      const { error } = await supabase.from('catalog').update({
        title: book.title,
        author: book.author,
        difficulty: book.difficulty,
        epub_url: book.epub_url,
        cover_url: book.cover_url,
        free: book.free,
        price_cents: book.price_cents || 0,
        stripe_price_id: book.stripe_price_id || null,
        Language: book.Language || 'English',
      }).eq('id', book.id);
      if (error) throw error;
      setAdminEditingBook(null);
      fetchAdminCatalog();
      alert('Book updated!');
    } catch (e) {
      alert('Error updating book: ' + e.message);
    }
  }, [fetchAdminCatalog]);

  const handleAdminDeleteBook = useCallback((id) => {
    setConfirmModal({
      show: true,
      title: 'Remove Book?',
      message: 'Are you sure you want to delete this book from the catalog?',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('catalog').delete().eq('id', id);
          if (error) throw error;
          fetchAdminCatalog();
        } catch (e) {
          alert('Error deleting book: ' + e.message);
        }
      }
    });
  }, [fetchAdminCatalog]);

  /* ─── Count total paragraphs ─── */
  const totalParagraphs = chapters.reduce((sum, ch) => sum + ch.paragraphs.length, 0);

  /* ═══════════════════ RENDER ═══════════════════ */

  // Loading
  if (loading || authLoading) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <div className="spinner-ring" />
          <p>{authLoading ? 'Loading...' : 'Extracting pages from the book...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">

      {/* ═══ Auth Modal ═══ */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuthModal(false)}><Icons.X /></button>
            <div className="auth-modal-body">
              <div className="auth-modal-icon"><Icons.User /></div>
              <h3>Sign in to Traxbook</h3>
              <p>Sign in to save your progress to the cloud, access premium books, and sync across devices.</p>
              <button className="btn-google" onClick={() => { signInWithGoogle(); setShowAuthModal(false); }}>
                <Icons.Google />
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Upgrade Modal ═══ */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUpgradeModal(false)}><Icons.X /></button>
            <div className="auth-modal-body">
              <div className="auth-modal-icon premium-icon"><Icons.Crown /></div>
              <h3>Upgrade to Pro</h3>
              <p>Cloud sync, premium books, and multi-device access are exclusive to Pro subscribers.</p>
              <button className="btn btn-primary btn-lg" onClick={() => { setShowUpgradeModal(false); setCurrentView('pricing'); }}>
                <Icons.Star /> View Plans & Pricing
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ═══ Confirm Modal ═══ */}
      {confirmModal.show && (
        <div className="modal-overlay" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '360px', padding: '32px' }}>
            <div className="auth-modal-body">
              <div className="auth-modal-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
                <Icons.AlertCircle />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{confirmModal.title}</h3>
              <p style={{ fontSize: '0.95rem', marginBottom: '24px', opacity: 0.8 }}>{confirmModal.message}</p>
              
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444' }}
                  onClick={() => {
                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                    setConfirmModal({ ...confirmModal, show: false });
                  }}
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ═══ Flashcard Modal ═══ */}
      {flashcardModal.show && (
        <div className="modal-overlay" onClick={() => setFlashcardModal({ show: false, source: '', translation: '', success: false })}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setFlashcardModal({ show: false, source: '', translation: '', success: false })}><Icons.X /></button>
            <div className="auth-modal-body" style={{ textAlign: 'left', alignItems: 'flex-start' }}>
              <h3 style={{ marginBottom: '1rem' }}>Create Flashcard</h3>
              {flashcardModal.success ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', width: '100%', color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', color: '#10b981' }}>
                    <Icons.Check />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Flashcard saved successfully!</h4>
                </div>
              ) : (
                <>
                  <div style={{ width: '100%', marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Source text</label>
                    <textarea 
                      value={flashcardModal.source}
                      readOnly
                      className="translation-input"
                      style={{ minHeight: '60px', marginTop: '0.5rem', background: 'rgba(255,255,255,0.05)', cursor: 'default' }}
                    />
                  </div>
                  <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Translation</label>
                    <textarea 
                      value={flashcardModal.translation}
                      onChange={(e) => setFlashcardModal(p => ({ ...p, translation: e.target.value }))}
                      placeholder="Enter translation for the selected text..."
                      className="translation-input"
                      style={{ minHeight: '60px', marginTop: '0.5rem' }}
                      autoFocus
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
                    <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setFlashcardModal({ show: false, source: '', translation: '', success: false })}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} onClick={handleSaveFlashcard}>
                      <Icons.Save /> Save
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Header ═══ */}
      <header className="app-header">
        <div className="header-brand" onClick={() => { if (!hasBook) setCurrentView('home'); else clearBook(); }} style={{ cursor: 'pointer' }}>
          <Icons.Globe />
          <h1 className="gradient-text">Traxbook<span></span></h1>
        </div>
        
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
        </button>

        <div className={`header-actions ${mobileMenuOpen ? 'is-open' : ''}`}>
          {currentView === 'editor' && hasBook && (
            <>
              <select 
                value={autoSaveInterval} 
                onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                className="auto-save-select"
                title="Auto-save interval"
              >
                <option value={0}>Auto-save: Off</option>
                <option value={1}>Auto-save: 1 min</option>
                <option value={2}>Auto-save: 2 min</option>
                <option value={5}>Auto-save: 5 min</option>
                <option value={10}>Auto-save: 10 min</option>
              </select>

              {!isPremium && (
                <button 
                  className={`btn btn-ghost manual-save-btn ${status === 'Modified' ? 'is-modified' : ''}`} 
                  onClick={handleManualSave} 
                  disabled={status === 'Saved' || status === 'Saving...'}
                  title={status === 'Modified' ? "Save changes" : "All saved"}
                >
                  <Icons.Save /> {status === 'Modified' ? 'Save' : status}
                </button>
              )}
              <button 
                className="btn btn-ghost" 
                onClick={() => handleSaveToCloud()} 
                disabled={status === 'Saving...'}
                title="Save your translation progress to the cloud"
              >
                <Icons.Cloud /> Save to Cloud
              </button>

               <button className="btn btn-ghost" onClick={() => exportAsEpub(metadata, chapters, user?.email)} title="Export new EPUB">
                <Icons.Download /> Export EPUB
              </button>
              <button className="btn btn-secondary" onClick={clearBook}>
                <Icons.LogOut /> Exit
              </button>
            </>
          )}

          {currentView !== 'editor' && (
            <>
              {isAdmin && (
                <button className="btn btn-ghost" onClick={() => setCurrentView(currentView === 'admin' ? 'home' : 'admin')} title="Admin Panel">
                  <Icons.Settings /> {currentView === 'admin' ? 'Exit Admin' : 'Admin'}
                </button>
              )}
              {user ? (
                <div className="user-menu">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="user-avatar" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="user-avatar-fallback"><Icons.User /></div>
                  )}
                  <span className="user-name">{profile?.display_name || user.email?.split('@')[0]}</span>
                  {isPremium && <span className="pro-badge"><Icons.Crown /> Pro</span>}
                  <button className="btn btn-ghost btn-sm" onClick={signOut} title="Sign out">
                    <Icons.LogOut />
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => setShowAuthModal(true)}>
                  <Icons.User /> Sign In
                </button>
              )}
            </>
          )}
        </div>
      </header>

      {/* ═══ Main ═══ */}
      <main className="app-main">

        {/* ─── VIEW: PRICING ─── */}
        {currentView === 'pricing' && (
          <section className="pricing-section fade-in">
            <button className="btn btn-ghost back-btn" onClick={() => setCurrentView('home')}>
              <Icons.ArrowLeft /> Back
            </button>
            <div className="pricing-hero">
              <h2>Choose Your <span className="gradient-text">Plan</span></h2>
              <p>Unlock the full power of Traxbook to accelerate your language learning journey.</p>
            </div>
            <div className="pricing-grid">
              {/* Free Plan */}
              <div className="pricing-card">
                <div className="pricing-card-header">
                  <h3>Free</h3>
                  <div className="pricing-price">
                    <span className="pricing-amount">$0</span>
                    <span className="pricing-period">forever</span>
                  </div>
                </div>
                <ul className="pricing-features">
                  <li><Icons.Check /> Upload your own EPUBs</li>
                  <li><Icons.Check /> Translate offline in browser</li>
                  <li><Icons.Check /> Export translated EPUB</li>
                  <li><Icons.Check /> Access free public books</li>
                  <li className="pricing-disabled"><Icons.X /> Save to Cloud</li>
                  <li className="pricing-disabled"><Icons.X /> Multi-device sync</li>
                  <li className="pricing-disabled"><Icons.X /> Premium book library</li>
                </ul>
                <button className="btn btn-secondary btn-block" disabled>Current Plan</button>
              </div>

              {/* Pro Plan */}
              <div className="pricing-card pricing-card-pro">
                <div className="pricing-popular-tag">Most Popular</div>
                <div className="pricing-card-header">
                  <h3><Icons.Crown /> Pro</h3>
                  <div className="pricing-price">
                    <span className="pricing-amount">$9.90</span>
                    <span className="pricing-period">/month</span>
                  </div>
                </div>
                <ul className="pricing-features">
                  <li><Icons.Check /> Everything in Free</li>
                  <li className="pricing-highlight"><Icons.Cloud /> Save to Cloud</li>
                  <li className="pricing-highlight"><Icons.Smartphone /> Multi-device sync</li>
                  <li className="pricing-highlight"><Icons.Infinity /> Unlimited premium books</li>
                  <li><Icons.Shield /> Priority support</li>
                  <li><Icons.Zap /> Early access to new features</li>
                </ul>
                 <button
                  className="btn btn-primary btn-block btn-lg"
                  data-stripe-price-id="price_1TOIa5F0lxCQwtFq9pAZKIOH"
                  onClick={() => {
                    // MANIFESTO: Apenas pessoas logadas podem comprar plano premium
                    if (!user) {
                      setShowAuthModal(true);
                    } else {
                      // Integrated Stripe Redirect
                      window.location.href = `https://checkout.stripe.com/pay/price_1TOIa5F0lxCQwtFq9pAZKIOH`;
                      // Note: In production you'd use the Stripe SDK to create a session
                    }
                  }}
                >
                  <Icons.Star /> Subscribe Now
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ─── VIEW: ADMIN ─── */}
        {currentView === 'admin' && isAdmin && (
          <section className="admin-section fade-in">
            <button className="btn btn-ghost back-btn" onClick={() => setCurrentView('home')}>
              <Icons.ArrowLeft /> Back to Home
            </button>
            <div className="admin-header">
              <h2><Icons.Settings /> Admin Dashboard</h2>
              <p>Manage the Public Library catalog, pricing, and subscription plans.</p>
            </div>

            {/* ─── Add New Book Form ─── */}
            <div className="admin-card glass">
              <h3><Icons.Plus /> Add New Book to Catalog</h3>
              <div className="admin-form-grid">
                <input placeholder="Title *" value={adminNewBook.title} onChange={(e) => setAdminNewBook(p => ({ ...p, title: e.target.value }))} />
                <input placeholder="Author" value={adminNewBook.author} onChange={(e) => setAdminNewBook(p => ({ ...p, author: e.target.value }))} />
                <input placeholder="EPUB URL" value={adminNewBook.epub_url} onChange={(e) => setAdminNewBook(p => ({ ...p, epub_url: e.target.value }))} />
                <input placeholder="Cover Image URL" value={adminNewBook.cover_url} onChange={(e) => setAdminNewBook(p => ({ ...p, cover_url: e.target.value }))} />
                <select value={adminNewBook.difficulty} onChange={(e) => setAdminNewBook(p => ({ ...p, difficulty: e.target.value }))}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Difficult">Difficult</option>
                </select>
                <input placeholder="Language" value={adminNewBook.Language} onChange={(e) => setAdminNewBook(p => ({ ...p, Language: e.target.value }))} />
                <label className="admin-checkbox">
                  <input type="checkbox" checked={adminNewBook.free} onChange={(e) => setAdminNewBook(p => ({ ...p, free: e.target.checked }))} /> Free
                </label>
                {!adminNewBook.free && (
                  <>
                    <input type="number" placeholder="Price (cents)" value={adminNewBook.price_cents} onChange={(e) => setAdminNewBook(p => ({ ...p, price_cents: Number(e.target.value) }))} />
                    <input placeholder="Stripe Price ID (price_...)" value={adminNewBook.stripe_price_id} onChange={(e) => setAdminNewBook(p => ({ ...p, stripe_price_id: e.target.value }))} />
                  </>
                )}
              </div>
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handleAdminAddBook}>
                <Icons.Plus /> Add Book
              </button>
            </div>

            {/* ─── Catalog Table ─── */}
            <div className="admin-card glass">
              <h3><Icons.Book /> Catalog ({adminCatalog.length} books)</h3>
              {adminCatalog.length === 0 ? (
                <p style={{ opacity: 0.5 }}>No books in catalog yet. Add one above.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Difficulty</th>
                        <th>Language</th>
                        <th>Free</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminCatalog.map(book => (
                        <tr key={book.id}>
                          {adminEditingBook?.id === book.id ? (
                            <>
                              <td><input value={adminEditingBook.title} onChange={(e) => setAdminEditingBook(p => ({ ...p, title: e.target.value }))} /></td>
                              <td><input value={adminEditingBook.author || ''} onChange={(e) => setAdminEditingBook(p => ({ ...p, author: e.target.value }))} /></td>
                              <td>
                                <select value={adminEditingBook.difficulty || 'Beginner'} onChange={(e) => setAdminEditingBook(p => ({ ...p, difficulty: e.target.value }))}>
                                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Difficult</option>
                                </select>
                              </td>
                              <td><input value={adminEditingBook.Language || ''} onChange={(e) => setAdminEditingBook(p => ({ ...p, Language: e.target.value }))} /></td>
                              <td>
                                <input type="checkbox" checked={adminEditingBook.free} onChange={(e) => setAdminEditingBook(p => ({ ...p, free: e.target.checked }))} />
                              </td>
                              <td><input type="number" value={adminEditingBook.price_cents || 0} onChange={(e) => setAdminEditingBook(p => ({ ...p, price_cents: Number(e.target.value) }))} /></td>
                              <td className="admin-actions">
                                <button className="btn btn-primary btn-sm" onClick={() => handleAdminUpdateBook(adminEditingBook)}><Icons.Check /></button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setAdminEditingBook(null)}><Icons.X /></button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td>{book.title}</td>
                              <td>{book.author}</td>
                              <td><span className={`mk-diff mode-${(book.difficulty || 'beginner').trim().toLowerCase()}`}>{book.difficulty || 'Beginner'}</span></td>
                              <td>{book.Language || '—'}</td>
                              <td>{book.free ? '✓ Free' : '💎 Paid'}</td>
                              <td>{book.free ? '—' : `$${((book.price_cents || 0) / 100).toFixed(2)}`}</td>
                              <td className="admin-actions">
                                <button className="btn btn-ghost btn-sm" onClick={() => setAdminEditingBook({ ...book })} title="Edit"><Icons.Edit /></button>
                                <button className="btn btn-ghost btn-sm" onClick={() => handleAdminDeleteBook(book.id)} title="Delete" style={{ color: '#ef4444' }}><Icons.Trash /></button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ─── Subscription Management ─── */}
            <div className="admin-card glass">
              <h3><Icons.CreditCard /> Subscription Plan (Stripe)</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Configure the monthly Pro plan that unlocks "Save to Cloud" for subscribers.
              </p>
              <div className="admin-form-grid">
                <div className="admin-stripe-row">
                  <label>Plan Name</label>
                  <input defaultValue="Traxbook Pro Monthly" disabled />
                </div>
                <div className="admin-stripe-row">
                  <label>Monthly Price</label>
                  <input defaultValue="$9.90" disabled />
                </div>
                <div className="admin-stripe-row">
                  <label>Stripe Price ID</label>
                  <input placeholder="price_XXXXXXXXXXXXXXX" defaultValue="" />
                </div>
                <div className="admin-stripe-row">
                  <label>Stripe Webhook URL</label>
                  <input placeholder="https://your-domain.com/api/stripe/webhook" defaultValue="" />
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '16px' }}>
                ⚠️ These fields are display-only for now. Connect your Stripe account and update the environment variables to activate payment processing.
              </p>
            </div>
          </section>
        )}

        {/* ─── VIEW: HOME ─── */}
        {currentView === 'home' && (
          <section className="welcome-section">
            <h2>
              Turn any EPUB into a{' '}
              <span className="gradient-text">personalized translation workout.</span>
            </h2>
            <p>
              Load your EPUB file and start translating instantly.
              {isPremium 
                ? "All your progress is securely saved in the cloud (Traxbook Drive)."
                : "All your progress is saved offline in your browser."}
            </p>

            {/* ─── Tabs Navigation ─── */}
            <div className="home-tabs">
              <button 
                className={`home-tab ${activeHomeTab === 'library' ? 'active' : ''}`}
                onClick={() => setActiveHomeTab('library')}
              >
                <Icons.Library /> My Library and Uploads
              </button>
              <button 
                className={`home-tab ${activeHomeTab === 'marketplace' ? 'active' : ''}`}
                onClick={() => setActiveHomeTab('marketplace')}
              >
                <Icons.Globe2 /> Public Library (Explore)
              </button>
              {user && (
                <button 
                  className={`home-tab ${activeHomeTab === 'flashcards' ? 'active' : ''}`}
                  onClick={() => setActiveHomeTab('flashcards')}
                >
                  <Icons.Star /> My Flashcards
                </button>
              )}
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
                  <span className="drop-text-main">Drag your EPUB or click here</span>
                  <span className="drop-text-sub">Only .epub files are accepted</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".epub"
                    hidden
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>

                {(!isPremium && library.length > 0) && (
                  <div className="library-section">
                    <h3 className="library-title">Your Local Library</h3>
                    <div className="library-grid">
                      {library.map(book => (
                        <div key={book.id} className="lib-card">
                          <div className="lib-card-info" onClick={() => handleOpenLibraryBook(book)}>
                            <h4 className="lib-title">{book.metadata.title}</h4>
                            <p className="lib-author">{book.metadata.creator}</p>
                          </div>
                          <button className="lib-delete-btn" onClick={() => handleDeleteBook(book.id)} title="Delete book and translations">
                            <Icons.Trash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {user && isPremium && cloudBooks.length > 0 && (
                  <div className="library-section" style={{ marginTop: '2rem' }}>
                    <h3 className="library-title">
                      <Icons.Cloud /> Traxbook Cloud Drive
                    </h3>
                    <div className="library-grid">
                      {cloudBooks.map(book => (
                        <div key={book.id} className="lib-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                          <div className="lib-card-info" onClick={() => handleOpenCloudBook(book.id)}>
                            <h4 className="lib-title">{book.book_title}</h4>
                            <p className="lib-author" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                              Last synced: {(() => {
                                const d = new Date(book.updated_at.endsWith('Z') ? book.updated_at : book.updated_at + 'Z');
                                return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                              })()}
                            </p>
                          </div>
                          <button 
                            className="lib-delete-btn" 
                            title="Delete from cloud" 
                            onClick={() => {
                              setConfirmModal({
                                show: true,
                                title: 'Excluir da Nuvem?',
                                message: 'Isto removerá o livro do seu Cloud Drive permanentemente.',
                                confirmText: 'Apagar',
                                onConfirm: async () => {
                                  try {
                                    await supabase.from('traxbook_drive').delete().eq('id', book.id);
                                    setCloudBooks(prev => prev.filter(b => b.id !== book.id));
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }
                              });
                            }}
                          >
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
                  <h3>Discover Classics</h3>
                  <p>Start your translation journey right now without downloading anything.</p>
                </div>
                
                <div className="marketplace-grid">
                  {/* MANIFESTO: Access Combos */}
                  {activeHomeTab === 'marketplace' && !isPremium && (
                    <div className="mk-card combo-card" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white' }}>
                      <div className="mk-info" style={{ height: '100%', justifyContent: 'center', padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', width: 'fit-content' }}>
                          <Icons.Zap /> Access Combo
                        </div>
                        <h4 style={{ color: 'white', fontSize: '1.4rem' }}>Classical Literature Pack</h4>
                        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>Dracula + Sherlock Holmes + Moby Dick</p>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>$12.00</div>
                        <button 
                          className="btn btn-primary" 
                          style={{ background: 'white', color: '#4f46e5', border: 'none' }}
                          onClick={() => {
                            if (!user) setShowAuthModal(true);
                            else window.location.href = `https://checkout.stripe.com/pay/price_1TOIaQF0lxCQwtFqiDtYDNU8`;
                          }}
                        >
                          Buy Combo
                        </button>
                      </div>
                    </div>
                  )}

                  {catalogError ? (
                    <div style={{ gridColumn: '1 / -1', color: '#ff4d4f', padding: '1rem', background: '#ffe6e6', borderRadius: '8px' }}>
                      <strong>Error reading from Supabase:</strong> {catalogError}
                      <p style={{ marginTop: '10px', fontSize: '0.9em' }}>
                        Tip: Go to the Supabase SQL Editor and run the command: <br/>
                        <code>ALTER TABLE catalog DISABLE ROW LEVEL SECURITY;</code>
                      </p>
                    </div>
                  ) : marketplaceBooks.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.6, gridColumn: '1 / -1' }}>Loading cloud catalog or no books available...</p>
                  ) : (
                    marketplaceBooks.map(book => {
                      // MANIFESTO: Descontos em livros para Premium
                      const displayPrice = isPremium 
                        ? `$${((book.price_cents || 0) * 0.8 / 100).toFixed(2)}` // 20% Discount
                        : `$${((book.price_cents || 0) / 100).toFixed(2)}`;
                      
                      return (
                        <div key={book.id} className="mk-card">
                          <div className="mk-cover" style={{ backgroundImage: `url(${book.cover_url || ''})` }}>
                            {!book.free && !isPremium && (
                              <div className="mk-premium-badge">
                                <Icons.Lock /> Premium
                              </div>
                            )}
                            {isPremium && !book.free && (
                              <div className="mk-premium-badge" style={{ background: '#10b981' }}>
                                <Icons.Zap /> Exclusive Price
                              </div>
                            )}
                          </div>
                          <div className="mk-info">
                            <div className="mk-meta-row">
                              <span className={`mk-diff mode-${(book.difficulty || 'beginner').trim().toLowerCase()}`}>
                                {book.difficulty || 'Beginner'}
                              </span>
                              {!book.free && (
                                <span className="mk-price-tag">{displayPrice}</span>
                              )}
                            </div>
                            <h4>{book.title}</h4>
                            <p>{book.author}</p>
                            <button 
                              className={`btn ${book.free || isPremium ? 'btn-primary' : 'btn-secondary'} mk-action-btn`}
                              onClick={() => {
                                if (!book.free && !isPremium && !user) {
                                  setShowAuthModal(true);
                                } else if (!book.free && !isPremium) {
                                  // Buy individual book
                                  window.location.href = `https://checkout.stripe.com/pay/${book.stripe_price_id || 'price_1TOIaIF0lxCQwtFqj99VXrl0'}`;
                                } else {
                                  handleDownloadMarketplaceEpub(book);
                                }
                              }}
                            >
                              {book.free || isPremium ? 'Start Translating' : 'Buy Now'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ─── Tab Content: FLASHCARDS ─── */}
            {activeHomeTab === 'flashcards' && user && (
              <div className="tab-pane fade-in">
                <div className="marketplace-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3>My Flashcards</h3>
                    <p>Review and edit the flashcards you created while reading.</p>
                  </div>
                  {myFlashcards.length > 0 && (
                    <button className="btn btn-secondary" onClick={handleDownloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icons.Download /> .csv to Anki
                    </button>
                  )}
                </div>

                <div className="flashcards-grid">
                  {myFlashcards.length === 0 ? (
                    <p style={{ gridColumn: '1 / -1', opacity: 0.5, textAlign: 'center', padding: '2rem' }}>You haven't created any flashcards yet. Select text while translating a book to add one.</p>
                  ) : (
                    myFlashcards.map(card => (
                      <div key={card.id} className="fc-card glass">
                        {editingCard?.id === card.id ? (
                          <div className="fc-editor">
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Source</label>
                            <input 
                              className="translation-input"
                              value={editingCard.source_text} 
                              onChange={e => setEditingCard({...editingCard, source_text: e.target.value})} 
                              style={{ marginBottom: '0.5rem', background: 'rgba(0,0,0,0.1)' }}
                            />
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Translation</label>
                            <input 
                              className="translation-input"
                              value={editingCard.translated_text} 
                              onChange={e => setEditingCard({...editingCard, translated_text: e.target.value})} 
                              style={{ marginBottom: '1rem' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setEditingCard(null)}>Cancel</button>
                              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={async () => {
                                try {
                                  if (!editingCard.source_text.trim() || !editingCard.translated_text.trim()) return;
                                  const {error} = await supabase.from('flashcards').update({ source_text: editingCard.source_text, translated_text: editingCard.translated_text }).eq('id', editingCard.id);
                                  if (error) throw error;
                                  setMyFlashcards(prev => prev.map(c => c.id === editingCard.id ? { ...c, source_text: editingCard.source_text, translated_text: editingCard.translated_text } : c));
                                  setEditingCard(null);
                                } catch (e) {
                                  alert(e.message);
                                }
                              }}><Icons.Check /> Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="fc-content">
                              <div className="fc-source">{card.source_text}</div>
                              <div className="fc-divider"></div>
                              <div className="fc-translation">{card.translated_text}</div>
                            </div>
                            <div className="fc-actions">
                              <button className="btn btn-ghost btn-sm" onClick={() => setEditingCard(card)} title="Edit"><Icons.Edit /></button>
                              <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} onClick={() => {
                                setConfirmModal({
                                  show: true,
                                  title: 'Delete Card?',
                                  message: 'Are you sure you want to remove this flashcard?',
                                  confirmText: 'Delete',
                                  onConfirm: async () => {
                                    try {
                                      const { error } = await supabase.from('flashcards').delete().eq('id', card.id);
                                      if (error) throw error;
                                      setMyFlashcards(prev => prev.filter(c => c.id !== card.id));
                                    } catch(e) {
                                      console.error("Delete error:", e);
                                      alert("Error deleting from cloud: " + e.message);
                                    }
                                  }
                                });
                              }} title="Delete"><Icons.Trash /></button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ─── Features Strip ─── */}
            <div className="features-strip">
              <div className="feature-item"><Icons.Shield /> Offline-first</div>
              <div className="feature-item"><Icons.Zap /> Instant parsing</div>
              <div className="feature-item"><Icons.Cloud /> Cloud sync (Pro)</div>
            </div>
          </section>
        )}

        {/* ─── VIEW: EDITOR ─── */}
        {currentView === 'editor' && hasBook && (
          <section className="editor-section">
            {/* Book Card */}
            <div className="book-card glass">
              {metadata?.cover_url ? (
                <div 
                  className="book-cover-placeholder" 
                  style={{ 
                    backgroundImage: `url(${metadata.cover_url})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    border: 'none'
                  }} 
                />
              ) : (
                <div className="book-cover-placeholder">
                  <Icons.Book />
                </div>
              )}
              <div className="book-info">
                <h3>{metadata?.title}</h3>
                <p className="author">by {metadata?.creator || 'Unknown Author'}</p>
                <div className="book-stats">
                  <span className="stat-chip"><Icons.Hash /> {totalParagraphs} lines</span>
                  <span className="stat-chip"><Icons.Book /> {chapters.length} chapters</span>
                </div>
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Translation Progress</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter Navigation */}
            {chapters.length > 1 && (
              <div className="chapter-nav">
                <button
                  className="chapter-nav-btn"
                  onClick={goToPrevChapter}
                  disabled={currentChapter === 0}
                  title="Previous chapter"
                >
                  <Icons.ChevronLeft />
                </button>

                <div className="chapter-nav-select-wrapper">
                  <select
                    className="chapter-nav-select"
                    value={currentChapter}
                    onChange={(e) => goToChapter(Number(e.target.value))}
                  >
                    {chapters.map((ch, i) => (
                      <option key={i} value={i}>
                        {ch.chapterLabel} ({ch.paragraphs.length} lines)
                      </option>
                    ))}
                  </select>
                  <Icons.ChevronDown />
                </div>

                <button
                  className="chapter-nav-btn"
                  onClick={goToNextChapter}
                  disabled={currentChapter === chapters.length - 1}
                  title="Next chapter"
                >
                  <Icons.ChevronRight />
                </button>

                <span className="chapter-nav-counter">
                  {currentChapter + 1} / {chapters.length}
                </span>
              </div>
            )}

            {/* Translation List — Paginated by Chapter */}
            <div className="translation-list">
              {chapters[currentChapter] && (
                <React.Fragment key={currentChapter}>
                  <div className="chapter-divider">
                    <span className="chapter-label">{chapters[currentChapter].chapterLabel}</span>
                  </div>
                  {chapters[currentChapter].paragraphs.map((p, pi) => (
                    <TranslationRow
                      key={p.id}
                      paragraph={p}
                      flashcards={myFlashcards}
                      onTranslationChange={(val) => handleTranslationChange(currentChapter, pi, val)}
                      onSelect={(text) => setFlashcardModal({ show: true, source: text, translation: '', success: false, originId: p.id })}
                    />
                  ))}
                </React.Fragment>
              )}
            </div>

            {/* Bottom Chapter Navigation */}
            {chapters.length > 1 && (
              <div className="chapter-nav chapter-nav-bottom">
                <button
                  className="chapter-nav-btn"
                  onClick={goToPrevChapter}
                  disabled={currentChapter === 0}
                >
                  <Icons.ChevronLeft /> Previous
                </button>
                <span className="chapter-nav-counter">
                  {currentChapter + 1} / {chapters.length}
                </span>
                <button
                  className="chapter-nav-btn"
                  onClick={goToNextChapter}
                  disabled={currentChapter === chapters.length - 1}
                >
                  Next <Icons.ChevronRight />
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

/* ─────────────────── TRANSLATION ROW (memoized) ─────────────────── */
const TranslationRow = React.memo(({ paragraph, flashcards, onTranslationChange, onSelect }) => {
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

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;
    const text = selection.toString().trim();
    if (text.length > 0) {
      onSelect(text);
    }
  };

  const renderedSource = useMemo(() => {
    if (!flashcards || flashcards.length === 0 || !paragraph.source) return paragraph.source;

    // Filter cards: Only highlight if they originated in this paragraph
    // or if they don't have an origin_id (old cards)
    const validCards = flashcards.filter(c => !c.origin_id || c.origin_id === paragraph.id);
    
    if (validCards.length === 0) return paragraph.source;

    const phrases = validCards
      .map(c => c.source_text?.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    if (phrases.length === 0) return paragraph.source;

    // Escape special characters
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = phrases.map(escapeRegExp).join('|');
    const regex = new RegExp(`(${regexPattern})`, 'gi');

    const parts = paragraph.source.split(regex);

    return parts.map((part, index) => {
      // Because we used capture groups, every odd index is a matched flashcard
      if (index % 2 === 1) {
        return <mark key={index} className="flashcard-highlight">{part}</mark>;
      }
      return part ? <React.Fragment key={index}>{part}</React.Fragment> : null;
    });
  }, [paragraph.source, flashcards]);

  return (
    <div className="text-pair">
      <p className={`source-text ${paragraph.isHeading ? 'heading' : ''}`} onMouseUp={handleMouseUp}>
        {renderedSource}
      </p>
      <textarea
        ref={textareaRef}
        className={`translation-input ${localVal ? 'has-content' : ''}`}
        placeholder="Translate here..."
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
