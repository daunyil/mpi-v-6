'use client';

import { useState, useCallback, useEffect } from 'react';
import { useCanvaStore } from '@/store/canva-store';
import { useThemeStore } from '@/store/theme-store';
import Stage from './Stage';
import PageTabBar from './PageTabBar';
import FloatingActionBar from './FloatingActionBar';

/**
 * ZenMode — Canvas-First layout for teachers
 *
 * - Horizontal page tabs at top
 * - Full-width stage in center
 * - Floating action bar at bottom
 * - Contextual toolbars on element selection
 * - Inline editing (via Stage)
 * - No permanent side panels
 */
export default function ZenMode({ onToggleMode }: { onToggleMode: () => void }) {
  const themeMode = useThemeStore((s) => s.mode);
  const selectedElIds = useCanvaStore((s) => s.selectedElIds);

  // ── Keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useCanvaStore.getState();
      const target = e.target as HTMLElement;

      // Don't intercept when editing text
      if (target.contentEditable === 'true' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selectedElIds.length > 0) {
          e.preventDefault();
          store.deleteSelected();
        }
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        store.redo();
        return;
      }

      // Copy / Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (store.selectedElIds.length > 0) { e.preventDefault(); store.copyElement(); }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault(); store.pasteElement();
        return;
      }

      // Select All
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        store.selectAllElements();
        return;
      }

      // Arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (store.selectedElIds.length === 0) return;
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        switch (e.key) {
          case 'ArrowUp': store.moveSelectedElements(0, -step); break;
          case 'ArrowDown': store.moveSelectedElements(0, step); break;
          case 'ArrowLeft': store.moveSelectedElements(-step, 0); break;
          case 'ArrowRight': store.moveSelectedElements(step, 0); break;
        }
        return;
      }

      // Escape
      if (e.key === 'Escape') {
        store.deselectAll();
        return;
      }

      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        store.zoomDelta(0.1);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        store.zoomDelta(-0.1);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        store.setZoom(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`h-full w-full flex flex-col ${themeMode === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <div className="h-full w-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
        {/* ── Page Tab Bar (top) ──────────────────────────────────── */}
        <PageTabBar />

        {/* ── Stage (full center) ─────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <Stage onMouseMove={() => {}} />
        </div>

        {/* ── Floating Action Bar (bottom) ────────────────────────── */}
        <FloatingActionBar onToggleMode={onToggleMode} />
      </div>
    </div>
  );
}
