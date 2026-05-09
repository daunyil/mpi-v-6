'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuthoringStore } from '@/store/authoring-store';
import { useCanvaStore } from '@/store/canva-store';
import { unifiedExport, detectExportMode } from '@/lib/sync-bridge';
import { exportProject } from '@/lib/template-engine/bridge';

// ── Preview mode ──────────────────────────────────────────────
type PreviewMode = 'canvas' | 'template';

// ── Screen definitions for authoring navigation ───────────────
const SCREEN_OPTIONS = [
  { id: 's-cover', label: '🎬 Cover' },
  { id: 's-cp', label: '📋 CP / TP / ATP' },
  { id: 's-sk', label: '🎭 Skenario' },
  { id: 's-materi', label: '📖 Materi & Fungsi' },
  { id: 's-kuis', label: '❓ Kuis' },
  { id: 's-hasil', label: '📊 Hasil' },
  { id: 's-penutup', label: '🎓 Penutup' },
];

// ── Device mode options ───────────────────────────────────────
const DEVICE_MODES = [
  { id: 'mobile' as const, label: '📱', width: 390, description: 'Mobile' },
  { id: 'tablet' as const, label: '📱', width: 768, description: 'Tablet' },
  { id: 'desktop' as const, label: '🖥️', width: 0, description: 'Desktop' },
];

type DeviceMode = 'mobile' | 'tablet' | 'desktop';

export default function LivePreview() {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [activeScreen, setActiveScreen] = useState('s-cover');
  const [htmlContent, setHtmlContent] = useState('');
  const [canvasSlideIdx, setCanvasSlideIdx] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Canvas store subscriptions ──────────────────────────────
  const canvasPages = useCanvaStore((s) => s.pages);
  const hasCanvasContent = canvasPages.some(p => p.elements.length > 0);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('canvas');

  // Auto-detect mode: canvas if there are canvas elements, otherwise template (new engine)
  useEffect(() => {
    if (hasCanvasContent) {
      setPreviewMode('canvas');
    } else {
      setPreviewMode('template');
    }
  }, [hasCanvasContent]);

  // ── Authoring store subscriptions ───────────────────────────
  const meta = useAuthoringStore((s) => s.meta);
  const cp = useAuthoringStore((s) => s.cp);
  const tp = useAuthoringStore((s) => s.tp);
  const atp = useAuthoringStore((s) => s.atp);
  const alur = useAuthoringStore((s) => s.alur);
  const skenario = useAuthoringStore((s) => s.skenario);
  const kuis = useAuthoringStore((s) => s.kuis);
  const materi = useAuthoringStore((s) => s.materi);
  const modules = useAuthoringStore((s) => s.modules);
  const games = useAuthoringStore((s) => s.games);
  const dirty = useAuthoringStore((s) => s.dirty);

  // ── Generate HTML with debounce ────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        if (previewMode === 'canvas') {
          const html = useCanvaStore.getState().exportSlideshowHTML();
          setHtmlContent(html);
        } else {
          // Template Engine — use unified export (includes authoring data)
          const html = unifiedExport('template');
          setHtmlContent(html);
        }
      } catch (err) {
        console.error('Failed to generate preview HTML:', err);
      }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [previewMode, meta, cp, tp, atp, alur, skenario, kuis, materi, modules, games, canvasPages]);

  // ── Inject navigation override script (authoring mode) ─────
  const srcdoc = useMemo(() => {
    if (!htmlContent) return '';

    if (previewMode === 'canvas') {
      // For canvas mode, inject a script that navigates to the selected slide
      const navScript = `
<script>
  (function(){
    // Navigate to selected slide
    function goToCanvasSlide(idx) {
      if (typeof showSlide === 'function') {
        showSlide(idx);
      }
    }
    // Override navigation to communicate with parent
    var _origNext = window.nextSlide;
    var _origPrev = window.prevSlide;
    window.nextSlide = function() {
      if (_origNext) _origNext();
      setTimeout(function() {
        window.parent.postMessage({ type: 'canvasSlideChange', getCurrentSlide: true }, '*');
      }, 50);
    };
    window.prevSlide = function() {
      if (_origPrev) _origPrev();
      setTimeout(function() {
        window.parent.postMessage({ type: 'canvasSlideChange', getCurrentSlide: true }, '*');
      }, 50);
    };
    // Navigate to the selected slide after load
    document.addEventListener('DOMContentLoaded', function(){
      goToCanvasSlide(${canvasSlideIdx});
    });
    if (document.readyState !== 'loading') {
      goToCanvasSlide(${canvasSlideIdx});
    }
  })();
<\/script>`;
      return htmlContent.replace('</body>', navScript + '\n</body>');
    }

    // Authoring/Template mode: inject screen navigation override
    const navScript = `
<script>
  // Override goScreen to also update parent via postMessage
  (function(){
    var _origGo = window.goScreen;
    window.goScreen = function(id) {
      if (_origGo) _origGo(id);
      window.parent.postMessage({ type: 'screenChange', screen: id }, '*');
    };
    // Navigate to the selected screen after DOM ready
    document.addEventListener('DOMContentLoaded', function(){
      if (window.goScreen && '${activeScreen}') {
        goScreen('${activeScreen}');
      }
    });
    // If already loaded (e.g. re-navigated), run immediately
    if (document.readyState !== 'loading') {
      if (window.goScreen && '${activeScreen}') {
        goScreen('${activeScreen}');
      }
    }
  })();
<\/script>`;
    return htmlContent.replace('</body>', navScript + '\n</body>');
  }, [htmlContent, activeScreen, previewMode, canvasSlideIdx]);

  // ── Listen for messages from iframe ────────────────────────
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'screenChange' && e.data.screen) {
        setActiveScreen(e.data.screen);
      }
      if (e.data?.type === 'canvasSlideChange') {
        // Sync the slide index from iframe
        // The iframe will send this after navigation
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const currentDevice = DEVICE_MODES.find((d) => d.id === deviceMode) || DEVICE_MODES[2];

  // Device frame classes based on mode
  const getDeviceFrameClasses = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'max-w-[390px] rounded-[2rem] border-4 border-zinc-700 shadow-xl';
      case 'tablet':
        return 'max-w-[768px] rounded-xl border-2 border-zinc-700 shadow-lg';
      case 'desktop':
      default:
        return 'w-full rounded-xl border-2 border-zinc-800 shadow-2xl';
    }
  };

  // Device frame container styles
  const getDeviceFrameStyle = (): React.CSSProperties => {
    switch (deviceMode) {
      case 'mobile':
        return { width: '390px', height: 'min(720px, calc(100vh - 120px))' };
      case 'tablet':
        return { width: '768px', maxWidth: '100%', height: 'min(720px, calc(100vh - 120px))' };
      case 'desktop':
      default:
        return { width: '100%', height: 'calc(100vh - 120px)' };
    }
  };

  // Canvas page options for navigation dropdown
  const canvasPageOptions = canvasPages.map((p, i) => ({
    id: String(i),
    label: `${i + 1}. ${p.label || 'Halaman ' + (i + 1)}`,
  }));

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* ── Toolbar ──────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center gap-3 flex-wrap">
        {/* Preview mode toggle */}
        <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => setPreviewMode('canvas')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
              previewMode === 'canvas'
                ? 'bg-amber-500/15 text-amber-400'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            🎨 Canvas
          </button>
          <button
            onClick={() => setPreviewMode('template')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
              previewMode === 'template'
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            🧩 Template
          </button>
        </div>

        {/* Device mode buttons */}
        <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-0.5">
          {DEVICE_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setDeviceMode(mode.id)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                deviceMode === mode.id
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
              }`}
              title={mode.description}
            >
              {mode.label}
              <span className="hidden sm:inline text-[0.6rem] opacity-60">{mode.description}</span>
              {mode.width > 0 && (
                <span className="ml-0.5 text-[0.6rem] opacity-60">{mode.width}px</span>
              )}
            </button>
          ))}
        </div>

        {/* Screen navigation — mode dependent */}
        {previewMode === 'canvas' ? (
          <select
            value={canvasSlideIdx}
            onChange={(e) => setCanvasSlideIdx(Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
          >
            {canvasPageOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={activeScreen}
            onChange={(e) => setActiveScreen(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
          >
            {SCREEN_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        )}

        {/* Status indicators */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                dirty ? 'bg-amber-400' : 'bg-zinc-600'
              }`}
            />
            <span className="text-[0.65rem] text-zinc-500">
              {dirty ? 'Perubahan belum disimpan' : 'Tersimpan'}
            </span>
          </div>
          <span className="text-[0.65rem] text-zinc-600">
            {previewMode === 'canvas' ? `🎨 ${canvasPages.length} halaman` : '🧩 Template Engine'}
          </span>
        </div>
      </div>

      {/* ── Preview Area ─────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center overflow-auto p-4 bg-zinc-950">
        <div
          className={`overflow-hidden transition-all duration-300 ${getDeviceFrameClasses()}`}
          style={getDeviceFrameStyle()}
        >
          {htmlContent ? (
            <iframe
              srcDoc={srcdoc}
              className="w-full h-full border-0"
              title="Live Preview"
              sandbox="allow-scripts"
              key={previewMode === 'canvas' ? `canvas-${canvasSlideIdx}` : `auth-${activeScreen}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
              <div className="text-center">
                <div className="text-3xl mb-3 animate-pulse">⏳</div>
                <div className="text-zinc-400 text-sm">Membuat preview...</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
