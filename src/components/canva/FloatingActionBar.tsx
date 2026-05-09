'use client';

import { useState, useRef } from 'react';
import { useCanvaStore } from '@/store/canva-store';
import { useAuthoringStore } from '@/store/authoring-store';
import { toast } from 'sonner';

/**
 * FloatingActionBar — Bottom floating bar for Zen Mode
 *
 * Contains: block picker, quick actions, preview/export, and mode toggle
 * Contextual toolbar appears based on selected element type.
 */

type BottomTab = 'blocks' | 'pages' | 'style' | 'auto' | 'settings';

export default function FloatingActionBar({ onToggleMode }: { onToggleMode: () => void }) {
  const {
    pages,
    currentPageIndex,
    selectedElIds,
    addElement,
    goPage,
    addPage,
    deletePage,
    duplicatePage,
    setBgColor,
    setOverlay,
    setRatio,
    ratioId,
    zoom,
    zoomDelta,
    exportPageHTML,
    exportSlideshowHTML,
    clearStage,
    updateElement,
    deleteSelected,
    toggleElementLock,
    toggleElementVisibility,
  } = useCanvaStore();

  const page = pages[currentPageIndex];
  const hasSelection = selectedElIds.length > 0;
  const singleElId = selectedElIds.length === 1 ? selectedElIds[0] : null;
  const singleEl = singleElId ? page?.elements.find(e => e.id === singleElId) : null;

  const [activeTab, setActiveTab] = useState<BottomTab | null>(null);
  const [showBlockPicker, setShowBlockPicker] = useState(false);

  // Preview & Export handlers
  const handlePreview = () => {
    const html = exportPageHTML();
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
    toast.success('Preview dibuka di tab baru');
  };

  const handleLivePreview = () => {
    const html = exportSlideshowHTML();
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
    toast.success('Live Preview dibuka di tab baru');
  };

  const handleExport = () => {
    const html = exportSlideshowHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canva-slideshow.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Slideshow diekspor');
  };

  return (
    <div className="relative">
      {/* ── Contextual Element Toolbar ──────────────────────────── */}
      {hasSelection && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <ElementContextBar
            element={singleEl ?? undefined}
            selectedCount={selectedElIds.length}
            onUpdate={updateElement}
            onDelete={deleteSelected}
            onToggleLock={() => selectedElIds.forEach(id => toggleElementLock(id))}
            onToggleVisibility={() => selectedElIds.forEach(id => toggleElementVisibility(id))}
          />
        </div>
      )}

      {/* ── Panel Popover ───────────────────────────────────────── */}
      {activeTab && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 w-[340px] max-h-[60vh] overflow-y-auto">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
            {activeTab === 'blocks' && <BlocksPanel onAdd={addElement} onClose={() => setActiveTab(null)} />}
            {activeTab === 'pages' && <PagesPanel onClose={() => setActiveTab(null)} />}
            {activeTab === 'style' && <StylePanel onClose={() => setActiveTab(null)} />}
            {activeTab === 'auto' && <AutoGeneratePanel onClose={() => setActiveTab(null)} />}
            {activeTab === 'settings' && <SettingsPanel onClose={() => setActiveTab(null)} onToggleMode={onToggleMode} />}
          </div>
        </div>
      )}

      {/* ── Main Floating Bar ───────────────────────────────────── */}
      <div className="flex items-center justify-center px-2 pb-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-secondary)] rounded-2xl shadow-2xl shadow-black/40">
          {/* Tab buttons */}
          <TabBtn icon="⚡" label="Auto" active={activeTab === 'auto'} onClick={() => setActiveTab(activeTab === 'auto' ? null : 'auto')} highlight />
          <TabBtn icon="🧩" label="Block" active={activeTab === 'blocks'} onClick={() => setActiveTab(activeTab === 'blocks' ? null : 'blocks')} />
          <TabBtn icon="📄" label="Page" active={activeTab === 'pages'} onClick={() => setActiveTab(activeTab === 'pages' ? null : 'pages')} />
          <TabBtn icon="🎨" label="Style" active={activeTab === 'style'} onClick={() => setActiveTab(activeTab === 'style' ? null : 'style')} />

          <div className="w-px h-5 bg-[var(--border-secondary)] mx-0.5" />

          {/* Quick actions */}
          <button
            onClick={handleLivePreview}
            title="Live Preview"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-green-400 hover:bg-green-500/10 transition-all text-sm"
          >▶</button>
          <button
            onClick={handleExport}
            title="Export HTML"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all text-sm"
          >📤</button>

          <div className="w-px h-5 bg-[var(--border-secondary)] mx-0.5" />

          {/* Zoom */}
          <button onClick={() => zoomDelta(-0.1)} className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all text-xs">−</button>
          <span className="text-[var(--text-muted)] text-[10px] font-mono w-9 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => zoomDelta(0.1)} className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all text-xs">+</button>

          <div className="w-px h-5 bg-[var(--border-secondary)] mx-0.5" />

          {/* Settings / Mode toggle */}
          <TabBtn icon="⚙️" label="Set" active={activeTab === 'settings'} onClick={() => setActiveTab(activeTab === 'settings' ? null : 'settings')} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB BUTTON
   ═══════════════════════════════════════════════════════════════ */

function TabBtn({ icon, label, active, onClick, highlight }: { icon: string; label: string; active: boolean; onClick: () => void; highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
        active
          ? highlight
            ? 'bg-amber-500/20 text-amber-400 shadow-sm shadow-amber-500/10'
            : 'bg-[var(--accent-bg)] text-[var(--accent-text)]'
          : highlight
            ? 'text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10'
            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
      }`}
    >
      <span className="text-sm">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ELEMENT CONTEXT BAR — Appears when element is selected
   ═══════════════════════════════════════════════════════════════ */

function ElementContextBar({
  element,
  selectedCount,
  onUpdate,
  onDelete,
  onToggleLock,
  onToggleVisibility,
}: {
  element: { id: string; type: string; icon?: string; label?: string; locked?: boolean; hidden?: boolean; color?: string; text?: string; fontSize?: number } | undefined;
  selectedCount: number;
  onUpdate: (id: string, props: Record<string, unknown>) => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onToggleVisibility: () => void;
}) {
  if (!element && selectedCount === 0) return null;

  const elType = element?.type || '';
  const isLocked = !!element?.locked;
  const isHidden = !!element?.hidden;

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-secondary)] rounded-xl shadow-2xl shadow-black/40">
      {/* Element info */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--bg-tertiary)]">
        <span className="text-sm">{element?.icon || '☑️'}</span>
        <span className="text-[10px] font-bold text-[var(--text-primary)] max-w-[100px] truncate">
          {selectedCount > 1 ? `${selectedCount} elemen` : (element?.label || elType)}
        </span>
      </div>

      {/* Contextual actions based on element type */}
      {element && elType === 'teks' && (
        <>
          <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-[var(--bg-tertiary)]">
            {[12, 14, 18, 24, 32].map(size => (
              <button
                key={size}
                onClick={() => onUpdate(element.id, { fontSize: size })}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                  (element.fontSize || 20) === size
                    ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </>
      )}

      {element && ['shape', 'button'].includes(elType) && (
        <label className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-[var(--bg-tertiary)] cursor-pointer">
          <span className="text-[9px] text-[var(--text-muted)]">🎨</span>
          <input
            type="color"
            value={element.color || '#3b82f6'}
            onChange={e => onUpdate(element.id, { color: e.target.value })}
            className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
          />
        </label>
      )}

      {/* Generic actions */}
      <button
        onClick={onToggleLock}
        title={isLocked ? 'Buka kunci' : 'Kunci'}
        className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] transition-all ${
          isLocked ? 'bg-orange-500/15 text-orange-400' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
        }`}
      >{isLocked ? '🔒' : '🔓'}</button>

      <button
        onClick={onToggleVisibility}
        title={isHidden ? 'Tampilkan' : 'Sembunyikan'}
        className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] transition-all ${
          isHidden ? 'bg-red-500/15 text-red-400' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
        }`}
      >👁</button>

      <button
        onClick={() => { if (confirm(`Hapus ${selectedCount > 1 ? selectedCount + ' elemen' : 'elemen ini'}?`)) onDelete(); }}
        title="Hapus"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-[11px] text-red-400/60 hover:text-red-300 hover:bg-red-500/10 transition-all"
      >🗑</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BLOCKS PANEL — Element picker
   ═══════════════════════════════════════════════════════════════ */

const BLOCK_GROUPS = [
  {
    label: '🔤 Teks & Visual',
    items: [
      { id: 'teks', icon: '🔤', name: 'Teks', note: 'Teks bebas', color: '#fff' },
      { id: 'shape', icon: '⬜', name: 'Shape', note: 'Kotak/warna', color: '#6366f1' },
      { id: 'button', icon: '🔘', name: 'Button', note: 'Tombol klik', color: '#3b82f6' },
      { id: 'divider', icon: '➖', name: 'Divider', note: 'Garis pemisah', color: '#71717a' },
      { id: 'gambar', icon: '🖼️', name: 'Gambar', note: 'Upload gambar', color: '#a855f7' },
    ],
  },
  {
    label: '🎓 Edu Interaktif',
    items: [
      { id: 'badge', icon: '🏷️', name: 'Badge', note: 'Lencana/label', color: '#f59e0b' },
      { id: 'progress', icon: '📊', name: 'Progress', note: 'Bar progres', color: '#22c55e' },
      { id: 'score', icon: '⭐', name: 'Score', note: 'Tampilan skor', color: '#fbbf24' },
      { id: 'timer', icon: '⏱️', name: 'Timer', note: 'Hitung mundur', color: '#ef4444' },
      { id: 'confetti', icon: '🎉', name: 'Confetti', note: 'Efek selebrasi', color: '#a855f7' },
    ],
  },
  {
    label: '📦 Data Blocks',
    items: [
      { id: 'navbar', icon: '🧭', name: 'Navbar', note: 'Navigasi halaman', color: '#3b82f6' },
      { id: 'kuis', icon: '❓', name: 'Kuis', note: 'Soal pilihan ganda', color: '#f5c842' },
      { id: 'game', icon: '🎮', name: 'Game', note: 'Game interaktif', color: '#3ecfcf' },
      { id: 'materi', icon: '📝', name: 'Materi', note: 'Konten materi', color: '#a78bfa' },
      { id: 'modul', icon: '🧩', name: 'Modul', note: 'Modul aktivitas', color: '#34d399' },
    ],
  },
];

function BlocksPanel({ onAdd, onClose }: { onAdd: (type: string) => void; onClose: () => void }) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? BLOCK_GROUPS.map(g => ({
        ...g,
        items: g.items.filter(t =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.note.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(g => g.items.length > 0)
    : BLOCK_GROUPS;

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-bold text-[var(--text-primary)]">🧩 Tambah Block</div>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs">✕</button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Cari elemen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-8 px-3 text-[11px] text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-lg focus:border-[var(--accent)]/40 focus:outline-none placeholder:text-[var(--text-muted)]"
        />
      </div>

      {/* Block grid */}
      <div className="space-y-3">
        {filtered.map(group => (
          <div key={group.label}>
            <div className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">{group.label}</div>
            <div className="grid grid-cols-3 gap-1.5">
              {group.items.map(t => (
                <button
                  key={t.id}
                  onClick={() => { onAdd(t.id); onClose(); }}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] border border-[var(--border-secondary)]/30 hover:border-[var(--accent)]/20 transition-all group cursor-pointer"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base group-hover:scale-110 transition-transform"
                    style={{ background: `linear-gradient(135deg, ${t.color}20, ${t.color}08)` }}
                  >
                    {t.icon}
                  </div>
                  <div className="text-[9px] font-semibold text-[var(--text-secondary)] group-hover:text-[var(--accent-text)] transition-colors truncate w-full text-center">
                    {t.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGES PANEL — Page management
   ═══════════════════════════════════════════════════════════════ */

function PagesPanel({ onClose }: { onClose: () => void }) {
  const { pages, currentPageIndex, goPage, addPage, duplicatePage, deletePage } = useCanvaStore();
  const ratio = useCanvaStore(s => s.currentRatio());

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-bold text-[var(--text-primary)]">📄 Halaman</div>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs">✕</button>
      </div>

      <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
        {pages.map((p, i) => {
          const isActive = i === currentPageIndex;
          const bgStyle = p.bgDataUrl
            ? { backgroundImage: `url('${p.bgDataUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: p.bgColor || '#1a1a2e' };

          return (
            <div
              key={p.id}
              onClick={() => { goPage(i); onClose(); }}
              className={`w-full relative rounded-xl overflow-hidden transition-all cursor-pointer group ${
                isActive
                  ? 'ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--bg-primary)] shadow-md shadow-[var(--accent)]/10'
                  : 'ring-1 ring-[var(--border-secondary)] hover:ring-[var(--text-muted)]'
              }`}
              style={{ ...bgStyle, aspectRatio: `${ratio.w}/${ratio.h}` }}
            >
              {/* Element preview dots */}
              <div className="absolute inset-0 pointer-events-none">
                {p.elements.slice(0, 6).map((el, j) => (
                  <div
                    key={j}
                    className="absolute rounded-[1px]"
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      width: `${Math.max(el.w, 3)}%`,
                      height: `${Math.max(el.h, 3)}%`,
                      background: 'rgba(255,255,255,.08)',
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-white truncate flex-1">{p.label}</span>
                  <span className="text-[8px] text-white/50 bg-black/30 px-1.5 py-0.5 rounded-full">{p.elements.length}</span>
                </div>
              </div>

              {/* Hover actions */}
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); duplicatePage(); }}
                  className="w-5 h-5 flex items-center justify-center rounded bg-black/50 backdrop-blur-sm text-[9px] text-white/70 hover:text-white hover:bg-black/70 transition-all"
                  title="Duplikat"
                >⧉</button>
                {pages.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm(`Hapus "${p.label}"?`)) deletePage(); }}
                    className="w-5 h-5 flex items-center justify-center rounded bg-black/50 backdrop-blur-sm text-[9px] text-red-400/70 hover:text-red-300 hover:bg-black/70 transition-all"
                    title="Hapus"
                  >✕</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={addPage}
        className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-[var(--border-secondary)] text-[11px] text-[var(--text-muted)] hover:text-[var(--accent-text)] hover:border-[var(--accent)]/30 hover:bg-[var(--accent-bg)]/5 transition-all flex items-center justify-center gap-1.5"
      >
        <span className="text-sm">+</span> Tambah Halaman
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLE PANEL — Background, colors, ratio
   ═══════════════════════════════════════════════════════════════ */

function StylePanel({ onClose }: { onClose: () => void }) {
  const { pages, currentPageIndex, setBgColor, setBgImage, setOverlay, setRatio, ratioId } = useCanvaStore();
  const page = pages[currentPageIndex];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) setBgImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-bold text-[var(--text-primary)]">🎨 Style</div>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs">✕</button>
      </div>

      {/* Background color */}
      <div className="mb-3">
        <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Warna Background</div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={page?.bgColor || '#1a1a2e'}
            onChange={e => setBgColor(e.target.value)}
            className="w-10 h-8 rounded-lg border border-[var(--border-secondary)] cursor-pointer bg-transparent"
          />
          <div className="flex flex-wrap gap-1 flex-1">
            {['#1a1a2e', '#0f172a', '#0d1117', '#1e1b4b', '#0c0a1a', '#0a1628', '#1a0a0a', '#0f0e1a', '#0f172a'].map(color => (
              <button
                key={color}
                onClick={() => setBgColor(color)}
                className={`w-6 h-6 rounded-lg border transition-all ${page?.bgColor === color ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/30' : 'border-[var(--border-secondary)] hover:border-[var(--text-muted)]'}`}
                style={{ background: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Background image */}
      <div className="mb-3">
        <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Background Image</div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 rounded-lg border border-dashed border-[var(--border-secondary)] hover:border-[var(--accent)]/30 bg-[var(--bg-tertiary)]/40 hover:bg-[var(--bg-tertiary)]/60 transition-colors flex flex-col items-center gap-1"
        >
          <span className="text-lg">📤</span>
          <span className="text-[10px] font-semibold text-[var(--text-muted)]">Upload PNG Canva</span>
        </button>
        {page?.bgDataUrl && (
          <div className="mt-2 rounded-lg overflow-hidden border border-[var(--border-secondary)]">
            <img src={page.bgDataUrl} alt="BG Preview" className="w-full h-16 object-cover" />
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Overlay Gelap</span>
          <span className="text-[10px] text-[var(--accent-text)] font-bold">{page?.overlay || 20}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={60}
          value={page?.overlay || 20}
          onChange={e => setOverlay(parseInt(e.target.value))}
          className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
        />
      </div>

      {/* Ratio */}
      <div className="mb-1">
        <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Rasio Halaman</div>
        <div className="flex flex-wrap gap-1">
          {[
            { id: '16:9', name: '16:9', desc: 'Landscape' },
            { id: '9:16', name: '9:16', desc: 'Portrait' },
            { id: '1:1', name: '1:1', desc: 'Square' },
            { id: 'A4', name: 'A4', desc: 'Dokumen' },
            { id: '4:3', name: '4:3', desc: 'Presentasi' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setRatio(r.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-semibold transition-all border ${
                ratioId === r.id
                  ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent)]/30'
                  : 'bg-[var(--bg-tertiary)]/40 text-[var(--text-muted)] border-[var(--border-secondary)] hover:border-[var(--text-muted)]'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS PANEL — Export, clear, mode toggle
   ═══════════════════════════════════════════════════════════════ */

function SettingsPanel({ onClose, onToggleMode }: { onClose: () => void; onToggleMode: () => void }) {
  const { clearStage, exportSlideshowHTML, exportPageHTML } = useCanvaStore();

  const handleExport = () => {
    const html = exportSlideshowHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canva-slideshow.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Slideshow diekspor');
  };

  const handleExportPage = () => {
    const html = exportPageHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canva-page.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Halaman diekspor');
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-bold text-[var(--text-primary)]">⚙️ Pengaturan</div>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs">✕</button>
      </div>

      {/* Mode toggle */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10">
        <div className="text-[10px] font-bold text-amber-400 mb-1.5">Mode Tampilan</div>
        <div className="text-[9px] text-[var(--text-muted)] mb-2 leading-relaxed">
          Zen Mode = tampilan sederhana untuk guru. Pro Mode = kontrol penuh semua panel.
        </div>
        <button
          onClick={onToggleMode}
          className="w-full py-2 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5"
        >
          ⚙️ Switch ke Pro Mode
        </button>
      </div>

      {/* Export options */}
      <div className="mb-3">
        <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Export</div>
        <div className="space-y-1.5">
          <button
            onClick={handleExport}
            className="w-full py-2 rounded-lg text-[10px] font-semibold text-[var(--accent-text)] bg-[var(--accent-bg)] border border-[var(--accent)]/20 hover:bg-[var(--accent-bg)]/80 transition-all flex items-center justify-center gap-1.5"
          >
            📤 Export Slideshow HTML
          </button>
          <button
            onClick={handleExportPage}
            className="w-full py-2 rounded-lg text-[10px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] hover:bg-[var(--bg-tertiary)]/80 transition-all flex items-center justify-center gap-1.5"
          >
            📄 Export Halaman Ini
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="pt-3 border-t border-[var(--border-secondary)]">
        <button
          onClick={() => { if (confirm('Bersihkan semua elemen di halaman ini?')) clearStage(); }}
          className="w-full py-2 rounded-lg text-[10px] font-semibold text-red-400 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all flex items-center justify-center gap-1.5"
        >
          🧹 Bersihkan Halaman
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AUTO-GENERATE PANEL — Quick access to PageTypeCreator
   ═══════════════════════════════════════════════════════════════ */

function AutoGeneratePanel({ onClose }: { onClose: () => void }) {
  const { generateFromPageType } = useCanvaStore();
  const { ALL_PAGE_TYPES, PAGE_TYPE_CATEGORIES } = require('@/store/page-types');
  const [selectedType, setSelectedType] = useState<any>(null);
  const [config, setConfig] = useState<Record<string, number | string | boolean>>({});

  if (selectedType) {
    // Config view
    const preview = selectedType.generate(config);
    const totalPages = preview.pages.length;

    return (
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => { setSelectedType(null); setConfig({}); }} className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: `${selectedType.color}15` }}>
            {selectedType.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-[var(--text-primary)] truncate">{selectedType.name}</div>
            <div className="text-[9px] text-[var(--text-muted)]">{totalPages} halaman</div>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs">✕</button>
        </div>

        {/* Config options */}
        <div className="space-y-2.5 mb-3">
          {selectedType.options.map((opt: any) => (
            <div key={opt.id}>
              {opt.type === 'number' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-[var(--text-secondary)] font-medium">{opt.label}</span>
                    <span className="text-[10px] text-amber-400 font-bold font-mono">{config[opt.id] ?? opt.default}</span>
                  </div>
                  <input
                    type="range" min={opt.min} max={opt.max} step={opt.step || 1}
                    value={config[opt.id] ?? opt.default}
                    onChange={e => setConfig({ ...config, [opt.id]: parseInt(e.target.value) })}
                    className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              )}
              {opt.type === 'select' && (
                <div>
                  <span className="text-[9px] text-[var(--text-secondary)] font-medium block mb-1">{opt.label}</span>
                  <div className="flex flex-wrap gap-1">
                    {opt.options?.map((o: any) => (
                      <button key={o.value} onClick={() => setConfig({ ...config, [opt.id]: o.value })}
                        className={`px-2 py-1 rounded-lg text-[9px] font-semibold transition-all border ${
                          (config[opt.id] ?? opt.default) === o.value
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-secondary)] hover:border-[var(--text-muted)]'
                        }`}>{o.label}</button>
                    ))}
                  </div>
                </div>
              )}
              {opt.type === 'toggle' && (
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[var(--text-secondary)] font-medium">{opt.label}</span>
                  <button onClick={() => setConfig({ ...config, [opt.id]: !(config[opt.id] ?? opt.default) })}
                    className={`w-8 h-4 rounded-full transition-all relative ${(config[opt.id] ?? opt.default) ? 'bg-amber-500' : 'bg-[var(--bg-tertiary)]'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${(config[opt.id] ?? opt.default) ? 'left-[14px]' : 'left-0.5'}`} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="flex flex-wrap gap-1 mb-3">
          {preview.pages.map((p: any, i: number) => (
            <div key={i} className="px-2 py-1 rounded-md text-[8px] font-medium border" style={{ background: `${p.bgColor}80`, borderColor: `${selectedType.color}30`, color: selectedType.color }}>{p.label}</div>
          ))}
        </div>

        {/* Generate */}
        <button onClick={() => { generateFromPageType(selectedType, config); onClose(); }}
          className="w-full py-2.5 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 active:scale-[0.98]">
          ⚡ Generate {totalPages} Halaman
        </button>
      </div>
    );
  }

  // Type selection view
  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">⚡ Auto-Generate</div>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs">✕</button>
      </div>
      <div className="text-[9px] text-[var(--text-muted)] mb-3 leading-relaxed">Pilih tipe halaman, sistem akan membuat semua halaman lengkap otomatis.</div>

      <div className="space-y-1.5 max-h-[40vh] overflow-y-auto custom-scrollbar">
        {ALL_PAGE_TYPES.map((pt: any) => (
          <button
            key={pt.id}
            onClick={() => {
              setSelectedType(pt);
              const defaults: Record<string, number | string | boolean> = {};
              pt.options.forEach((opt: any) => { defaults[opt.id] = opt.default; });
              setConfig(defaults);
            }}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--bg-tertiary)]/40 border border-[var(--border-secondary)]/20 hover:border-amber-500/30 hover:bg-[var(--bg-tertiary)]/70 transition-all group text-left"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: `${pt.color}15` }}>{pt.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-amber-300 transition-colors">{pt.name}</div>
              <div className="text-[8px] text-[var(--text-muted)] leading-relaxed">{pt.description}</div>
            </div>
            <svg className="text-[var(--text-muted)] group-hover:text-amber-500 transition-colors flex-shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>
    </div>
  );
}
