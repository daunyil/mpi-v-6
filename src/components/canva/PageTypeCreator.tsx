'use client';

import { useState } from 'react';
import { useCanvaStore } from '@/store/canva-store';
import { useAuthoringStore } from '@/store/authoring-store';
import {
  ALL_PAGE_TYPES,
  PAGE_TYPE_CATEGORIES,
  type PageTypeDefinition,
  type PageTypeOption,
} from '@/store/page-types';

interface Config {
  [key: string]: number | string | boolean;
}

export default function PageTypeCreator() {
  const [selectedType, setSelectedType] = useState<PageTypeDefinition | null>(null);
  const [config, setConfig] = useState<Config>({});
  const [show, setShow] = useState(true);

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 hover:from-amber-500/10 hover:to-orange-500/10 border border-amber-500/10 hover:border-amber-500/20 transition-all"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">⚡</span>
          <span className="text-[10px] font-bold text-amber-400">Buat Halaman Otomatis</span>
        </div>
        <span className="text-[9px] text-amber-500/50">▶</span>
      </button>
    );
  }

  // If a type is selected, show config panel
  if (selectedType) {
    return (
      <PageTypeConfig
        pageType={selectedType}
        config={config}
        setConfig={setConfig}
        onBack={() => { setSelectedType(null); setConfig({}); }}
      />
    );
  }

  // Show type selection
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>⚡</span> Auto-Generate
        </div>
        <button onClick={() => setShow(false)} className="text-zinc-600 hover:text-zinc-400 text-[9px]">Sembunyikan</button>
      </div>
      <div className="text-[9px] text-zinc-500 mb-3 leading-relaxed">
        Pilih tipe halaman, sistem akan membuat semua halaman lengkap dengan navbar, skor, progress, dan apresiasi.
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1 mb-2.5">
        {PAGE_TYPE_CATEGORIES.map(cat => (
          <div key={cat.id} className="text-[8px] text-zinc-600 px-2 py-0.5 rounded-md border border-zinc-700/20">
            {cat.label}
          </div>
        ))}
      </div>

      {/* Page type cards */}
      <div className="space-y-1.5">
        {ALL_PAGE_TYPES.map(pt => (
          <button
            key={pt.id}
            onClick={() => {
              setSelectedType(pt);
              const defaults: Config = {};
              pt.options.forEach(opt => { defaults[opt.id] = opt.default; });
              setConfig(defaults);
            }}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-700/20 hover:border-amber-500/30 hover:bg-zinc-800/70 transition-all group text-left"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 group-hover:scale-105 transition-transform"
              style={{ background: `${pt.color}15` }}
            >
              {pt.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-zinc-200 group-hover:text-amber-300 transition-colors">
                {pt.name}
              </div>
              <div className="text-[8px] text-zinc-500 leading-relaxed">{pt.description}</div>
            </div>
            <svg className="text-zinc-700 group-hover:text-amber-500 transition-colors flex-shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Config Panel ──────────────────────────────────────────── */

function PageTypeConfig({
  pageType,
  config,
  setConfig,
  onBack,
}: {
  pageType: PageTypeDefinition;
  config: Config;
  setConfig: (c: Config) => void;
  onBack: () => void;
}) {
  const { generateFromPageType } = useCanvaStore();

  const updateConfig = (key: string, value: number | string | boolean) => {
    setConfig({ ...config, [key]: value });
  };

  const handleGenerate = () => {
    generateFromPageType(pageType, config);
  };

  // Preview: count total pages
  const preview = pageType.generate(config);
  const totalPages = preview.pages.length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
          style={{ background: `${pageType.color}15` }}
        >
          {pageType.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-zinc-200 truncate">{pageType.name}</div>
          <div className="text-[8px] text-zinc-500">{totalPages} halaman akan dibuat</div>
        </div>
      </div>

      {/* Configuration options */}
      <div className="space-y-3 mb-4">
        {pageType.options.map(opt => (
          <ConfigOption
            key={opt.id}
            option={opt}
            value={config[opt.id] ?? opt.default}
            onChange={v => updateConfig(opt.id, v)}
          />
        ))}
      </div>

      {/* Info banner */}
      <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 mb-3">
        <div className="text-[8px] text-amber-400/80 font-bold uppercase tracking-wider mb-1">🤖 Yang Otomatis dari Sistem</div>
        <div className="text-[8px] text-zinc-500 leading-relaxed">
          Navbar navigasi, progress bar, skor,{' '}
          {pageType.id.includes('timer') || (config.timer as number) > 0 ? 'timer, ' : ''}
          confetti, dan halaman apresiasi akan langsung dibuat.
        </div>
        <AuthoringDataStatus pageTypeId={pageType.id} />
      </div>

      {/* Page preview */}
      <div className="mb-4">
        <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider mb-1.5">Preview Halaman</div>
        <div className="flex flex-wrap gap-1">
          {preview.pages.map((p, i) => (
            <div
              key={i}
              className="px-2 py-1 rounded-md text-[8px] font-medium border"
              style={{
                background: `${p.bgColor}80`,
                borderColor: `${pageType.color}30`,
                color: pageType.color,
              }}
            >
              {p.label}
            </div>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        className="w-full py-3 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        <span>⚡</span>
        Generate {totalPages} Halaman
      </button>
    </div>
  );
}

/* ── Config Option Renderer ────────────────────────────────── */

function ConfigOption({
  option,
  value,
  onChange,
}: {
  option: PageTypeOption;
  value: number | string | boolean;
  onChange: (v: number | string | boolean) => void;
}) {
  if (option.type === 'number') {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-zinc-400 font-medium">{option.label}</span>
          <span className="text-[9px] text-amber-400 font-bold font-mono">{value}</span>
        </div>
        <input
          type="range"
          min={option.min}
          max={option.max}
          step={option.step || 1}
          value={value as number}
          onChange={e => onChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-[7px] text-zinc-700 font-mono">
          <span>{option.min}</span>
          <span>{option.max}</span>
        </div>
      </div>
    );
  }

  if (option.type === 'select') {
    return (
      <div className="space-y-1">
        <span className="text-[9px] text-zinc-400 font-medium">{option.label}</span>
        <div className="flex flex-wrap gap-1">
          {option.options?.map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-semibold transition-all border ${
                value === opt.value
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/30 hover:border-zinc-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (option.type === 'toggle') {
    return (
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-zinc-400 font-medium">{option.label}</span>
        <button
          onClick={() => onChange(!value)}
          className={`w-9 h-5 rounded-full transition-all relative ${
            value ? 'bg-amber-500 shadow-sm shadow-amber-500/30' : 'bg-zinc-700'
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              value ? 'left-[18px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    );
  }

  return null;
}

/* ── Authoring Data Status Indicator ──────────────────────── */

function AuthoringDataStatus({ pageTypeId }: { pageTypeId: string }) {
  const kuis = useAuthoringStore(s => s.kuis);
  const meta = useAuthoringStore(s => s.meta);
  const isKuis = pageTypeId.includes('kuis') || pageTypeId.includes('timer');

  if (!isKuis && !meta.judulPertemuan) return null;
  if (isKuis && kuis.length === 0 && !meta.judulPertemuan) return null;

  return (
    <div className="mt-2 pt-2 border-t border-amber-500/10">
      <div className="text-[8px] text-green-400/70 font-bold uppercase tracking-wider mb-1">📦 Data dari Authoring Tool</div>
      <div className="text-[8px] text-zinc-500 leading-relaxed">
        {meta.judulPertemuan && <span className="text-zinc-400">📄 {meta.judulPertemuan}</span>}
        {isKuis && kuis.length > 0 && (
          <span className="text-zinc-400 block mt-0.5">
            ❓ {kuis.length} soal tersedia — akan otomatis terisi ke halaman soal
          </span>
        )}
      </div>
    </div>
  );
}
