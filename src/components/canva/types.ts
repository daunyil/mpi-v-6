// ═══════════════════════════════════════════════════════════════
// TYPES — Canva Mode Visual Page Builder
// ═══════════════════════════════════════════════════════════════

export interface Ratio {
  id: string;
  name: string;
  desc: string;
  w: number;
  h: number;
}

export interface ElemType {
  id: string;
  icon: string;
  name: string;
  color: string;
  category?: 'basic' | 'edu' | 'nav';
}

export interface CanvaElement {
  id: string;
  type: string;
  icon?: string;
  label?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
  hidden?: boolean;
  // System element flag — auto-generated, harder to delete
  system?: boolean;
  // User lock — prevents move/resize but allows selection & delete
  locked?: boolean;
  // Teks-specific
  text?: string;
  fontSize?: number;
  // Shape-specific
  color?: string;
  radius?: number;
  // Data reference (kuis/game/modul)
  dataIdx?: number;
  // Modul-specific: type from authoring store (skenario, video, flashcard, etc.)
  modulType?: string;
  // Navbar-specific: 'bottom-bar' | 'breadcrumb' | 'dots' | 'arrows'
  navStyle?: string;
  // Icon-specific
  emoji?: string;
  // Quiz-specific
  correctIdx?: number;  // For quiz: 0-indexed correct option (0=A, 1=B, etc.)
  correctBS?: boolean;  // For benar/salah: true = benar is correct, false = salah is correct
  // Image-specific
  dataUrl?: string;     // For image element: base64 data URL
}

export interface CanvaPage {
  id: string;
  label: string;
  bgDataUrl: string | null;
  bgColor: string;
  overlay: number;
  elements: CanvaElement[];
}

export type LeftTab = 'layout' | 'pages' | 'elems' | 'ratio' | 'layers' | 'templates';

// ── Template ──────────────────────────────────────────────────

export interface CanvaTemplate {
  id: string;
  name: string;
  description: string;
  category: 'kuis' | 'materi' | 'game' | 'umum';
  thumbnail: string;       // bgColor as thumbnail representation
  pages: CanvaPage[];
  ratioId: string;
  createdAt: string;
  updatedAt: string;
}
export type Tool = 'select' | 'text';
export type ResizeDir = 'tl' | 'tr' | 'bl' | 'br';

// ── Constants ──────────────────────────────────────────────────

export const RATIOS: Ratio[] = [
  { id: '16:9', name: '16:9', desc: 'Landscape PPT', w: 1280, h: 720 },
  { id: '9:16', name: '9:16', desc: 'Portrait HP', w: 720, h: 1280 },
  { id: '1:1', name: '1:1', desc: 'Square Post', w: 800, h: 800 },
  { id: 'A4', name: 'A4', desc: 'Dokumen LKS', w: 794, h: 1123 },
  { id: '4:3', name: '4:3', desc: 'Presentasi Lama', w: 1024, h: 768 },
];

export const ELEM_TYPES: ElemType[] = [
  // Navigation
  { id: 'navbar', icon: '🧭', name: 'Navbar', color: 'rgba(59,130,246,.5)', category: 'nav' },
  // Basic
  { id: 'teks', icon: '🔤', name: 'Teks', color: 'rgba(255,255,255,.3)', category: 'basic' },
  { id: 'shape', icon: '⬜', name: 'Shape', color: 'rgba(100,100,200,.3)', category: 'basic' },
  { id: 'button', icon: '🔘', name: 'Button', color: 'rgba(59,130,246,.4)', category: 'basic' },
  { id: 'divider', icon: '➖', name: 'Divider', color: 'rgba(255,255,255,.2)', category: 'basic' },
  // Edu interactive
  { id: 'badge', icon: '🏷️', name: 'Badge', color: 'rgba(245,158,11,.4)', category: 'edu' },
  { id: 'progress', icon: '📊', name: 'Progress', color: 'rgba(34,197,94,.4)', category: 'edu' },
  { id: 'score', icon: '⭐', name: 'Score', color: 'rgba(251,191,36,.4)', category: 'edu' },
  { id: 'timer', icon: '⏱️', name: 'Timer', color: 'rgba(239,68,68,.4)', category: 'edu' },
  { id: 'confetti', icon: '🎉', name: 'Confetti', color: 'rgba(168,85,247,.4)', category: 'edu' },
  // Data blocks
  { id: 'kuis', icon: '❓', name: 'Kuis', color: 'rgba(245,200,66,.4)', category: 'basic' },
  { id: 'game', icon: '🎮', name: 'Game', color: 'rgba(56,217,217,.4)', category: 'basic' },
  { id: 'materi', icon: '📝', name: 'Materi', color: 'rgba(167,139,250,.4)', category: 'basic' },
  { id: 'modul', icon: '🧩', name: 'Modul', color: 'rgba(52,211,153,.4)', category: 'basic' },
  { id: 'gambar', icon: '🖼️', name: 'Gambar', color: 'rgba(168,85,247,.4)', category: 'basic' },
];

export const LAYER_COLORS: Record<string, string> = {
  navbar: '#3b82f6',
  kuis: '#f5c842',
  game: '#3ecfcf',
  materi: '#a78bfa',
  modul: '#34d399',
  teks: '#fff',
  shape: '#6366f1',
  button: '#3b82f6',
  badge: '#f59e0b',
  progress: '#22c55e',
  score: '#fbbf24',
  timer: '#ef4444',
  confetti: '#a855f7',
  divider: '#71717a',
  gambar: '#a855f7',
};
