import type { ReactNode } from 'react';

// ── Constants ──────────────────────────────────────────────────
export const INPUT_CLS =
  'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors';

export const TEXTAREA_CLS = INPUT_CLS + ' resize-none';

export const BLOCK_TYPES = [
  { id: 'teks',      icon: '📝', label: 'Paragraf Teks',    color: '#a1a1aa' },
  { id: 'definisi',  icon: '📌', label: 'Kotak Definisi',   color: '#f9c82e' },
  { id: 'poin',      icon: '•',  label: 'Poin-Poin',        color: '#3ecfcf' },
  { id: 'tabel',     icon: '📊', label: 'Tabel',            color: '#a78bfa' },
  { id: 'kutipan',   icon: '💬', label: 'Kutipan / Quote',  color: '#34d399' },
  { id: 'gambar',    icon: '🖼️', label: 'Gambar dari URL',  color: '#fb923c' },
  { id: 'timeline',  icon: '🔄', label: 'Timeline / Alur',  color: '#3ecfcf' },
  { id: 'highlight', icon: '⚡', label: 'Highlight Card',   color: '#f9c82e' },
  { id: 'compare',   icon: '⚖️', label: 'Perbandingan',     color: '#a78bfa' },
  { id: 'infobox',   icon: '💡', label: 'Info / Tips Box',  color: '#60a5fa' },
  { id: 'checklist', icon: '✅', label: 'Checklist',        color: '#34d399' },
  { id: 'statistik', icon: '📈', label: 'Statistik Angka',  color: '#fb923c' },
  { id: 'studi',     icon: '📖', label: 'Studi Kasus',      color: '#f87171' },
] as const;

export function blockTypeInfo(tipe: string) {
  return BLOCK_TYPES.find((b) => b.id === tipe) || { id: 'unknown', icon: '📦', label: tipe, color: '#71717a' };
}

// ── Shared small components ────────────────────────────────────
export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="block text-xs font-medium text-zinc-400 mb-1.5">{children}</label>;
}

export function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function TypeBadge({ tipe }: { tipe: string }) {
  const info = blockTypeInfo(tipe);
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border"
      style={{
        backgroundColor: info.color + '18',
        color: info.color,
        borderColor: info.color + '30',
      }}
    >
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  );
}

export function SubItemHeader({ label, count, onAdd }: { label: string; count: number; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <FieldLabel>{label} ({count})</FieldLabel>
      <button onClick={onAdd} className="text-xs text-amber-500 hover:text-amber-400 transition-colors font-medium">
        ＋ Tambah
      </button>
    </div>
  );
}

export function RemoveButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0 text-sm p-1 disabled:opacity-30 disabled:cursor-not-allowed"
      title="Hapus"
    >
      ✕
    </button>
  );
}

export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">{title}</h3>
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl leading-none p-1">✕</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
