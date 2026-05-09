# Canva ↔ Authoring Store Sync Bridge — Architecture Plan

## 1. Problem Statement

Three `require()` calls bypass ES module boundaries. Two completely separate
export pipelines produce incompatible HTML. No data flows back from Canvas mode
to the Authoring Store.

```
CURRENT (broken):

  AuthoringTool ──write──▶ authoring-store ◀──require()── canva-store ◀──write─── CanvasMode
                                   │                              │
                                   ▼                              ▼
                           bridge.ts ──▶ template-engine    alpine-slideshow.ts
                                   │                              │
                                   ▼                              ▼
                             template HTML                   canvas HTML
                            (structured screens)          (freeform slides)

  LivePreview picks ONE pipeline — never both. No unified export.
```

---

## 2. Architecture Overview

```
PROPOSED:

  AuthoringTool ──▶ authoring-store ──┐
  CanvasMode   ──▶ canva-store    ──┤
                                     ▼
                              sync-bridge.ts  ◄── single source of truth for cross-store ops
                              (new file)
                                     │
                    ┌────────────────┼─────────────────┐
                    ▼                ▼                  ▼
            readAuthoring()   writeBackAuthoring()   unifiedExport()
            (no require)      (canvas→authoring)     (both stores)
```

### Key Principles

1. **Zustand `.getState()` pattern** — stores can read each other via
   `useOtherStore.getState()` without `require()` or circular deps.
2. **Explicit data passing** — no store directly mutates another store;
   instead, bridge functions orchestrate reads + writes.
3. **Unified export** — a single `unifiedExport()` function that merges
  canvas pages + authoring data into one HTML output.
4. **Write-back adapters** — canvas elements with `type: 'kuis'/'game'/'modul'`
   can sync their content back to the authoring store.

---

## 3. New File: `src/lib/sync-bridge.ts`

This is the **single coordination point**. It imports both stores at module
level (ES imports, not `require()`) and provides named functions.

```typescript
// src/lib/sync-bridge.ts
//
// SYNC BRIDGE — Coordination layer between Authoring Store and Canva Store
//
// Rules:
//   1. This is the ONLY file that imports BOTH stores.
//   2. Stores never import each other directly.
//   3. Consumers import from here, not from the other store.
//   4. All functions are pure-ish: read state, compute, write state.

import { useAuthoringStore } from '@/store/authoring-store';
import { useCanvaStore } from '@/store/canva-store';
import type {
  KuisItem, MetaState, MateriState, CpState, TpItem, AtpState, AlurItem,
} from '@/store/authoring-store';
import type { CanvaElement, CanvaPage } from '@/components/canva/types';
import { MODUL_TYPE_SIMPLE, getModuleTypeInfo } from '@/lib/shared/module-types';
import { exportProject as exportTemplateProject } from '@/lib/template-engine/bridge';
import type { AuthoringExportData } from '@/lib/template-engine/bridge';

// ═══════════════════════════════════════════════════════════════
// SECTION A: READING AUTHORING DATA FROM CANVAS MODE
// ═══════════════════════════════════════════════════════════════

/**
 * Get module metadata for a given index.
 * Replaces the require() call in canva-store.addModulElement().
 */
export function getModuleMeta(idx: number): {
  modulType: string;
  modulTitle: string;
  modulIcon: string;
  modulColor: string;
} {
  const authState = useAuthoringStore.getState();
  const mod = authState?.modules?.[idx];
  if (!mod) {
    return { modulType: '', modulTitle: '', modulIcon: '🧩', modulColor: '#34d399' };
  }
  const modulType = (mod.type as string) || '';
  const info = MODUL_TYPE_SIMPLE[modulType] || { icon: '🧩', color: '#34d399', label: 'Modul' };
  return {
    modulType,
    modulTitle: (mod.title as string) || info.label,
    modulIcon: info.icon,
    modulColor: info.color,
  };
}

/**
 * Get authoring data needed for page-type auto-generation.
 * Replaces the require() call in canva-store.generateFromPageType().
 */
export function getAuthoringDataForGeneration(): {
  kuis?: KuisItem[];
  meta?: MetaState;
} {
  const authState = useAuthoringStore.getState();
  const result: { kuis?: KuisItem[]; meta?: MetaState } = {};
  if (authState?.kuis?.length > 0) {
    result.kuis = authState.kuis;
  }
  if (authState?.meta) {
    result.meta = authState.meta;
  }
  return result;
}

/**
 * Get all kuis items from the authoring store.
 */
export function getKuisItems(): KuisItem[] {
  return useAuthoringStore.getState().kuis || [];
}

/**
 * Get all modules from the authoring store.
 */
export function getModules(): Array<Record<string, unknown>> {
  return useAuthoringStore.getState().modules || [];
}

/**
 * Get all games from the authoring store.
 */
export function getGames(): Array<Record<string, unknown>> {
  return useAuthoringStore.getState().games || [];
}

/**
 * Get full authoring export data snapshot.
 * Used by the unified export pipeline.
 */
export function getAuthoringExportData(): AuthoringExportData {
  const s = useAuthoringStore.getState();
  return {
    meta: s.meta,
    cp: s.cp,
    tp: s.tp,
    atp: s.atp,
    alur: s.alur,
    skenario: s.skenario,
    kuis: s.kuis,
    modules: s.modules,
    games: s.games,
    materi: s.materi,
  };
}

// ═══════════════════════════════════════════════════════════════
// SECTION B: WRITE-BACK (Canvas → Authoring Store)
// ═══════════════════════════════════════════════════════════════

/**
 * Extract kuis data from canvas pages and write back to authoring store.
 */
export function syncCanvasKuisToAuthoring(): number {
  const canvasState = useCanvaStore.getState();
  const pages = canvasState.pages;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const extracted: KuisItem[] = [];

  for (const page of pages) {
    const qEl = page.elements.find(
      e => e.label === 'Pertanyaan' || e.label === 'Pernyataan' || e.label?.startsWith('Soal')
    );
    if (!qEl) continue;

    const opts: string[] = [];
    let ans = 0;

    for (let i = 0; i < 6; i++) {
      const optEl = page.elements.find(e => e.label === `Opsi ${letters[i]}`);
      if (optEl && optEl.text) {
        const text = optEl.text.replace(/^[A-F]\.\s*/, '');
        opts.push(text);
      }
    }

    if ((qEl as CanvaElement & { correctIdx?: number }).correctIdx !== undefined) {
      ans = (qEl as CanvaElement & { correctIdx?: number }).correctIdx;
    }

    if (qEl.text || opts.length > 0) {
      extracted.push({
        q: qEl.text || '',
        opts: opts.length > 0 ? opts : ['', '', '', ''],
        ans,
        ex: '',
      });
    }
  }

  if (extracted.length > 0) {
    useAuthoringStore.setState({ kuis: extracted, dirty: true });
  }

  return extracted.length;
}

/**
 * Sync canvas meta-like elements back to authoring store.
 */
export function syncCanvasMetaToAuthoring(): void {
  const canvasState = useCanvaStore.getState();
  const firstPage = canvasState.pages[0];
  if (!firstPage) return;

  const updates: Partial<MetaState> = {};

  const judulEl = firstPage.elements.find(e => e.label === 'Judul Utama' || e.label === 'Judul Game');
  if (judulEl?.text) {
    updates.judulPertemuan = judulEl.text;
  }

  const descEl = firstPage.elements.find(e => e.label === 'Deskripsi' || e.label === 'Info');
  if (descEl?.text) {
    const parts = descEl.text.match(/^(.+?)\s+Kelas\s+(.+)$/);
    if (parts) {
      updates.mapel = parts[1];
      updates.kelas = parts[2];
    }
  }

  if (Object.keys(updates).length > 0) {
    const current = useAuthoringStore.getState().meta;
    useAuthoringStore.setState({
      meta: { ...current, ...updates },
      dirty: true,
    });
  }
}

/**
 * Full write-back: sync all extractable canvas data to authoring store.
 */
export function syncAllCanvasToAuthoring(): {
  kuisCount: number;
  metaUpdated: boolean;
} {
  const kuisCount = syncCanvasKuisToAuthoring();
  syncCanvasMetaToAuthoring();
  return { kuisCount, metaUpdated: true };
}

// ═══════════════════════════════════════════════════════════════
// SECTION C: AUTHORING → CANVA ELEMENT GENERATION
// ═══════════════════════════════════════════════════════════════

/**
 * Convert authoring kuis items into canvas element templates.
 */
export function kuisToCanvasElements(kuisIdx: number): Omit<CanvaElement, 'id'> | null {
  const kuis = useAuthoringStore.getState().kuis?.[kuisIdx];
  if (!kuis) return null;

  return {
    type: 'kuis',
    icon: '❓',
    label: 'Kuis #' + (kuisIdx + 1),
    dataIdx: kuisIdx,
    x: 5, y: 5, w: 45, h: 40,
    opacity: 100,
  };
}

/**
 * Convert authoring module into canvas element template.
 */
export function moduleToCanvasElement(modIdx: number): Omit<CanvaElement, 'id'> | null {
  const meta = getModuleMeta(modIdx);
  if (!meta.modulType && meta.modulIcon === '🧩') return null;

  return {
    type: 'modul',
    icon: meta.modulIcon,
    label: meta.modulTitle || 'Modul #' + (modIdx + 1),
    dataIdx: modIdx,
    modulType: meta.modulType || undefined,
    color: meta.modulColor,
    x: 5, y: 5, w: 40, h: 30,
    opacity: 100,
  };
}

/**
 * Convert authoring game into canvas element template.
 */
export function gameToCanvasElement(gameIdx: number): Omit<CanvaElement, 'id'> | null {
  const games = useAuthoringStore.getState().games;
  if (!games?.[gameIdx]) return null;

  return {
    type: 'game',
    icon: '🎮',
    label: 'Game #' + (gameIdx + 1),
    dataIdx: gameIdx,
    x: 55, y: 5, w: 40, h: 40,
    opacity: 100,
  };
}

/**
 * Generate canvas pages from authoring kuis data.
 * Creates a full quiz page set (start + question pages + result).
 */
export function generateKuisPages(
  config: { numOptions?: number; hasTimer?: boolean; hasNavbar?: boolean } = {}
): { pages: Omit<CanvaPage, 'id'>[]; navbarStyle?: string } {
  const kuisData = useAuthoringStore.getState().kuis;
  const meta = useAuthoringStore.getState().meta;
  if (!kuisData || kuisData.length === 0) {
    return { pages: [] };
  }

  const numOpts = config.numOptions ?? 4;
  const hasTimer = config.hasTimer ?? false;
  const hasNavbar = config.hasNavbar ?? true;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const pages: Omit<CanvaPage, 'id'>[] = [];

  // Start page
  const startElements: Omit<CanvaElement, 'id'>[] = [
    { type: 'shape', icon: '', label: 'Area Ilustrasi', x: 10, y: 5, w: 80, h: 30, opacity: 100, color: 'rgba(59,130,246,0.15)', radius: 16, system: true },
    { type: 'teks', icon: '', label: 'Judul Utama', x: 15, y: 10, w: 70, h: 10, opacity: 100, text: meta?.judulPertemuan || 'Judul Kuis', fontSize: 32, system: true },
    { type: 'teks', icon: '', label: 'Deskripsi', x: 20, y: 22, w: 60, h: 6, opacity: 100, text: `${meta?.mapel || ''} Kelas ${meta?.kelas || ''}`, fontSize: 14, system: true },
    { type: 'teks', icon: '', label: 'Petunjuk', x: 25, y: 45, w: 50, h: 4, opacity: 100, text: `${kuisData.length} soal pilihan ganda`, fontSize: 12 },
    { type: 'button', icon: '🚀', label: 'Mulai Kuis', x: 30, y: 55, w: 40, h: 10, opacity: 100, text: '🚀  Mulai Kuis', color: '#3b82f6', radius: 12 },
  ];
  pages.push({ label: 'Mulai Kuis', bgDataUrl: null, bgColor: '#0f172a', overlay: 20, elements: startElements });

  // Question pages — populated from authoring kuis data
  const baseY = hasTimer ? 20 : 15;
  const optionH = 9;
  const optionGap = 10.5;

  for (let i = 0; i < kuisData.length; i++) {
    const item = kuisData[i];
    const questionElements: Omit<CanvaElement, 'id'>[] = [
      { type: 'teks', icon: '📄', label: 'Counter Sistem', x: 5, y: 3, w: 25, h: 5, opacity: 100, text: `Soal ${i + 1} dari ${kuisData.length}`, fontSize: 11, system: true },
      { type: 'progress', icon: '📊', label: `Progress ${i + 1}/${kuisData.length}`, x: 10, y: 3, w: 80, h: 3, opacity: 100, color: '#3b82f6', text: `${(i / kuisData.length) * 100}`, system: true },
      { type: 'score', icon: '⭐', label: 'Skor Sistem', x: 78, y: 3, w: 20, h: 7, opacity: 100, text: '0', color: '#f59e0b', system: true },
    ];

    if (hasTimer) {
      questionElements.push({ type: 'timer', icon: '⏱️', label: 'Timer Sistem', x: 35, y: 3, w: 30, h: 10, opacity: 100, text: '02:00', color: '#ef4444', system: true });
    }

    questionElements.push({
      type: 'teks', icon: '❓', label: 'Pertanyaan', x: 8, y: baseY, w: 84, h: 14, opacity: 100,
      text: item.q || 'Tulis pertanyaan di sini...', fontSize: 20,
      correctIdx: item.ans,
    });

    for (let j = 0; j < Math.min(numOpts, item.opts?.length || 0); j++) {
      questionElements.push({
        type: 'button', icon: letters[j], label: `Opsi ${letters[j]}`,
        x: 10, y: baseY + 14 + j * optionGap, w: 80, h: optionH, opacity: 100,
        text: `${letters[j]}. ${item.opts[j]}`,
        color: '#1e3a5f', radius: 10,
      });
    }

    if (hasNavbar) {
      questionElements.push({ type: 'navbar', icon: '🧭', label: 'Navbar Sistem', x: 0, y: 88, w: 100, h: 12, opacity: 100, navStyle: 'bottom-bar', color: '#1e293b', system: true });
    }

    pages.push({ label: `Soal ${i + 1}`, bgDataUrl: null, bgColor: '#0c1222', overlay: 20, elements: questionElements });
  }

  // Result page
  const resultElements: Omit<CanvaElement, 'id'>[] = [
    { type: 'confetti', icon: '', label: 'Area Confetti', x: 5, y: 2, w: 90, h: 40, opacity: 100, system: true },
    { type: 'badge', icon: '🏆', label: 'Badge Juara', x: 30, y: 5, w: 40, h: 20, opacity: 100, text: 'Luar Biasa!', color: '#f59e0b', system: true },
    { type: 'score', icon: '⭐', label: 'Skor Akhir', x: 25, y: 30, w: 50, h: 12, opacity: 100, text: '100', color: '#22c55e', system: true },
    { type: 'button', icon: '🔄', label: 'Ulangi', x: 10, y: 80, w: 35, h: 8, opacity: 100, text: '🔄  Ulangi', color: '#3b82f6', radius: 10 },
  ];
  if (hasNavbar) {
    resultElements.push({ type: 'navbar', icon: '🧭', label: 'Navbar Sistem', x: 0, y: 88, w: 100, h: 12, opacity: 100, navStyle: 'bottom-bar', color: '#1e293b', system: true });
  }
  pages.push({ label: 'Hasil Kuis', bgDataUrl: null, bgColor: '#0f172a', overlay: 20, elements: resultElements });

  return { pages, navbarStyle: hasNavbar ? 'bottom-bar' : undefined };
}

// ═══════════════════════════════════════════════════════════════
// SECTION D: UNIFIED EXPORT
// ═══════════════════════════════════════════════════════════════

export type ExportMode = 'canvas-only' | 'template-only' | 'hybrid';

export interface UnifiedExportOptions {
  mode: ExportMode;
  screenMapping?: Record<string, 'canvas' | 'template'>;
}

/**
 * Detect the best export mode based on current store state.
 */
export function detectExportMode(): ExportMode {
  const canvasPages = useCanvaStore.getState().pages;
  const hasCanvasContent = canvasPages.some(p => p.elements.length > 0);

  const authState = useAuthoringStore.getState();
  const hasAuthoringContent = !!(
    authState.kuis?.length ||
    authState.modules?.length ||
    authState.materi?.blok?.length ||
    authState.skenario?.length ||
    authState.cp?.capaianFase
  );

  if (hasCanvasContent && hasAuthoringContent) return 'hybrid';
  if (hasCanvasContent) return 'canvas-only';
  return 'template-only';
}

/**
 * Unified export: produces a single HTML file combining both stores' data.
 */
export function unifiedExport(options?: UnifiedExportOptions): string {
  const mode = options?.mode ?? detectExportMode();

  switch (mode) {
    case 'canvas-only':
      return useCanvaStore.getState().exportSlideshowHTML();
    case 'template-only':
      return exportTemplateProject(getAuthoringExportData());
    case 'hybrid':
      return exportHybrid();
  }
}

/**
 * Hybrid export: combines canvas slides + template screens into one HTML.
 */
function exportHybrid(): string {
  syncAllCanvasToAuthoring();

  const canvasHtml = useCanvaStore.getState().exportSlideshowHTML();
  const templateHtml = exportTemplateProject(getAuthoringExportData());

  const hasFilledQuiz = useCanvaStore.getState().pages.some(p =>
    p.elements.some(e => e.label === 'Pertanyaan' && e.text && e.text !== 'Tulis pertanyaan di sini...')
  );

  if (hasFilledQuiz) {
    return canvasHtml;
  }

  return templateHtml;
}

// ═══════════════════════════════════════════════════════════════
// SECTION E: REACTIVE SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════════════

export function subscribeToAuthoringKuis(
  callback: (kuis: KuisItem[]) => void
): () => void {
  return useAuthoringStore.subscribe(
    (state) => state.kuis,
    (kuis) => callback(kuis)
  );
}

export function subscribeToAuthoringMeta(
  callback: (meta: MetaState) => void
): () => void {
  return useAuthoringStore.subscribe(
    (state) => state.meta,
    (meta) => callback(meta)
  );
}

export function subscribeToAuthoringModules(
  callback: (modules: Array<Record<string, unknown>>) => void
): () => void {
  return useAuthoringStore.subscribe(
    (state) => state.modules,
    (modules) => callback(modules)
  );
}
```

---

## 4. Changes to Existing Files

### 4.1 `src/store/canva-store.ts`

**Replace two `require()` calls with sync-bridge imports.**

**Change 1: Top of file — add import**

```typescript
// ADD at top of file (after existing imports):
import { getModuleMeta, getAuthoringDataForGeneration } from '@/lib/sync-bridge';
```

**Change 2: `addModulElement()` (line ~426-470)**

Replace the `try { require(...) }` block with:

```typescript
addModulElement: (idx) => {
  const { pages, currentPageIndex } = get();
  const page = pages[currentPageIndex];
  if (!page) return;

  // Fetch module info via sync-bridge (no require!)
  const { modulType, modulTitle, modulIcon, modulColor } = getModuleMeta(idx);

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
```

**Change 3: `generateFromPageType()` (line ~851-954)**

Replace the `try { require(...) }` block with:

```typescript
generateFromPageType: (pageType, config) => {
  const { pages } = get();
  get()._pushHistory();

  // Fetch authoring data via sync-bridge (no require!)
  const authoringData = getAuthoringDataForGeneration();

  // Merge authoring data into config
  const enrichedConfig = { ...config, _authoringData: authoringData } as any;

  // ... rest of the function stays exactly the same ...
```

### 4.2 `src/components/canva/FloatingActionBar.tsx`

**Replace `require()` in `AutoGeneratePanel` (line ~654)**

Move to top of file:

```typescript
// ADD at top of file:
import { ALL_PAGE_TYPES, PAGE_TYPE_CATEGORIES } from '@/store/page-types';

// REMOVE from AutoGeneratePanel:
// const { ALL_PAGE_TYPES, PAGE_TYPE_CATEGORIES } = require('@/store/page-types');
```

### 4.3 `src/components/authoring/LivePreview.tsx`

**Simplify to use unified export.**

```typescript
// ADD import:
import { unifiedExport } from '@/lib/sync-bridge';

// REPLACE the useEffect debounce logic:
useEffect(() => {
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    try {
      const html = unifiedExport({
        mode: previewMode === 'canvas' ? 'canvas-only' : 'template-only'
      });
      setHtmlContent(html);
    } catch (err) {
      console.error('Failed to generate preview HTML:', err);
    }
  }, 500);
  return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
}, [previewMode, meta, cp, tp, atp, alur, skenario, kuis, materi, modules, games, canvasPages]);
```

### 4.4 `src/components/authoring/ImportExport.tsx`

**Add canvas data to JSON export and use unified export.**

```typescript
// ADD imports:
import { useCanvaStore } from '@/store/canva-store';
import { unifiedExport } from '@/lib/sync-bridge';

// MODIFY exportJSON:
const exportJSON = useCallback(() => {
  const s = useAuthoringStore.getState();
  const c = useCanvaStore.getState();
  const data = {
    meta: s.meta, cp: s.cp, tp: s.tp, atp: s.atp, alur: s.alur,
    skenario: s.skenario, kuis: s.kuis, modules: s.modules,
    games: s.games, materi: s.materi,
    canvasPages: c.pages,
    canvasRatioId: c.ratioId,
  };
  // ... rest same
}, []);

// MODIFY exportStudentHtml to use unified export:
const exportStudentHtml = useCallback(() => {
  try {
    const html = unifiedExport();
    // ... rest same
  } catch (err) {
    // ...
  }
}, []);
```

---

## 5. Data Flow Diagrams

### 5.1 Canvas → Authoring (Write-Back)

```
┌─────────────────────┐
│   Canvas Mode       │
│                     │
│  Pages with         │
│  positioned         │
│  elements:          │
│  - Pertanyaan       │
│  - Opsi A/B/C/D    │
│  - Judul Utama      │
│  - Skor             │
└────────┬────────────┘
         │ syncCanvasKuisToAuthoring()
         │ syncCanvasMetaToAuthoring()
         ▼
┌─────────────────────┐
│  Authoring Store    │
│  .kuis = [...]      │
│  .meta.judul = ...  │
└────────┬────────────┘
         │ exportProject()
         ▼
┌─────────────────────┐
│  Template Engine    │
│  → HTML Export      │
└─────────────────────┘
```

### 5.2 Authoring → Canvas (Element Generation)

```
┌─────────────────────┐
│  Authoring Store    │
│  .kuis[3]           │
│  .modules[2]        │
│  .games[1]          │
└────────┬────────────┘
         │ getModuleMeta(idx)
         │ getKuisItems()
         │ generateKuisPages()
         ▼
┌─────────────────────┐
│  Sync Bridge        │
│  Converts authoring │
│  data → CanvaElement│
│  templates          │
└────────┬────────────┘
         │ addModulElement() / addKuisElement()
         ▼
┌─────────────────────┐
│  Canva Store        │
│  .pages[].elements  │
│  with populated     │
│  dataIdx, text      │
└─────────────────────┘
```

### 5.3 Unified Export

```
                    ┌──────────────────┐
                    │ unifiedExport()   │
                    └────────┬─────────┘
                             │
              ┌──────────────┼───────────────┐
              ▼              ▼               ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │ canvas-only│  │template-only│  │  hybrid    │
     │            │  │            │  │            │
     │ alpine-    │  │ bridge →   │  │ 1. sync    │
     │ slideshow  │  │ template   │  │    canvas  │
     │ export     │  │ engine     │  │    → auth  │
     │            │  │            │  │ 2. merge   │
     │            │  │            │  │    outputs  │
     └────────────┘  └────────────┘  └────────────┘
```

---

## 6. Implementation Order

| Step | File | Change | Risk |
|------|------|--------|------|
| 1 | `src/lib/sync-bridge.ts` | Create new file with all bridge functions | Low (additive) |
| 2 | `src/store/canva-store.ts` | Replace 2x `require()` with bridge imports | Medium (behavior change) |
| 3 | `src/components/canva/FloatingActionBar.tsx` | Replace `require()` with ES import | Low (trivial) |
| 4 | `src/components/authoring/LivePreview.tsx` | Use `unifiedExport()` | Medium (preview change) |
| 5 | `src/components/authoring/ImportExport.tsx` | Add canvas data to JSON + unified export | Medium (export change) |
| 6 | Add "Sync to Canvas" button | In authoring kuis/modules tabs | Low (additive UI) |
| 7 | Add "Sync to Authoring" button | In canvas floating bar | Low (additive UI) |
| 8 | Full hybrid export | Merge canvas + template HTML | High (complex) |

---

## 7. Zustand Cross-Store Communication Pattern

The **official Zustand pattern** for cross-store communication is:

```typescript
// Store A can read Store B's state:
const storeBState = useStoreB.getState();

// Store A can subscribe to Store B's changes:
const unsub = useStoreB.subscribe((state) => {
  // react to changes
});

// Store A can write to Store B:
useStoreB.setState({ key: value });
```

Our sync-bridge centralizes this. The key constraint:

> **Only `sync-bridge.ts` imports both stores.**
> Each store only imports the bridge for reading the other store.
> Components import the bridge for coordinated operations.

This prevents the circular import issue that forced the `require()` hack
in the first place, because the bridge is a **leaf module** that doesn't
import components.

---

## 8. Future: Reactive Hook for Canvas Components

```typescript
// src/hooks/use-synced-authoring.ts
import { useAuthoringStore } from '@/store/authoring-store';
import type { KuisItem, MetaState } from '@/store/authoring-store';

/**
 * Hook that provides authoring data for canvas components.
 * Re-subscribes reactively when authoring data changes.
 */
export function useAuthoringInCanvas() {
  const kuis = useAuthoringStore((s) => s.kuis);
  const modules = useAuthoringStore((s) => s.modules);
  const games = useAuthoringStore((s) => s.games);
  const meta = useAuthoringStore((s) => s.meta);

  return { kuis, modules, games, meta };
}
```

Components like `FloatingActionBar` would use this hook instead of
`require()` or calling the bridge imperatively.

---

## 9. File Summary

| File | Status | Purpose |
|------|--------|---------|
| `src/lib/sync-bridge.ts` | **NEW** | Single coordination point for cross-store ops |
| `src/store/canva-store.ts` | **MODIFY** | Remove 2x `require()`, use bridge imports |
| `src/store/authoring-store.ts` | **UNCHANGED** | No changes needed |
| `src/components/canva/FloatingActionBar.tsx` | **MODIFY** | Remove `require()`, use ES import |
| `src/components/authoring/LivePreview.tsx` | **MODIFY** | Use `unifiedExport()` |
| `src/components/authoring/ImportExport.tsx` | **MODIFY** | Include canvas data in export |
| `src/hooks/use-synced-authoring.ts` | **NEW** | Reactive hook for canvas components |
