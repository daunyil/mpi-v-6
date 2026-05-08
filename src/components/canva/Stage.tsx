'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useCanvaStore } from '@/store/canva-store';
import type { CanvaElement, ResizeDir } from './types';

export default function Stage({ onMouseMove }: { onMouseMove: (x: number, y: number) => void }) {
  const {
    pages,
    currentPageIndex,
    ratioId,
    zoom,
    tool,
    selectedElIds,
    selectElement,
    deselectAll,
    addElement,
    updateElement,
  } = useCanvaStore();

  const page = pages[currentPageIndex];
  const ratio = useCanvaStore(s => s.currentRatio());

  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [baseScale, setBaseScale] = useState(0.5);
  const [stageW, setStageW] = useState(ratio.w);
  const [stageH, setStageH] = useState(ratio.h);

  // Drag & resize state
  const dragState = useRef<{
    type: 'move' | 'resize';
    elId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW?: number;
    origH?: number;
    dir?: ResizeDir;
  } | null>(null);

  // Track mouse position
  const handleAreaMouseMove = useCallback((e: React.MouseEvent) => {
    if (!stageWrapRef.current) return;
    const rect = stageWrapRef.current.getBoundingClientRect();
    const scale = baseScale * zoom;
    const x = Math.round((e.clientX - rect.left) / scale);
    const y = Math.round((e.clientY - rect.top) / scale);
    if (x >= 0 && y >= 0 && x <= stageW && y <= stageH) {
      onMouseMove(x, y);
    }

    if (!dragState.current || !canvasAreaRef.current) return;

    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    const dxPct = dx / scale / stageW * 100;
    const dyPct = dy / scale / stageH * 100;

    if (dragState.current.type === 'move') {
      const newX = Math.max(0, Math.min(90, dragState.current.origX + dxPct));
      const newY = Math.max(0, Math.min(90, dragState.current.origY + dyPct));
      updateElement(dragState.current.elId, { x: newX, y: newY });
    } else if (dragState.current.type === 'resize') {
      const dir = dragState.current.dir!;
      const orig = {
        x: dragState.current.origX,
        y: dragState.current.origY,
        w: dragState.current.origW!,
        h: dragState.current.origH!,
      };

      let newX = orig.x, newY = orig.y, newW = orig.w, newH = orig.h;

      if (dir.includes('r')) newW = Math.max(10, orig.w + dxPct);
      if (dir.includes('b')) newH = Math.max(8, orig.h + dyPct);
      if (dir.includes('l')) {
        newX = Math.min(orig.x + orig.w - 10, orig.x + dxPct);
        newW = Math.max(10, orig.w - dxPct);
      }
      if (dir.includes('t')) {
        newY = Math.min(orig.y + orig.h - 8, orig.y + dyPct);
        newH = Math.max(8, orig.h - dyPct);
      }

      updateElement(dragState.current.elId, { x: newX, y: newY, w: newW, h: newH });
    }
  }, [baseScale, zoom, stageW, stageH, updateElement, onMouseMove]);

  const handleMouseUp = useCallback(() => {
    dragState.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  // ResizeObserver for responsive scaling
  useEffect(() => {
    const area = canvasAreaRef.current;
    if (!area) return;
    const observer = new ResizeObserver(() => {
      const aW = (area.clientWidth || 800) - 60;
      const aH = (area.clientHeight || 500) - 60;
      const scaleW = aW / ratio.w;
      const scaleH = aH / ratio.h;
      setBaseScale(Math.min(scaleW, scaleH, 1));
      setStageW(ratio.w);
      setStageH(ratio.h);
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, [ratio]);

  // Handle drop from element panel
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const elType = e.dataTransfer.getData('elemType');
    if (!elType) return;
    const rect = stageWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = baseScale * zoom;
    const x = Math.max(2, Math.min(80, (e.clientX - rect.left) / scale / stageW * 100));
    const y = Math.max(2, Math.min(85, (e.clientY - rect.top) / scale / stageH * 100));
    addElement(elType, parseFloat(x.toFixed(1)), parseFloat(y.toFixed(1)));
  }, [baseScale, zoom, stageW, stageH, addElement]);

  // Handle click on stage background
  const handleStageBgClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.id !== 'cm-stage-wrap' && target.id !== 'cm-stage-bg' && target.id !== 'cm-canvas-area' && target.id !== 'cm-stage-bg-overlay') return;

    if (tool === 'text') {
      const rect = stageWrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scale = baseScale * zoom;
      const x = Math.max(2, Math.min(80, (e.clientX - rect.left) / scale / stageW * 100));
      const y = Math.max(2, Math.min(85, (e.clientY - rect.top) / scale / stageH * 100));
      addElement('teks', parseFloat(x.toFixed(1)), parseFloat(y.toFixed(1)));
      useCanvaStore.getState().setTool('select');
      return;
    }

    deselectAll();
  };

  const scale = baseScale * zoom;

  if (!page) return null;

  const multiSelectCount = selectedElIds.length;

  return (
    <div
      ref={canvasAreaRef}
      id="cm-canvas-area"
      className="flex-1 bg-[var(--bg-primary)] overflow-auto flex items-center justify-center relative"
      style={{ cursor: tool === 'text' ? 'text' : 'default' }}
      onMouseMove={handleAreaMouseMove}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
      onDrop={handleDrop}
    >
      <div className="relative">
        <div
          ref={stageWrapRef}
          id="cm-stage-wrap"
          className="relative overflow-hidden shadow-2xl shadow-black/50"
          style={{
            width: stageW,
            height: stageH,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
          onMouseDown={handleStageBgClick}
        >
          {/* Background color */}
          <div
            id="cm-stage-bg"
            className="absolute inset-0"
            style={{ background: page.bgColor || '#1a1a2e' }}
          />

          {/* Background image */}
          {page.bgDataUrl && (
            <img
              src={page.bgDataUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Overlay */}
          <div
            id="cm-stage-bg-overlay"
            className="absolute inset-0 pointer-events-none"
            style={{ background: `rgba(14,28,47,${(page.overlay || 20) / 100})` }}
          />

          {/* Elements container */}
          <div className="absolute inset-0">
            {page.elements.map(el => {
              const isSelected = selectedElIds.includes(el.id);
              const isPrimary = isSelected && selectedElIds[0] === el.id;
              return (
                <StageElement
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  isPrimary={isPrimary}
                  onSelect={(shiftKey) => selectElement(el.id, shiftKey)}
                  onStartDrag={(startX, startY) => {
                    // Skip drag if element is locked
                    if (el.locked) return;
                    dragState.current = {
                      type: 'move',
                      elId: el.id,
                      startX,
                      startY,
                      origX: el.x,
                      origY: el.y,
                    };
                  }}
                  onStartResize={(dir, startX, startY) => {
                    // Skip resize if element is locked
                    if (el.locked) return;
                    dragState.current = {
                      type: 'resize',
                      elId: el.id,
                      startX,
                      startY,
                      origX: el.x,
                      origY: el.y,
                      origW: el.w,
                      origH: el.h,
                      dir,
                    };
                  }}
                />
              );
            })}
          </div>

          {/* Drop hint */}
          {page.elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-3xl mb-3 opacity-30">🎨</div>
                <div className="text-zinc-600 text-sm">Pilih ⚡ Auto-Generate atau seret elemen</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Multi-select indicator badge */}
      {multiSelectCount > 1 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
          <div className="px-3 py-1.5 rounded-full bg-amber-500/90 text-amber-950 text-[11px] font-bold shadow-lg shadow-amber-500/20 flex items-center gap-1.5">
            <span className="text-[13px]">☑️</span>
            {multiSelectCount} selected
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAGE ELEMENT — Complete renderer for ALL element types
   ═══════════════════════════════════════════════════════════════ */

function StageElement({
  element,
  isSelected,
  isPrimary,
  onSelect,
  onStartDrag,
  onStartResize,
}: {
  element: CanvaElement;
  isSelected: boolean;
  isPrimary: boolean;
  onSelect: (shiftKey: boolean) => void;
  onStartDrag: (startX: number, startY: number) => void;
  onStartResize: (dir: ResizeDir, startX: number, startY: number) => void;
}) {
  const { updateElement, deleteElement, saveTextContent } = useCanvaStore();
  const textRef = useRef<HTMLDivElement>(null);
  const isLocked = !!element.locked;
  const isSys = !!element.system;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(e.shiftKey);
    // Don't start drag if locked
    if (isLocked) return;
    onStartDrag(e.clientX, e.clientY);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, dir: ResizeDir) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLocked) return;
    onStartResize(dir, e.clientX, e.clientY);
  };

  const handleTextBlur = () => {
    if (textRef.current) {
      saveTextContent(element.id, textRef.current.textContent || '');
    }
  };

  // Determine ring color based on element type and lock state
  const ringColor = isLocked
    ? 'ring-orange-400/60'
    : isSys
      ? 'ring-blue-400/60'
      : 'ring-amber-400/60';

  const handleBarBg = isLocked
    ? 'bg-orange-500/90 text-orange-950'
    : isSys
      ? 'bg-blue-500/90 text-blue-950'
      : 'bg-amber-500/90 text-amber-950';

  return (
    <div
      className={`absolute group ${isSelected ? 'ring-2 ring-offset-0 z-10' : 'z-0'} ${element.hidden ? 'hidden' : ''} ${isLocked && isSelected ? `ring-2 ${ringColor}` : ''}`}
      style={{
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${element.w}%`,
        height: `${element.h}%`,
        opacity: (element.opacity ?? 100) / 100,
        cursor: isLocked ? 'not-allowed' : undefined,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Handle bar — only for primary selection */}
      {isSelected && isPrimary && (
        <div className={`absolute -top-5 left-0 right-0 flex items-center justify-between px-1 rounded-t text-[9px] font-bold z-20 ${handleBarBg}`}>
          <span className="truncate">
            {isLocked && <span className="mr-0.5">🔒</span>}
            {isSys && !isLocked && <span className="mr-0.5">⚙️</span>}
            {element.icon} {element.label || element.type}
          </span>
          <button
            onClick={e => { e.stopPropagation(); deleteElement(element.id); }}
            className="ml-1 hover:text-red-700 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Selection ring — shown on ALL selected elements */}
      {isSelected && (
        <div className={`absolute inset-0 rounded-sm ring-2 pointer-events-none ${ringColor}`} />
      )}

      {/* Lock icon indicator for non-primary selected locked elements */}
      {isSelected && isLocked && !isPrimary && (
        <div className="absolute -top-1 -right-1 z-20 text-[10px] bg-orange-500/90 rounded-full w-4 h-4 flex items-center justify-center">🔒</div>
      )}

      {/* ═══ Element Body ═══ */}
      <div className="w-full h-full overflow-hidden">
        <ElementBody element={element} textRef={textRef} onTextBlur={handleTextBlur} />
      </div>

      {/* Resize handles — only for primary selection AND not locked */}
      {isSelected && isPrimary && !isLocked && (
        <>
          {(['tl', 'tr', 'bl', 'br'] as ResizeDir[]).map(dir => (
            <div
              key={dir}
              onMouseDown={e => handleResizeMouseDown(e, dir)}
              className={`absolute w-3 h-3 rounded-sm z-30 cursor-${
                dir === 'tl' || dir === 'br' ? 'nwse-resize' : 'nesw-resize'
              } ${
                isSys
                  ? 'bg-blue-400 border border-blue-600'
                  : 'bg-amber-400 border border-amber-600'
              }`}
              style={{
                top: dir.includes('t') ? -5 : 'auto',
                bottom: dir.includes('b') ? -5 : 'auto',
                left: dir.includes('l') ? -5 : 'auto',
                right: dir.includes('r') ? -5 : 'auto',
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ELEMENT BODY — Visual rendering per type
   ═══════════════════════════════════════════════════════════════ */

function ElementBody({
  element,
  textRef,
  onTextBlur,
}: {
  element: CanvaElement;
  textRef: React.RefObject<HTMLDivElement | null>;
  onTextBlur: () => void;
}) {
  switch (element.type) {
    case 'navbar':
      return <NavbarBody element={element} />;
    case 'button':
      return <ButtonBody element={element} />;
    case 'badge':
      return <BadgeBody element={element} />;
    case 'progress':
      return <ProgressBody element={element} />;
    case 'score':
      return <ScoreBody element={element} />;
    case 'timer':
      return <TimerBody element={element} />;
    case 'confetti':
      return <ConfettiBody element={element} />;
    case 'divider':
      return <DividerBody element={element} />;
    case 'teks':
      return <TeksBody element={element} textRef={textRef} onTextBlur={onTextBlur} />;
    case 'shape':
      return <ShapeBody element={element} />;
    case 'kuis':
      return <KuisBody element={element} />;
    case 'game':
      return <GameBody element={element} />;
    case 'materi':
      return <MateriBody element={element} />;
    case 'modul':
      return <ModulBody element={element} />;
    case 'gambar':
      return <GambarBody element={element} />;
    default:
      return <FallbackBody element={element} />;
  }
}

/* ── NAVBAR ────────────────────────────────────────────────── */

function NavbarBody({ element }: { element: CanvaElement }) {
  const style = element.navStyle || 'bottom-bar';
  const bgColor = element.color || '#1e293b';

  // Get page count from store for breadcrumb display
  const pages = useCanvaStore(s => s.pages);
  const currentPageIndex = useCanvaStore(s => s.currentPageIndex);
  const totalPages = pages.length;

  if (style === 'dots') {
    return (
      <div
        className="w-full h-full flex items-center justify-center gap-2"
        style={{ background: bgColor }}
      >
        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === currentPageIndex ? 10 : 6,
              height: 6,
              background: i === currentPageIndex ? '#f59e0b' : 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>
    );
  }

  if (style === 'breadcrumb') {
    return (
      <div
        className="w-full h-full flex items-center justify-center gap-1.5 px-4"
        style={{ background: bgColor }}
      >
        {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="px-2 py-0.5 rounded text-[10px] font-semibold"
              style={{
                background: i === currentPageIndex ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)',
                color: i === currentPageIndex ? '#f59e0b' : 'rgba(255,255,255,0.5)',
              }}
            >
              {i + 1}
            </div>
            {i < Math.min(totalPages, 6) - 1 && (
              <div className="w-3 h-px bg-white/10" />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Default: bottom-bar with prev/next
  return (
    <div
      className="w-full h-full flex items-center justify-between px-4"
      style={{ background: bgColor }}
    >
      {/* Prev */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
        style={{
          background: currentPageIndex > 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
          opacity: currentPageIndex > 0 ? 1 : 0.3,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        <span className="text-[10px] font-semibold text-white/70">Sebelumnya</span>
      </div>

      {/* Page dots */}
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: i === currentPageIndex ? 8 : 4,
              height: 4,
              background: i === currentPageIndex ? '#f59e0b' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Next */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
        style={{
          background: currentPageIndex < totalPages - 1 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
          opacity: currentPageIndex < totalPages - 1 ? 1 : 0.3,
        }}
      >
        <span className="text-[10px] font-semibold" style={{ color: currentPageIndex < totalPages - 1 ? '#f59e0b' : 'rgba(255,255,255,0.3)' }}>
          {currentPageIndex < totalPages - 2 ? 'Selanjutnya' : 'Selesai'}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={currentPageIndex < totalPages - 1 ? '#f59e0b' : 'rgba(255,255,255,0.3)'} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </div>
  );
}

/* ── BUTTON ────────────────────────────────────────────────── */

function ButtonBody({ element }: { element: CanvaElement }) {
  const bgColor = element.color || '#3b82f6';
  const radius = element.radius || 10;

  return (
    <div
      className="w-full h-full flex items-center justify-center cursor-pointer hover:brightness-110 transition-all"
      style={{
        background: bgColor,
        borderRadius: radius,
        boxShadow: `0 4px 16px ${bgColor}40`,
      }}
    >
      <span className="text-white font-bold text-shadow-sm" style={{ fontSize: 'clamp(11px, 1.2vw, 16px)' }}>
        {element.text || 'Tombol'}
      </span>
    </div>
  );
}

/* ── BADGE ─────────────────────────────────────────────────── */

function BadgeBody({ element }: { element: CanvaElement }) {
  const bgColor = element.color || '#f59e0b';

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-1"
      style={{
        background: `${bgColor}15`,
        border: `1px solid ${bgColor}30`,
        borderRadius: element.radius || 12,
      }}
    >
      <span className="text-xl">{element.icon || '🏷️'}</span>
      <span className="text-[11px] font-bold" style={{ color: bgColor }}>
        {element.text || element.label || 'Badge'}
      </span>
    </div>
  );
}

/* ── PROGRESS BAR ──────────────────────────────────────────── */

function ProgressBody({ element }: { element: CanvaElement }) {
  const progressColor = element.color || '#22c55e';
  // Parse text as percentage (0-100)
  const pct = parseFloat(element.text || '0') || 0;

  return (
    <div className="w-full h-full flex flex-col justify-center gap-1 px-1">
      {/* Label */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[9px] text-white/50 font-medium">📊 {element.label || 'Progress'}</span>
        <span className="text-[9px] font-bold" style={{ color: progressColor }}>{Math.round(pct)}%</span>
      </div>
      {/* Bar track */}
      <div className="w-full h-2/3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.max(2, Math.min(100, pct))}%`,
            background: `linear-gradient(90deg, ${progressColor}, ${progressColor}cc)`,
            boxShadow: `0 0 8px ${progressColor}40`,
          }}
        />
      </div>
    </div>
  );
}

/* ── SCORE DISPLAY ─────────────────────────────────────────── */

function ScoreBody({ element }: { element: CanvaElement }) {
  const scoreColor = element.color || '#fbbf24';

  return (
    <div
      className="w-full h-full flex items-center justify-center gap-1.5 rounded-xl"
      style={{
        background: `${scoreColor}12`,
        border: `1px solid ${scoreColor}25`,
      }}
    >
      <span className="text-sm">⭐</span>
      <div className="flex flex-col items-start">
        <span className="text-[7px] text-white/40 font-semibold uppercase tracking-wider">Skor</span>
        <span className="text-[14px] font-black" style={{ color: scoreColor }}>
          {element.text || '0'}
        </span>
      </div>
    </div>
  );
}

/* ── TIMER DISPLAY ─────────────────────────────────────────── */

function TimerBody({ element }: { element: CanvaElement }) {
  const timerColor = element.color || '#ef4444';

  return (
    <div
      className="w-full h-full flex items-center justify-center gap-2 rounded-xl"
      style={{
        background: `${timerColor}10`,
        border: `1px solid ${timerColor}20`,
      }}
    >
      <span className="text-sm animate-pulse">⏱️</span>
      <span className="text-[16px] font-mono font-black tracking-wider" style={{ color: timerColor }}>
        {element.text || '02:00'}
      </span>
    </div>
  );
}

/* ── CONFETTI (placeholder visual) ─────────────────────────── */

function ConfettiBody({ element }: { element: CanvaElement }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-lg">
      {/* Decorative particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { color: '#f59e0b', x: '15%', y: '20%', size: 6, delay: 0 },
          { color: '#ef4444', x: '35%', y: '35%', size: 8, delay: 0.3 },
          { color: '#3b82f6', x: '55%', y: '15%', size: 5, delay: 0.6 },
          { color: '#22c55e', x: '75%', y: '40%', size: 7, delay: 0.2 },
          { color: '#a855f7', x: '85%', y: '25%', size: 6, delay: 0.8 },
          { color: '#ec4899', x: '25%', y: '55%', size: 5, delay: 0.4 },
          { color: '#f59e0b', x: '65%', y: '60%', size: 4, delay: 0.7 },
          { color: '#06b6d4', x: '45%', y: '50%', size: 6, delay: 0.1 },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size * 1.5,
              background: p.color,
              transform: `rotate(${i * 45}deg)`,
              opacity: 0.6,
              animation: `confettiFall 2s ease-in-out ${p.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>
      {/* Center icon */}
      <div className="relative z-10 text-center">
        <div className="text-2xl">🎉</div>
        {element.label && (
          <div className="text-[9px] text-white/40 font-medium mt-1">{element.label}</div>
        )}
      </div>
      {/* CSS animation */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: rotate(0deg) translateY(0); opacity: 0.3; }
          100% { transform: rotate(180deg) translateY(15px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

/* ── DIVIDER ───────────────────────────────────────────────── */

function DividerBody({ element }: { element: CanvaElement }) {
  const color = element.color || 'rgba(255,255,255,0.1)';
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full" style={{ background: color }} />
    </div>
  );
}

/* ── TEKS (editable) ───────────────────────────────────────── */

function TeksBody({
  element,
  textRef,
  onTextBlur,
}: {
  element: CanvaElement;
  textRef: React.RefObject<HTMLDivElement | null>;
  onTextBlur: () => void;
}) {
  return (
    <div
      ref={textRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={onTextBlur}
      className="w-full h-full outline-none text-white"
      style={{
        fontSize: `${element.fontSize || 20}px`,
        fontWeight: 700,
        textShadow: '0 2px 8px rgba(0,0,0,.5)',
        lineHeight: 1.4,
        padding: 8,
        wordBreak: 'break-word',
        overflow: 'auto',
      }}
    >
      {element.text || 'Ketik teks…'}
    </div>
  );
}

/* ── SHAPE ─────────────────────────────────────────────────── */

function ShapeBody({ element }: { element: CanvaElement }) {
  return (
    <div
      className="w-full h-full"
      style={{
        background: element.color || 'rgba(255,255,255,.15)',
        borderRadius: element.radius || 8,
      }}
    />
  );
}

/* ── KUIS ──────────────────────────────────────────────────── */

function KuisBody({ element }: { element: CanvaElement }) {
  return (
    <div className="p-3 h-full bg-amber-500/10 rounded-lg border border-amber-500/20">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-sm">❓</div>
        <div>
          <div className="text-[11px] font-bold text-amber-300">{element.label || 'Kuis'}</div>
          <div className="text-[9px] text-amber-200/50">Pilihan ganda interaktif</div>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-2 bg-amber-500/10 rounded w-full" />
        <div className="h-2 bg-amber-500/10 rounded w-4/5" />
        <div className="h-2 bg-amber-500/10 rounded w-3/5" />
      </div>
      <div className="mt-2 flex gap-1">
        <div className="flex-1 h-5 rounded bg-amber-500/8 border border-amber-500/10" />
        <div className="flex-1 h-5 rounded bg-amber-500/8 border border-amber-500/10" />
      </div>
    </div>
  );
}

/* ── GAME ──────────────────────────────────────────────────── */

function GameBody({ element }: { element: CanvaElement }) {
  return (
    <div className="p-3 h-full bg-cyan-500/10 rounded-lg border border-cyan-500/20 flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center text-2xl mb-2">🎮</div>
      <div className="text-[11px] font-bold text-cyan-300">{element.label || 'Game Interaktif'}</div>
      <div className="text-[9px] text-cyan-200/40 mt-0.5">Klik untuk bermain</div>
    </div>
  );
}

/* ── MATERI ────────────────────────────────────────────────── */

function MateriBody({ element }: { element: CanvaElement }) {
  return (
    <div className="p-3 h-full bg-purple-500/10 rounded-lg border border-purple-500/20">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">📝</div>
        <div className="text-[11px] font-bold text-purple-300">{element.label || 'Materi'}</div>
      </div>
      <div className="space-y-1.5">
        <div className="h-1.5 bg-purple-500/10 rounded w-full" />
        <div className="h-1.5 bg-purple-500/10 rounded w-full" />
        <div className="h-1.5 bg-purple-500/10 rounded w-4/5" />
      </div>
    </div>
  );
}

/* ── MODUL ─────────────────────────────────────────────────── */

const MODUL_TYPE_MAP: Record<string, { icon: string; color: string; label: string; desc: string }> = {
  'skenario': { icon: '🎭', color: '#f9c82e', label: 'Skenario Interaktif', desc: 'Pilihan bercabang' },
  'video': { icon: '🎥', color: '#ff6b6b', label: 'Video Embed', desc: 'Video pembelajaran' },
  'flashcard': { icon: '🃏', color: '#3ecfcf', label: 'Flashcard', desc: 'Kartu bolak-balik' },
  'infografis': { icon: '📊', color: '#a78bfa', label: 'Infografis', desc: 'Kartu konsep visual' },
  'studi-kasus': { icon: '📰', color: '#fb923c', label: 'Studi Kasus', desc: 'Analisis kasus' },
  'debat': { icon: '🗣️', color: '#f87171', label: 'Debat & Polling', desc: 'Pro dan kontra' },
  'timeline': { icon: '📅', color: '#34d399', label: 'Timeline', desc: 'Urutan peristiwa' },
  'matching': { icon: '🔀', color: '#60a5fa', label: 'Game Pasangkan', desc: 'Cocokkan istilah' },
  'materi': { icon: '📖', color: '#a1a1aa', label: 'Materi Teks', desc: 'Konten bacaan' },
  'truefalse': { icon: '✅', color: '#34d399', label: 'Benar / Salah', desc: 'Pernyataan B/S' },
  'memory': { icon: '🧠', color: '#a78bfa', label: 'Memory Match', desc: 'Cocokkan kartu' },
  'roda': { icon: '🎡', color: '#fb923c', label: 'Roda Putar', desc: 'Pilihan acak' },
};

function ModulBody({ element }: { element: CanvaElement }) {
  const modulType = element.modulType || '';
  const info = MODUL_TYPE_MAP[modulType] || { icon: element.icon || '🧩', color: element.color || '#34d399', label: 'Modul', desc: 'Aktivitas pembelajaran' };
  const colorBase = info.color;
  // Convert hex to RGB for alpha usage
  const r = parseInt(colorBase.slice(1, 3), 16);
  const g = parseInt(colorBase.slice(3, 5), 16);
  const b = parseInt(colorBase.slice(5, 7), 16);

  return (
    <div
      className="p-3 h-full rounded-lg flex flex-col items-center justify-center"
      style={{
        background: `rgba(${r},${g},${b},0.08)`,
        border: `1px solid rgba(${r},${g},${b},0.2)`,
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2"
        style={{ background: `rgba(${r},${g},${b},0.15)` }}
      >
        {info.icon}
      </div>
      <div className="text-[11px] font-bold" style={{ color: colorBase }}>{element.label || info.label}</div>
      <div className="text-[9px] mt-0.5" style={{ color: `rgba(${r},${g},${b},0.5)` }}>{info.desc}</div>
    </div>
  );
}

/* ── GAMBAR ─────────────────────────────────────────────── */

function GambarBody({ element }: { element: CanvaElement }) {
  if (element.dataUrl) {
    return (
      <div className="w-full h-full overflow-hidden rounded-lg">
        <img src={element.dataUrl} alt={element.label || 'Gambar'} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center rounded-lg"
      style={{ background: 'rgba(168,85,247,0.08)', border: '1px dashed rgba(168,85,247,0.3)' }}
    >
      <span className="text-2xl">🖼️</span>
      <span className="text-[9px] mt-1" style={{ color: 'rgba(168,85,247,0.5)' }}>{element.label || 'Gambar'}</span>
    </div>
  );
}

/* ── FALLBACK ──────────────────────────────────────────────── */

function FallbackBody({ element }: { element: CanvaElement }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 rounded-lg border border-white/10">
      <span className="text-lg">{element.icon || '❓'}</span>
      <span className="text-[9px] text-white/40 mt-1">{element.label || element.type}</span>
    </div>
  );
}
