// ═══════════════════════════════════════════════════════════════
// SYNC BRIDGE — Single coordination point for Canva ↔ Authoring
// ═══════════════════════════════════════════════════════════════
//
// This is the ONLY file that imports both stores.
// Each store imports only from here — no circular dependencies.
// Components import here for coordinated operations.
//
// Architecture:
//   canva-store ──┐
//                  ├── sync-bridge ──→ consumers (LivePreview, ImportExport, etc.)
//   authoring-store ┘
// ═══════════════════════════════════════════════════════════════

import { useCanvaStore } from '@/store/canva-store';
import { useAuthoringStore } from '@/store/authoring-store';
import { MODUL_TYPE_SIMPLE } from '@/lib/shared/module-types';
import type { ExportData } from '@/lib/shared/types';
import { exportProject } from '@/lib/template-engine/bridge';

// ── Types ─────────────────────────────────────────────────────
type KuisItem = { q: string; opts: string[]; ans: number; ex: string };
type ModuleData = Record<string, unknown>;
type GameData = Record<string, unknown>;

export type ExportMode = 'template' | 'canvas' | 'hybrid';

// ═══════════════════════════════════════════════════════════════
// SECTION A: READ AUTHORING DATA (replaces require() calls)
// ═══════════════════════════════════════════════════════════════

/** Get module metadata for a specific index (icon, color, label, type) */
export function getModuleMeta(idx: number): {
  type: string;
  icon: string;
  color: string;
  label: string;
  title: string;
} {
  const authState = useAuthoringStore.getState();
  const mod = authState?.modules?.[idx];
  const modulType = (mod?.type as string) || '';
  const info = MODUL_TYPE_SIMPLE[modulType] || { icon: '🧩', color: '#34d399', label: 'Modul' };
  return {
    type: modulType,
    icon: info.icon,
    color: info.color,
    label: info.label,
    title: (mod?.title as string) || info.label,
  };
}

/** Get all authoring data needed for canvas page generation */
export function getAuthoringDataForGeneration(): {
  kuis: KuisItem[];
  meta: { judulPertemuan: string; mapel: string; kelas: string; namaBab: string };
  modules: ModuleData[];
  games: GameData[];
} {
  const authState = useAuthoringStore.getState();
  return {
    kuis: authState?.kuis || [],
    meta: authState?.meta || { judulPertemuan: '', mapel: '', kelas: '', namaBab: '' },
    modules: authState?.modules || [],
    games: authState?.games || [],
  };
}

/** Get kuis items from authoring store */
export function getKuisItems(): KuisItem[] {
  return useAuthoringStore.getState()?.kuis || [];
}

/** Get modules from authoring store */
export function getModules(): ModuleData[] {
  return useAuthoringStore.getState()?.modules || [];
}

/** Get games from authoring store */
export function getGames(): GameData[] {
  return useAuthoringStore.getState()?.games || [];
}

/** Get full authoring export data for bridge */
export function getAuthoringExportData(): ExportData {
  const s = useAuthoringStore.getState();
  return {
    meta: s.meta,
    cp: s.cp,
    tp: s.tp,
    atp: s.atp,
    alur: s.alur,
    skenario: s.skenario,
    kuis: s.kuis,
    materi: s.materi,
    modules: s.modules,
    games: s.games,
  };
}

// ═══════════════════════════════════════════════════════════════
// SECTION B: WRITE-BACK (Canvas → Authoring Store)
// ═══════════════════════════════════════════════════════════════

/** Sync canvas kuis elements back to authoring store */
export function syncCanvasKuisToAuthoring(): void {
  const canvaState = useCanvaStore.getState();
  const pages = canvaState.pages;

  // Collect all kuis elements from canvas pages
  const kuisElements: Array<{ pageIdx: number; elIdx: number; text: string; dataIdx: number }> = [];
  pages.forEach((page, pageIdx) => {
    page.elements.forEach((el, elIdx) => {
      if (el.type === 'kuis') {
        kuisElements.push({
          pageIdx,
          elIdx,
          text: el.text || '',
          dataIdx: el.dataIdx ?? -1,
        });
      }
    });
  });

  // If no kuis elements, skip
  if (kuisElements.length === 0) return;

  const authState = useAuthoringStore.getState();
  const existingKuis = [...authState.kuis];

  // Update existing kuis items from canvas text content
  kuisElements.forEach(ke => {
    if (ke.dataIdx >= 0 && ke.dataIdx < existingKuis.length) {
      // Update question text if it changed
      if (ke.text && ke.text !== existingKuis[ke.dataIdx].q) {
        existingKuis[ke.dataIdx] = {
          ...existingKuis[ke.dataIdx],
          q: ke.text,
        };
      }
    }
  });

  useAuthoringStore.setState({ kuis: existingKuis, dirty: true });
}

/** Sync canvas meta info (title, subject, class) back to authoring store */
export function syncCanvasMetaToAuthoring(): void {
  const canvaState = useCanvaStore.getState();
  const pages = canvaState.pages;

  // Look for title elements in first page
  const firstPage = pages[0];
  if (!firstPage) return;

  let foundTitle = '';
  for (const el of firstPage.elements) {
    if (el.type === 'teks' && el.text && el.fontSize && el.fontSize >= 20) {
      foundTitle = el.text;
      break;
    }
  }

  if (foundTitle) {
    const authState = useAuthoringStore.getState();
    if (authState.meta.judulPertemuan !== foundTitle) {
      useAuthoringStore.setState({
        meta: { ...authState.meta, judulPertemuan: foundTitle },
        dirty: true,
      });
    }
  }
}

/** Sync all canvas data back to authoring store */
export function syncAllCanvasToAuthoring(): void {
  syncCanvasKuisToAuthoring();
  syncCanvasMetaToAuthoring();
}

// ═══════════════════════════════════════════════════════════════
// SECTION C: AUTHORING → CANVAS (convert data to canvas elements)
// ═══════════════════════════════════════════════════════════════

/** Convert a kuis item to canvas element props */
export function kuisToCanvasElements(kuis: KuisItem[], startIdx: number): Array<{
  type: string;
  icon: string;
  label: string;
  text: string;
  dataIdx: number;
  x: number;
  y: number;
  w: number;
  h: number;
}> {
  return kuis.map((k, i) => ({
    type: 'kuis',
    icon: '❓',
    label: `Kuis #${startIdx + i + 1}`,
    text: k.q,
    dataIdx: startIdx + i,
    x: 5,
    y: 5,
    w: 45,
    h: 40,
  }));
}

/** Convert a module to canvas element props */
export function moduleToCanvasElement(mod: ModuleData, idx: number): {
  type: string;
  icon: string;
  label: string;
  modulType: string;
  color: string;
  dataIdx: number;
  x: number;
  y: number;
  w: number;
  h: number;
} {
  const modulType = (mod.type as string) || '';
  const info = MODUL_TYPE_SIMPLE[modulType] || { icon: '🧩', color: '#34d399', label: 'Modul' };
  return {
    type: 'modul',
    icon: info.icon,
    label: (mod.title as string) || info.label,
    modulType,
    color: info.color,
    dataIdx: idx,
    x: 5,
    y: 5,
    w: 40,
    h: 30,
  };
}

/** Convert a game to canvas element props */
export function gameToCanvasElement(game: GameData, idx: number): {
  type: string;
  icon: string;
  label: string;
  dataIdx: number;
  x: number;
  y: number;
  w: number;
  h: number;
} {
  const gameType = (game.type as string) || '';
  const info = MODUL_TYPE_SIMPLE[gameType] || { icon: '🎮', color: '#3ecfcf', label: 'Game' };
  return {
    type: 'game',
    icon: info.icon,
    label: (game.title as string) || `Game #${idx + 1}`,
    dataIdx: idx,
    x: 55,
    y: 5,
    w: 40,
    h: 40,
  };
}

// ═══════════════════════════════════════════════════════════════
// SECTION D: UNIFIED EXPORT
// ═══════════════════════════════════════════════════════════════

/** Detect which export mode to use based on current data */
export function detectExportMode(): ExportMode {
  const canvaState = useCanvaStore.getState();
  const authState = useAuthoringStore.getState();

  const hasCanvasContent = canvaState.pages.some(p => p.elements.length > 0);
  const hasAuthoringContent = authState.kuis.length > 0
    || authState.modules.length > 0
    || authState.games.length > 0
    || authState.materi.blok.length > 0
    || !!authState.meta.judulPertemuan;

  if (hasCanvasContent && hasAuthoringContent) return 'hybrid';
  if (hasCanvasContent) return 'canvas';
  return 'template';
}

/** Export using the detected mode */
export function unifiedExport(mode?: ExportMode): string {
  const effectiveMode = mode || detectExportMode();

  switch (effectiveMode) {
    case 'canvas': {
      // Canvas-only export: use alpine-slideshow pipeline
      const canvaState = useCanvaStore.getState();
      return canvaState.exportSlideshowHTML();
    }
    case 'template': {
      // Template-only export: use bridge pipeline
      const authData = getAuthoringExportData();
      return exportProject(authData);
    }
    case 'hybrid': {
      // Hybrid export: template pipeline as primary (richer output).
      // Canvas pages are designed for the visual canvas editor;
      // the template engine produces a more complete interactive experience.
      // Teachers should use the Canvas tab if they want canvas-only export.
      const authData = getAuthoringExportData();
      return exportProject(authData);
    }
    default:
      return exportProject(getAuthoringExportData());
  }
}

/** Check if canvas has any content */
export function hasCanvasContent(): boolean {
  return useCanvaStore.getState().pages.some(p => p.elements.length > 0);
}

/** Check if authoring store has any content */
export function hasAuthoringContent(): boolean {
  const s = useAuthoringStore.getState();
  return s.kuis.length > 0
    || s.modules.length > 0
    || s.games.length > 0
    || s.materi.blok.length > 0
    || !!s.meta.judulPertemuan;
}

// ═══════════════════════════════════════════════════════════════
// SECTION E: VALIDATION — Pre-export smoke test
// ═══════════════════════════════════════════════════════════════

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate export data from both stores before export.
 * Returns { valid, errors, warnings } — errors are fatal, warnings are informational.
 * Call before unifiedExport() to catch issues early.
 */
export function validateExportData(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const authState = useAuthoringStore.getState();
  const canvaState = useCanvaStore.getState();

  // ── Meta validation ───────────────────────────────────────
  if (!authState.meta.judulPertemuan) {
    warnings.push('meta.judulPertemuan is empty — cover screen will use default title');
  }
  if (!authState.meta.mapel) {
    warnings.push('meta.mapel is empty — subject info missing');
  }
  if (!authState.meta.kelas) {
    warnings.push('meta.kelas is empty — class info missing');
  }

  // ── CP validation ─────────────────────────────────────────
  if (!authState.cp.elemen && !authState.cp.capaianFase) {
    warnings.push('cp.elemen and cp.capaianFase are both empty — CP/TP/ATP screen may look sparse');
  }

  // ── TP validation ─────────────────────────────────────────
  if (authState.tp.length === 0) {
    warnings.push('tp is empty — no Tujuan Pembelajaran defined');
  } else {
    authState.tp.forEach((t, i) => {
      if (!t.verb) warnings.push(`tp[${i}].verb is empty`);
      if (!t.desc) warnings.push(`tp[${i}].desc is empty`);
    });
  }

  // ── Kuis validation ───────────────────────────────────────
  if (authState.kuis.length > 0) {
    authState.kuis.forEach((k, i) => {
      if (!k.q) errors.push(`kuis[${i}].q is empty — quiz question text missing`);
      if (!k.opts || k.opts.length < 2) errors.push(`kuis[${i}].opts has fewer than 2 options`);
      if (k.ans < 0 || k.ans >= (k.opts?.length || 0)) errors.push(`kuis[${i}].ans (${k.ans}) is out of range for ${k.opts?.length || 0} options`);
    });
  }

  // ── Materi validation ─────────────────────────────────────
  if (authState.materi.blok.length > 0) {
    authState.materi.blok.forEach((b, i) => {
      if (!b.tipe) errors.push(`materi.blok[${i}].tipe is empty — block type required`);
    });
  }

  // ── Modules validation ────────────────────────────────────
  if (authState.modules.length > 0) {
    authState.modules.forEach((m, i) => {
      if (!m.type) errors.push(`modules[${i}].type is empty — module type required`);
      if (!m.title) warnings.push(`modules[${i}].title is empty — module will use default label`);
    });
  }

  // ── Games validation ──────────────────────────────────────
  if (authState.games.length > 0) {
    authState.games.forEach((g, i) => {
      if (!g.type) errors.push(`games[${i}].type is empty — game type required`);
    });
  }

  // ── Alur validation ───────────────────────────────────────
  if (authState.alur.length > 0) {
    authState.alur.forEach((a, i) => {
      if (!a.fase) warnings.push(`alur[${i}].fase is empty`);
      if (!a.judul) warnings.push(`alur[${i}].judul is empty`);
    });
  }

  // ── Skenario validation ───────────────────────────────────
  if (authState.skenario.length > 0) {
    authState.skenario.forEach((s, i) => {
      if (!s.title) warnings.push(`skenario[${i}].title is empty`);
      if (!s.choices) warnings.push(`skenario[${i}].choices is empty — scenario needs choices`);
    });
  }

  // ── Canvas pages validation ───────────────────────────────
  const pagesWithElements = canvaState.pages.filter(p => p.elements.length > 0);
  if (pagesWithElements.length > 0) {
    pagesWithElements.forEach((p, i) => {
      p.elements.forEach((el, j) => {
        if (el.type === 'kuis' && (el.dataIdx ?? -1) < 0) {
          warnings.push(`canvas page[${i}].elements[${j}] is kuis with no dataIdx — won't link to quiz data`);
        }
      });
    });
  }

  // ── Cross-store consistency ───────────────────────────────
  const kuisElementsInCanvas = canvaState.pages.flatMap(p =>
    p.elements.filter(e => e.type === 'kuis')
  );
  if (kuisElementsInCanvas.length > 0 && authState.kuis.length === 0) {
    warnings.push('Canvas has kuis elements but authoring store has no quiz data — quiz will show placeholders');
  }

  // ── No content at all ─────────────────────────────────────
  const hasAnyContent = authState.kuis.length > 0
    || authState.modules.length > 0
    || authState.games.length > 0
    || authState.materi.blok.length > 0
    || !!authState.meta.judulPertemuan
    || pagesWithElements.length > 0;

  if (!hasAnyContent) {
    errors.push('No content in either store — export will produce an empty project');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
