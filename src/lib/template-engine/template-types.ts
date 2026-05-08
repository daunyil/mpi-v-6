// ═══════════════════════════════════════════════════════════════
// TEMPLATE TYPES — Slot schema & data types for the template system
// ═══════════════════════════════════════════════════════════════

// ── Slot Types ────────────────────────────────────────────────
export type SlotType = 'text' | 'richtext' | 'icon' | 'color' | 'image' | 'list' | 'items' | 'tabs' | 'chapters' | 'questions';

export interface SlotDefinition {
  id: string;
  label: string;
  type: SlotType;
  required?: boolean;
  default?: string | number | boolean | unknown[];
  description?: string;
}

// ── Screen Template Definition ────────────────────────────────
export interface ScreenTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'opening' | 'dokumen' | 'materi' | 'interaksi' | 'evaluasi' | 'penutup';
  color: string;
  slots: SlotDefinition[];
  render: (data: Record<string, unknown>, ctx: RenderContext) => string;
}

// ── Render Context ────────────────────────────────────────────
export interface RenderContext {
  /** Screen ID for DOM targetting */
  screenId: string;
  /** Progress percentage (0-100) for navbar */
  progress: number;
  /** Current score display */
  score: number;
  /** Whether this screen has navbar */
  hasNavbar: boolean;
  /** Next screen ID for navigation */
  nextScreen?: string;
  /** Previous screen ID for navigation */
  prevScreen?: string;
  /** Screen index (0-based) */
  screenIndex: number;
  /** Total screens */
  totalScreens: number;
  /** Module render function — renders a module by its type and data */
  renderModule?: (mod: Record<string, unknown>) => string;
  /** Game render function — renders a game by its type and data */
  renderGame?: (game: Record<string, unknown>) => string;
}

// ── Auto-Build Data Schema ────────────────────────────────────
export interface AutoBuildData {
  meta: {
    judulPertemuan: string;
    subjudul: string;
    ikon: string;
    durasi: string;
    namaBab: string;
    mapel: string;
    kelas: string;
    kurikulum: string;
  };
  cp: {
    elemen: string;
    subElemen: string;
    capaianFase: string;
    profil: string[];
    fase: string;
    kelas: string;
  };
  tp: Array<{
    verb: string;
    desc: string;
    pertemuan: number;
    color: string;
  }>;
  atp: {
    namaBab: string;
    jumlahPertemuan: number;
    pertemuan: Array<{
      judul: string;
      tp: string;
      durasi: string;
      kegiatan: string;
      penilaian: string;
    }>;
  };
  alur: Array<{
    fase: string;
    durasi: string;
    judul: string;
    deskripsi: string;
  }>;
  skenario: Array<Record<string, unknown>>;
  kuis: Array<{
    q: string;
    opts: string[];
    ans: number;
    ex: string;
  }>;
  modules: Array<Record<string, unknown>>;
  games: Array<Record<string, unknown>>;
  materi: {
    blok: Array<Record<string, unknown>>;
  };
}

// ── Build Result ──────────────────────────────────────────────
export interface BuiltScreen {
  /** Screen template ID */
  templateId: string;
  /** Screen ID for DOM (e.g. 's-cover') */
  screenId: string;
  /** Label shown in navigation */
  label: string;
  /** Filled slot data */
  data: Record<string, unknown>;
  /** Whether this screen should be included */
  included: boolean;
}

// ── Export Config ─────────────────────────────────────────────
export interface ExportConfig {
  /** Title for the HTML document */
  title: string;
  /** Whether to include navbar on all screens */
  globalNavbar: boolean;
  /** Whether to include scoring system */
  hasScoring: boolean;
  /** Whether to include confetti system */
  hasConfetti: boolean;
  /** Whether to include timer system */
  hasTimer: boolean;
  /** Custom theme overrides */
  theme?: Partial<ThemeConfig>;
}

export interface ThemeConfig {
  bg: string;
  bg2: string;
  card: string;
  border: string;
  yellow: string;
  cyan: string;
  red: string;
  purple: string;
  green: string;
  orange: string;
  text: string;
  muted: string;
  radius: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  bg: '#0e1c2f',
  bg2: '#13243a',
  card: '#182d45',
  border: 'rgba(255,255,255,.09)',
  yellow: '#f9c12e',
  cyan: '#3ecfcf',
  red: '#ff6b6b',
  purple: '#a78bfa',
  green: '#34d399',
  orange: '#fb923c',
  text: '#e8f2ff',
  muted: '#6e90b5',
  radius: '16px',
};
