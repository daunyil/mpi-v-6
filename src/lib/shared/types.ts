// ═══════════════════════════════════════════════════════════════
// SHARED TYPES — Unified type definitions for the export pipeline
// ═══════════════════════════════════════════════════════════════
//
// Replaces both ExportState (export-html.ts) and AutoBuildData
// (template-types.ts) with a single unified type.
// ═══════════════════════════════════════════════════════════════

import type {
  MetaState, CpState, TpItem, AtpState, AlurItem,
  KuisItem, MateriState,
} from '@/store/authoring-store';

/** Unified export data — single type for the entire pipeline */
export interface ExportData {
  meta: MetaState;
  cp: CpState;
  tp: TpItem[];
  atp: AtpState;
  alur: AlurItem[];
  skenario: Array<Record<string, unknown>>;
  kuis: KuisItem[];
  materi: MateriState;
  modules: Array<Record<string, unknown>>;
  games: Array<Record<string, unknown>>;
}

/** Template ID union — all valid screen template IDs */
export type TemplateId =
  | 'cover'
  | 'petunjuk'
  | 'review'
  | 'dokumen'
  | 'tujuan'
  | 'skenario'
  | 'materi-tabicons'
  | 'materi-accordion'
  | 'diskusi-timer'
  | 'hubungan-konsep'
  | 'flashcard'
  | 'hotspot'
  | 'kuis'
  | 'sortir-game'
  | 'roda-game'
  | 'hasil'
  | 'refleksi'
  | 'penutup';

/** All 18 template IDs as array */
export const ALL_TEMPLATE_IDS: TemplateId[] = [
  'cover', 'petunjuk', 'review', 'dokumen', 'tujuan',
  'skenario', 'materi-tabicons', 'materi-accordion',
  'diskusi-timer', 'hubungan-konsep', 'flashcard', 'hotspot',
  'kuis', 'sortir-game', 'roda-game',
  'hasil', 'refleksi', 'penutup',
];

/** Accent color per pertemuan (cycling through 6 colors) */
export function getAccentForPertemuan(ke: number): string {
  const accents = ['--y', '--c', '--g', '--p', '--r', '--o'];
  return accents[(ke - 1) % accents.length] || '--y';
}
