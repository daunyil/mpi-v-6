// ═══════════════════════════════════════════════════════════════
// ZUSTAND STORE — Canva Mode State Management
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { toast } from 'sonner';
import {
  type CanvaPage,
  type CanvaElement,
  type CanvaTemplate,
  type LeftTab,
  type Tool,
  type Ratio,
  RATIOS,
  ELEM_TYPES,
} from '@/components/canva/types';
import { renderElHTML as _renderElHTMLExport, exportPageHTML as exportPageHTMLExport, exportSlideshowHTML as exportSlideshowHTMLExport } from '@/lib/export/alpine-slideshow';

function createPage(label: string): CanvaPage {
  return {
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    label,
    bgDataUrl: null,
    bgColor: '#1a1a2e',
    overlay: 20,
    elements: [],
  };
}

function createElId(): string {
  return 'el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
}

// ── Snapshot type for undo/redo ────────────────────────────────
type Snapshot = {
  pages: CanvaPage[];
  currentPageIndex: number;
  ratioId: string;
};

const MAX_HISTORY = 50;

// ── Clipboard for copy/paste ───────────────────────────────────
let _clipboard: CanvaElement | null = null;

interface CanvaState {
  // ── Persisted state ──────────────────────────────────────────
  pages: CanvaPage[];
  currentPageIndex: number;
  ratioId: string;

  // ── Templates ────────────────────────────────────────────────
  templates: CanvaTemplate[];
  saveAsTemplate: (name: string, description: string, category: CanvaTemplate['category']) => void;
  loadTemplate: (templateId: string) => void;
  deleteTemplate: (templateId: string) => void;
  renameTemplate: (templateId: string, name: string) => void;

  // ── UI state ─────────────────────────────────────────────────
  zoom: number;
  tool: Tool;
  leftTab: LeftTab;
  selectedElIds: string[];
  // Compatibility getter — returns first selected element or null
  selectedElId: string | null;

  // ── History (undo/redo) ─────────────────────────────────────
  _history: Snapshot[];
  _historyIdx: number;
  _skipHistory: boolean;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  _pushHistory: () => void;

  // ── Computed helpers ─────────────────────────────────────────
  currentPage: () => CanvaPage | undefined;
  currentRatio: () => Ratio;
  selectedElement: () => CanvaElement | undefined;

  // ── Actions: Page ────────────────────────────────────────────
  goPage: (idx: number) => void;
  addPage: () => void;
  duplicatePage: () => void;
  deletePage: () => void;
  setPageLabel: (label: string) => void;

  // ── Actions: Background ──────────────────────────────────────
  setBgColor: (hex: string) => void;
  setBgImage: (dataUrl: string) => void;
  setOverlay: (val: number) => void;

  // ── Actions: Element ─────────────────────────────────────────
  addElement: (type: string, x?: number, y?: number) => void;
  addKuisElement: (idx: number) => void;
  addGameElement: (idx: number) => void;
  addModulElement: (idx: number) => void;
  selectElement: (elId: string | null, multi?: boolean) => void;
  deselectAll: () => void;
  selectAllElements: () => void;
  isElementSelected: (id: string) => boolean;
  updateElement: (elId: string, props: Partial<CanvaElement>) => void;
  deleteElement: (elId: string) => void;
  deleteSelected: () => void;
  deleteSelectedElements: () => void;
  toggleElementVisibility: (elId: string) => void;
  toggleElementLock: (elId: string) => void;
  saveTextContent: (elId: string, text: string) => void;
  moveElementZ: (elId: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  moveSelectedElements: (dx: number, dy: number) => void;

  // ── Actions: Copy/Paste ──────────────────────────────────────
  copyElement: () => void;
  pasteElement: () => void;

  // ── Actions: Tool & UI ───────────────────────────────────────
  setTool: (tool: Tool) => void;
  setLeftTab: (tab: LeftTab) => void;
  setZoom: (zoom: number) => void;
  zoomDelta: (delta: number) => void;
  setRatio: (ratioId: string) => void;
  nudgeSelected: (dx: number, dy: number) => void;

  // ── Actions: Stage ───────────────────────────────────────────
  clearStage: () => void;
  applyLayout: (template: { bgColor: string; elements: Omit<CanvaElement, 'id'>[] }) => void;
  applyLayoutPack: (templates: { bgColor: string; elements: Omit<CanvaElement, 'id'>[] }[]) => void;
  generateFromPageType: (pageType: { id: string; name: string; generate: (config: Record<string, number | string | boolean>) => { pages: { label: string; bgColor: string; elements: Omit<CanvaElement, 'id'>[] }[]; navbarStyle?: string } }, config: Record<string, number | string | boolean>) => void;

  // ── Persistence ──────────────────────────────────────────────
  saveProject: () => void;
  loadProject: () => void;
  hasSavedProject: () => boolean;

  // ── Export helpers ───────────────────────────────────────────
  exportPageHTML: (pageIdx?: number) => string;
  exportSlideshowHTML: () => string;
  _renderElHTML: (el: CanvaElement) => string;
}

// ── Auto-save helper (debounced) ──────────────────────────────
let _autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

function autoSave() {
  if (_autoSaveTimer) return; // Throttle to once per 500ms
  _autoSaveTimer = setTimeout(() => {
    _autoSaveTimer = null;
    try {
      const state = useCanvaStore.getState();
      const data = {
        pages: state.pages,
        currentPageIndex: state.currentPageIndex,
        ratioId: state.ratioId,
      };
      localStorage.setItem('canva-project', JSON.stringify(data));
    } catch { /* quota exceeded or not available */ }
  }, 500);
}

// ── Template localStorage helpers ──────────────────────────────
const TEMPLATES_KEY = 'canva_templates_v1';

function loadTemplatesFromStorage(): CanvaTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveTemplatesToStorage(templates: CanvaTemplate[]) {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch { /* quota exceeded */ }
}

// Helper: set selection (keeps selectedElId in sync with selectedElIds for backward compat)
function _sel(ids: string[]) {
  return { selectedElIds: ids, selectedElId: ids[0] || null } as Partial<CanvaState>;
}

export const useCanvaStore = create<CanvaState>((set, get) => ({
  // ── Initial state ────────────────────────────────────────────
  pages: [createPage('Halaman 1')],
  currentPageIndex: 0,
  ratioId: '16:9',
  templates: loadTemplatesFromStorage(),
  zoom: 1.0,
  tool: 'select',
  leftTab: 'pages',
  selectedElIds: [],
  selectedElId: null,

  // ── History ──────────────────────────────────────────────────
  _history: [],
  _historyIdx: -1,
  _skipHistory: false,

  _pushHistory: () => {
    const { pages, currentPageIndex, ratioId, _history, _historyIdx, _skipHistory } = get();
    if (_skipHistory) return;
    const snapshot: Snapshot = { pages: JSON.parse(JSON.stringify(pages)), currentPageIndex, ratioId };
    const newHistory = _history.slice(0, _historyIdx + 1);
    newHistory.push(snapshot);
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({ _history: newHistory, _historyIdx: newHistory.length - 1 });
  },

  undo: () => {
    const { _history, _historyIdx } = get();
    if (_historyIdx <= 0) return;
    const prev = _history[_historyIdx - 1];
    if (!prev) return;
    set({
      ...JSON.parse(JSON.stringify(prev)),
      _historyIdx: _historyIdx - 1,
      _skipHistory: true,
      ..._sel([]),
    });
    set({ _skipHistory: false });
    toast.info('Undo');
    autoSave();
  },

  redo: () => {
    const { _history, _historyIdx } = get();
    if (_historyIdx >= _history.length - 1) return;
    const next = _history[_historyIdx + 1];
    if (!next) return;
    set({
      ...JSON.parse(JSON.stringify(next)),
      _historyIdx: _historyIdx + 1,
      _skipHistory: true,
      ..._sel([]),
    });
    set({ _skipHistory: false });
    toast.info('Redo');
    autoSave();
  },

  canUndo: () => get()._historyIdx > 0,
  canRedo: () => get()._historyIdx < get()._history.length - 1,

  // ── Computed ─────────────────────────────────────────────────
  currentPage: () => get().pages[get().currentPageIndex],
  currentRatio: () => RATIOS.find(r => r.id === get().ratioId) || RATIOS[0],
  selectedElement: () => {
    const page = get().pages[get().currentPageIndex];
    if (!page) return undefined;
    const firstId = get().selectedElIds[0];
    if (!firstId) return undefined;
    return page.elements.find(e => e.id === firstId);
  },

  // ── Page actions ─────────────────────────────────────────────
  goPage: (idx) => {
    const pages = get().pages;
    if (idx < 0 || idx >= pages.length) return;
    set({ currentPageIndex: idx, ..._sel([]) });
  },

  addPage: () => {
    const pages = get().pages;
    const newPage = createPage('Halaman ' + (pages.length + 1));
    get()._pushHistory();
    set({ pages: [...pages, newPage], currentPageIndex: pages.length, ..._sel([]) });
    toast.success('Halaman baru ditambahkan');
    autoSave();
  },

  duplicatePage: () => {
    const { pages, currentPageIndex } = get();
    const orig = pages[currentPageIndex];
    const clone: CanvaPage = JSON.parse(JSON.stringify(orig));
    clone.id = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    clone.label = orig.label + ' (Salinan)';
    clone.elements.forEach((el: CanvaElement) => {
      el.id = createElId();
    });
    const newPages = [...pages];
    newPages.splice(currentPageIndex + 1, 0, clone);
    get()._pushHistory();
    set({ pages: newPages, currentPageIndex: currentPageIndex + 1, ..._sel([]) });
    toast.success('Halaman diduplikat');
    autoSave();
  },

  deletePage: () => {
    const { pages, currentPageIndex } = get();
    if (pages.length <= 1) { toast.warning('Minimal 1 halaman'); return; }
    get()._pushHistory();
    const newPages = pages.filter((_, i) => i !== currentPageIndex);
    set({
      pages: newPages,
      currentPageIndex: Math.max(0, currentPageIndex - 1),
      ..._sel([]),
    });
    toast.success('Halaman dihapus');
    autoSave();
  },

  setPageLabel: (label) => {
    const { pages, currentPageIndex } = get();
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], label };
    set({ pages: newPages });
    autoSave();
  },

  // ── Background actions ───────────────────────────────────────
  setBgColor: (hex) => {
    get()._pushHistory();
    const { pages, currentPageIndex } = get();
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], bgColor: hex };
    set({ pages: newPages });
    autoSave();
  },

  setBgImage: (dataUrl) => {
    get()._pushHistory();
    const { pages, currentPageIndex } = get();
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], bgDataUrl: dataUrl };
    set({ pages: newPages });
    toast.success('Background diterapkan');
    autoSave();
  },

  setOverlay: (val) => {
    get()._pushHistory();
    const { pages, currentPageIndex } = get();
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], overlay: val };
    set({ pages: newPages });
    autoSave();
  },

  // ── Element actions ──────────────────────────────────────────
  addElement: (type, x, y) => {
    const { pages, currentPageIndex } = get();
    const page = pages[currentPageIndex];
    if (!page) return;
    const typeInfo = ELEM_TYPES.find(t => t.id === type);
    const el: CanvaElement = {
      id: createElId(),
      type,
      icon: typeInfo?.icon || '',
      label: typeInfo?.name || type,
      x: x ?? 5,
      y: y ?? 10,
      w: 40,
      h: 30,
      opacity: 100,
    };
    if (type === 'teks') { el.text = 'Judul Halaman'; el.fontSize = 24; el.h = 15; }
    if (type === 'shape') { el.color = 'rgba(255,255,255,.1)'; el.radius = 8; el.h = 20; }
    if (type === 'navbar') { el.navStyle = 'bottom-bar'; el.h = 10; el.y = 85; el.w = 90; el.x = 5; el.color = '#1e293b'; }
    if (type === 'button') { el.text = 'Tombol'; el.color = '#3b82f6'; el.radius = 10; el.h = 8; el.w = 30; }
    if (type === 'badge') { el.text = 'Label'; el.color = '#f59e0b'; el.radius = 10; el.h = 10; el.w = 25; }
    if (type === 'progress') { el.color = '#22c55e'; el.h = 3; el.w = 70; }
    if (type === 'score') { el.text = '0'; el.color = '#fbbf24'; el.h = 8; el.w = 20; }
    if (type === 'timer') { el.text = '02:00'; el.color = '#ef4444'; el.h = 10; el.w = 25; }
    if (type === 'confetti') { el.h = 30; el.w = 80; }
    if (type === 'divider') { el.color = 'rgba(255,255,255,0.1)'; el.h = 1; el.w = 70; }
    if (type === 'gambar') { el.dataUrl = ''; el.w = 30; el.h = 30; }
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: [...page.elements, el],
    };
    get()._pushHistory();
    set({ pages: newPages, ..._sel([el.id]) });
    toast.success(`${typeInfo?.name || type} ditambahkan`);
    autoSave();
  },

  addKuisElement: (idx) => {
    const { pages, currentPageIndex } = get();
    const page = pages[currentPageIndex];
    if (!page) return;
    const el: CanvaElement = {
      id: createElId(),
      type: 'kuis',
      icon: '❓',
      label: 'Kuis #' + (idx + 1),
      dataIdx: idx,
      x: 5, y: 5, w: 45, h: 40,
      opacity: 100,
    };
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: [...page.elements, el],
    };
    set({ pages: newPages, ..._sel([el.id]) });
    autoSave();
  },

  addGameElement: (idx) => {
    const { pages, currentPageIndex } = get();
    const page = pages[currentPageIndex];
    if (!page) return;
    const el: CanvaElement = {
      id: createElId(),
      type: 'game',
      icon: '🎮',
      label: 'Game #' + (idx + 1),
      dataIdx: idx,
      x: 55, y: 5, w: 40, h: 40,
      opacity: 100,
    };
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: [...page.elements, el],
    };
    set({ pages: newPages, ..._sel([el.id]) });
    autoSave();
  },

  addModulElement: (idx) => {
    const { pages, currentPageIndex } = get();
    const page = pages[currentPageIndex];
    if (!page) return;

    // Fetch module info from authoring store
    let modulType = '';
    let modulTitle = '';
    let modulIcon = '🧩';
    let modulColor = '#34d399';
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAuthoringStore } = require('@/store/authoring-store');
      const authState = useAuthoringStore.getState();
      const mod = authState?.modules?.[idx];
      if (mod) {
        modulType = (mod.type as string) || '';
        modulTitle = (mod.title as string) || '';
        // Map module type to icon & color (same as Konten.tsx MODULE_TYPES)
        const typeMap: Record<string, { icon: string; color: string; label: string }> = {
          'skenario': { icon: '🎭', color: '#f9c82e', label: 'Skenario Interaktif' },
          'video': { icon: '🎥', color: '#ff6b6b', label: 'Video Embed' },
          'flashcard': { icon: '🃏', color: '#3ecfcf', label: 'Flashcard' },
          'infografis': { icon: '📊', color: '#a78bfa', label: 'Infografis' },
          'studi-kasus': { icon: '📰', color: '#fb923c', label: 'Studi Kasus' },
          'debat': { icon: '🗣️', color: '#f87171', label: 'Debat & Polling' },
          'timeline': { icon: '📅', color: '#34d399', label: 'Timeline' },
          'matching': { icon: '🔀', color: '#60a5fa', label: 'Game Pasangkan' },
          'materi': { icon: '📖', color: '#a1a1aa', label: 'Materi Teks' },
          'truefalse': { icon: '✅', color: '#34d399', label: 'Benar / Salah' },
          'memory': { icon: '🧠', color: '#a78bfa', label: 'Memory Match' },
          'roda': { icon: '🎡', color: '#fb923c', label: 'Roda Putar' },
          'hero': { icon: '🖼️', color: '#f9c82e', label: 'Hero Banner' },
          'kutipan': { icon: '💬', color: '#a78bfa', label: 'Kutipan Inspiratif' },
          'langkah': { icon: '👣', color: '#3ecfcf', label: 'Langkah-Langkah' },
          'accordion': { icon: '🗂️', color: '#fb923c', label: 'Accordion / FAQ' },
          'statistik': { icon: '📊', color: '#34d399', label: 'Statistik & Angka Kunci' },
          'polling': { icon: '🗳️', color: '#a78bfa', label: 'Polling / Voting' },
          'embed': { icon: '🔗', color: '#3ecfcf', label: 'Embed / iFrame' },
          'tab-icons': { icon: '📑', color: '#3ecfcf', label: 'Tab Interaktif' },
          'icon-explore': { icon: '🔍', color: '#fb923c', label: 'Eksplorasi Ikon' },
          'comparison': { icon: '⚖️', color: '#a78bfa', label: 'Perbandingan' },
          'card-showcase': { icon: '🎭', color: '#f9c82e', label: 'Card Showcase' },
          'hotspot-image': { icon: '🗺️', color: '#34d399', label: 'Hotspot Image' },
        };
        const info = typeMap[modulType] || { icon: '🧩', color: '#34d399', label: 'Modul' };
        modulIcon = info.icon;
        modulColor = info.color;
        modulTitle = modulTitle || info.label;
      }
    } catch { /* authoring store not available */ }

    const el: CanvaElement = {
      id: createElId(),
      type: 'modul',
      icon: modulIcon,
      label: modulTitle || 'Modul #' + (idx + 1),
      dataIdx: idx,
      modulType: modulType || undefined,
      color: modulColor,
      x: 5, y: 5, w: 40, h: 30,
      opacity: 100,
    };
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: [...page.elements, el],
    };
    set({ pages: newPages, ..._sel([el.id]) });
    autoSave();
  },

  selectElement: (elId, multi) => {
    if (elId === null) {
      set(_sel([]));
      return;
    }
    const { selectedElIds } = get();
    if (multi) {
      // Shift+click: toggle element in selection
      if (selectedElIds.includes(elId)) {
        set(_sel(selectedElIds.filter(id => id !== elId)));
      } else {
        set(_sel([...selectedElIds, elId]));
      }
    } else {
      // Normal click: replace selection (deselect if already the only one selected)
      if (selectedElIds.length === 1 && selectedElIds[0] === elId) {
        set(_sel([]));
      } else {
        set(_sel([elId]));
      }
    }
  },

  deselectAll: () => set(_sel([])),

  selectAllElements: () => {
    const page = get().pages[get().currentPageIndex];
    if (!page) return;
    set(_sel(page.elements.map(e => e.id)));
  },

  isElementSelected: (id) => get().selectedElIds.includes(id),

  updateElement: (elId, props) => {
    const { pages, currentPageIndex } = get();
    const page = pages[currentPageIndex];
    if (!page) return;
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: page.elements.map(el =>
        el.id === elId ? { ...el, ...props } : el
      ),
    };
    set({ pages: newPages });
    autoSave();
  },

  deleteElement: (elId) => {
    const { pages, currentPageIndex, selectedElIds } = get();
    const page = pages[currentPageIndex];
    if (!page) return;
    get()._pushHistory();
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: page.elements.filter(e => e.id !== elId),
    };
    set({
      pages: newPages,
      ..._sel(selectedElIds.filter(id => id !== elId)),
    });
    autoSave();
  },

  deleteSelected: () => {
    const { selectedElIds, deleteElement } = get();
    if (selectedElIds.length > 0) {
      if (selectedElIds.length === 1) {
        deleteElement(selectedElIds[0]);
      } else {
        get().deleteSelectedElements();
      }
      toast.success('Elemen dihapus');
    }
  },

  deleteSelectedElements: () => {
    const { pages, currentPageIndex, selectedElIds } = get();
    if (selectedElIds.length === 0) return;
    const page = pages[currentPageIndex];
    if (!page) return;
    get()._pushHistory();
    const deleteSet = new Set(selectedElIds);
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: page.elements.filter(e => !deleteSet.has(e.id)),
    };
    set({ pages: newPages, ..._sel([]) });
    autoSave();
  },

  moveElementZ: (elId, direction) => {
    const { pages, currentPageIndex } = get();
    const page = pages[currentPageIndex];
    if (!page) return;
    const idx = page.elements.findIndex(e => e.id === elId);
    if (idx === -1) return;
    get()._pushHistory();
    const els = [...page.elements];
    const el = els[idx];
    els.splice(idx, 1);
    let newIdx = idx;
    if (direction === 'up') newIdx = Math.min(els.length, idx + 1);
    else if (direction === 'down') newIdx = Math.max(0, idx - 1);
    else if (direction === 'top') newIdx = els.length;
    else if (direction === 'bottom') newIdx = 0;
    els.splice(newIdx, 0, el);
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...page, elements: els };
    set({ pages: newPages });
    autoSave();
  },

  toggleElementLock: (elId) => {
    get()._pushHistory();
    const { pages, currentPageIndex } = get();
    const page = pages[currentPageIndex];
    if (!page) return;
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: page.elements.map(el =>
        el.id === elId ? { ...el, locked: !el.locked } : el
      ),
    };
    set({ pages: newPages });
    autoSave();
  },

  toggleElementVisibility: (elId) => {
    get()._pushHistory();
    const { pages, currentPageIndex } = get();
    const page = pages[currentPageIndex];
    if (!page) return;
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: page.elements.map(el =>
        el.id === elId ? { ...el, hidden: !el.hidden } : el
      ),
    };
    set({ pages: newPages });
    autoSave();
  },

  saveTextContent: (elId, text) => {
    get().updateElement(elId, { text });
  },

  // ── Copy/Paste ───────────────────────────────────────────────
  copyElement: () => {
    const el = get().selectedElement();
    if (el) {
      _clipboard = JSON.parse(JSON.stringify(el));
      toast.success('Elemen disalin');
    }
  },

  pasteElement: () => {
    if (!_clipboard) { toast.warning('Tidak ada elemen di clipboard'); return; }
    const { pages, currentPageIndex } = get();
    const page = pages[currentPageIndex];
    if (!page) return;
    const pasted: CanvaElement = {
      ...JSON.parse(JSON.stringify(_clipboard)),
      id: createElId(),
      x: Math.min(95, _clipboard.x + 2),
      y: Math.min(95, _clipboard.y + 2),
    };
    get()._pushHistory();
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: [...page.elements, pasted],
    };
    set({ pages: newPages, ..._sel([pasted.id]) });
    toast.success('Elemen ditempel');
    autoSave();
  },

  // ── Template actions ──────────────────────────────────────────
  saveAsTemplate: (name, description, category) => {
    const { pages, ratioId } = get();
    const now = new Date().toISOString();
    const bgColor = pages[0]?.bgColor || '#1a1a2e';
    const tmpl: CanvaTemplate = {
      id: 'tmpl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name,
      description,
      category,
      thumbnail: bgColor,
      pages: JSON.parse(JSON.stringify(pages)),
      ratioId,
      createdAt: now,
      updatedAt: now,
    };
    const templates = [...get().templates, tmpl];
    set({ templates });
    saveTemplatesToStorage(templates);
    toast.success(`Template "${name}" disimpan`);
  },

  loadTemplate: (templateId) => {
    const tmpl = get().templates.find(t => t.id === templateId);
    if (!tmpl) return;
    get()._pushHistory();
    // Deep clone pages and regenerate element IDs
    const newPages = tmpl.pages.map(p => ({
      ...JSON.parse(JSON.stringify(p)),
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      elements: p.elements.map(el => ({
        ...JSON.parse(JSON.stringify(el)),
        id: createElId(),
      })),
    }));
    set({
      pages: newPages,
      currentPageIndex: 0,
      ratioId: tmpl.ratioId,
      ..._sel([]),
    });
    toast.success(`Template "${tmpl.name}" dimuat`);
    autoSave();
  },

  deleteTemplate: (templateId) => {
    const templates = get().templates.filter(t => t.id !== templateId);
    set({ templates });
    saveTemplatesToStorage(templates);
    toast.success('Template dihapus');
  },

  renameTemplate: (templateId, name) => {
    const templates = get().templates.map(t =>
      t.id === templateId ? { ...t, name, updatedAt: new Date().toISOString() } : t
    );
    set({ templates });
    saveTemplatesToStorage(templates);
    toast.success('Template diganti nama');
  },

  // ── Tool & UI ────────────────────────────────────────────────
  setTool: (tool) => set({ tool }),
  setLeftTab: (tab) => set({ leftTab: tab }),

  nudgeSelected: (dx, dy) => {
    get().moveSelectedElements(dx, dy);
  },

  moveSelectedElements: (dx, dy) => {
    const { selectedElIds, pages, currentPageIndex } = get();
    if (selectedElIds.length === 0) return;
    get()._pushHistory();
    const page = pages[currentPageIndex];
    if (!page) return;
    const idsToNudge = new Set(selectedElIds);
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: page.elements.map(e => {
        if (!idsToNudge.has(e.id)) return e;
        // Skip locked elements
        if (e.locked) return e;
        return { ...e, x: Math.max(0, Math.min(95, e.x + dx)), y: Math.max(0, Math.min(95, e.y + dy)) };
      }),
    };
    set({ pages: newPages });
    autoSave();
  },
  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.25, zoom)) }),
  zoomDelta: (delta) => {
    const current = get().zoom;
    set({ zoom: Math.min(2, Math.max(0.25, current + delta)) });
  },
  setRatio: (ratioId) => set({ ratioId }),

  // ── Persistence ──────────────────────────────────────────────
  saveProject: () => {
    const { pages, currentPageIndex, ratioId } = get();
    try {
      const data = { pages, currentPageIndex, ratioId };
      localStorage.setItem('canva-project', JSON.stringify(data));
      toast.success('Proyek disimpan');
    } catch {
      toast.error('Gagal menyimpan: storage penuh');
    }
  },

  loadProject: () => {
    try {
      const raw = localStorage.getItem('canva-project');
      if (!raw) { toast.warning('Tidak ada proyek tersimpan'); return; }
      const data = JSON.parse(raw);
      if (data.pages && Array.isArray(data.pages)) {
        get()._pushHistory();
        set({
          pages: data.pages,
          currentPageIndex: data.currentPageIndex || 0,
          ratioId: data.ratioId || '16:9',
          ..._sel([]),
        });
        toast.success('Proyek dimuat');
      }
    } catch {
      toast.error('Gagal memuat proyek');
    }
  },

  hasSavedProject: () => {
    try {
      return !!localStorage.getItem('canva-project');
    } catch {
      return false;
    }
  },

  // ── Stage ────────────────────────────────────────────────────
  clearStage: () => {
    const { pages, currentPageIndex } = get();
    if (pages[currentPageIndex].elements.length === 0) return;
    get()._pushHistory();
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], elements: [] };
    set({ pages: newPages, ..._sel([]) });
    toast.success('Stage dibersihkan');
    autoSave();
  },

  applyLayout: (template) => {
    const { pages, currentPageIndex } = get();
    if (!pages[currentPageIndex]) return;
    get()._pushHistory();
    const elements: CanvaElement[] = template.elements.map(e => ({
      ...e,
      id: createElId(),
    }));
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...newPages[currentPageIndex],
      bgColor: template.bgColor || newPages[currentPageIndex].bgColor,
      elements,
    };
    set({ pages: newPages, ..._sel([]) });
    toast.success('Layout diterapkan');
    autoSave();
  },

  applyLayoutPack: (templates) => {
    const { pages } = get();
    get()._pushHistory();
    const newPages = templates.map((tmpl, i) => {
      const existing = pages[i];
      const elements: CanvaElement[] = tmpl.elements.map(e => ({
        ...e,
        id: createElId(),
      }));
      if (existing) {
        return {
          ...existing,
          bgColor: tmpl.bgColor || existing.bgColor,
          elements,
        };
      }
      return {
        id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        label: 'Halaman ' + (i + 1),
        bgDataUrl: null,
        bgColor: tmpl.bgColor,
        overlay: 20,
        elements,
      };
    });
    set({ pages: newPages, currentPageIndex: 0, ..._sel([]) });
    toast.success(`Paket ${templates.length} halaman diterapkan`);
    autoSave();
  },

  generateFromPageType: (pageType, config) => {
    const { pages } = get();
    get()._pushHistory();

    // Fetch kuis data from Authoring Store (if available)
    let authoringData: { kuis?: Array<{ q: string; opts: string[]; ans: number; ex: string }>; meta?: { judulPertemuan: string; mapel: string; kelas: string; namaBab: string } } = {};
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAuthoringStore } = require('@/store/authoring-store');
      const authState = useAuthoringStore.getState();
      if (authState?.kuis?.length > 0) {
        authoringData.kuis = authState.kuis;
      }
      if (authState?.meta) {
        authoringData.meta = authState.meta;
      }
    } catch { /* authoring store not available */ }

    // Merge authoring data into config for page type generator
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrichedConfig = { ...config, _authoringData: authoringData } as any;
    const result = pageType.generate(enrichedConfig);

    // Post-process: fill kuis content from authoring data
    if (authoringData.kuis && authoringData.kuis.length > 0) {
      const kuisData = authoringData.kuis;
      result.pages.forEach((blueprint, idx) => {
        // Skip start page (index 0) and result page (last)
        const isQuestionPage = idx > 0 && idx < result.pages.length - (pageType.id.includes('kuis') ? 1 : 0);
        if (isQuestionPage) {
          const qIdx = idx - 1; // Question index (0-based)
          const kuisItem = kuisData[qIdx];
          if (kuisItem) {
            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
            // Find question placeholder and fill it
            blueprint.elements.forEach((el) => {
              if (el.label === 'Pertanyaan' || el.label === 'Pernyataan' || el.label?.startsWith('Soal')) {
                el.text = kuisItem.q;
                // Store correct answer index
                if (el.label === 'Pertanyaan') {
                  (el as CanvaElement & { correctIdx?: number }).correctIdx = kuisItem.ans;
                }
                if (el.label === 'Pernyataan') {
                  (el as CanvaElement & { correctBS?: boolean }).correctBS = kuisItem.ans === 0;
                }
              }
              // Fill option buttons
              if (el.label?.startsWith('Opsi ') && kuisItem.opts) {
                const optMatch = el.label.match(/Opsi ([A-Z])/);
                if (optMatch) {
                  const letterIdx = letters.indexOf(optMatch[1]);
                  if (letterIdx >= 0 && letterIdx < kuisItem.opts.length) {
                    el.text = `${optMatch[1]}. ${kuisItem.opts[letterIdx]}`;
                  }
                }
              }
            });
          }
        }

        // Fill start page title from meta
        if (idx === 0 && authoringData.meta?.judulPertemuan) {
          blueprint.elements.forEach((el) => {
            if (el.label === 'Judul Utama' || el.label === 'Judul Game') {
              el.text = authoringData.meta!.judulPertemuan;
            }
            if (el.label === 'Deskripsi' || el.label === 'Info') {
              const mapel = authoringData.meta!.mapel;
              const kelas = authoringData.meta!.kelas;
              if (mapel && kelas) {
                el.text = `${mapel} Kelas ${kelas}`;
              }
            }
          });
        }
      });
    }

    const newPages = result.pages.map((blueprint, i) => {
      const existing = pages[i];
      const elements: CanvaElement[] = blueprint.elements.map(e => ({
        ...e,
        id: createElId(),
      }));
      if (existing) {
        return {
          ...existing,
          bgColor: blueprint.bgColor,
          elements,
        };
      }
      return {
        id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        label: blueprint.label,
        bgDataUrl: null,
        bgColor: blueprint.bgColor,
        overlay: 20,
        elements,
      };
    });
    set({ pages: newPages, currentPageIndex: 0, ..._sel([]) });
    toast.success(`${pageType.name}: ${result.pages.length} halaman digenerate`);
    autoSave();
  },

  // ── Export helpers ───────────────────────────────────────────
  //    Delegated to canva-export.ts for maintainability
  // ──────────────────────────────────────────────────────────────
  _renderElHTML: (el: CanvaElement): string => {
    return _renderElHTMLExport(el);
  },

  exportPageHTML: (pageIdx) => {
    const { pages, ratioId } = get();
    const idx = pageIdx ?? get().currentPageIndex;
    const page = pages[idx];
    if (!page) return '';
    const ratio = RATIOS.find(r => r.id === ratioId) || RATIOS[0];
    return exportPageHTMLExport({ page, ratio });
  },

  exportSlideshowHTML: () => {
    const { pages, ratioId } = get();
    const ratio = RATIOS.find(r => r.id === ratioId) || RATIOS[0];
    return exportSlideshowHTMLExport({ pages, ratio });
  },
}));
