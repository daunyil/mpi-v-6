'use client';

import { useCanvaStore } from '@/store/canva-store';
import type { LeftTab } from './types';

const RAIL_ITEMS: { id: LeftTab; icon: string; title: string; divider?: boolean }[] = [
  { id: 'pages', icon: '📄', title: 'Halaman' },
  { id: 'elems', icon: '🧩', title: 'Elemen' },
  { id: 'ratio', icon: '📐', title: 'Rasio' },
  { id: 'layers', icon: '🔲', title: 'Layer', divider: true },
];

export default function IconRail() {
  const { leftTab, setLeftTab } = useCanvaStore();

  return (
    <div className="flex flex-col items-center gap-1 py-2 px-1 bg-[var(--bg-secondary)] border-r border-[var(--border-secondary)]">
      {RAIL_ITEMS.map((item, i) => (
        <div key={item.id}>
          {item.divider && <div className="w-8 h-px bg-[var(--border-secondary)] mb-1" />}
          <button
            onClick={() => setLeftTab(item.id)}
            title={item.title}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-all ${
              leftTab === item.id
                ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] shadow-sm shadow-amber-500/10'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            {item.icon}
          </button>
        </div>
      ))}
    </div>
  );
}
