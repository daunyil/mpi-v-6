'use client';

import { useState, useCallback, useEffect } from 'react';
import { useCanvaStore } from '@/store/canva-store';
import { useThemeStore } from '@/store/theme-store';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';
import LeftPanel from './LeftPanel';
import Stage from './Stage';
import RightPanel from './RightPanel';

/**
 * ProMode — Full panel control layout (original CanvaBuilder)
 *
 * For advanced users who need:
 * - All panels visible (Left, Right)
 * - Toolbar at top
 * - Status bar at bottom
 * - Full drag & drop control
 */
export default function ProMode({ onToggleMode }: { onToggleMode: () => void }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(true);
  const themeMode = useThemeStore((s) => s.mode);
  const selectedElIds = useCanvaStore((s) => s.selectedElIds);

  const handleMouseMove = useCallback((x: number, y: number) => {
    setMousePos({ x, y });
  }, []);

  // Auto-expand right panel when element selected, auto-collapse when deselected
  useEffect(() => {
    if (selectedElIds.length > 0) {
      setRightCollapsed(false);
    } else {
      setRightCollapsed(true);
    }
  }, [selectedElIds]);

  // Auto-load saved project on mount
  useEffect(() => {
    const store = useCanvaStore.getState();
    if (store.hasSavedProject()) {
      store.loadProject();
    }
  }, []);

  // ── Keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useCanvaStore.getState();
      const target = e.target as HTMLElement;

      // Don't intercept when editing text
      if (target.contentEditable === 'true' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Delete ALL selected elements
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

      // Arrow keys: nudge ALL selected elements
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

      // Escape: deselect all
      if (e.key === 'Escape') {
        store.deselectAll();
        return;
      }

      // Tool shortcuts
      if (e.key === 'v' || e.key === 'V') store.setTool('select');
      if (e.key === 't' || e.key === 'T') store.setTool('text');

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
        {/* Top Toolbar */}
        <Toolbar />

        {/* Main builder row */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Panel */}
          <LeftPanel
            isCollapsed={leftCollapsed}
            onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
          />

          {/* Stage Canvas Area */}
          <Stage onMouseMove={handleMouseMove} />

          {/* Right Panel */}
          <RightPanel
            isCollapsed={rightCollapsed}
            onToggleCollapse={() => setRightCollapsed(!rightCollapsed)}
          />
        </div>

        {/* Status Bar */}
        <StatusBar mousePos={mousePos} />
      </div>
    </div>
  );
}
