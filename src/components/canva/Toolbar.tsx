'use client';

import { useCanvaStore } from '@/store/canva-store';
import { toast } from 'sonner';

export default function Toolbar() {
  const {
    tool,
    setTool,
    zoom,
    zoomDelta,
    ratioId,
    clearStage,
    exportPageHTML,
    exportSlideshowHTML,
    currentPageIndex,
    pages,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedElIds,
    deleteSelectedElements,
  } = useCanvaStore();

  const page = pages[currentPageIndex];
  const label = page?.label || 'Untitled';
  const hasMultiSelect = selectedElIds.length > 1;

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
    const html = exportPageHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canva-page-${currentPageIndex + 1}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Halaman diekspor sebagai HTML');
  };

  const handleExportSlideshow = () => {
    const html = exportSlideshowHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canva-slideshow.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Slideshow diekspor (' + pages.length + ' halaman)');
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-secondary)] border-b border-[var(--border-secondary)] text-xs select-none">
      {/* Logo + Title */}
      <span className="text-sm">🎨</span>
      <span className="font-bold text-[var(--text-primary)] min-w-0 truncate max-w-[140px]">{label}</span>
      <div className="w-px h-5 bg-[var(--border-secondary)] mx-1" />

      {/* Undo/Redo */}
      <button
        onClick={undo}
        disabled={!canUndo()}
        title="Undo (Ctrl+Z)"
        className={`p-1 rounded transition-colors ${canUndo() ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]' : 'text-[var(--text-muted)] cursor-not-allowed'}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
      </button>
      <button
        onClick={redo}
        disabled={!canRedo()}
        title="Redo (Ctrl+Y)"
        className={`p-1 rounded transition-colors ${canRedo() ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]' : 'text-[var(--text-muted)] cursor-not-allowed'}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
      </button>
      <div className="w-px h-5 bg-[var(--border-secondary)] mx-1" />

      {/* Tool buttons */}
      <button
        onClick={() => setTool('select')}
        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
          tool === 'select'
            ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent)]/30'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
        }`}
        title="Pilih (V)"
      >
        ↖ Pilih
      </button>
      <button
        onClick={() => setTool('text')}
        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
          tool === 'text'
            ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent)]/30'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
        }`}
        title="Teks (T)"
      >
        T Teks
      </button>
      <div className="w-px h-5 bg-[var(--border-secondary)] mx-1" />

      {/* Action buttons */}
      <button onClick={handleLivePreview} title="Live Preview" className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-green-400 hover:text-green-300 transition-colors">▶</button>
      <button onClick={handlePreview} title="Preview" className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">👁</button>
      <button onClick={handleExport} title="Export HTML" className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">📤</button>
      <button onClick={handleExportSlideshow} title="Export Slideshow" className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">🎞</button>
      <button
        onClick={() => { if (confirm('Bersihkan semua elemen di halaman ini?')) clearStage(); }}
        title="Bersihkan"
        className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-red-400 hover:text-red-300 transition-colors"
      >
        🗑
      </button>

      {/* Multi-select delete */}
      {hasMultiSelect && (
        <>
          <div className="w-px h-5 bg-[var(--border-secondary)] mx-1" />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30">
            <span className="text-[10px] font-bold text-amber-400">☑️ {selectedElIds.length}</span>
            <button
              onClick={() => { if (confirm(`Hapus ${selectedElIds.length} elemen terpilih?`)) deleteSelectedElements(); }}
              className="px-2 py-0.5 rounded text-[9px] font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
              title="Hapus Semua"
            >
              🗑 Hapus Semua
            </button>
          </div>
        </>
      )}

      {/* Ratio badge */}
      <span className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--accent-text)] font-bold text-[10px] ml-1">{ratioId}</span>

      {/* Keyboard hints */}
      <div className="hidden lg:flex items-center gap-2 ml-2 text-[9px] text-[var(--text-muted)]">
        <span>Del=hapus</span>
        <span>Shift+Click=multi</span>
        <span>Ctrl+A=semua</span>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-1 ml-auto">
        <button onClick={() => zoomDelta(-0.1)} className="w-6 h-6 flex items-center justify-center rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-sm transition-colors" title="Zoom out">−</button>
        <span className="text-[var(--text-secondary)] text-[11px] font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => zoomDelta(0.1)} className="w-6 h-6 flex items-center justify-center rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-sm transition-colors" title="Zoom in">+</button>
      </div>
    </div>
  );
}
