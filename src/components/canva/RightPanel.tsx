'use client';

import { useRef } from 'react';
import { useCanvaStore } from '@/store/canva-store';

export default function RightPanel({ isCollapsed, onToggleCollapse }: { isCollapsed: boolean; onToggleCollapse: () => void }) {
  const {
    pages,
    currentPageIndex,
    selectedElIds,
    setBgColor,
    setBgImage,
    setOverlay,
    updateElement,
    deleteSelected,
    deleteSelectedElements,
    deselectAll,
    toggleElementLock,
  } = useCanvaStore();

  const page = pages[currentPageIndex];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get selected elements
  const selectedEls = page?.elements.filter(e => selectedElIds.includes(e.id)) || [];
  const isMultiSelect = selectedElIds.length > 1;
  const singleEl = selectedEls.length === 1 ? selectedEls[0] : null;

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

  // ── Collapsed: thin icon strip ────────────────────────────────
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center w-10 min-w-[40px] bg-[var(--bg-secondary)] border-l border-[var(--border-secondary)] py-2 relative">
        <button
          onClick={onToggleCollapse}
          title="Buka panel properti"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all mb-0.5"
        >
          ⚙️
        </button>
        <button
          onClick={onToggleCollapse}
          title="Background"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all mb-0.5"
        >
          🖼️
        </button>
        <button
          onClick={onToggleCollapse}
          title="Layer"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all mb-0.5"
        >
          🔲
        </button>
        {/* Expand toggle */}
        <button
          onClick={onToggleCollapse}
          title="Buka panel"
          className="mt-auto w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </div>
    );
  }

  // ── Expanded: full panel ──────────────────────────────────────
  return (
    <div className="w-52 min-w-[200px] flex flex-col bg-[var(--bg-secondary)] border-l border-[var(--border-secondary)] overflow-y-auto custom-scrollbar relative">
      {/* ── Background section ──────────────────────────────── */}
      <div className="p-2.5 border-b border-zinc-700/30">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">🖼️ Background</div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 rounded-lg border border-dashed border-zinc-700 hover:border-amber-500/30 bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors flex flex-col items-center gap-1"
        >
          <span className="text-lg">📤</span>
          <span className="text-[10px] font-bold text-zinc-400">Upload PNG Canva</span>
          <span className="text-[8px] text-zinc-500">PNG · JPG · WEBP</span>
        </button>

        {page?.bgDataUrl && (
          <div className="mt-2 rounded-lg overflow-hidden border border-zinc-700/30">
            <img src={page.bgDataUrl} alt="BG Preview" className="w-full h-16 object-cover" />
          </div>
        )}

        <div className="mt-3">
          <label className="text-[10px] text-zinc-500 block mb-1">Overlay gelap</label>
          <input
            type="range"
            min={0}
            max={60}
            value={page?.overlay || 20}
            onChange={e => setOverlay(parseInt(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="mt-3">
          <label className="text-[10px] text-zinc-500 block mb-1">Warna BG</label>
          <input
            type="color"
            value={page?.bgColor || '#1a1a2e'}
            onChange={e => setBgColor(e.target.value)}
            className="w-full h-7 rounded-md border border-zinc-700 cursor-pointer bg-zinc-800"
          />
        </div>
      </div>

      {/* ── Multi-select panel ────────────────────────────────── */}
      {isMultiSelect && (
        <div className="p-2.5 border-b border-zinc-700/30">
          <MultiSelectPanel
            count={selectedEls.length}
            elements={selectedEls}
            onDeleteAll={deleteSelectedElements}
            onDeselectAll={deselectAll}
            onBatchColorChange={(color) => {
              selectedElIds.forEach(id => updateElement(id, { color }));
            }}
          />
        </div>
      )}

      {/* ── Element properties (single selection) ──────────── */}
      {!isMultiSelect && singleEl && (
        <div className="p-2.5 border-b border-zinc-700/30">
          {singleEl.system ? (
            <SystemElementPanel element={singleEl} />
          ) : (
            <ContentElementPanel element={singleEl} />
          )}
        </div>
      )}

      {/* ── Layers (mini) ───────────────────────────────────── */}
      <div className="p-2.5 flex-1">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">🔲 Layer</div>
        <LayerMiniList />
      </div>

      {/* Collapse toggle button on the left edge */}
      <button
        onClick={onToggleCollapse}
        title="Tutup panel"
        className="absolute top-1/2 -translate-y-1/2 -left-3 z-10 w-6 h-8 flex items-center justify-center rounded-l-md bg-[var(--bg-secondary)] border border-r-0 border-[var(--border-secondary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MULTI-SELECT PANEL — Batch operations for multiple elements
   ═══════════════════════════════════════════════════════════════ */

function MultiSelectPanel({
  count,
  elements,
  onDeleteAll,
  onDeselectAll,
  onBatchColorChange,
}: {
  count: number;
  elements: { id: string; type: string; icon?: string; label?: string; color?: string }[];
  onDeleteAll: () => void;
  onDeselectAll: () => void;
  onBatchColorChange: (color: string) => void;
}) {
  const { toggleElementLock } = useCanvaStore();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex-1">
          ☑️ Multi-Select
        </div>
        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
          {count} Elemen Terpilih
        </span>
      </div>

      {/* Batch color picker */}
      <div className="mb-3">
        <label className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">🎨 Warna Semua</label>
        <input
          type="color"
          value={elements[0]?.color || '#f59e0b'}
          onChange={e => onBatchColorChange(e.target.value)}
          className="w-full h-7 rounded-md border border-zinc-700 cursor-pointer bg-zinc-800"
        />
      </div>

      {/* Batch lock toggle */}
      <div className="mb-3">
        <button
          onClick={() => { elements.forEach(el => toggleElementLock(el.id)); }}
          className="w-full py-1.5 rounded-lg text-[9px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-1"
        >
          🔒 Toggle Kunci Semua
        </button>
      </div>

      {/* Delete all button */}
      <button
        onClick={() => { if (confirm(`Hapus ${count} elemen terpilih?`)) onDeleteAll(); }}
        className="w-full py-2 rounded-lg text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1 mb-2"
      >
        🗑 Hapus Semua
      </button>

      {/* Deselect all button */}
      <button
        onClick={onDeselectAll}
        className="w-full py-2 rounded-lg text-[10px] font-bold text-zinc-400 bg-zinc-800/40 border border-zinc-700/30 hover:bg-zinc-800/60 transition-colors flex items-center justify-center gap-1"
      >
        ↩ Deselect Semua
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SYSTEM ELEMENT PANEL — Lock + Position + Style only
   ═══════════════════════════════════════════════════════════════ */

function SystemElementPanel({ element }: { element: { id: string; type: string; icon?: string; label?: string; x: number; y: number; w: number; h: number; opacity: number; color?: string; navStyle?: string; text?: string; locked?: boolean } }) {
  const { updateElement, toggleElementLock } = useCanvaStore();
  const isLocked = !!element.locked;

  return (
    <div>
      {/* System badge + Lock toggle */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex-1">
          ⚙️ Properti
        </div>
        <button
          onClick={() => toggleElementLock(element.id)}
          className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all border ${
            isLocked
              ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
              : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/30 hover:border-zinc-600'
          }`}
          title={isLocked ? 'Buka kunci' : 'Kunci posisi'}
        >
          {isLocked ? '🔒 Terkunci' : '🔓 Terkunci'}
        </button>
        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
          Sistem
        </span>
      </div>

      {/* Lock message */}
      {isLocked && (
        <div className="p-2 rounded-lg bg-orange-500/5 border border-orange-500/10 mb-3">
          <div className="text-[9px] text-orange-300/70 leading-relaxed">
            🔒 Elemen terkunci. Posisi tidak bisa diubah.
          </div>
        </div>
      )}

      {/* Info: what this system element does */}
      <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 mb-3">
        <div className="text-[9px] text-blue-300/70 leading-relaxed">
          {getSystemDescription(element.type)}
        </div>
      </div>

      {/* Type info */}
      <div className="flex items-center gap-2 mb-3 p-1.5 rounded-lg bg-zinc-800/40">
        <span className="text-base">{element.icon}</span>
        <div>
          <div className="text-[10px] font-bold text-zinc-200">{element.label || element.type}</div>
          <div className="text-[8px] text-zinc-500">{getTypeName(element.type)}</div>
        </div>
      </div>

      {/* Position (movable, but disabled if locked) */}
      <div className="mb-3">
        <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">📍 Posisi</div>
        <div className="grid grid-cols-2 gap-1.5">
          <PropInput label="X" value={Math.round(element.x)} onChange={v => updateElement(element.id, { x: v })} disabled={isLocked} />
          <PropInput label="Y" value={Math.round(element.y)} onChange={v => updateElement(element.id, { y: v })} disabled={isLocked} />
          <PropInput label="Lebar" value={Math.round(element.w)} onChange={v => updateElement(element.id, { w: v })} disabled={isLocked} />
          <PropInput label="Tinggi" value={Math.round(element.h)} onChange={v => updateElement(element.id, { h: v })} disabled={isLocked} />
        </div>
      </div>

      {/* Opacity */}
      <PropInput label="Opacity" value={element.opacity || 100} min={0} max={100} onChange={v => updateElement(element.id, { opacity: v })} />

      {/* Color (if applicable) */}
      {['navbar', 'progress', 'score', 'timer', 'badge', 'shape'].includes(element.type) && (
        <div className="mt-3">
          <label className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">🎨 Warna</label>
          <input
            type="color"
            value={element.color || getDefaultColor(element.type)}
            onChange={e => updateElement(element.id, { color: e.target.value })}
            className="w-full h-7 rounded-md border border-zinc-700 cursor-pointer bg-zinc-800"
          />
        </div>
      )}

      {/* Navbar style selector */}
      {element.type === 'navbar' && (
        <div className="mt-3">
          <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">🧭 Style Navbar</div>
          <div className="flex flex-wrap gap-1">
            {[
              { value: 'bottom-bar', label: 'Bar Navigasi', icon: '⬛' },
              { value: 'breadcrumb', label: 'Breadcrumb', icon: '🔗' },
              { value: 'dots', label: 'Titik', icon: '●●●' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => updateElement(element.id, { navStyle: opt.value })}
                className={`px-2 py-1.5 rounded-lg text-[9px] font-semibold transition-all border ${
                  element.navStyle === opt.value
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/30 hover:border-zinc-600'
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timer text (editable duration) */}
      {element.type === 'timer' && (
        <div className="mt-3">
          <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">⏱️ Durasi</div>
          <input
            type="text"
            value={element.text || '02:00'}
            onChange={e => updateElement(element.id, { text: e.target.value })}
            className="w-full h-7 px-2 text-[11px] font-mono font-bold text-zinc-200 bg-zinc-800 border border-zinc-700/50 rounded-lg focus:border-blue-500/50 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTENT ELEMENT PANEL — Full editing capabilities
   ═══════════════════════════════════════════════════════════════ */

function ContentElementPanel({ element }: { element: { id: string; type: string; icon?: string; label?: string; x: number; y: number; w: number; h: number; opacity: number; color?: string; radius?: number; text?: string; fontSize?: number; dataUrl?: string; locked?: boolean } }) {
  const { updateElement, deleteSelected, saveTextContent, toggleElementLock } = useCanvaStore();
  const gambarInputRef = useRef<HTMLInputElement>(null);
  const isLocked = !!element.locked;

  return (
    <div>
      {/* Content badge + Lock toggle */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex-1">
          ✏️ Edit Konten
        </div>
        <button
          onClick={() => toggleElementLock(element.id)}
          className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all border ${
            isLocked
              ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
              : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/30 hover:border-zinc-600'
          }`}
          title={isLocked ? 'Buka kunci' : 'Kunci posisi'}
        >
          {isLocked ? '🔒 Terkunci' : '🔓 Terkunci'}
        </button>
        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
          Guru
        </span>
      </div>

      {/* Lock message */}
      {isLocked && (
        <div className="p-2 rounded-lg bg-orange-500/5 border border-orange-500/10 mb-3">
          <div className="text-[9px] text-orange-300/70 leading-relaxed">
            🔒 Elemen terkunci. Posisi tidak bisa diubah.
          </div>
        </div>
      )}

      {/* Element info */}
      <div className="flex items-center gap-2 mb-3 p-1.5 rounded-lg bg-zinc-800/40">
        <span className="text-base">{element.icon}</span>
        <div>
          <div className="text-[10px] font-bold text-zinc-200">{element.label || element.type}</div>
          <div className="text-[8px] text-zinc-500">{getTypeName(element.type)}</div>
        </div>
      </div>

      {/* Image upload (for gambar) */}
      {element.type === 'gambar' && (
        <div className="mb-3">
          <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">🖼️ Gambar</div>
          <input
            ref={gambarInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const dataUrl = ev.target?.result as string;
                if (dataUrl) updateElement(element.id, { dataUrl });
              };
              reader.readAsDataURL(file);
              e.target.value = '';
            }}
            className="hidden"
          />
          {element.dataUrl ? (
            <div className="space-y-2">
              <div className="rounded-lg overflow-hidden border border-zinc-700/30">
                <img src={element.dataUrl} alt={element.label || 'Gambar'} className="w-full h-24 object-cover" />
              </div>
              <button
                onClick={() => updateElement(element.id, { dataUrl: '' })}
                className="w-full py-1.5 rounded-lg text-[9px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >🗑 Hapus Gambar</button>
            </div>
          ) : (
            <button
              onClick={() => gambarInputRef.current?.click()}
              className="w-full py-4 rounded-lg border border-dashed border-purple-500/30 hover:border-purple-400/50 bg-purple-500/5 hover:bg-purple-500/10 transition-colors flex flex-col items-center gap-1"
            >
              <span className="text-lg">📤</span>
              <span className="text-[9px] font-semibold text-purple-300">Upload Gambar</span>
              <span className="text-[8px] text-zinc-500">PNG · JPG · WEBP</span>
            </button>
          )}
        </div>
      )}

      {/* Quiz correct answer (for Pertanyaan/Pernyataan elements) */}
      {(element.label === 'Pertanyaan' || element.label === 'Pernyataan') && (
        <div className="mb-3">
          <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">✅ Jawaban Benar</div>
          {element.label === 'Pertanyaan' ? (
            <div className="flex gap-1">
              {['A', 'B', 'C', 'D'].map((letter, idx) => (
                <button
                  key={letter}
                  onClick={() => updateElement(element.id, { correctIdx: idx } as any)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                    (element as any).correctIdx === idx
                      ? 'bg-green-500/15 text-green-400 border-green-500/30'
                      : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/30 hover:border-zinc-600'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => updateElement(element.id, { correctBS: true } as any)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                  (element as any).correctBS === true
                    ? 'bg-green-500/15 text-green-400 border-green-500/30'
                    : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/30 hover:border-zinc-600'
                }`}
              >✅ Benar</button>
              <button
                onClick={() => updateElement(element.id, { correctBS: false } as any)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                  (element as any).correctBS === false
                    ? 'bg-green-500/15 text-green-400 border-green-500/30'
                    : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/30 hover:border-zinc-600'
                }`}
              >❌ Salah</button>
            </div>
          )}
        </div>
      )}

      {/* Text content (for text, button types) */}
      {(element.type === 'teks' || element.type === 'button') && (
        <div className="mb-3">
          <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">🔤 Teks</div>
          {element.type === 'teks' ? (
            <textarea
              value={element.text || ''}
              onChange={e => saveTextContent(element.id, e.target.value)}
              rows={3}
              className="w-full px-2 py-1.5 text-[10px] text-zinc-200 bg-zinc-800 border border-zinc-700/50 rounded-lg focus:border-amber-500/50 focus:outline-none resize-none leading-relaxed"
              placeholder="Ketik teks..."
            />
          ) : (
            <input
              type="text"
              value={element.text || ''}
              onChange={e => saveTextContent(element.id, e.target.value)}
              className="w-full h-7 px-2 text-[10px] text-zinc-200 bg-zinc-800 border border-zinc-700/50 rounded-lg focus:border-amber-500/50 focus:outline-none"
              placeholder="Label tombol..."
            />
          )}
        </div>
      )}

      {/* Font size (for text) */}
      {element.type === 'teks' && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-semibold text-zinc-500">Tipe Huruf</span>
            <span className="text-[10px] text-amber-400 font-bold">{element.fontSize || 20}px</span>
          </div>
          <input
            type="range"
            min={8}
            max={72}
            value={element.fontSize || 20}
            onChange={e => updateElement(element.id, { fontSize: parseInt(e.target.value) })}
            className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      )}

      {/* Position & Size (disabled when locked) */}
      <div className="mb-3">
        <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">📍 Posisi & Ukuran</div>
        <div className="grid grid-cols-2 gap-1.5">
          <PropInput label="X" value={Math.round(element.x)} onChange={v => updateElement(element.id, { x: v })} disabled={isLocked} />
          <PropInput label="Y" value={Math.round(element.y)} onChange={v => updateElement(element.id, { y: v })} disabled={isLocked} />
          <PropInput label="Lebar" value={Math.round(element.w)} onChange={v => updateElement(element.id, { w: v })} disabled={isLocked} />
          <PropInput label="Tinggi" value={Math.round(element.h)} onChange={v => updateElement(element.id, { h: v })} disabled={isLocked} />
        </div>
      </div>

      {/* Opacity */}
      <PropInput label="Opacity" value={element.opacity || 100} min={0} max={100} onChange={v => updateElement(element.id, { opacity: v })} />

      {/* Color (for shape, button) */}
      {(element.type === 'shape' || element.type === 'button') && (
        <div className="mt-3">
          <label className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">🎨 Warna</label>
          <input
            type="color"
            value={element.color || (element.type === 'button' ? '#3b82f6' : 'rgba(255,255,255,0.15)')}
            onChange={e => updateElement(element.id, { color: e.target.value })}
            className="w-full h-7 rounded-md border border-zinc-700 cursor-pointer bg-zinc-800"
          />
        </div>
      )}

      {/* Border Radius (for shape, button) */}
      {(element.type === 'shape' || element.type === 'button') && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-semibold text-zinc-500">Sudut</span>
            <span className="text-[10px] text-amber-400 font-bold">{element.radius || 8}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={element.radius || 8}
            onChange={e => updateElement(element.id, { radius: parseInt(e.target.value) })}
            className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      )}

      {/* Quick alignment (disabled when locked) */}
      {!isLocked && (
        <div className="mt-3">
          <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">📐 Cepat Rata</div>
          <div className="grid grid-cols-4 gap-1">
            <button onClick={() => updateElement(element.id, { x: 0, y: 0 })} className="py-1.5 rounded text-[9px] text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700/30 transition-all">⬆</button>
            <button onClick={() => { const cx = 50 - (element.w / 2); updateElement(element.id, { x: cx }); }} className="py-1.5 rounded text-[9px] text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700/30 transition-all">⬌</button>
            <button onClick={() => updateElement(element.id, { y: 0 })} className="py-1.5 rounded text-[9px] text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700/30 transition-all">⬆</button>
            <button onClick={() => updateElement(element.id, { x: 100 - element.w, y: 100 - element.h })} className="py-1.5 rounded text-[9px] text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700/30 transition-all">⬋</button>
          </div>
        </div>
      )}

      {/* Delete button */}
      <button
        onClick={deleteSelected}
        className="w-full mt-3 py-2 rounded-lg text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
      >
        🗑 Hapus Elemen
      </button>
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────────────── */

function PropInput({ label, value, min, max, onChange, disabled }: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-[10px] text-zinc-500 w-12 flex-shrink-0">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        disabled={disabled}
        className={`flex-1 h-6 px-1.5 text-[10px] text-zinc-200 bg-zinc-800 border border-zinc-700/50 rounded focus:border-amber-500/50 focus:outline-none ${
          disabled ? 'opacity-40 cursor-not-allowed' : ''
        }`}
      />
    </div>
  );
}

function getDefaultColor(type: string): string {
  const colors: Record<string, string> = {
    navbar: '#1e293b',
    progress: '#22c55e',
    score: '#fbbf24',
    timer: '#ef4444',
    badge: '#f59e0b',
    shape: 'rgba(255,255,255,0.15)',
  };
  return colors[type] || '#ffffff';
}

function getTypeName(type: string): string {
  const names: Record<string, string> = {
    navbar: 'Navigasi Halaman',
    teks: 'Teks Bebas',
    shape: 'Kotak / Latar',
    button: 'Tombol Aksi',
    badge: 'Lencana / Label',
    progress: 'Bar Progress',
    score: 'Tampilan Skor',
    timer: 'Hitung Mundur',
    confetti: 'Efek Selebrasi',
    divider: 'Garis Pemisah',
    kuis: 'Soal Kuis',
    game: 'Game Interaktif',
    materi: 'Materi Ajar',
    modul: 'Modul Aktivitas',
    gambar: 'Gambar',
  };
  return names[type] || type;
}

function getSystemDescription(type: string): string {
  const descriptions: Record<string, string> = {
    navbar: 'Navigasi otomatis prev/next antar halaman. Guru bisa ganti style (bar/breadcrumb/dots) dan posisi.',
    score: 'Skor otomatis dihitung saat siswa menjawab. Guru bisa atur posisi dan warna tampilan.',
    progress: 'Bar progress otomatis mengikuti soal aktif. Guru bisa ganti warna dan posisi.',
    timer: 'Timer countdown otomatis. Guru bisa atur durasi di properti.',
    confetti: 'Efek selebrasi otomatis muncul di halaman hasil jika skor tinggi.',
    badge: 'Badge apresiasi otomatis. Isi teks akan berubah sesuai hasil.',
    divider: 'Garis pemisah visual otomatis.',
    teks: 'Teks bawaan sistem (label, counter, feedback). Bisa diedit kontennya.',
    shape: 'Area latar bawaan sistem untuk layout.',
  };
  return descriptions[type] || 'Elemen bawaan sistem yang di-generate otomatis.';
}

/* ── Layer Mini List ───────────────────────────────────────── */

function LayerMiniList() {
  const { pages, currentPageIndex, selectedElIds, selectElement, toggleElementVisibility, toggleElementLock } = useCanvaStore();
  const page = pages[currentPageIndex];
  if (!page) return null;

  const elements = [...page.elements].reverse();
  const colors: Record<string, string> = {
    navbar: '#3b82f6', kuis: '#f5c842', game: '#3ecfcf', materi: '#a78bfa',
    modul: '#34d399', teks: '#fff', shape: '#6366f1', button: '#3b82f6',
    badge: '#f59e0b', progress: '#22c55e', score: '#fbbf24', timer: '#ef4444',
    confetti: '#a855f7', divider: '#71717a', gambar: '#a855f7',
  };

  return (
    <div className="space-y-0.5">
      {elements.length === 0 && (
        <div className="text-[9px] text-zinc-600 text-center py-2">Kosong</div>
      )}
      {elements.map(el => {
        const isActive = selectedElIds.includes(el.id);
        const color = colors[el.type] || '#888';
        return (
          <div
            key={el.id}
            onClick={() => selectElement(el.id)}
            className={`flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer transition-colors ${
              isActive
                ? el.system
                  ? 'bg-blue-500/15 text-blue-300'
                  : 'bg-amber-500/15 text-amber-300'
                : 'text-zinc-500 hover:bg-zinc-800/40'
            } ${el.locked ? 'opacity-70' : ''}`}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[9px] flex-1 truncate">
              {el.locked && <span className="text-[7px] mr-0.5 opacity-60">🔒</span>}
              {el.system && !el.locked && <span className="text-[7px] mr-0.5 opacity-50">⚙️</span>}
              {el.icon} {el.label || el.type}
            </span>
            <button
              onClick={e => { e.stopPropagation(); toggleElementLock(el.id); }}
              className={`text-[9px] ${el.locked ? 'text-orange-400/60' : 'opacity-0 group-hover:opacity-60 hover:opacity-100'}`}
              title={el.locked ? 'Buka kunci' : 'Kunci'}
            >
              {el.locked ? '🔒' : '🔓'}
            </button>
            <button
              onClick={e => { e.stopPropagation(); toggleElementVisibility(el.id); }}
              className={`text-[9px] ${el.hidden ? 'text-red-400/50' : 'opacity-60 hover:opacity-100'}`}
            >
              👁
            </button>
          </div>
        );
      })}
    </div>
  );
}
