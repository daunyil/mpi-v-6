'use client';

import { useCanvaStore } from '@/store/canva-store';

export default function StatusBar({ mousePos }: { mousePos: { x: number; y: number } }) {
  const {
    pages,
    currentPageIndex,
    ratioId,
  } = useCanvaStore();

  const page = pages[currentPageIndex];
  const ratio = useCanvaStore(s => s.currentRatio());

  return (
    <div className="flex items-center gap-4 px-3 py-1 bg-[var(--bg-secondary)] border-t border-[var(--border-secondary)] text-[11px] text-[var(--text-muted)]">
      <span>📐 {ratio.w}×{ratio.h}</span>
      <span>🧩 {page?.elements.length || 0} elemen</span>
      <span>📄 {currentPageIndex + 1}/{pages.length} halaman</span>
      <span className="ml-auto font-mono">x:{mousePos.x} y:{mousePos.y}</span>
    </div>
  );
}
