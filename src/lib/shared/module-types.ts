// ═══════════════════════════════════════════════════════════════
// MODULE TYPES — Single source of truth for module type metadata
// ═══════════════════════════════════════════════════════════════
//
// This is the ONLY place to define module type icons, colors, labels.
// All consumers (canva-store, alpine-slideshow, template-engine, etc.)
// MUST import from here.
//
// Adding a new module type: add ONE entry here → all UI and export
// pipelines pick it up automatically.
// ═══════════════════════════════════════════════════════════════

export interface ModuleTypeInfo {
  icon: string;
  color: string;
  label: string;
  desc: string;
}

/** Full module type color map — single source of truth */
export const MODUL_TYPE_MAP: Record<string, ModuleTypeInfo> = {
  'skenario':     { icon: '🎭', color: '#f9c82e', label: 'Skenario Interaktif', desc: 'Pilihan bercabang' },
  'video':        { icon: '🎥', color: '#ff6b6b', label: 'Video Embed', desc: 'Video pembelajaran' },
  'flashcard':    { icon: '🃏', color: '#3ecfcf', label: 'Flashcard', desc: 'Kartu bolak-balik' },
  'infografis':   { icon: '📊', color: '#a78bfa', label: 'Infografis', desc: 'Kartu konsep visual' },
  'studi-kasus':  { icon: '📰', color: '#fb923c', label: 'Studi Kasus', desc: 'Analisis kasus' },
  'debat':        { icon: '🗣️', color: '#f87171', label: 'Debat & Polling', desc: 'Pro dan kontra' },
  'timeline':     { icon: '📅', color: '#34d399', label: 'Timeline', desc: 'Urutan peristiwa' },
  'matching':     { icon: '🔀', color: '#60a5fa', label: 'Game Pasangkan', desc: 'Cocokkan istilah' },
  'materi':       { icon: '📖', color: '#a1a1aa', label: 'Materi Teks', desc: 'Konten bacaan' },
  'truefalse':    { icon: '✅', color: '#34d399', label: 'Benar / Salah', desc: 'Pernyataan B/S' },
  'memory':       { icon: '🧠', color: '#a78bfa', label: 'Memory Match', desc: 'Cocokkan kartu' },
  'roda':         { icon: '🎡', color: '#fb923c', label: 'Roda Putar', desc: 'Pilihan acak' },
  'hero':         { icon: '🖼️', color: '#f9c82e', label: 'Hero Banner', desc: 'Halaman pembuka visual' },
  'kutipan':      { icon: '💬', color: '#a78bfa', label: 'Kutipan Inspiratif', desc: 'Kutipan tokoh / pepatah' },
  'langkah':      { icon: '👣', color: '#3ecfcf', label: 'Langkah-Langkah', desc: 'Prosedur / tahapan' },
  'accordion':    { icon: '🗂️', color: '#fb923c', label: 'Accordion / FAQ', desc: 'Konten lipat buka-tutup' },
  'statistik':    { icon: '📊', color: '#34d399', label: 'Statistik & Angka', desc: 'Data dan fakta visual' },
  'polling':      { icon: '🗳️', color: '#a78bfa', label: 'Polling / Voting', desc: 'Survei pilihan siswa' },
  'embed':        { icon: '🔗', color: '#3ecfcf', label: 'Embed / iFrame', desc: 'Konten dari situs lain' },
  'tab-icons':    { icon: '📑', color: '#3ecfcf', label: 'Tab Interaktif', desc: 'Tab navigasi konten' },
  'icon-explore': { icon: '🔍', color: '#fb923c', label: 'Eksplorasi Ikon', desc: 'Grid ikon interaktif' },
  'comparison':   { icon: '⚖️', color: '#a78bfa', label: 'Perbandingan', desc: 'Bandingkan kategori' },
  'card-showcase':{ icon: '🎭', color: '#f9c82e', label: 'Card Showcase', desc: 'Card visual animasi' },
  'hotspot-image':{ icon: '🗺️', color: '#34d399', label: 'Hotspot Image', desc: 'Gambar interaktif' },
  'flipcard':     { icon: '🃏', color: '#3ecfcf', label: 'FlipCard Deck', desc: 'Set kartu bolak-balik' },
  'diskusi':      { icon: '💬', color: '#f87171', label: 'Diskusi Kelompok', desc: 'Pertanyaan diskusi terbimbing' },
  'callout':      { icon: '📢', color: '#fbbf24', label: 'Callout', desc: 'Penekanan / perhatian' },
  'fillblank':    { icon: '✏️', color: '#60a5fa', label: 'Fill-in-the-Blank', desc: 'Isi titik-titik' },
  'sorting':      { icon: '🔄', color: '#34d399', label: 'Game Sortir', desc: 'Kelompokkan item' },
  'spinwheel':    { icon: '🎡', color: '#fb923c', label: 'Roda Putar', desc: 'Roda keberuntungan' },
};

/** Get module type info with fallback */
export function getModuleTypeInfo(type: string): ModuleTypeInfo {
  return MODUL_TYPE_MAP[type] || { icon: '🧩', color: '#34d399', label: type || 'Modul', desc: 'Aktivitas pembelajaran' };
}

/** Simplified map for runtime canvas usage (icon + color + label only) */
export const MODUL_TYPE_SIMPLE: Record<string, { icon: string; color: string; label: string }> = Object.fromEntries(
  Object.entries(MODUL_TYPE_MAP).map(([key, val]) => [key, { icon: val.icon, color: val.color, label: val.label }])
);
