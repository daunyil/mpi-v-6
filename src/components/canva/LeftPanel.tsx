'use client';

import { useState } from 'react';
import { useCanvaStore } from '@/store/canva-store';
import { useAuthoringStore } from '@/store/authoring-store';
import { ALL_PAGE_TYPES } from '@/store/page-types';
import type { LeftTab, CanvaTemplate } from './types';
import PageTypeCreator from './PageTypeCreator';

const TABS: { id: LeftTab; label: string; fullLabel: string }[] = [
  { id: 'layout', label: '⚡', fullLabel: 'Auto-Generate' },
  { id: 'pages', label: '📄', fullLabel: 'Halaman' },
  { id: 'elems', label: '🧩', fullLabel: 'Elemen' },
  { id: 'ratio', label: '📏', fullLabel: 'Rasio' },
  { id: 'layers', label: '📊', fullLabel: 'Layer' },
  { id: 'templates', label: '📂', fullLabel: 'Template' },
];

export default function LeftPanel() {
  const { leftTab, setLeftTab } = useCanvaStore();

  return (
    <div className="w-60 min-w-[235px] flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-secondary)] overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[var(--border-secondary)] bg-[var(--bg-secondary)]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setLeftTab(tab.id)}
            className={`flex-1 py-2.5 text-[11px] font-semibold transition-all relative ${
              leftTab === tab.id
                ? 'text-[var(--accent-text)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
            title={tab.fullLabel}
          >
            {tab.label}
            {leftTab === tab.id && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--accent-text)] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {leftTab === 'layout' && <div className="p-2"><PageTypeCreator /></div>}
        {leftTab === 'pages' && <div className="p-2"><PagesContent /></div>}
        {leftTab === 'elems' && <div className="p-2"><ElementsContent /></div>}
        {leftTab === 'ratio' && <div className="p-2"><RatioContent /></div>}
        {leftTab === 'layers' && <div className="p-2"><LayersContent /></div>}
        {leftTab === 'templates' && <div className="p-2"><TemplatesContent /></div>}
      </div>
    </div>
  );
}

/* ── Pages Tab ──────────────────────────────────────────────── */

function PagesContent() {
  const { pages, currentPageIndex, goPage, addPage, duplicatePage, deletePage, setPageLabel } = useCanvaStore();
  const ratio = useCanvaStore(s => s.currentRatio());
  const [editingLabel, setEditingLabel] = useState<string | null>(null);

  return (
    <div>
      <SectionHeader title="Halaman" count={pages.length} />

      <div className="space-y-2 mb-3">
        {pages.map((p, i) => {
          const isActive = i === currentPageIndex;
          const bgStyle = p.bgDataUrl
            ? { backgroundImage: `url('${p.bgDataUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: p.bgColor || '#1a1a2e' };

          return (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => goPage(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goPage(i); } }}
              className={`w-full relative rounded-xl overflow-hidden transition-all group cursor-pointer ${
                isActive
                  ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-zinc-900 shadow-md shadow-amber-500/10'
                  : 'ring-1 ring-zinc-700/50 hover:ring-zinc-600'
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
                      background: el.type === 'shape' ? (el.color || 'rgba(255,255,255,.15)') :
                                  el.type === 'button' ? (el.color || '#3b82f6') :
                                  el.type === 'navbar' ? (el.color || '#1e293b') :
                                  'rgba(255,255,255,.08)',
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-2">
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-bold text-white truncate flex-1">
                    {editingLabel === p.id ? (
                      <input
                        autoFocus
                        value={p.label}
                        onBlur={(e) => { goPage(i); setPageLabel(e.target.value); setEditingLabel(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { goPage(i); setPageLabel((e.target as HTMLInputElement).value); setEditingLabel(null); } }}
                        onClick={e => e.stopPropagation()}
                        className="w-full bg-zinc-800 text-[10px] text-zinc-200 px-1 py-0.5 rounded border border-amber-500/30 focus:outline-none"
                      />
                    ) : (
                      <span onDoubleClick={(e) => { e.stopPropagation(); setEditingLabel(p.id); }} className="cursor-text">{p.label}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-white/50 bg-black/30 px-1.5 py-0.5 rounded-full">{p.elements.length}</span>
                    {isActive && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                  </div>
                </div>
              </div>

              <div className={`absolute top-1 right-1 flex gap-0.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button
                  onClick={e => { e.stopPropagation(); useCanvaStore.getState().duplicatePage(); }}
                  className="w-5 h-5 flex items-center justify-center rounded bg-black/50 backdrop-blur-sm text-[9px] text-white/70 hover:text-white hover:bg-black/70 transition-all"
                  title="Duplikat"
                >⧉</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <button
          onClick={addPage}
          className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 text-[11px] text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-1.5"
        >
          <span className="text-sm">+</span> Tambah Halaman
        </button>
        <div className="flex gap-1">
          <button
            onClick={duplicatePage}
            className="flex-1 py-2 rounded-lg text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-zinc-700/30 transition-all flex items-center justify-center gap-1"
          >
            <span>⧉</span> Duplikat
          </button>
          <button
            onClick={() => {
              if (pages.length <= 1) return;
              if (confirm(`Hapus "${pages[currentPageIndex].label}"?`)) deletePage();
            }}
            className="flex-1 py-2 rounded-lg text-[10px] text-red-400/70 hover:text-red-300 hover:bg-red-500/10 border border-zinc-700/30 transition-all flex items-center justify-center gap-1"
          >
            <span>🗑</span> Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Elements Tab ───────────────────────────────────────────── */

const ELEM_GROUPS = [
  {
    label: '🧭 Navigasi',
    items: [
      { id: 'navbar', icon: '🧭', name: 'Navbar', note: 'Navigasi halaman', color: '#3b82f6' },
    ],
  },
  {
    label: '🔤 Teks & Visual',
    items: [
      { id: 'teks', icon: '🔤', name: 'Teks', note: 'Teks bebas', color: 'rgba(255,255,255,.3)' },
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
      { id: 'kuis', icon: '❓', name: 'Kuis', note: 'Soal pilihan ganda', color: '#f5c842' },
      { id: 'game', icon: '🎮', name: 'Game', note: 'Game interaktif', color: '#3ecfcf' },
      { id: 'materi', icon: '📝', name: 'Materi', note: 'Konten materi', color: '#a78bfa' },
      { id: 'modul', icon: '🧩', name: 'Modul', note: 'Modul aktivitas', color: '#34d399' },
    ],
  },
];

function ElementsContent() {
  const { addElement, addKuisElement, addGameElement, addModulElement } = useCanvaStore();
  const authoringModules = useAuthoringStore((s) => s.modules);
  const authoringKuis = useAuthoringStore((s) => s.kuis);
  const authoringGames = useAuthoringStore((s) => s.games);
  const [search, setSearch] = useState('');

  const handleDragStart = (e: React.DragEvent, typeId: string) => {
    e.dataTransfer.setData('elemType', typeId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filtered = search.trim()
    ? ELEM_GROUPS.map(g => ({
        ...g,
        items: g.items.filter(t =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.note.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(g => g.items.length > 0)
    : ELEM_GROUPS;

  // Module type map for showing icons/colors in the list
  const modulTypeMap: Record<string, { icon: string; color: string; label: string }> = {
    'skenario': { icon: '🎭', color: '#f9c82e', label: 'Skenario' },
    'video': { icon: '🎥', color: '#ff6b6b', label: 'Video' },
    'flashcard': { icon: '🃏', color: '#3ecfcf', label: 'Flashcard' },
    'infografis': { icon: '📊', color: '#a78bfa', label: 'Infografis' },
    'studi-kasus': { icon: '📰', color: '#fb923c', label: 'Studi Kasus' },
    'debat': { icon: '🗣️', color: '#f87171', label: 'Debat' },
    'timeline': { icon: '📅', color: '#34d399', label: 'Timeline' },
    'matching': { icon: '🔀', color: '#60a5fa', label: 'Matching' },
    'materi': { icon: '📖', color: '#a1a1aa', label: 'Materi' },
    'truefalse': { icon: '✅', color: '#34d399', label: 'B/S' },
    'memory': { icon: '🧠', color: '#a78bfa', label: 'Memory' },
    'roda': { icon: '🎡', color: '#fb923c', label: 'Roda' },
  };

  return (
    <div>
      <div className="relative mb-2">
        <svg className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input
          type="text"
          placeholder="Cari elemen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-7 pl-6 pr-2 text-[10px] text-zinc-300 bg-zinc-800/60 border border-zinc-700/40 rounded-lg focus:border-amber-500/40 focus:outline-none placeholder:text-zinc-600"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 text-[10px]">✕</button>
        )}
      </div>
      <div className="text-[8px] text-zinc-600 mb-2.5 flex items-center gap-1">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 9l4-4 4 4"/><path d="M9 5v14"/></svg>
        Klik atau seret ke canvas
      </div>

      <div className="space-y-3">
        {filtered.map(group => (
          <div key={group.label}>
            <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <div className="w-1 h-3 rounded-full bg-zinc-700" />
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map(t => (
                <button
                  key={t.id}
                  draggable
                  onClick={() => addElement(t.id)}
                  onDragStart={e => handleDragStart(e, t.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/20 hover:border-amber-500/20 transition-all group cursor-grab active:cursor-grabbing"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${(t.color || '#888')}20, ${(t.color || '#888')}08)` }}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[10px] font-bold text-zinc-200 group-hover:text-amber-300 transition-colors">{t.name}</div>
                    <div className="text-[8px] text-zinc-600 leading-tight">{t.note}</div>
                  </div>
                  <svg className="text-zinc-700 group-hover:text-zinc-500 transition-colors flex-shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Authoring Data Blocks ────────────────────────── */}
      {(authoringKuis.length > 0 || authoringGames.length > 0 || authoringModules.length > 0) && (
        <div className="mt-4">
          <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <div className="w-1 h-3 rounded-full bg-amber-700" />
            Data dari Authoring
          </div>
          <div className="space-y-1">
            {/* Kuis from authoring */}
            {authoringKuis.length > 0 && (
              <button
                onClick={() => addKuisElement(authoringKuis.length - 1)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/20 hover:border-amber-500/20 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f5c84220, #f5c84208)' }}>❓</div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[10px] font-bold text-zinc-200 group-hover:text-amber-300">Kuis ({authoringKuis.length} soal)</div>
                  <div className="text-[8px] text-zinc-600">Dari tab Konten</div>
                </div>
                <svg className="text-zinc-700 group-hover:text-zinc-500 flex-shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
              </button>
            )}
            {/* Games from authoring */}
            {authoringGames.length > 0 && (
              <button
                onClick={() => addGameElement(authoringGames.length - 1)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/20 hover:border-amber-500/20 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3ecfcf20, #3ecfcf08)' }}>🎮</div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[10px] font-bold text-zinc-200 group-hover:text-amber-300">Game ({authoringGames.length})</div>
                  <div className="text-[8px] text-zinc-600">Dari tab Konten</div>
                </div>
                <svg className="text-zinc-700 group-hover:text-zinc-500 flex-shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
              </button>
            )}
            {/* Modules from authoring */}
            {authoringModules.map((mod, idx) => {
              const t = (mod.type as string) || '';
              const info = modulTypeMap[t] || { icon: '🧩', color: '#34d399', label: 'Modul' };
              const title = (mod.title as string) || info.label;
              return (
                <button
                  key={idx}
                  onClick={() => addModulElement(idx)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/20 hover:border-amber-500/20 transition-all group cursor-pointer"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${info.color}20, ${info.color}08)` }}
                  >
                    {info.icon}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[10px] font-bold text-zinc-200 group-hover:text-amber-300 truncate">{title}</div>
                    <div className="text-[8px] text-zinc-600">{info.label} · Dari Authoring</div>
                  </div>
                  <svg className="text-zinc-700 group-hover:text-zinc-500 flex-shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Ratio Tab ──────────────────────────────────────────────── */

function RatioContent() {
  const { ratioId, setRatio } = useCanvaStore();

  return (
    <div>
      <SectionHeader title="Rasio Halaman" />
      <div className="space-y-1.5">
        {[
          { id: '16:9', name: '16:9', desc: 'Landscape PPT', w: 1280, h: 720 },
          { id: '9:16', name: '9:16', desc: 'Portrait HP', w: 720, h: 1280 },
          { id: '1:1', name: '1:1', desc: 'Square Post', w: 800, h: 800 },
          { id: 'A4', name: 'A4', desc: 'Dokumen LKS', w: 794, h: 1123 },
          { id: '4:3', name: '4:3', desc: 'Presentasi Lama', w: 1024, h: 768 },
        ].map(r => {
          const isActive = ratioId === r.id;
          const aspect = r.w / r.h;
          const tw = aspect >= 1 ? 36 : Math.round(36 * aspect);
          const th = aspect <= 1 ? 24 : Math.round(24 / aspect);
          return (
            <button
              key={r.id}
              onClick={() => setRatio(r.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/5'
                  : 'bg-zinc-800/30 border-zinc-700/20 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/50'
              }`}
            >
              <div
                className="rounded-md border border-current/20 flex-shrink-0 flex items-center justify-center"
                style={{ width: tw + 12, height: th + 8 }}
              >
                <div
                  className={`rounded-sm ${isActive ? 'bg-amber-500/30' : 'bg-current/10'}`}
                  style={{ width: tw, height: th }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold">{r.name}</div>
                <div className="text-[8px] opacity-60">{r.desc}</div>
              </div>
              <div className="text-[8px] opacity-40 font-mono">{r.w}x{r.h}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Layers Tab ─────────────────────────────────────────────── */

const TYPE_COLORS: Record<string, string> = {
  navbar: '#3b82f6', kuis: '#f5c842', game: '#3ecfcf', materi: '#a78bfa',
  modul: '#34d399', teks: '#fff', shape: '#6366f1', button: '#3b82f6',
  badge: '#f59e0b', progress: '#22c55e', score: '#fbbf24', timer: '#ef4444',
  confetti: '#a855f7', divider: '#71717a', gambar: '#a855f7',
};

function LayersContent() {
  const { pages, currentPageIndex, selectedElIds, selectElement, toggleElementVisibility, toggleElementLock, moveElementZ, deleteElement } = useCanvaStore();
  const page = pages[currentPageIndex];
  if (!page) return null;

  const elements = [...page.elements].reverse();

  return (
    <div>
      <SectionHeader title="Layer" count={elements.length} subtitle="atas = paling depan" />

      {elements.length === 0 && (
        <div className="text-[10px] text-zinc-600 text-center py-8">
          <div className="text-xl mb-2">📭</div>
          Belum ada elemen di canvas
        </div>
      )}

      <div className="space-y-0.5">
        {elements.map(el => {
          const isActive = selectedElIds.includes(el.id);
          const color = TYPE_COLORS[el.type] || '#888';
          return (
            <div
              key={el.id}
              onClick={(e) => selectElement(el.id, e.shiftKey)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all group ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20'
                  : 'text-zinc-400 hover:bg-zinc-800/60'
              } ${el.locked ? 'opacity-60' : ''}`}
            >
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: color, boxShadow: `0 0 6px ${color}30` }}
              />
              <span className="text-[10px] font-medium flex-1 truncate">
                {el.locked && <span className="text-[7px] text-orange-400/60 mr-0.5">🔒</span>}
                {el.icon} {el.label || el.type}
                {el.system && !el.locked && <span className="text-[7px] text-blue-400/60 ml-1">SYS</span>}
              </span>
              {el.hidden && <span className="text-[8px] text-zinc-600 italic">tersembunyi</span>}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); moveElementZ(el.id, 'up'); }}
                  className="w-5 h-5 flex items-center justify-center rounded text-[9px] text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700"
                  title="Naik"
                >↑</button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveElementZ(el.id, 'down'); }}
                  className="w-5 h-5 flex items-center justify-center rounded text-[9px] text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700"
                  title="Turun"
                >↓</button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleElementLock(el.id); }}
                  className={`w-5 h-5 flex items-center justify-center rounded text-[9px] ${el.locked ? 'text-orange-400/70' : 'text-zinc-500 hover:text-zinc-200'}`}
                  title={el.locked ? 'Buka kunci' : 'Kunci posisi'}
                >{el.locked ? '🔒' : '🔓'}</button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleElementVisibility(el.id); }}
                  className={`w-5 h-5 flex items-center justify-center rounded text-[9px] ${el.hidden ? 'text-red-400/50' : 'text-zinc-500 hover:text-zinc-200'}`}
                  title={el.hidden ? 'Tampilkan' : 'Sembunyikan'}
                >👁</button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedElIds.length > 0 && (
        <div className="flex gap-1 mt-3 pt-3 border-t border-zinc-700/30">
          <button
            onClick={() => { selectedElIds.forEach(id => moveElementZ(id, 'top')); }}
            className="flex-1 py-2 rounded-lg text-[9px] font-semibold text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all border border-zinc-700/30"
          >↑ Paling atas</button>
          <button
            onClick={() => { selectedElIds.forEach(id => moveElementZ(id, 'bottom')); }}
            className="flex-1 py-2 rounded-lg text-[9px] font-semibold text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all border border-zinc-700/30"
          >↓ Paling bawah</button>
          <button
            onClick={() => { selectedElIds.forEach(id => deleteElement(id)); }}
            className="py-2 px-3 rounded-lg text-[9px] font-semibold text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition-all border border-zinc-700/30"
          >🗑</button>
        </div>
      )}
    </div>
  );
}

/* ── Templates Tab ──────────────────────────────────────────── */

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  kuis: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Kuis' },
  materi: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Materi' },
  game: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'Game' },
  umum: { bg: 'bg-zinc-500/15', text: 'text-zinc-400', border: 'border-zinc-500/30', label: 'Umum' },
};

// Built-in templates definition
const BUILTIN_TEMPLATES = [
  {
    id: 'builtin-kuis-5',
    name: 'Kuis 5 Soal',
    description: 'Template kuis pilihan ganda dengan 5 soal, timer, dan halaman hasil',
    category: 'kuis' as const,
    pageTypeId: 'kuis-pg',
    config: { jumlahSoal: 5, timer: 2, opsi: '4', apresiasi: true, navbar: true },
  },
  {
    id: 'builtin-materi-4',
    name: 'Materi 4 Halaman',
    description: 'Template materi pembelajaran dengan header dan 4 halaman konten',
    category: 'materi' as const,
    pageTypeId: 'materi',
    config: { jumlahHalaman: 4, navbar: true },
  },
  {
    id: 'builtin-flashcard-8',
    name: 'Flashcard 8 Kartu',
    description: 'Template flashcard dengan 8 kartu belajar depan/belakang',
    category: 'materi' as const,
    pageTypeId: 'flashcard',
    config: { jumlahKartu: 8, navbar: true },
  },
  {
    id: 'builtin-game-petualangan',
    name: 'Game Petualangan',
    description: 'Template game petualangan 3 level dengan skor dan confetti',
    category: 'game' as const,
    pageTypeId: 'game-interactive',
    config: { jumlahLevel: 3, tipeGame: 'petualangan', timer: 2, navbar: true },
  },
];

function TemplatesContent() {
  const { templates, saveAsTemplate, loadTemplate, deleteTemplate, renameTemplate } = useCanvaStore();
  const [tmplName, setTmplName] = useState('');
  const [tmplDesc, setTmplDesc] = useState('');
  const [tmplCategory, setTmplCategory] = useState<CanvaTemplate['category']>('umum');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleSave = () => {
    if (!tmplName.trim()) return;
    saveAsTemplate(tmplName.trim(), tmplDesc.trim(), tmplCategory);
    setTmplName('');
    setTmplDesc('');
    setTmplCategory('umum');
  };

  const handleLoad = (id: string) => {
    if (confirm('Memuat template akan mengganti semua halaman saat ini. Lanjutkan?')) {
      loadTemplate(id);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus template "${name}"?`)) {
      deleteTemplate(id);
    }
  };

  const handleRenameStart = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const handleRenameConfirm = () => {
    if (renamingId && renameValue.trim()) {
      renameTemplate(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleLoadBuiltin = (builtin: typeof BUILTIN_TEMPLATES[number]) => {
    if (confirm(`Memuat template "${builtin.name}" akan mengganti semua halaman saat ini. Lanjutkan?`)) {
      // Use the generateFromPageType action
      const { generateFromPageType } = useCanvaStore.getState();
      const pt = ALL_PAGE_TYPES.find(p => p.id === builtin.pageTypeId);
      if (pt) {
        generateFromPageType(pt, builtin.config);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Save Template Section ─────────────────────────────── */}
      <div>
        <SectionHeader title="Simpan Template" />
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nama template..."
            value={tmplName}
            onChange={e => setTmplName(e.target.value)}
            className="w-full h-7 px-2.5 text-[10px] text-zinc-200 bg-zinc-800/60 border border-zinc-700/40 rounded-lg focus:border-amber-500/40 focus:outline-none placeholder:text-zinc-600"
          />
          <input
            type="text"
            placeholder="Deskripsi (opsional)..."
            value={tmplDesc}
            onChange={e => setTmplDesc(e.target.value)}
            className="w-full h-7 px-2.5 text-[10px] text-zinc-200 bg-zinc-800/60 border border-zinc-700/40 rounded-lg focus:border-amber-500/40 focus:outline-none placeholder:text-zinc-600"
          />
          <div className="flex gap-1">
            {(['kuis', 'materi', 'game', 'umum'] as const).map(cat => {
              const style = CATEGORY_STYLES[cat];
              const isActive = tmplCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setTmplCategory(cat)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-semibold transition-all border ${
                    isActive
                      ? `${style.bg} ${style.text} ${style.border}`
                      : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/20 hover:border-zinc-600'
                  }`}
                >
                  {style.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleSave}
            disabled={!tmplName.trim()}
            className="w-full py-2.5 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
          >
            💾 Simpan Template
          </button>
        </div>
      </div>

      {/* ── Saved Templates Section ──────────────────────────── */}
      <div>
        <SectionHeader title="Template Tersimpan" count={templates.length} />

        {templates.length === 0 && (
          <div className="text-[10px] text-zinc-600 text-center py-6">
            <div className="text-xl mb-2">📭</div>
            Belum ada template tersimpan.
            <br />
            <span className="text-zinc-500">Simpan layout Anda untuk digunakan kembali.</span>
          </div>
        )}

        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-0.5">
          {templates.map(tmpl => {
            const catStyle = CATEGORY_STYLES[tmpl.category] || CATEGORY_STYLES.umum;
            const isRenaming = renamingId === tmpl.id;
            const dateStr = new Date(tmpl.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

            return (
              <div
                key={tmpl.id}
                className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30 hover:border-zinc-600/50 transition-all group"
              >
                {/* Template header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    {isRenaming ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={handleRenameConfirm}
                        onKeyDown={e => { if (e.key === 'Enter') handleRenameConfirm(); if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); } }}
                        className="w-full bg-zinc-800 text-[10px] text-zinc-200 px-1.5 py-0.5 rounded border border-amber-500/30 focus:outline-none"
                      />
                    ) : (
                      <div className="text-[11px] font-bold text-zinc-200 truncate">{tmpl.name}</div>
                    )}
                    {tmpl.description && (
                      <div className="text-[8px] text-zinc-500 truncate mt-0.5">{tmpl.description}</div>
                    )}
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold ${catStyle.bg} ${catStyle.text} border ${catStyle.border} flex-shrink-0`}>
                    {catStyle.label}
                  </span>
                </div>

                {/* Preview dots */}
                <div className="flex gap-1 mb-2 overflow-hidden">
                  {tmpl.pages.slice(0, 8).map((p, i) => (
                    <div
                      key={i}
                      className="w-6 h-4 rounded-[3px] relative flex-shrink-0 border border-zinc-700/40"
                      style={{ background: p.bgColor || '#1a1a2e' }}
                    >
                      <div className="absolute inset-0 overflow-hidden">
                        {p.elements.slice(0, 4).map((el, j) => (
                          <div
                            key={j}
                            className="absolute rounded-[0.5px]"
                            style={{
                              left: `${el.x}%`,
                              top: `${el.y}%`,
                              width: `${Math.max(el.w, 5)}%`,
                              height: `${Math.max(el.h, 5)}%`,
                              background: el.type === 'shape' ? (el.color || 'rgba(255,255,255,.15)') : 'rgba(255,255,255,.1)',
                              opacity: 0.7,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  {tmpl.pages.length > 8 && (
                    <div className="w-6 h-4 rounded-[3px] flex items-center justify-center bg-zinc-800/60 text-[7px] text-zinc-500 flex-shrink-0">
                      +{tmpl.pages.length - 8}
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 text-[8px] text-zinc-500 mb-2">
                  <span>📄 {tmpl.pages.length} hal</span>
                  <span>•</span>
                  <span>{dateStr}</span>
                  <span>•</span>
                  <span>{tmpl.ratioId}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleLoad(tmpl.id)}
                    className="flex-1 py-1.5 rounded-lg text-[9px] font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all flex items-center justify-center gap-1"
                  >
                    📥 Muat
                  </button>
                  <button
                    onClick={() => handleRenameStart(tmpl.id, tmpl.name)}
                    className="py-1.5 px-2.5 rounded-lg text-[9px] font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-zinc-700/30 transition-all"
                    title="Ganti nama"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(tmpl.id, tmpl.name)}
                    className="py-1.5 px-2.5 rounded-lg text-[9px] font-semibold text-red-400/70 hover:text-red-300 hover:bg-red-500/10 border border-zinc-700/30 transition-all"
                    title="Hapus"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Built-in Templates Section ───────────────────────── */}
      <div>
        <SectionHeader title="Template Bawaan" />
        <div className="text-[8px] text-zinc-600 mb-2">Template siap pakai untuk memulai proyek baru</div>

        <div className="space-y-1.5">
          {BUILTIN_TEMPLATES.map(builtin => {
            const catStyle = CATEGORY_STYLES[builtin.category] || CATEGORY_STYLES.umum;
            return (
              <div
                key={builtin.id}
                className="p-2.5 rounded-xl bg-zinc-800/30 border border-zinc-700/20 hover:border-zinc-600/40 transition-all group"
              >
                <div className="flex items-start gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `${catStyle.text === 'text-amber-400' ? '#f59e0b' : catStyle.text === 'text-purple-400' ? '#a855f7' : catStyle.text === 'text-cyan-400' ? '#06b6d4' : '#71717a'}15` }}
                  >
                    {builtin.category === 'kuis' ? '❓' : builtin.category === 'materi' ? '📖' : builtin.category === 'game' ? '🎮' : '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-zinc-200 group-hover:text-amber-300 transition-colors">{builtin.name}</div>
                    <div className="text-[8px] text-zinc-500 leading-relaxed">{builtin.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleLoadBuiltin(builtin)}
                  className="w-full mt-2 py-1.5 rounded-lg text-[9px] font-semibold text-amber-400/80 hover:text-amber-300 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 transition-all"
                >
                  📥 Muat Template
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Reusable ───────────────────────────────────────────────── */

function SectionHeader({ title, count, subtitle }: { title: string; count?: number; subtitle?: string }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{title}</div>
        {count !== undefined && <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 text-[8px] text-zinc-500 font-bold">{count}</span>}
      </div>
      {subtitle && <div className="text-[8px] text-zinc-600 italic">{subtitle}</div>}
    </div>
  );
}
