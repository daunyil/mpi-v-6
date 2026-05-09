'use client';

import { useState } from 'react';
import { useCanvaStore } from '@/store/canva-store';

/**
 * PageTabBar — Horizontal page navigation for Zen Mode
 *
 * Shows page tabs at the top like browser tabs.
 * Click to navigate, double-click to rename, + to add page.
 * Drag to reorder (future).
 */
export default function PageTabBar() {
  const {
    pages,
    currentPageIndex,
    goPage,
    addPage,
    duplicatePage,
    deletePage,
    setPageLabel,
  } = useCanvaStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEditing = (pageId: string, currentLabel: string) => {
    setEditingId(pageId);
    setEditValue(currentLabel);
  };

  const confirmEdit = (pageIdx: number) => {
    if (editValue.trim()) {
      goPage(pageIdx);
      setPageLabel(editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 bg-[var(--bg-secondary)] border-b border-[var(--border-secondary)] overflow-x-auto custom-scrollbar select-none min-h-[36px]">
      {pages.map((p, i) => {
        const isActive = i === currentPageIndex;
        const isEditing = editingId === p.id;

        return (
          <div
            key={p.id}
            className={`
              group relative flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-[11px] font-medium cursor-pointer
              transition-all whitespace-nowrap min-w-0 max-w-[160px]
              ${isActive
                ? 'bg-[var(--bg-primary)] text-[var(--accent-text)] border-t-2 border-x border-[var(--accent)]/40 border-b-0 border-b-transparent'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border-t-2 border-transparent'
              }
            `}
            onClick={() => { if (!isEditing) goPage(i); }}
            onDoubleClick={(e) => { e.stopPropagation(); startEditing(p.id, p.label); }}
          >
            {/* Page index badge */}
            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
              isActive
                ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
            }`}>
              {i + 1}
            </span>

            {/* Page label */}
            {isEditing ? (
              <input
                autoFocus
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={() => confirmEdit(i)}
                onKeyDown={e => {
                  if (e.key === 'Enter') confirmEdit(i);
                  if (e.key === 'Escape') { setEditingId(null); setEditValue(''); }
                }}
                onClick={e => e.stopPropagation()}
                className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-[11px] px-1 py-0.5 rounded border border-[var(--accent)]/30 focus:outline-none w-24"
              />
            ) : (
              <span className="truncate">{p.label}</span>
            )}

            {/* Element count */}
            <span className={`text-[8px] flex-shrink-0 ${isActive ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)]/50'}`}>
              {p.elements.length}
            </span>

            {/* Context actions — only on hover/active */}
            {isActive && !isEditing && (
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  onClick={e => { e.stopPropagation(); duplicatePage(); }}
                  title="Duplikat halaman"
                  className="w-4 h-4 flex items-center justify-center rounded text-[8px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                >⧉</button>
                {pages.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm(`Hapus "${p.label}"?`)) deletePage(); }}
                    title="Hapus halaman"
                    className="w-4 h-4 flex items-center justify-center rounded text-[8px] text-red-400/60 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >✕</button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add page button */}
      <button
        onClick={addPage}
        title="Tambah halaman baru"
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--accent-text)] hover:bg-[var(--accent-bg)] transition-all ml-1 flex-shrink-0"
      >
        <span className="text-sm">+</span>
        <span className="hidden sm:inline">Halaman</span>
      </button>
    </div>
  );
}
