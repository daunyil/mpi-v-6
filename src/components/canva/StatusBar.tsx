'use client';

import { useCanvaStore } from '@/store/canva-store';

export default function StatusBar({ mousePos }: { mousePos: { x: number; y: number } }) {
  const {
    pages,
    currentPageIndex,
    zoom,
  } = useCanvaStore();

  const page = pages[currentPageIndex];

  return (
    <div className="flex items-center px-3 py-0.5 bg-[var(--bg-secondary)] border-t border-[var(--border-secondary)] text-[10px] text-[var(--text-muted)] select-none">
      {/* Left: page info */}
      <div className="flex items-center gap-2">
        <span>📄 {currentPageIndex + 1}/{pages.length}</span>
        <span>🧩 {page?.elements.length || 0}</span>
      </div>
      {/* Center: mouse position */}
      <span className="mx-auto font-mono text-[9px]">x:{mousePos.x} y:{mousePos.y}</span>
      {/* Right: zoom */}
      <span className="font-mono">{Math.round(zoom * 100)}%</span>
    </div>
  );
}
