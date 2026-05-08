import { ModalShell } from './konten-shared';

// ── Module Type Definitions ───────────────────────────────────
export const MODULE_TYPES = [
  { id: 'skenario', icon: '🎭', label: 'Skenario Interaktif', desc: 'Pilihan bercabang dengan dialog dan konsekuensi', color: '#f9c82e' },
  { id: 'video', icon: '🎥', label: 'Video Embed', desc: 'Video dari YouTube, Drive, atau URL lain', color: '#ff6b6b' },
  { id: 'flashcard', icon: '🃏', label: 'Flashcard', desc: 'Kartu bolak-balik untuk belajar istilah', color: '#3ecfcf' },
  { id: 'infografis', icon: '📊', label: 'Infografis / Kartu Konsep', desc: 'Kartu informasi visual', color: '#a78bfa' },
  { id: 'studi-kasus', icon: '📰', label: 'Studi Kasus', desc: 'Analisis kasus dengan pertanyaan', color: '#fb923c' },
  { id: 'debat', icon: '🗣️', label: 'Debat & Polling', desc: 'Mosiperta debat pro dan kontra', color: '#f87171' },
  { id: 'timeline', icon: '📅', label: 'Timeline', desc: 'Urutan peristiwa berdasarkan waktu', color: '#34d399' },
  { id: 'matching', icon: '🔀', label: 'Game Pasangkan', desc: 'Cocokkan istilah dengan definisi', color: '#60a5fa' },
  { id: 'materi', icon: '📖', label: 'Materi Teks', desc: 'Blok konten teks untuk siswa baca', color: '#a1a1aa' },
  { id: 'hero', icon: '🖼️', label: 'Hero Banner', desc: 'Halaman pembuka visual dengan gradient dan CTA', color: '#f9c82e' },
  { id: 'kutipan', icon: '💬', label: 'Kutipan Inspiratif', desc: 'Kutipan tokoh atau pepatah dengan desain elegan', color: '#a78bfa' },
  { id: 'langkah', icon: '👣', label: 'Langkah-Langkah', desc: 'Prosedur atau tahapan dengan nomor dan ikon', color: '#3ecfcf' },
  { id: 'accordion', icon: '🗂️', label: 'Accordion / FAQ', desc: 'Konten lipat buka-tutup untuk FAQ atau rangkuman', color: '#fb923c' },
  { id: 'statistik', icon: '📊', label: 'Statistik & Angka Kunci', desc: 'Data, angka, dan fakta menarik secara visual', color: '#34d399' },
  { id: 'polling', icon: '🗳️', label: 'Polling / Voting', desc: 'Survei pilihan tunggal atau ganda untuk siswa', color: '#a78bfa' },
  { id: 'embed', icon: '🔗', label: 'Embed / iFrame', desc: 'Sisipkan konten dari situs lain dalam halaman', color: '#3ecfcf' },
  { id: 'tab-icons', icon: '📑', label: 'Tab Interaktif', desc: 'Tab navigasi dengan emoji dan konten berbeda', color: '#3ecfcf' },
  { id: 'icon-explore', icon: '🔍', label: 'Eksplorasi Ikon', desc: 'Grid ikon yang bisa diklik untuk membuka detail', color: '#fb923c' },
  { id: 'comparison', icon: '⚖️', label: 'Perbandingan', desc: 'Bandingkan 2-4 kategori berdampingan', color: '#a78bfa' },
  { id: 'card-showcase', icon: '🎭', label: 'Card Showcase', desc: 'Card visual dengan hover effects dan animasi', color: '#f9c82e' },
  { id: 'hotspot-image', icon: '🗺️', label: 'Hotspot Image', desc: 'Gambar dengan titik-titik interaktif (hotspot)', color: '#34d399' },
] as const;

export const GAME_TYPES = [
  { id: 'truefalse', icon: '✅', label: 'Benar / Salah', desc: 'Pernyataan benar atau salah', color: '#34d399' },
  { id: 'memory', icon: '🧠', label: 'Memory Match', desc: 'Cocokkan kartu berpasangan', color: '#a78bfa' },
  { id: 'roda', icon: '🎡', label: 'Roda Putar', desc: 'Putar roda untuk pilihan acak', color: '#fb923c' },
] as const;

export const ALL_MODULE_TYPES = [...MODULE_TYPES, ...GAME_TYPES];

export function moduleTypeInfo(typeId: string) {
  return ALL_MODULE_TYPES.find((t) => t.id === typeId) || { id: 'unknown', icon: '📦', label: typeId, desc: '', color: '#71717a' };
}

// ── Module Mini Preview ───────────────────────────────────────
export function modulePreview(mod: Record<string, unknown>): string {
  const t = mod.type as string;
  switch (t) {
    case 'skenario': {
      const ch = (mod.chapters as unknown[]) || [];
      let pilihan = 0;
      (ch as Record<string, unknown>[]).forEach((c) => { pilihan += ((c.choices as unknown[]) || []).length; });
      return ch.length ? `${ch.length} bab · ${pilihan} pilihan` : 'Belum ada bab';
    }
    case 'video': return mod.url ? `URL tersimpan` : 'Belum ada URL';
    case 'flashcard': {
      const k = (mod.kartu as unknown[]) || [];
      return k.length ? `${k.length} kartu` : 'Belum ada kartu';
    }
    case 'infografis': {
      const k = (mod.kartu as unknown[]) || [];
      return k.length ? `${k.length} kartu · ${(mod.layout as string) || 'grid'}` : 'Belum ada kartu';
    }
    case 'studi-kasus': {
      const p = (mod.pertanyaan as unknown[]) || [];
      return p.length ? `${p.length} pertanyaan` : 'Belum ada pertanyaan';
    }
    case 'debat': return (mod.pertanyaan as string) ? 'Mosiperta tersimpan' : 'Belum ada mosiperta';
    case 'timeline': {
      const e = (mod.events as unknown[]) || [];
      return e.length ? `${e.length} peristiwa` : 'Belum ada peristiwa';
    }
    case 'matching': {
      const p = (mod.pasangan as unknown[]) || [];
      return p.length ? `${p.length} pasangan` : 'Belum ada pasangan';
    }
    case 'materi': {
      const b = (mod.blok as unknown[]) || [];
      return b.length ? `${b.length} blok` : 'Belum ada blok';
    }
    case 'truefalse': {
      const s = (mod.soal as unknown[]) || [];
      return s.length ? `${s.length} pernyataan` : 'Belum ada pernyataan';
    }
    case 'memory': {
      const p = (mod.pasangan as unknown[]) || [];
      return p.length ? `${p.length} pasangan` : 'Belum ada pasangan';
    }
    case 'roda': {
      const o = (mod.opsi as unknown[]) || [];
      return o.length ? `${o.length} opsi` : 'Belum ada opsi';
    }
    case 'hero': return (mod.title as string) ? `Hero: ${mod.title}` : 'Belum ada judul hero';
    case 'kutipan': return (mod.teks as string) ? `Kutipan tersimpan` : 'Belum ada kutipan';
    case 'langkah': {
      const l = (mod.langkah as unknown[]) || [];
      return l.length ? `${l.length} langkah · ${(mod.style as string) || 'numbered'}` : 'Belum ada langkah';
    }
    case 'accordion': {
      const it = (mod.items as unknown[]) || [];
      return it.length ? `${it.length} item` : 'Belum ada item';
    }
    case 'statistik': {
      const it = (mod.items as unknown[]) || [];
      return it.length ? `${it.length} item · ${(mod.layout as string) || 'grid'}` : 'Belum ada item';
    }
    case 'polling': {
      const o = (mod.opsi as unknown[]) || [];
      return o.length ? `${o.length} opsi · ${(mod.tipe as string) || 'single'}` : 'Belum ada opsi';
    }
    case 'embed': return (mod.url as string) ? 'URL tersimpan' : 'Belum ada URL';
    case 'tab-icons': {
      const t = (mod.tabs as unknown[]) || [];
      return t.length ? `${t.length} tab · ${(mod.layout as string) || 'vertical'}` : 'Belum ada tab';
    }
    case 'icon-explore': {
      const it = (mod.items as unknown[]) || [];
      return it.length ? `${it.length} item · ${(mod.layout as string) || 'grid'}` : 'Belum ada item';
    }
    case 'comparison': {
      const k = (mod.kolom as unknown[]) || [];
      const b = (mod.baris as unknown[]) || [];
      return k.length ? `${k.length} kolom · ${b.length} baris` : 'Belum ada kolom';
    }
    case 'card-showcase': {
      const c = (mod.cards as unknown[]) || [];
      return c.length ? `${c.length} card · ${(mod.layout as string) || 'grid'}` : 'Belum ada card';
    }
    case 'hotspot-image': {
      const h = (mod.hotspots as unknown[]) || [];
      return h.length ? `${h.length} hotspot · ${(mod.mode as string) || 'pin'}` : 'Belum ada hotspot';
    }
    default: return '';
  }
}

// ── Module Picker Modal ───────────────────────────────────────
export function ModulePickerModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (typeId: string) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">Pilih Tipe Modul / Game</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Pilih modul pembelajaran atau game yang ingin ditambahkan</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl leading-none p-1">✕</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Learning Modules */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Modul Pembelajaran
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MODULE_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onPick(t.id)}
                  className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-4 text-left hover:border-zinc-500 hover:bg-zinc-800 transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{t.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100">{t.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{t.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Games */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Game Interaktif
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GAME_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onPick(t.id)}
                  className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-4 text-left hover:border-zinc-500 hover:bg-zinc-800 transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{t.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100">{t.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{t.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
