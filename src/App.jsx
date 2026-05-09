import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import { supabase } from './supabaseClient';

/* ─────────────────── SVG ICON COMPONENTS ─────────────────── */
const Icons = {
  Globe: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
  ),
  Book: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
  ),
  Save: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.222 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7.778a2 2 0 0 0-.586-1.414l-3.778-3.778a2 2 0 0 0-1.414-.586Z" />
      <path d="M15 2v5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V2" />
      <path d="M17 22v-8a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v8" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
  ),
  Hash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
  ),
  Library: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
  ),
  Globe2: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><circle cx="12" cy="12" r="10" /></svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
  ),
  LogOut: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
  ),
  ChevronLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
  ),
  ChevronDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
  ),
  AlertCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  ),
  Cloud: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  ),
  Crown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" /><path d="M3 20h18" /></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
  ),
  Star: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
  ),
  CreditCard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
  ),
  Google: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  ),
  Smartphone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
  ),
  Infinity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" /></svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
  ),
};

/* ─────────────────── ADMIN CONFIG ─────────────────── */
// Add your admin email(s) here
const ADMIN_EMAILS = ['marcosjscabral@gmail.com'];

/* ─────────────────── STRIPE PRICING CONFIG ─────────────────── */
const DEFAULT_PREMIUM_PLAN = {
  name: 'TraxBook Premium',
  description: 'Infinite upload, Cloud Sync, Anki Flashcards, Multi-device sync, and Exclusive Discounts.',
  price_cents: 590,
  currency: 'brl',
  interval: 'month',
  stripe_price_id: 'price_1TQaFUF0lxCQwtFqphGyANtC',
  stripe_product_id: 'prod_UPP38mXAutU8uz',
  stripe_payment_link: 'https://buy.stripe.com/dRmaEX2vk3qW6Y05dEcwg0l',
};

// Load saved premium plan from localStorage or use default
function loadPremiumPlan() {
  try {
    const saved = localStorage.getItem('traxbook_premium_plan');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clear stale cache if it points to an old/inactive price
      if (parsed.stripe_price_id && parsed.stripe_price_id !== DEFAULT_PREMIUM_PLAN.stripe_price_id) {
        localStorage.removeItem('traxbook_premium_plan');
        return DEFAULT_PREMIUM_PLAN;
      }
      return { ...DEFAULT_PREMIUM_PLAN, ...parsed };
    }
  } catch (e) { /* ignore */ }
  return DEFAULT_PREMIUM_PLAN;
}

// Centralized map: stripe_price_id → Payment Link URL
const STRIPE_PAYMENT_LINKS = {
  'price_1TQaFUF0lxCQwtFqphGyANtC': 'https://buy.stripe.com/dRmaEX2vk3qW6Y05dEcwg0l',  // Premium Subscription (BRL R$5,90/mo)
  'price_1TQZZEF0lxCQwtFq9zKNq0iN': 'https://buy.stripe.com/cNi28rc5U7Hcbeg7lMcwg0b',  // Legacy Premium (USD - INACTIVE)
  'price_1TOIa5F0lxCQwtFq9pAZKIOH': 'https://buy.stripe.com/4gM7sLd9Y1iObeg35wcwg00',  // Old Premium Subscription
  'price_1TOIaIF0lxCQwtFqj99VXrl0': 'https://buy.stripe.com/5kQ00j4DsaTodmo35wcwg01',  // Dracula
  'price_1TOIaIF0lxCQwtFq9YDWh6dz': 'https://buy.stripe.com/14A8wPgmagdIgyA8pQcwg02',  // Sherlock Holmes
  'price_1TOIaQF0lxCQwtFqiDtYDNU8': 'https://buy.stripe.com/6oUfZhc5U8Lgeqs21scwg03',  // Access Combo
  'price_1TOLTwF0lxCQwtFqCD8vs4Z8': 'https://buy.stripe.com/5kQ14n0nc9Pk5TW9tUcwg05',  // Moby Dick
  'price_1TOLYkF0lxCQwtFq2CwVM2XR': 'https://buy.stripe.com/bJe9ATee25z40zC0Xocwg04',  // Jesus the Christ
};

// Helper: detect the browser locale in a Stripe-compatible format (e.g. "pt-BR", "en", "es")
function getBrowserLocale() {
  const lang = navigator.language || navigator.languages?.[0] || 'auto';
  // Stripe supports full locales like pt-BR, en-US, or short codes like pt, en, es
  // We pass it as-is; Stripe will fall back to 'auto' if unrecognised
  return lang;
}

// Helper: resolve the correct payment link for a book or plan
// Appends client_reference_id so the Stripe webhook can identify the Supabase user
// Appends locale so Stripe Checkout renders in the user's browser language
function getPaymentLink(stripePriceId, fallbackPaymentLink, userId) {
  // Clean inputs just in case they come as string 'null' or have whitespace
  const cleanFallback = (fallbackPaymentLink && fallbackPaymentLink !== 'null' && fallbackPaymentLink !== 'undefined') ? fallbackPaymentLink.trim() : null;
  const cleanPriceId = (stripePriceId && stripePriceId !== 'null' && stripePriceId !== 'undefined') ? stripePriceId.trim() : null;

  const baseUrl = cleanFallback || (cleanPriceId ? STRIPE_PAYMENT_LINKS[cleanPriceId] : null);

  if (!baseUrl) {
    console.error(`[Stripe] Not Configured: priceId=${stripePriceId}, fallback=${fallbackPaymentLink}`);
    return null;
  }

  // Build query params
  const params = new URLSearchParams();
  if (userId) params.set('client_reference_id', userId);
  params.set('locale', getBrowserLocale());

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${params.toString()}`;
}

// Helper: call Stripe Admin Edge Function
async function callStripeAdmin(action, payload) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/stripe-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Stripe API error');
  return data;
}

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
    stripe_payment_link: 'https://buy.stripe.com/5kQ00j4DsaTodmo35wcwg01',
    Language: 'English'
  },
  {
    id: 'm2',
    title: 'Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    difficulty: 'Intermediate',
    epub_url: 'https://raw.githubusercontent.com/IDPF/epub3-samples/master/30/sherlock-holmes/sherlock-holmes.epub',
    cover_url: 'https://m.media-amazon.com/images/I/81B+GVD0tVL._AC_UF1000,1000_QL80_.jpg',
    free: false,
    price_cents: 500,
    stripe_price_id: 'price_1TOIaIF0lxCQwtFq9YDWh6dz',
    stripe_payment_link: 'https://buy.stripe.com/14A8wPgmagdIgyA8pQcwg02',
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
    price_cents: 0,
    Language: 'English'
  },
  {
    id: 'm4',
    title: 'Moby Dick',
    author: 'Herman Melville',
    difficulty: 'Advanced',
    epub_url: 'https://raw.githubusercontent.com/IDPF/epub3-samples/master/30/moby-dick/moby-dick.epub',
    cover_url: 'https://m.media-amazon.com/images/I/81fH+x4A1GL._AC_UF1000,1000_QL80_.jpg',
    free: true,
    price_cents: 0,
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
    } catch (e) { console.warn("Failed to read project backup in the epub."); }
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
  const [flippedCardIds, setFlippedCardIds] = useState([]);
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
  const [pendingUpgradeModal, setPendingUpgradeModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [flashcardModal, setFlashcardModal] = useState({ show: false, source: '', translation: '', success: false, originId: null, locationInfo: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, confirmText: 'Confirm' });
  const [cloudBooks, setCloudBooks] = useState([]);

  /* ─── Admin State ─── */
  const [adminCatalog, setAdminCatalog] = useState([]);
  const [adminEditingBook, setAdminEditingBook] = useState(null);
  const [adminNewBook, setAdminNewBook] = useState({ title: '', author: '', difficulty: 'Beginner', epub_url: '', cover_url: '', free: true, premium_only: false, price_cents: 0, stripe_price_id: '', stripe_payment_link: '', Language: 'English' });
  const [PREMIUM_PLAN, setPREMIUM_PLAN] = useState(loadPremiumPlan);
  const [editingPremiumPlan, setEditingPremiumPlan] = useState(false);
  const [premiumDraft, setPremiumDraft] = useState(null);

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

  /* ─── Open Upgrade Modal after login if PRO was clicked ─── */
  useEffect(() => {
    if (user && pendingUpgradeModal) {
      setShowUpgradeModal(true);
      setPendingUpgradeModal(false);
    }
  }, [user, pendingUpgradeModal]);

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

  /* ─── Detect Stripe Payment Return ─── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeSuccess = params.get('stripe_success');
    const stripeCancel = params.get('stripe_cancel');

    if (stripeSuccess === 'true' && user) {
      // Clean URL
      window.history.replaceState(null, '', window.location.pathname);

      // Re-fetch profile from Supabase since webhook may have updated is_premium
      const refreshProfile = async () => {
        // Small delay to let webhook process
        await new Promise(r => setTimeout(r, 2000));
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (!error && data) {
            setProfile(data);
            if (data.is_premium) {
              alert('🎉 Payment successful! Welcome to Traxbook Premium! Your account has been upgraded.');
            } else {
              alert('✅ Payment received! Your Premium status will activate in a few moments. Please refresh the page if needed.');
            }
          }
        } catch (e) {
          console.warn('Could not refresh profile after payment:', e);
        }
      };
      refreshProfile();
    } else if (stripeCancel === 'true') {
      window.history.replaceState(null, '', window.location.pathname);
      alert('Payment was cancelled. You can try again anytime from the Pricing page.');
    }
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

  /* ─── Handle bfcache (Browser Back Button) ─── */
  const [redirectingBookId, setRedirectingBookId] = useState(null);

  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        setRedirectingBookId(null);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  /* ─── Fetch Flashcards and Purchases Globally ─── */
  const [purchasedBookIds, setPurchasedBookIds] = useState([]);

  useEffect(() => {
    if (user) {
      // Fetch flashcards
      const fetchCards = async () => {
        try {
          const { data, error } = await supabase.from('flashcards').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          if (!error) setMyFlashcards(data || []);
        } catch (e) {
          console.error(e);
        }
      };
      fetchCards();

      // Fetch purchases
      const fetchPurchases = async () => {
        try {
          const { data, error } = await supabase.from('purchases').select('book_id').eq('user_id', user.id);
          if (!error && data) {
            setPurchasedBookIds(data.map(p => p.book_id).filter(Boolean));
          }
        } catch (e) {
          console.error('Failed to fetch purchases:', e);
        }
      };
      fetchPurchases();
    } else {
      setMyFlashcards([]);
      setPurchasedBookIds([]);
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

  const handleProButtonClick = useCallback(() => {
    if (!user) {
      setPendingUpgradeModal(true);
      setShowAuthModal(true);
    } else {
      setShowUpgradeModal(true);
    }
  }, [user]);

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
    // 1. Auth check
    if (!book.free || book.premium_only) {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
    }

    // 2. Premium-only check
    if (book.premium_only && !isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    // 3. Purchase check for paid books (strictly database)
    if (!book.free && !isAdmin) {
      const hasPurchased = purchasedBookIds.includes(book.id);

      if (!hasPurchased) {
        alert('You need to purchase this book first to translate it.');
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
  }, [applyBookState, user, isPremium, library, purchasedBookIds, isAdmin]);

  /* ─── Handle file ─── */
  const handleFile = useCallback(async (file) => {
    // MANIFESTO: Usuários autenticados ou não podem fazer upload de arquivos EPUB livremente.

    // MANIFESTO: Aceitar upload apenas de arquivos .epub
    if (!file || !file.name.toLowerCase().endsWith('.epub')) {
      alert('Only .epub files are accepted.');
      return;
    }

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { metadata: meta, chapters: chs } = await parseEpub(arrayBuffer);
      const id = btoa(unescape(encodeURIComponent(meta.title + '||' + meta.creator))).replace(/[^a-zA-Z0-9]/g, '');

      // MANIFESTO: Usuários gratuitos (logados ou não) podem fazer upload livremente.
      // Arquivos ficam salvos apenas no navegador (IndexedDB local).
      // Sem bloqueio de tempo — upload ilimitado para todos.
      await applyBookState(id, meta, chs);
    } catch (err) {
      console.error('Error processing EPUB:', err);
      alert('Could not load this EPUB. Make sure the file is valid.');
    } finally {
      setLoading(false);
    }
  }, [applyBookState, user]);

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
          onConfirm: () => { }
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

    // MANIFESTO: Usuários autenticados ou não podem fazer upload de arquivos EPUB livremente.

    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile, user]);

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
    // MANIFESTO: Todos os usuários podem iniciar a criação de flashcards.
    // O salvamento efetivo requer login.


    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;
    const text = selection.toString().trim();
    if (text.length > 0) {
      setFlashcardModal({ show: true, source: text, translation: '', success: false, originId: null, locationInfo: '' });
    }
  }, [user]);

  const FREE_FLASHCARD_LIMIT = 20;

  const handleSaveFlashcard = async () => {
    if (!user) {
      // MANIFESTO: Ao tentar salvar sem login, fecha o modal de flashcard e abre o de login.
      setFlashcardModal(p => ({ ...p, show: false }));
      setShowAuthModal(true);
      return;
    }
    if (!flashcardModal.translation.trim()) {
      alert('Please enter a translation.');
      return;
    }
    // MANIFESTO: Plano gratuito pode salvar até 20 flashcards
    if (!isPremium && myFlashcards.length >= FREE_FLASHCARD_LIMIT) {
      setFlashcardModal({ show: false, source: '', translation: '', success: false, originId: null, locationInfo: '' });
      setShowUpgradeModal(true);
      return;
    }
    try {
      const { error, data } = await supabase.from('flashcards').insert([{
        user_id: user.id,
        source_text: flashcardModal.source,
        translated_text: flashcardModal.translation,
        origin_id: flashcardModal.originId,
        location_info: flashcardModal.locationInfo
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
        setFlashcardModal({ show: false, source: '', translation: '', success: false, originId: null, locationInfo: '' });
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
      let stripeData = null;

      // If the book is paid and no stripe_price_id was provided manually, create everything in Stripe
      if (!adminNewBook.free && !adminNewBook.stripe_price_id && adminNewBook.price_cents > 0) {
        try {
          stripeData = await callStripeAdmin('create_product', {
            title: adminNewBook.title,
            price_cents: adminNewBook.price_cents,
          });
          // Dynamically register the new payment link so it works immediately without deploy
          if (stripeData?.stripe_price_id && stripeData?.stripe_payment_link) {
            STRIPE_PAYMENT_LINKS[stripeData.stripe_price_id] = stripeData.stripe_payment_link;
          }
        } catch (stripeError) {
          const proceed = confirm(
            'Failed to create Stripe product: ' + stripeError.message +
            '\n\nDo you want to add the book anyway without Stripe? You can configure Stripe later from the Edit modal.'
          );
          if (!proceed) return;
        }
      }

      const fullPayload = {
        title: adminNewBook.title,
        author: adminNewBook.author,
        difficulty: adminNewBook.difficulty,
        epub_url: adminNewBook.epub_url,
        cover_url: adminNewBook.cover_url,
        free: adminNewBook.free,
        premium_only: adminNewBook.premium_only || false,
        price_cents: adminNewBook.price_cents || 0,
        stripe_price_id: stripeData?.stripe_price_id || adminNewBook.stripe_price_id || null,
        stripe_product_id: stripeData?.stripe_product_id || null,
        stripe_payment_link: stripeData?.stripe_payment_link || adminNewBook.stripe_payment_link || null,
        Language: adminNewBook.Language || 'English',
      };

      const { error } = await supabase.from('catalog').insert([fullPayload]);

      if (error) {
        // Retry without stripe fields if columns are missing
        console.warn('Full insert failed, retrying without stripe fields:', error.message);
        const basicPayload = {
          title: adminNewBook.title,
          author: adminNewBook.author,
          difficulty: adminNewBook.difficulty,
          epub_url: adminNewBook.epub_url,
          cover_url: adminNewBook.cover_url,
          free: adminNewBook.free,
          Language: adminNewBook.Language || 'English',
        };
        const { error: err2 } = await supabase.from('catalog').insert([basicPayload]);
        if (err2) throw err2;
      }

      setAdminNewBook({ title: '', author: '', difficulty: 'Beginner', epub_url: '', cover_url: '', free: true, premium_only: false, price_cents: 0, stripe_price_id: '', stripe_payment_link: '', Language: 'English' });
      fetchAdminCatalog();

      if (stripeData) {
        alert(`✅ Book added!\n\nStripe product created automatically:\n• Product: ${stripeData.stripe_product_id}\n• Price: ${stripeData.stripe_price_id}\n• Link: Ready to use`);
      } else {
        alert('✅ Book added to catalog!');
      }
    } catch (e) {
      alert('Error adding book: ' + e.message);
    }
  }, [adminNewBook, fetchAdminCatalog]);

  const handleAdminUpdateBook = useCallback(async (book) => {
    try {
      // Try full update first
      const fullPayload = {
        title: book.title,
        author: book.author,
        difficulty: book.difficulty,
        epub_url: book.epub_url,
        cover_url: book.cover_url,
        free: book.free,
        premium_only: book.premium_only || false,
        price_cents: book.price_cents || 0,
        stripe_price_id: book.stripe_price_id || null,
        stripe_payment_link: book.stripe_payment_link || null,
        stripe_product_id: book.stripe_product_id || null,
        Language: book.Language || 'English',
      };
      const { error } = await supabase.from('catalog').update(fullPayload).eq('id', book.id);

      if (error) {
        // If it fails (missing columns), try without stripe fields
        console.warn('Full update failed, retrying without stripe fields:', error.message);
        const basicPayload = {
          title: book.title,
          author: book.author,
          difficulty: book.difficulty,
          epub_url: book.epub_url,
          cover_url: book.cover_url,
          free: book.free,
          Language: book.Language || 'English',
        };
        // Try adding price_cents separately
        try { basicPayload.price_cents = book.price_cents || 0; } catch (e) { }

        const { error: err2 } = await supabase.from('catalog').update(basicPayload).eq('id', book.id);
        if (err2) throw err2;
      }

      setAdminEditingBook(null);
      fetchAdminCatalog();
      alert('✅ Book updated!');
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
          <div className="modal-content glass" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUpgradeModal(false)}><Icons.X /></button>
            <div className="auth-modal-body">
              <div className="auth-modal-icon premium-icon" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#fff' }}>
                <Icons.Crown />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Upgrade to Pro</h3>
              <p style={{ opacity: 0.8, marginBottom: '24px' }}>Unlock the full potential of your reading and learning experience.</p>

              <div style={{ width: '100%', textAlign: 'left', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#FFA500' }}><Icons.Cloud /></div>
                  <span style={{ fontSize: '0.95rem' }}><strong>Cloud Sync:</strong> Save your books to Traxbook Drive</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#FFA500' }}><Icons.Smartphone /></div>
                  <span style={{ fontSize: '0.95rem' }}><strong>Multi-device:</strong> Read on any computer or tablet</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#FFA500' }}><Icons.Infinity /></div>
                  <span style={{ fontSize: '0.95rem' }}><strong>Unlimited:</strong> Create as many flashcards as you want</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#FFA500' }}><Icons.Download /></div>
                  <span style={{ fontSize: '0.95rem' }}><strong>EPUB Export:</strong> Download your translations as new ebooks</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#FFA500' }}><Icons.Star /></div>
                  <span style={{ fontSize: '0.95rem' }}><strong>Discounts:</strong> 20% off on all Marketplace books</span>
                </div>
              </div>

              <a
                href={getPaymentLink(PREMIUM_PLAN.stripe_price_id, PREMIUM_PLAN.stripe_payment_link, user?.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg pro-button"
                style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', padding: '14px' }}
              >
                <Icons.Crown /> Subscribe Now - Only R$5,90/mo
              </a>
              <p style={{ fontSize: '0.8rem', marginTop: '12px', opacity: 0.6 }}>Cancel anytime. Secure payment via Stripe.</p>
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
          <img src="/logo.svg" alt="Traxbook Logo" className="brand-logo" style={{ height: '36px', width: 'auto' }} />
        </div>

        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
        </button>

        <div className={`header-actions ${mobileMenuOpen ? 'is-open' : ''}`}>
          {/* PRO Button for free users */}
          {/* PRO Button for everyone except premium users */}
          {!isPremium && (
            <button
              className="btn pro-button"
              onClick={handleProButtonClick}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <Icons.Crown /> PRO
            </button>
          )}

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

              {/* MANIFESTO: Download EPUB traduzido é exclusivo para Premium */}
              {isPremium ? (
                <button className="btn btn-ghost" onClick={() => exportAsEpub(metadata, chapters, user?.email)} title="Export translated EPUB">
                  <Icons.Download /> Export EPUB
                </button>
              ) : (
                <button className="btn btn-ghost" onClick={() => setShowUpgradeModal(true)} title="Premium feature — upgrade to export">
                  <Icons.Lock /> Export EPUB
                </button>
              )}
              <button className="btn btn-secondary" onClick={clearBook}>
                <Icons.LogOut /> Exit
              </button>
            </>
          )}

          {currentView !== 'editor' && (
            <>
              {isAdmin && (
                <button className="btn btn-ghost" onClick={() => { setCurrentView(currentView === 'admin' ? 'home' : 'admin'); setMobileMenuOpen(false); }} title="Admin Panel">
                  <Icons.Settings /> {currentView === 'admin' ? 'Exit Admin' : 'Admin'}
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => { setCurrentView('guide'); setMobileMenuOpen(false); }} title="User Guide">
                <Icons.Book /> Info
              </button>
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

        {/* ─── VIEW: GUIDE ─── */}
        {currentView === 'guide' && (
          <section className="guide-section fade-in">
            <button className="btn btn-ghost back-btn" onClick={() => setCurrentView('home')} style={{ marginBottom: '20px' }}>
              <Icons.ArrowLeft /> Back
            </button>
            <div className="guide-content">
              <h1>📘 User Guide: <span className="wavy-underline">Traxbook</span></h1>
              <p className="guide-subtitle">Transforming your reading into active learning.</p>

              <p className="guide-intro">
                Welcome to <strong>Traxbook</strong>! This quick guide will help you navigate our platform and understand how to get the most out of your translation and study sessions.
              </p>

              <hr className="guide-divider" />

              <div className="guide-section-block">
                <h2>🚀 Starting Your Translation</h2>
                <p>To ensure the best experience, follow these upload guidelines:</p>
                <ul>
                  <li><strong>Single Format:</strong> <span className="traxbook-tag">Traxbook</span> exclusively processes <strong>.epub</strong> files.</li>
                  <li><strong>Access:</strong> Anyone can upload and translate EPUBs.</li>
                  <li><strong>Frequency:</strong> You can upload <strong>unlimited books</strong>. Translations are saved in your browser's cache.</li>
                </ul>
              </div>

              <hr className="guide-divider" />

              <div className="guide-section-block">
                <h2>✍️ How to Translate and Study</h2>
                <p><span className="traxbook-tag">Traxbook</span> organizes the original text paragraph by paragraph, creating a response field right below it for your practice.</p>
              </div>

              <div className="guide-section-block">
                <h2>🗂️ Flashcards System</h2>
                <p>Found a new word or a difficult expression?</p>
                <ul>
                  <li><strong>Save for review:</strong> Create flashcards during translation (requires login to save in the cloud).</li>
                  <li><strong>Free Limit:</strong> Save up to <strong>20 flashcards</strong> to reinforce your vocabulary.</li>
                </ul>
              </div>

              <hr className="guide-divider" />

              <div className="guide-section-block">
                <h2>⭐ Premium Plan Advantages</h2>
                <p>Take your studies to the next level with exclusive features:</p>
                <ul>
                  <li><strong><span className="traxbook-tag">Traxbook</span> Drive:</strong> Automatic cloud synchronization. Start on your PC and continue on your tablet exactly where you left off.</li>
                  <li><strong>Unlimited Flashcards:</strong> Create as many flashcards as you want.</li>
                  <li><strong>Anki Integration:</strong> Export your flashcards in CSV format to practice in Anki.</li>
                  <li><strong>Full Export:</strong> Download your translated book in EPUB format.<br /><span style={{ fontSize: '0.9em', fontStyle: 'italic', color: 'var(--text-dim)' }}>Note: Every exported file includes the signature "Translated by [Email] via <span className="traxbook-tag">Traxbook</span>" to ensure authorship of your effort.</span></li>
                  <li><strong>Marketplace:</strong> Get a <strong>20% discount</strong> on all books in our classics library.</li>
                </ul>
              </div>

              <hr className="guide-divider" />

              <div className="guide-section-block">
                <h2>💳 Subscription and Payments</h2>
                <p>We manage everything simply and securely:</p>
                <ul>
                  <li><strong>Security:</strong> We process payments via <strong>Stripe</strong>.</li>
                  <li><strong>Flexibility:</strong> Monthly subscriptions that can be canceled at any time from your dashboard.</li>
                </ul>
              </div>

              <hr className="guide-divider" />

              <div className="guide-section-block">
                <h2>💡 Tips for Better Learning</h2>
                <ol>
                  <li><strong>Consistency is key:</strong> Try to translate at least 5 paragraphs a day.</li>
                  <li><strong>Use Flashcards:</strong> Don't just save isolated words; save short sentences to understand the context.</li>
                  <li><strong>Synchronize:</strong> If you study on the go, the Premium plan ensures your progress is never lost between devices.</li>
                </ol>
              </div>

              <div className="guide-footer">
                <p>Do you have any questions or need help? Contact us through our customer email: traxbookepub@gmail.com</p>
                <br /><br />
                <p>We are constantly improving this project, so instability may occur. If something doesn't work as expected, please contact our support team.</p>
                <br /><br />
                <p>Traxbook version 2.0.0 - 05/2026  </p>
              </div>
            </div>
          </section>
        )}

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
                    <span className="pricing-amount">R$0</span>
                    <span className="pricing-period">forever</span>
                  </div>
                </div>
                <ul className="pricing-features">
                  <li><Icons.Check /> Upload unlimited EPUBs</li>
                  <li><Icons.Check /> Translate offline in browser</li>
                  <li><Icons.Check /> Up to 20 flashcards</li>
                  <li><Icons.Check /> Access free public books</li>
                  <li className="pricing-disabled"><Icons.X /> Export translated EPUB</li>
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
                  <h3><Icons.Crown /> {PREMIUM_PLAN.name}</h3>
                  <div className="pricing-price">
                    <span className="pricing-amount">R${(PREMIUM_PLAN.price_cents / 100).toFixed(2)}</span>
                    <span className="pricing-period">/month</span>
                  </div>
                </div>
                <ul className="pricing-features">
                  <li><Icons.Check /> Everything in Free</li>
                  <li className="pricing-highlight"><Icons.Download /> Export translated EPUB</li>
                  <li className="pricing-highlight"><Icons.Cloud /> Save to Cloud</li>
                  <li className="pricing-highlight"><Icons.Smartphone /> Multi-device sync</li>
                  <li className="pricing-highlight"><Icons.Infinity /> Unlimited premium books</li>
                  <li className="pricing-highlight"><Icons.Zap /> Unlimited flashcards</li>
                  <li><Icons.Shield /> Priority support</li>
                </ul>
                <button
                  className="btn btn-primary btn-block btn-lg"
                  data-stripe-price-id={PREMIUM_PLAN.stripe_price_id}
                  style={{ transition: 'all 0.2s ease' }}
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    // MANIFESTO: Apenas pessoas logadas podem comprar plano premium
                    if (!user) {
                      setShowAuthModal(true);
                    } else {
                      btn.style.background = '#10b981';
                      btn.innerHTML = '✓ Redirecting to Stripe...';
                      setTimeout(() => {
                        window.open(getPaymentLink(PREMIUM_PLAN.stripe_price_id, PREMIUM_PLAN.stripe_payment_link, user.id), '_blank', 'noopener,noreferrer');
                      }, 500);
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
              <p>Manage catalog, pricing, and the Premium subscription.</p>
            </div>

            {/* ─── PREMIUM PLAN CARD ─── */}
            <div className="admin-card glass" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <h3 style={{ marginBottom: '16px' }}><Icons.Crown /> Premium Plan Configuration</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Plan Name</label>
                  <input value={PREMIUM_PLAN.name} onChange={(e) => setPREMIUM_PLAN(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Price (cents) → R${(PREMIUM_PLAN.price_cents / 100).toFixed(2)}</label>
                  <input type="number" value={PREMIUM_PLAN.price_cents} onChange={(e) => setPREMIUM_PLAN(p => ({ ...p, price_cents: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Interval</label>
                  <select value={PREMIUM_PLAN.interval} onChange={(e) => setPREMIUM_PLAN(p => ({ ...p, interval: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    <option value="month">month</option><option value="year">year</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Stripe Product ID</label>
                  <input value={PREMIUM_PLAN.stripe_product_id} onChange={(e) => setPREMIUM_PLAN(p => ({ ...p, stripe_product_id: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Stripe Price ID</label>
                  <input value={PREMIUM_PLAN.stripe_price_id} onChange={(e) => setPREMIUM_PLAN(p => ({ ...p, stripe_price_id: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Payment Link URL</label>
                  <input value={PREMIUM_PLAN.stripe_payment_link} onChange={(e) => setPREMIUM_PLAN(p => ({ ...p, stripe_payment_link: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '12px' }} />
                </div>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="btn btn-primary btn-sm" onClick={() => {
                  localStorage.setItem('traxbook_premium_plan', JSON.stringify(PREMIUM_PLAN));
                  alert('✅ Premium plan saved!');
                }}>
                  <Icons.Check /> Save Premium Plan
                </button>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Displayed: <strong>${(PREMIUM_PLAN.price_cents / 100).toFixed(2)}/{PREMIUM_PLAN.interval}</strong>
                </span>
              </div>
            </div>

            {/* ─── ADD NEW BOOK ─── */}
            <div className="admin-card glass">
              <h3><Icons.Plus /> Add New Book</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input placeholder="Title *" value={adminNewBook.title} onChange={(e) => setAdminNewBook(p => ({ ...p, title: e.target.value }))} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <input placeholder="Author" value={adminNewBook.author} onChange={(e) => setAdminNewBook(p => ({ ...p, author: e.target.value }))} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <input placeholder="EPUB URL" value={adminNewBook.epub_url} onChange={(e) => setAdminNewBook(p => ({ ...p, epub_url: e.target.value }))} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <input placeholder="Cover Image URL" value={adminNewBook.cover_url} onChange={(e) => setAdminNewBook(p => ({ ...p, cover_url: e.target.value }))} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <select value={adminNewBook.difficulty} onChange={(e) => setAdminNewBook(p => ({ ...p, difficulty: e.target.value }))} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option><option value="Difficult">Difficult</option>
                </select>
                <input placeholder="Language" value={adminNewBook.Language} onChange={(e) => setAdminNewBook(p => ({ ...p, Language: e.target.value }))} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
                  <input type="checkbox" checked={adminNewBook.free} onChange={(e) => setAdminNewBook(p => ({ ...p, free: e.target.checked }))} />
                  <span>Free Book</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
                  <input type="checkbox" checked={adminNewBook.premium_only} onChange={(e) => setAdminNewBook(p => ({ ...p, premium_only: e.target.checked }))} />
                  <span>👑 Premium Only</span>
                </label>
                {!adminNewBook.free && (
                  <input type="number" placeholder="Price (cents, ex: 500 = $5.00)" value={adminNewBook.price_cents} onChange={(e) => setAdminNewBook(p => ({ ...p, price_cents: Number(e.target.value) }))} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                )}
                {!adminNewBook.free && (
                  <>
                    <input placeholder="Stripe Price ID (price_...)" value={adminNewBook.stripe_price_id} onChange={(e) => setAdminNewBook(p => ({ ...p, stripe_price_id: e.target.value }))} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '12px' }} />
                    <input placeholder="Payment Link (https://buy.stripe.com/...)" value={adminNewBook.stripe_payment_link} onChange={(e) => setAdminNewBook(p => ({ ...p, stripe_payment_link: e.target.value }))} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '12px' }} />
                  </>
                )}
              </div>
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handleAdminAddBook}>
                <Icons.Plus /> Add Book
              </button>
            </div>

            {/* ─── BOOK CATALOG CARDS ─── */}
            <div className="admin-card glass">
              <h3><Icons.Book /> Catalog ({adminCatalog.length} books)</h3>
              {adminCatalog.length === 0 ? (
                <p style={{ opacity: 0.5 }}>No books in catalog yet. Add one above.</p>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {adminCatalog.map(book => (
                    <div key={book.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '1rem' }}>{book.title}</strong>
                          <span className={`mk-diff mode-${(book.difficulty || 'beginner').trim().toLowerCase()}`} style={{ fontSize: '10px' }}>{book.difficulty || 'Beginner'}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {book.author || 'Unknown'} · {book.Language || 'English'} · {book.free ? '🆓 Free' : `💰 $${((book.price_cents || 0) / 100).toFixed(2)}`}
                          {book.premium_only ? ' · 👑 Premium Only' : ''}
                          {!book.free && book.stripe_price_id ? ' · ✅ Stripe OK' : !book.free ? ' · ⚠️ No Stripe' : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => setAdminEditingBook({ ...book })}>
                          <Icons.Edit /> Edit
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleAdminDeleteBook(book.id)} style={{ color: '#ef4444' }}>
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── ADMIN EDIT BOOK MODAL ─── */}
        {adminEditingBook && (
          <div className="modal-overlay" onClick={() => setAdminEditingBook(null)}>
            <div className="modal glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}><Icons.Edit /> Edit Book</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setAdminEditingBook(null)}><Icons.X /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { label: 'Title', key: 'title', full: false },
                  { label: 'Author', key: 'author', full: false },
                  { label: 'Language', key: 'Language', full: false },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>{field.label}</label>
                    <input
                      value={adminEditingBook[field.key] || ''}
                      onChange={(e) => setAdminEditingBook(p => ({ ...p, [field.key]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '14px' }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Difficulty</label>
                  <select value={adminEditingBook.difficulty || 'Beginner'} onChange={(e) => setAdminEditingBook(p => ({ ...p, difficulty: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Difficult</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>EPUB URL</label>
                  <input value={adminEditingBook.epub_url || ''} onChange={(e) => setAdminEditingBook(p => ({ ...p, epub_url: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '12px' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Cover Image URL</label>
                  <input value={adminEditingBook.cover_url || ''} onChange={(e) => setAdminEditingBook(p => ({ ...p, cover_url: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '12px' }} />
                </div>
              </div>

              {/* Pricing Section */}
              <div style={{ marginTop: '20px', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(99,102,241,0.05)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>💰 Pricing & Stripe</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={adminEditingBook.free} onChange={(e) => setAdminEditingBook(p => ({ ...p, free: e.target.checked }))} />
                  <span style={{ fontWeight: 500 }}>Free Book (no payment required)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', background: adminEditingBook.premium_only ? 'rgba(139,92,246,0.1)' : 'transparent', border: adminEditingBook.premium_only ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent' }}>
                  <input type="checkbox" checked={adminEditingBook.premium_only || false} onChange={(e) => setAdminEditingBook(p => ({ ...p, premium_only: e.target.checked }))} />
                  <span style={{ fontWeight: 500 }}>👑 Premium Only (only premium subscribers can access)</span>
                </label>
                {!adminEditingBook.free && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Price (cents) → R${((adminEditingBook.price_cents || 0) / 100).toFixed(2)}</label>
                      <input type="number" value={adminEditingBook.price_cents || 0} onChange={(e) => setAdminEditingBook(p => ({ ...p, price_cents: Number(e.target.value) }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Stripe Price ID</label>
                      <input value={adminEditingBook.stripe_price_id || ''} onChange={(e) => setAdminEditingBook(p => ({ ...p, stripe_price_id: e.target.value }))} placeholder="price_..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '12px' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Stripe Payment Link</label>
                      <input value={adminEditingBook.stripe_payment_link || ''} onChange={(e) => setAdminEditingBook(p => ({ ...p, stripe_payment_link: e.target.value }))} placeholder="https://buy.stripe.com/..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '12px' }} />
                    </div>

                    {/* ─── Stripe Help ─── */}
                    <div style={{ gridColumn: '1 / -1', marginTop: '8px', padding: '12px', borderRadius: '8px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      {!adminEditingBook.stripe_price_id ? (
                        <div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                            ⚠️ <strong>No Stripe product configured.</strong> To enable purchases:
                          </p>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={async () => {
                                if (!adminEditingBook.price_cents || adminEditingBook.price_cents <= 0) {
                                  alert('Please set a price first.');
                                  return;
                                }
                                try {
                                  const stripeData = await callStripeAdmin('create_product', {
                                    title: adminEditingBook.title,
                                    price_cents: adminEditingBook.price_cents,
                                  });
                                  // Register in runtime map
                                  if (stripeData?.stripe_price_id && stripeData?.stripe_payment_link) {
                                    STRIPE_PAYMENT_LINKS[stripeData.stripe_price_id] = stripeData.stripe_payment_link;
                                  }
                                  setAdminEditingBook(prev => ({
                                    ...prev,
                                    stripe_product_id: stripeData.stripe_product_id,
                                    stripe_price_id: stripeData.stripe_price_id,
                                    stripe_payment_link: stripeData.stripe_payment_link,
                                  }));
                                  // Auto-save Stripe fields to Supabase
                                  try {
                                    await supabase.from('catalog').update({
                                      stripe_product_id: stripeData.stripe_product_id,
                                      stripe_price_id: stripeData.stripe_price_id,
                                      stripe_payment_link: stripeData.stripe_payment_link,
                                    }).eq('id', adminEditingBook.id);
                                  } catch (_) { /* will be saved on "Save Changes" */ }
                                  alert('✅ Stripe product created and saved!\n\nProduct: ' + stripeData.stripe_product_id + '\nPrice: ' + stripeData.stripe_price_id);
                                } catch (error) {
                                  alert('Failed to create Stripe product: ' + error.message);
                                }
                              }}
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              ⚡ Create Stripe Product
                            </button>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>or</span>
                            <a href="https://dashboard.stripe.com/products/create" target="_blank" rel="noreferrer"
                              style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '6px', background: '#6b7280', color: 'white', textDecoration: 'none', fontSize: '12px', fontWeight: 500 }}>
                              Manual Setup
                            </a>
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0' }}>
                            <strong>Auto-create:</strong> Creates product, price, and payment link in Stripe + saves to catalog automatically.<br />
                            <strong>Manual:</strong> Go to Stripe Dashboard to create manually.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: '12px', color: '#10b981', margin: '0 0 8px 0' }}>
                            ✅ Stripe configured! Price ID: <code>{adminEditingBook.stripe_price_id}</code>
                          </p>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={async () => {
                              if (!adminEditingBook.price_cents || adminEditingBook.price_cents <= 0) {
                                alert('Please set a price first.');
                                return;
                              }
                              try {
                                const stripeData = await callStripeAdmin('update_price', {
                                  stripe_product_id: adminEditingBook.stripe_product_id || adminEditingBook.stripe_price_id?.replace('price_', 'prod_'),
                                  stripe_price_id_old: adminEditingBook.stripe_price_id,
                                  price_cents: adminEditingBook.price_cents,
                                });
                                // Register in runtime map
                                if (stripeData?.stripe_price_id && stripeData?.stripe_payment_link) {
                                  STRIPE_PAYMENT_LINKS[stripeData.stripe_price_id] = stripeData.stripe_payment_link;
                                }
                                setAdminEditingBook(prev => ({
                                  ...prev,
                                  stripe_price_id: stripeData.stripe_price_id,
                                  stripe_payment_link: stripeData.stripe_payment_link,
                                }));
                                // Auto-save updated Stripe fields to Supabase
                                try {
                                  await supabase.from('catalog').update({
                                    stripe_price_id: stripeData.stripe_price_id,
                                    stripe_payment_link: stripeData.stripe_payment_link,
                                  }).eq('id', adminEditingBook.id);
                                } catch (_) { /* will be saved on "Save Changes" */ }
                                alert('✅ Stripe price updated and saved!');
                              } catch (error) {
                                alert('Failed to update Stripe price: ' + error.message);
                              }
                            }}
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                          >
                            🔄 Update Price
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setAdminEditingBook(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => handleAdminUpdateBook(adminEditingBook)}>
                  <Icons.Check /> Save Changes
                </button>
              </div>
            </div>
          </div>
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
                : " All your progress is saved offline in your browser"}
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
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                >
                  <div className="drop-icon">
                    <Icons.Upload />
                  </div>
                  <span className="drop-text-main">
                    Drag your EPUB or click here
                  </span>
                  <span className="drop-text-sub">
                    Only .epub files are accepted
                  </span>
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

                  {catalogError ? (
                    <div style={{ gridColumn: '1 / -1', color: '#ff4d4f', padding: '1rem', background: '#ffe6e6', borderRadius: '8px' }}>
                      <strong>Error reading from Supabase:</strong> {catalogError}
                      <p style={{ marginTop: '10px', fontSize: '0.9em' }}>
                        Tip: Go to the Supabase SQL Editor and run the command: <br />
                        <code>ALTER TABLE catalog DISABLE ROW LEVEL SECURITY;</code>
                      </p>
                    </div>
                  ) : marketplaceBooks.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.6, gridColumn: '1 / -1' }}>Loading cloud catalog or no books available...</p>
                  ) : (
                    marketplaceBooks.map(book => {
                      // MANIFESTO: Descontos em livros para Premium
                      const displayPrice = isPremium
                        ? `R$${((book.price_cents || 0) * 0.8 / 100).toFixed(2)}` // 20% Discount
                        : `R$${((book.price_cents || 0) / 100).toFixed(2)}`;

                      // Check if book is already in local library (bought/downloaded)
                      const mkBookId = btoa(unescape(encodeURIComponent(book.title + '||' + (book.author || '')))).replace(/[^a-zA-Z0-9]/g, '');
                      const isDownloaded = library.some(l => l.id === mkBookId);

                      // Check database purchase record
                      const hasPurchased = purchasedBookIds.includes(book.id);

                      // LOGIC CORRECTION: Paid books strictly follow the 'purchases' database table.
                      // Free books are unlocked (but premium_only free books require isPremium).
                      const isUnlocked = book.free ? (!book.premium_only || isPremium) : hasPurchased;

                      return (
                        <div key={book.id} className="mk-card">
                          <div className="mk-cover" style={{ backgroundImage: `url(${book.cover_url || ''})` }}>
                            {book.premium_only && (
                              <div className="mk-premium-badge">
                                <Icons.Lock /> Premium
                              </div>
                            )}
                            {isAdmin && !isUnlocked && (
                              <button
                                className="btn btn-secondary"
                                style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '10px', padding: '4px 8px', zIndex: 10 }}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!user) return;
                                  try {
                                    const { error } = await supabase.from('purchases').insert({
                                      user_id: user.id,
                                      book_id: book.id,
                                      status: 'completed',
                                      amount_total: book.price_cents || 0,
                                      currency: 'brl'
                                    });
                                    if (error) throw error;
                                    setPurchasedBookIds([...purchasedBookIds, book.id]);
                                    alert('✅ Compra simulada com sucesso!');
                                  } catch (err) {
                                    alert('Erro ao simular compra: ' + err.message);
                                  }
                                }}
                              >
                                🧪 Mock Buy
                              </button>
                            )}
                          </div>
                          <div className="mk-info">
                            <div className="mk-meta-row">
                              <span className={`mk-diff mode-${(book.difficulty || 'beginner').trim().toLowerCase()}`}>
                                {book.difficulty || 'Beginner'}
                              </span>
                              <span className="mk-price-tag" style={book.free || book.premium_only ? { background: book.premium_only ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)', color: book.premium_only ? '#8b5cf6' : '#10b981' } : {}}>
                                {book.free ? 'Free' : book.premium_only ? '👑 Premium' : displayPrice}
                              </span>
                            </div>
                            <h4>{book.title}</h4>
                            <p>{book.author}</p>
                            <button
                              className={`btn ${redirectingBookId === book.id ? '' : (isUnlocked ? 'btn-success' : (book.premium_only ? 'btn-secondary' : 'btn-primary'))} mk-action-btn`}
                              style={{
                                transition: 'all 0.2s ease',
                                ...(redirectingBookId === book.id ? { background: '#6366f1', color: '#fff' } : {})
                              }}
                              onClick={(e) => {
                                const btn = e.currentTarget;
                                if (!user) {
                                  setShowAuthModal(true);
                                } else if (book.premium_only && !isPremium) {
                                  // Premium-only book, user is not premium → go to pricing
                                  setCurrentView('pricing');
                                } else if (!book.free && !hasPurchased) {
                                  // Paid book, not bought → buy it
                                  setRedirectingBookId(book.id);
                                  const payLink = getPaymentLink(book.stripe_price_id, book.stripe_payment_link, user.id);
                                  if (payLink) {
                                    setTimeout(() => { window.open(payLink, '_blank', 'noopener,noreferrer'); }, 400);
                                  } else {
                                    btn.style.background = '#ef4444';
                                    btn.textContent = 'Not Configured';
                                    setTimeout(() => {
                                      setRedirectingBookId(null);
                                      btn.style.background = '';
                                    }, 2000);
                                  }
                                } else {
                                  // Free, premium or already bought → open
                                  btn.style.background = 'var(--success)';
                                  btn.style.color = '#fff';
                                  btn.textContent = 'Loading...';
                                  handleDownloadMarketplaceEpub(book);
                                }
                              }}
                            >
                              {redirectingBookId === book.id ? 'Redirecting...' : (book.premium_only && !isPremium ? '🔒 Premium Only' : isUnlocked ? 'Start Translating' : `Buy ${displayPrice}`)}
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
                    {isPremium ? (
                      <p>Review and edit the flashcards you created while reading.</p>
                    ) : (
                      <p>You have {myFlashcards.length}/{FREE_FLASHCARD_LIMIT} flashcards saved.{myFlashcards.length >= FREE_FLASHCARD_LIMIT ? ' ' : ''}
                        {myFlashcards.length >= FREE_FLASHCARD_LIMIT && <span style={{ color: '#f59e0b', fontWeight: 600 }}>Limit reached — <button className="btn-link" style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, textDecoration: 'underline' }} onClick={() => setCurrentView('pricing')}>upgrade to Pro</button> for unlimited.</span>}
                      </p>
                    )}
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
                      <div
                        key={card.id}
                        className={`fc-card glass ${flippedCardIds.includes(card.id) ? 'flipped' : ''}`}
                        onClick={() => setFlippedCardIds(prev => prev.includes(card.id) ? prev.filter(id => id !== card.id) : [...prev, card.id])}
                      >
                        <div className="fc-inner">
                          {editingCard?.id === card.id ? (
                            <div className="fc-editor-wrapper" onClick={e => e.stopPropagation()}>
                              <div className="fc-editor">
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Source</label>
                                <input
                                  className="translation-input"
                                  value={editingCard.source_text}
                                  onChange={e => setEditingCard({ ...editingCard, source_text: e.target.value })}
                                  style={{ marginBottom: '0.5rem', background: 'rgba(0,0,0,0.1)' }}
                                />
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Translation</label>
                                <input
                                  className="translation-input"
                                  value={editingCard.translated_text}
                                  onChange={e => setEditingCard({ ...editingCard, translated_text: e.target.value })}
                                  style={{ marginBottom: '1rem' }}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setEditingCard(null)}>Cancel</button>
                                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={async () => {
                                    try {
                                      if (!editingCard.source_text.trim() || !editingCard.translated_text.trim()) return;
                                      const { error } = await supabase.from('flashcards').update({ source_text: editingCard.source_text, translated_text: editingCard.translated_text }).eq('id', editingCard.id);
                                      if (error) throw error;
                                      setMyFlashcards(prev => prev.map(c => c.id === editingCard.id ? { ...c, source_text: editingCard.source_text, translated_text: editingCard.translated_text } : c));
                                      setEditingCard(null);
                                    } catch (e) {
                                      alert(e.message);
                                    }
                                  }}><Icons.Check /> Save</button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="fc-front">
                                <div className="fc-content">
                                  <div className="fc-source">{card.source_text}</div>
                                </div>
                              </div>
                              <div className="fc-back">
                                <div className="fc-content">
                                  <div className="fc-translation">{card.translated_text}</div>
                                </div>
                                <div className="fc-actions">
                                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setEditingCard(card); }} title="Edit"><Icons.Edit /></button>
                                  <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} onClick={(e) => {
                                    e.stopPropagation();
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
                                        } catch (e) {
                                          console.error("Delete error:", e);
                                          alert("Error deleting from cloud: " + e.message);
                                        }
                                      }
                                    });
                                  }} title="Delete"><Icons.Trash /></button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
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
          <section className="editor-layout">

            {/* Floating tooltip for text selection → Flashcard (works on mobile) */}
            <SelectionTooltip
              onFlashcard={(text) =>
                setFlashcardModal({ show: true, source: text, translation: '', success: false, originId: null, locationInfo: '' })
              }
            />

            {/* LEFT COLUMN: Table of Contents */}
            <aside className="editor-sidebar-left">
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, letterSpacing: '1px' }}>
                Table of Contents
              </h4>
              <ul className="toc-list">
                {chapters.map((ch, i) => (
                  <li
                    key={i}
                    className={`toc-item ${currentChapter === i ? 'active' : ''}`}
                    onClick={() => goToChapter(i)}
                    title={ch.chapterLabel}
                  >
                    {ch.chapterLabel}
                  </li>
                ))}
              </ul>
            </aside>

            {/* CENTER COLUMN: Reader & Translation */}
            <div className="editor-center">
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

              {/* Mobile Chapter Navigation (Visible only on small screens) */}
              {chapters.length > 1 && (
                <div className="chapter-nav chapter-nav-mobile">
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
                        onSelect={(text) => setFlashcardModal({ show: true, source: text, translation: '', success: false, originId: p.id, locationInfo: `[${chapters[currentChapter]?.chapterLabel}]` })}
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
            </div>

            {/* RIGHT COLUMN: Flashcards */}
            <aside className="editor-sidebar-right">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px', margin: 0 }}>
                  Flashcards
                </h4>
                {myFlashcards.length > 0 && (
                  <span style={{ fontSize: '11px', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                    {myFlashcards.length}
                  </span>
                )}
              </div>

              {myFlashcards.length === 0 ? (
                <div className="flashcard-panel-empty">
                  <Icons.Star style={{ width: 24, height: 24, marginBottom: 8, opacity: 0.5, margin: '0 auto', display: 'block' }} />
                  <p>No flashcards yet.</p>
                  <p style={{ marginTop: '4px', fontSize: '11px' }}>Select text while reading to create one.</p>
                </div>
              ) : (
                <div className="flashcards-mini-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {myFlashcards.map((fc, i) => (
                    <div
                      key={fc.id || i}
                      className={`fc-card ${flippedCardIds.includes(fc.id) ? 'flipped' : ''}`}
                      onClick={() => setFlippedCardIds(prev => prev.includes(fc.id) ? prev.filter(id => id !== fc.id) : [...prev, fc.id])}
                      style={{ minHeight: '100px' }}
                    >
                      <div className="fc-inner">
                        {editingCard?.id === fc.id ? (
                          <div className="fc-editor-wrapper" onClick={e => e.stopPropagation()} style={{ padding: '8px' }}>
                            <div className="fc-editor">
                              <input
                                value={editingCard.source_text}
                                onChange={e => setEditingCard(p => ({ ...p, source_text: e.target.value }))}
                                placeholder="Source text"
                                className="fc-editor-input"
                              />
                              <textarea
                                value={editingCard.translated_text}
                                onChange={e => setEditingCard(p => ({ ...p, translated_text: e.target.value }))}
                                placeholder="Translation"
                                className="fc-editor-input fc-editor-textarea"
                              />
                              <div className="fc-editor-actions">
                                <button className="btn btn-ghost btn-sm" onClick={() => setEditingCard(null)}>Cancel</button>
                                <button className="btn btn-primary btn-sm" onClick={handleSaveEditFlashcard}><Icons.Check size={14} /> Save</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="fc-front">
                              {fc.location_info && (
                                <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                  {fc.location_info}
                                </div>
                              )}
                              <div className="fc-content">
                                <div className="fc-source" style={{ fontSize: '14px' }}>{fc.source_text}</div>
                              </div>
                            </div>
                            <div className="fc-back">
                              {fc.location_info && (
                                <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                  {fc.location_info}
                                </div>
                              )}
                              <div className="fc-content">
                                <div className="fc-translation" style={{ fontSize: '14px' }}>{fc.translated_text}</div>
                              </div>
                              <div className="fc-actions" style={{ right: '8px', bottom: '6px' }}>
                                <button className="btn btn-ghost btn-sm" style={{ padding: '2px 4px' }} onClick={(e) => { e.stopPropagation(); setEditingCard(fc); }} title="Edit"><Icons.Edit size={14} /></button>
                                <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444', padding: '2px 4px' }} onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmModal({
                                    show: true,
                                    title: 'Delete Card?',
                                    message: 'Are you sure you want to remove this flashcard?',
                                    confirmText: 'Delete',
                                    onConfirm: async () => {
                                      try {
                                        const { error } = await supabase.from('flashcards').delete().eq('id', fc.id);
                                        if (error) throw error;
                                        setMyFlashcards(prev => prev.filter(c => c.id !== fc.id));
                                      } catch (e) {
                                        alert("Error: " + e.message);
                                      }
                                    }
                                  });
                                }} title="Delete"><Icons.Trash size={14} /></button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>

          </section>
        )}
      </main>
    </div>
  );
};

/* ─────────────────── SELECTION FLASHCARD TOOLTIP ─────────────────── */
const SelectionTooltip = ({ onFlashcard }) => {
  const [tooltip, setTooltip] = useState(null); // { x, y, text }
  const hideTimer = useRef(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);

      // Small delay so the selection is fully committed (especially on mobile)
      hideTimer.current = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          setTooltip(null);
          return;
        }
        // Skip if inside textarea/input
        const anchorNode = selection.anchorNode;
        if (!anchorNode) { setTooltip(null); return; }
        const parentEl = anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode;
        if (parentEl?.closest('textarea, input')) { setTooltip(null); return; }
        // Only show inside .source-text
        if (!parentEl?.closest('.source-text')) { setTooltip(null); return; }

        const text = selection.toString().trim();
        if (text.length === 0) { setTooltip(null); return; }

        // Get position from bounding rect of the range
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setTooltip({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
          text,
        });
      }, 50);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!tooltip) return null;

  return (
    <div
      className="selection-flashcard-tooltip"
      style={{ left: tooltip.x, top: tooltip.y }}
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={(e) => e.preventDefault()}
    >
      <button
        className="selection-flashcard-btn"
        onClick={() => {
          onFlashcard(tooltip.text);
          setTooltip(null);
          window.getSelection()?.removeAllRanges();
        }}
      >
        📚 Flashcard
      </button>
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
