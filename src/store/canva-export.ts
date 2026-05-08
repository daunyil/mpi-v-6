// ═══════════════════════════════════════════════════════════════
// CANVA EXPORT — HTML rendering & export logic
// Extracted from canva-store.ts for maintainability
// ═══════════════════════════════════════════════════════════════

import type { CanvaPage, CanvaElement, Ratio } from '@/components/canva/types';

// ── Module type color map used by modul element renderer ─────────
export const MODUL_TYPE_COLOR_MAP: Record<string, { icon: string; color: string; label: string; desc: string }> = {
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
  'hero': { icon: '🖼️', color: '#f9c82e', label: 'Hero Banner', desc: 'Halaman pembuka visual' },
  'kutipan': { icon: '💬', color: '#a78bfa', label: 'Kutipan Inspiratif', desc: 'Kutipan tokoh / pepatah' },
  'langkah': { icon: '👣', color: '#3ecfcf', label: 'Langkah-Langkah', desc: 'Prosedur / tahapan' },
  'accordion': { icon: '🗂️', color: '#fb923c', label: 'Accordion / FAQ', desc: 'Konten lipat buka-tutup' },
  'statistik': { icon: '📊', color: '#34d399', label: 'Statistik & Angka', desc: 'Data dan fakta visual' },
  'polling': { icon: '🗳️', color: '#a78bfa', label: 'Polling / Voting', desc: 'Survei pilihan siswa' },
  'embed': { icon: '🔗', color: '#3ecfcf', label: 'Embed / iFrame', desc: 'Konten dari situs lain' },
  'tab-icons': { icon: '📑', color: '#3ecfcf', label: 'Tab Interaktif', desc: 'Tab navigasi konten' },
  'icon-explore': { icon: '🔍', color: '#fb923c', label: 'Eksplorasi Ikon', desc: 'Grid ikon interaktif' },
  'comparison': { icon: '⚖️', color: '#a78bfa', label: 'Perbandingan', desc: 'Bandingkan kategori' },
  'card-showcase': { icon: '🎭', color: '#f9c82e', label: 'Card Showcase', desc: 'Card visual animasi' },
  'hotspot-image': { icon: '🗺️', color: '#34d399', label: 'Hotspot Image', desc: 'Gambar interaktif' },
};

// ── Timer helper ───────────────────────────────────────────────
function parseTimerSeconds(text: string): number {
  const match = text.match(/(\d{1,2}):(\d{2})/);
  if (match) return (parseInt(match[1]) || 0) * 60 + (parseInt(match[2]) || 0);
  return 120; // default 2 minutes
}

// ── Render one element as HTML string ──────────────────────────
export function renderElHTML(el: CanvaElement): string {
  const pos = `position:absolute;left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;opacity:${(el.opacity || 100) / 100}`;
  switch (el.type) {
    case 'teks':
      return `<div style="${pos}"><div style="font-size:${el.fontSize || 20}px;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.5);padding:8px;line-height:1.4;word-break:break-word">${(el.text || '').replace(/\n/g, '<br>')}</div></div>`;
    case 'shape':
      return `<div style="${pos}"><div style="width:100%;height:100%;background:${el.color || 'rgba(255,255,255,.15)'};border-radius:${el.radius || 8}px"></div></div>`;
    case 'divider':
      return `<div style="${pos}"><div style="width:100%;height:100%;background:${el.color || 'rgba(255,255,255,0.1)'}"></div></div>`;
    case 'button':
      return `<div data-el="button" data-label="${el.label || ''}" style="${pos};cursor:pointer" onclick="handleButtonClick(this)">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${el.color || '#3b82f6'};border-radius:${el.radius || 10}px;box-shadow:0 4px 16px ${el.color || '#3b82f6'}40;font-weight:700;color:#fff;font-size:${Math.max(12, Math.round((el.w || 30) * 0.4))}px;text-shadow:0 1px 4px rgba(0,0,0,.3)">${el.text || 'Tombol'}</div></div>`;
    case 'badge':
      return `<div style="${pos}"><div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:${(el.color || '#f59e0b')}15;border:1px solid ${(el.color || '#f59e0b')}30;border-radius:${el.radius || 12}px">
        <span style="font-size:clamp(16px,2.5vw,28px)">${el.icon || '🏷️'}</span>
        <span style="font-size:clamp(10px,1.2vw,14px);font-weight:700;color:${el.color || '#f59e0b'}">${el.text || el.label || 'Badge'}</span></div></div>`;
    case 'progress': {
      const pct = parseFloat(el.text || '0') || 0;
      const clr = el.color || '#22c55e';
      return `<div data-el="progress" data-value="${pct}" style="${pos};display:flex;flex-direction:column;justify-content:center;gap:4px;padding:4px">
        <div style="display:flex;justify-content:space-between;padding:0 4px"><span style="font-size:9px;color:rgba(255,255,255,.5);font-weight:600">📊 ${el.label || 'Progress'}</span><span style="font-size:9px;font-weight:700;color:${clr}">${Math.round(pct)}%</span></div>
        <div style="width:100%;height:60%;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.08)"><div style="width:${Math.max(2, Math.min(100, pct))}%;height:100%;border-radius:999px;background:linear-gradient(90deg,${clr},${clr}cc);box-shadow:0 0 8px ${clr}40;transition:width .4s"></div></div></div>`;
    }
    case 'score': {
      const clr = el.color || '#fbbf24';
      return `<div data-el="score" style="${pos}"><div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:12px;background:${clr}12;border:1px solid ${clr}25">
        <span style="font-size:14px">⭐</span>
        <div style="display:flex;flex-direction:column"><span style="font-size:7px;color:rgba(255,255,255,.4);font-weight:600;text-transform:uppercase;letter-spacing:1px">Skor</span><span data-el="score-value" style="font-size:14px;font-weight:900;color:${clr}">${el.text || '0'}</span></div></div></div>`;
    }
    case 'timer': {
      const clr = el.color || '#ef4444';
      return `<div data-el="timer" data-seconds="${parseTimerSeconds(el.text || '02:00')}" style="${pos}"><div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:12px;background:${clr}10;border:1px solid ${clr}20">
        <span style="font-size:14px">⏱️</span><span data-el="timer-value" style="font-size:16px;font-family:monospace;font-weight:900;letter-spacing:2px;color:${clr}">${el.text || '02:00'}</span></div></div>`;
    }
    case 'confetti':
      return `<div data-el="confetti" style="${pos};overflow:hidden;border-radius:8px;position:relative">
        <div style="position:absolute;inset:0;pointer-events:none">
          ${['#f59e0b','#ef4444','#3b82f6','#22c55e','#a855f7','#ec4899','#06b6d4','#f97316'].map((c, i) =>
            `<div style="position:absolute;left:${10 + (i * 11) % 80}%;top:${15 + (i * 17) % 50}%;width:${4 + i % 4}px;height:${6 + i % 4}px;background:${c};transform:rotate(${i * 45}deg);opacity:.5;animation:cFall ${1.5 + i * .15}s ease-in-out ${i * .2}s infinite alternate"></div>`
          ).join('')}
        </div>
        <div style="position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%">
          <span style="font-size:clamp(20px,3vw,32px)">🎉</span>
          ${el.label ? `<span style="font-size:9px;color:rgba(255,255,255,.4);margin-top:4px">${el.label}</span>` : ''}
        </div></div>`;
    case 'navbar': {
      const bgColor = el.color || '#1e293b';
      if (el.navStyle === 'dots') {
        return `<div data-el="navbar" style="${pos};background:${bgColor};display:flex;align-items:center;justify-content:center;gap:8px" data-navstyle="dots"></div>`;
      }
      if (el.navStyle === 'breadcrumb') {
        return `<div data-el="navbar" style="${pos};background:${bgColor};display:flex;align-items:center;justify-content:center;gap:6px;padding:0 16px" data-navstyle="breadcrumb"></div>`;
      }
      return `<div data-el="navbar" style="${pos};background:${bgColor};display:flex;align-items:center;justify-content:space-between;padding:0 16px" data-navstyle="bar">
        <div onclick="prevSlide()" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;cursor:pointer;background:rgba(255,255,255,.08)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span style="font-size:10px;font-weight:600;color:rgba(255,255,255,.7)">Sebelumnya</span></div>
        <div data-el="nav-dots" style="display:flex;gap:4px"></div>
        <div onclick="nextSlide()" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;cursor:pointer;background:rgba(245,158,11,.15)">
          <span style="font-size:10px;font-weight:600;color:#f59e0b">Selanjutnya</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg></div></div>`;
    }
    case 'kuis':
      return `<div style="${pos};background:rgba(245,200,66,.08);border:1px solid rgba(245,200,66,.2);border-radius:8px;padding:12px">
        <div style="font-size:.9rem;font-weight:700;color:#f5c842;margin-bottom:8px">❓ ${el.label || 'Kuis'}</div>
        <div style="font-size:.8rem;color:rgba(255,255,255,.6)">Kuis pilihan ganda interaktif</div></div>`;
    case 'game':
      return `<div style="${pos};background:rgba(56,217,217,.08);border:1px solid rgba(56,217,217,.2);border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <span style="font-size:2rem">${el.icon || '🎮'}</span>
        <span style="font-size:.85rem;font-weight:700;color:#3ecfcf;margin-top:4px">${el.label || 'Game'}</span></div>`;
    case 'materi':
      return `<div style="${pos};background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:8px;padding:12px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div style="width:28px;height:28px;border-radius:8px;background:rgba(167,139,250,.2);display:flex;align-items:center;justify-content:center;font-size:14px">📝</div>
          <div><div style="font-size:11px;font-weight:700;color:#a78bfa">${el.label || 'Materi'}</div><div style="font-size:9px;color:rgba(167,139,250,.5)">Konten materi</div></div></div></div>`;
    case 'modul': {
      const modulType = el.modulType || '';
      const info = MODUL_TYPE_COLOR_MAP[modulType] || { icon: el.icon || '🧩', color: el.color || '#34d399', label: 'Modul', desc: 'Aktivitas pembelajaran' };
      const c = info.color;
      const cr = parseInt(c.slice(1,3),16);
      const cg = parseInt(c.slice(3,5),16);
      const cb = parseInt(c.slice(5,7),16);
      return `<div style="${pos};background:rgba(${cr},${cg},${cb},.08);border:1px solid rgba(${cr},${cg},${cb},.2);border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="width:48px;height:48px;border-radius:12px;background:rgba(${cr},${cg},${cb},.15);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:8px">${info.icon}</div>
        <div style="font-size:11px;font-weight:700;color:${c}">${el.label || info.label}</div>
        <div style="font-size:9px;color:rgba(${cr},${cg},${cb},.5);margin-top:2px">${info.desc}</div></div>`;
    }
    case 'gambar':
      return el.dataUrl
        ? `<div style="${pos};overflow:hidden;border-radius:8px"><img src="${el.dataUrl}" style="width:100%;height:100%;object-fit:cover;display:block" alt="${el.label || 'Gambar'}"/></div>`
        : `<div style="${pos};display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(168,85,247,.08);border:1px dashed rgba(168,85,247,.3);border-radius:8px">
            <span style="font-size:2rem">🖼️</span>
            <span style="font-size:9px;color:rgba(168,85,247,.5);margin-top:4px">${el.label || 'Gambar'}</span></div>`;
    default:
      return `<div style="${pos};display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px">
        <span style="font-size:18px">${el.icon || '❓'}</span><span style="font-size:9px;color:rgba(255,255,255,.4);margin-top:4px">${el.label || el.type}</span></div>`;
  }
}

// ── Export: Single page HTML ───────────────────────────────────
export interface ExportPageOptions {
  page: CanvaPage;
  ratio: Ratio;
}

export function exportPageHTML({ page, ratio }: ExportPageOptions): string {
  const bgStyle = page.bgDataUrl
    ? `background-image:url('${page.bgDataUrl}');background-size:cover;background-position:center`
    : `background:${page.bgColor || '#1a1a2e'}`;

  const elementsHTML = (page.elements || [])
    .filter(el => !el.hidden)
    .map(el => renderElHTML(el))
    .join('\n    ');

  return `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${page.label}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0e0c15;font-family:system-ui,-apple-system,sans-serif}
.slide{position:relative;width:${ratio.w}px;height:${ratio.h}px;overflow:hidden;${bgStyle}}
@keyframes cFall{0%{transform:rotate(0deg) translateY(0);opacity:.3}100%{transform:rotate(180deg) translateY(15px);opacity:.8}}</style></head>
<body><div class="slide">${page.overlay ? `<div style="position:absolute;inset:0;background:rgba(14,28,47,${(page.overlay || 20) / 100});pointer-events:none"></div>` : ''}${elementsHTML}</div>
<script>
function handleButtonClick(el){
  var label=(el.getAttribute('data-label')||'').toLowerCase();
  if(label.includes('ulangi')||label.includes('coba lagi')||label.includes('main lagi')){location.reload();return;}
  el.style.outline='2px solid #f59e0b';el.style.outlineOffset='2px';
  setTimeout(function(){el.style.outline='none';},600);
}
<\/script></body></html>`;
}

// ── Export: Full interactive slideshow HTML ─────────────────────
export interface ExportSlideshowOptions {
  pages: CanvaPage[];
  ratio: Ratio;
}

export function exportSlideshowHTML({ pages, ratio }: ExportSlideshowOptions): string {
  // Detect features from all pages
  const hasTimer = pages.some(p => p.elements.some(e => e.type === 'timer'));
  const hasScore = pages.some(p => p.elements.some(e => e.type === 'score'));
  const hasProgress = pages.some(p => p.elements.some(e => e.type === 'progress'));
  const hasNavbar = pages.some(p => p.elements.some(e => e.type === 'navbar'));
  const hasConfetti = pages.some(p => p.elements.some(e => e.type === 'confetti'));

  // Get timer duration from first timer element found
  const timerEl = pages.flatMap(p => p.elements).find(e => e.type === 'timer');
  const timerSeconds = timerEl ? parseTimerSeconds(timerEl.text || '02:00') : 0;

  // Build quiz data — detect quiz pages with correctIdx or correctBS
  const quizData: Record<number, { type: 'pg' | 'bs'; correct: number | boolean }> = {};
  pages.forEach((p, idx) => {
    const qEl = p.elements.find(e => e.label === 'Pertanyaan' && e.correctIdx !== undefined);
    if (qEl && qEl.correctIdx !== undefined) {
      quizData[idx] = { type: 'pg', correct: qEl.correctIdx };
    }
    const bsEl = p.elements.find(e => e.label === 'Pernyataan' && e.correctBS !== undefined);
    if (bsEl && bsEl.correctBS !== undefined) {
      quizData[idx] = { type: 'bs', correct: bsEl.correctBS };
    }
  });
  const quizDataJSON = JSON.stringify(quizData);

  // Find first question slide (first slide with score element, not the first page)
  let firstQuestionSlide = 1;
  for (let i = 1; i < pages.length - 1; i++) {
    if (pages[i].elements.some(e => e.type === 'score')) {
      firstQuestionSlide = i;
      break;
    }
  }

  // Build each slide with per-slide background
  const slidesHtml = pages.map((p, i) => {
    const bgStyle = p.bgDataUrl
      ? `background-image:url('${p.bgDataUrl}');background-size:cover;background-position:center`
      : `background:${p.bgColor || '#1a1a2e'}`;
    const elemsHtml = (p.elements || [])
      .filter(el => !el.hidden)
      .map(el => renderElHTML(el))
      .join('\n        ');
    const overlayHtml = p.overlay ? `<div style="position:absolute;inset:0;background:rgba(14,28,47,${(p.overlay || 20) / 100});pointer-events:none"></div>` : '';
    return `<div class="slide" data-slide="${i}" style="${bgStyle};display:${i === 0 ? 'block' : 'none'}">
      ${overlayHtml}
      ${elemsHtml}
    </div>`;
  }).join('\n');

  // Determine question pages (pages with score + progress but not first or last)
  const questionCount = pages.filter((p, i) =>
    i > 0 && i < pages.length - 1 &&
    p.elements.some(e => e.type === 'score') &&
    p.elements.some(e => e.type === 'progress')
  ).length;

  return `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Interactive Slideshow</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0e0c15;font-family:system-ui,-apple-system,sans-serif}
.slide{position:relative;width:${ratio.w}px;height:${ratio.h}px;overflow:hidden}
.slide-num{position:fixed;top:16px;right:16px;color:rgba(255,255,255,.4);font-size:11px;z-index:999;font-weight:600;background:rgba(0,0,0,.3);padding:4px 10px;border-radius:6px;backdrop-filter:blur(4px)}
@keyframes cFall{0%{transform:rotate(0deg) translateY(0);opacity:.3}100%{transform:rotate(180deg) translateY(15px);opacity:.8}}
@keyframes popIn{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes correctPulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}50%{box-shadow:0 0 0 12px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
@keyframes wrongShake{0%,100%{transform:translateX(0)}15%,45%,75%{transform:translateX(-6px)}30%,60%,90%{transform:translateX(6px)}}
.score-pop{animation:popIn .4s ease-out}
.quiz-correct{outline:3px solid #22c55e !important;outline-offset:2px;animation:correctPulse .6s ease-out}
.quiz-wrong{outline:3px solid #ef4444 !important;outline-offset:2px;animation:wrongShake .4s ease-out}
.quiz-disabled{pointer-events:none;opacity:.5}
</style></head>
<body>
${slidesHtml}
<div class="slide-num" id="slideNum">1 / ${pages.length}</div>
<script>
(function(){
  var cur=0,total=${pages.length},questionCount=${questionCount};
  var score=0,timerInterval=null,timerSec=${timerSeconds},timerRunning=false;
  var slides=document.querySelectorAll('.slide');
  var quizData=${quizDataJSON};
  var quizAnswered={};

  /* ── Slide Navigation ──────────────────────────────── */
  function showSlide(n){
    if(n<0||n>=total)return;
    cur=n;
    slides.forEach(function(s,i){s.style.display=i===n?'block':'none'});
    document.getElementById('slideNum').textContent=(n+1)+' / '+total;
    updateNavDots();
    updateProgress();
    // Start timer on first question slide
    ${hasTimer ? `if(timerSec>0&&n===${firstQuestionSlide}&&!timerRunning)startTimer();` : ''}
    // Setup quiz handlers for this slide
    setupQuizHandlers(n);
    // Update final score on result page (last slide)
    if(n===total-1&&n>0){
      slides[n].querySelectorAll('[data-el="score-value"]').forEach(function(v){
        v.textContent=score;v.classList.remove('score-pop');void v.offsetWidth;v.classList.add('score-pop');
      });
      slides[n].querySelectorAll('[data-el="progress"]').forEach(function(bar){
        var fill=bar.querySelector('div[style*="linear-gradient"]');
        if(fill)fill.style.width='100%';
        var lbl=bar.querySelector('span:last-child');
        if(lbl)lbl.textContent='100%';
      });
    }
  }
  function nextSlide(){showSlide(cur+1)}
  function prevSlide(){if(cur>0)showSlide(cur-1)}
  window.nextSlide=nextSlide;window.prevSlide=prevSlide;

  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key===' ')nextSlide();
    if(e.key==='ArrowLeft')prevSlide();
  });

  /* ── Quiz Handlers ─────────────────────────────────── */
  function setupQuizHandlers(n){
    var qd=quizData[n];
    if(!qd)return;
    if(quizAnswered[n])return; // already answered
    var slide=slides[n];
    if(!slide)return;

    if(qd.type==='pg'){
      // Find all Opsi buttons and add quiz handlers
      var btns=slide.querySelectorAll('[data-el="button"]');
      btns.forEach(function(btn){
        var label=btn.getAttribute('data-label')||'';
        var m=label.match(/^Opsi ([A-Z])$/);
        if(m){
          var optIdx=m[1].charCodeAt(0)-65;
          btn.setAttribute('data-opt-idx',String(optIdx));
          btn.onclick=function(){
            if(quizAnswered[n])return;
            quizAnswered[n]=true;
            var isCorrect=optIdx===qd.correct;
            if(isCorrect){score++;updateScoreDisplay();}
            // Highlight all buttons
            btns.forEach(function(b){
              var bi=parseInt(b.getAttribute('data-opt-idx')||'0');
              if(bi===qd.correct){b.classList.add('quiz-correct');}
              else{b.classList.add('quiz-disabled');}
            });
            if(!isCorrect){btn.classList.add('quiz-wrong');btn.classList.remove('quiz-disabled');}
            setTimeout(nextSlide,800);
          };
        }
      });
    }

    if(qd.type==='bs'){
      // Find Benar and Salah buttons
      var allBtns=slide.querySelectorAll('[data-el="button"]');
      allBtns.forEach(function(btn){
        var label=btn.getAttribute('data-label')||'';
        var answered=false;
        if(label==='Benar'){
          btn.onclick=function(){
            if(quizAnswered[n]||answered)return;
            answered=true;quizAnswered[n]=true;
            if(qd.correct===true){score++;updateScoreDisplay();btn.classList.add('quiz-correct');}
            else{btn.classList.add('quiz-wrong');}
            // Highlight the correct one
            allBtns.forEach(function(b){var bl=b.getAttribute('data-label')||'';if(bl==='Salah'){b.classList.add('quiz-disabled');}});
            if(qd.correct!==true){
              allBtns.forEach(function(b){var bl=b.getAttribute('data-label')||'';if(bl==='Salah'&&qd.correct===false){b.classList.remove('quiz-disabled');b.classList.add('quiz-correct');}});
            }
            setTimeout(nextSlide,800);
          };
        }
        if(label==='Salah'){
          btn.onclick=function(){
            if(quizAnswered[n]||answered)return;
            answered=true;quizAnswered[n]=true;
            if(qd.correct===false){score++;updateScoreDisplay();btn.classList.add('quiz-correct');}
            else{btn.classList.add('quiz-wrong');}
            allBtns.forEach(function(b){var bl=b.getAttribute('data-label')||'';if(bl==='Benar'){b.classList.add('quiz-disabled');}});
            if(qd.correct!==false){
              allBtns.forEach(function(b){var bl=b.getAttribute('data-label')||'';if(bl==='Benar'&&qd.correct===true){b.classList.remove('quiz-disabled');b.classList.add('quiz-correct');}});
            }
            setTimeout(nextSlide,800);
          };
        }
      });
    }
  }

  /* ── Navbar Dots ───────────────────────────────────── */
  function updateNavDots(){
    var dotsContainers=slides[cur].querySelectorAll('[data-el="nav-dots"]');
    dotsContainers.forEach(function(c){
      c.innerHTML='';
      for(var i=0;i<total;i++){
        var d=document.createElement('div');
        d.style.cssText='width:'+(i===cur?'8px':'4px')+';height:4px;border-radius:4px;background:'+(i===cur?'#f59e0b':'rgba(255,255,255,.2)')+';transition:all .2s';
        c.appendChild(d);
      }
    });
    // Also update breadcrumb navbars
    var bcNavs=slides[cur].querySelectorAll('[data-navstyle="breadcrumb"]');
    bcNavs.forEach(function(c){
      c.innerHTML='';
      var count=Math.min(total,6);
      for(var i=0;i<count;i++){
        if(i>0){var sep=document.createElement('div');sep.style.cssText='width:12px;height:1px;background:rgba(255,255,255,.1)';c.appendChild(sep);}
        var b=document.createElement('div');
        b.textContent=i+1;
        b.style.cssText='padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:'+(i===cur?'rgba(245,158,11,.2)':'rgba(255,255,255,.06)')+';color:'+(i===cur?'#f59e0b':'rgba(255,255,255,.5)')+';cursor:pointer';
        b.onclick=(function(idx){return function(){showSlide(idx)}})(i);
        c.appendChild(b);
      }
    });
    // Update dots-style navbars
    var dotNavs=slides[cur].querySelectorAll('[data-navstyle="dots"]');
    dotNavs.forEach(function(c){
      c.innerHTML='';
      var count=Math.min(total,10);
      for(var i=0;i<count;i++){
        var d=document.createElement('div');
        d.style.cssText='border-radius:50%;width:'+(i===cur?'10px':'6px')+';height:6px;background:'+(i===cur?'#f59e0b':'rgba(255,255,255,.25)')+';transition:all .2s;cursor:pointer';
        d.onclick=(function(idx){return function(){showSlide(idx)}})(i);
        c.appendChild(d);
      }
    });
  }

  /* ── Progress Bar Update ───────────────────────────── */
  ${hasProgress ? `function updateProgress(){
    var bars=slides[cur].querySelectorAll('[data-el="progress"]');
    bars.forEach(function(bar){
      var pct=Math.round(((cur)/(total-1))*100);
      bar.setAttribute('data-value',pct);
      var fill=bar.querySelector('div[style*="linear-gradient"]');
      if(fill)fill.style.width=Math.max(2,Math.min(100,pct))+'%';
      var label=bar.querySelector('span:last-child');
      if(label)label.textContent=pct+'%';
    });
  }` : 'function updateProgress(){}'}

  /* ── Score System ──────────────────────────────────── */
  function updateScoreDisplay(){
    document.querySelectorAll('[data-el="score-value"]').forEach(function(v){
      v.textContent=score;
      v.classList.remove('score-pop');void v.offsetWidth;v.classList.add('score-pop');
    });
  }
  ${hasScore ? `window.addScore=function(){score++;updateScoreDisplay();};` : ''}

  /* ── Button Click Handler ──────────────────────────── */
  var answeredSlides = {}; // Track which slides have been answered
  window.handleButtonClick=function(el){
    var label=(el.getAttribute('data-label')||'').toLowerCase();
    // Check if this is a restart button
    if(label.includes('ulangi')||label.includes('coba lagi')||label.includes('main lagi')){restartQuiz();return;}
    // If this is an Opsi/Benar/Salah button on a quiz page, let quiz handler deal with it
    var origLabel=el.getAttribute('data-label')||'';
    if(quizData[cur]&&(origLabel.match(/^Opsi [A-Z]$/)||origLabel==='Benar'||origLabel==='Salah'))return;
    // Highlight clicked button
    el.style.outline='2px solid #f59e0b';
    el.style.outlineOffset='2px';
    // If on a question page with score, add score
    ${hasScore ? `var hasScoreEl = slides[cur].querySelector('[data-el="score"]');
    if (hasScoreEl && cur > 0 && cur < total - 1 && !answeredSlides[cur]) { addScore(); answeredSlides[cur] = true; }` : ''}
    // Advance after short delay
    setTimeout(nextSlide,400);
  };

  function restartQuiz(){
    score=0;
    document.querySelectorAll('[data-el="score-value"]').forEach(function(v){v.textContent='0'});
    if(timerInterval){clearInterval(timerInterval);timerRunning=false}
    timerSec=${timerSeconds};
    document.querySelectorAll('[data-el="timer-value"]').forEach(function(v){
      var m=Math.floor(timerSec/60);var s=timerSec%60;
      v.textContent=(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
    });
    answeredSlides={};
    quizAnswered={};
    document.querySelectorAll('.slide [data-el="button"]').forEach(function(btn){btn.style.outline='none';btn.style.pointerEvents='';btn.style.opacity='1'});
    document.querySelectorAll('.slide [data-quiz-opt]').forEach(function(opt){opt.style.outline='none';opt.style.pointerEvents='';opt.style.opacity='1'});
    showSlide(0);
  }
  window.restartQuiz=restartQuiz;

  /* ── Timer Countdown ───────────────────────────────── */
  ${hasTimer ? `function startTimer(){
    if(timerSec<=0)return;
    timerRunning=true;
    timerInterval=setInterval(function(){
      timerSec--;
      if(timerSec<=0){
        clearInterval(timerInterval);
        timerRunning=false;
        showSlide(total-1);
        return;
      }
      var m=Math.floor(timerSec/60);
      var s=timerSec%60;
      var str=(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
      document.querySelectorAll('[data-el="timer-value"]').forEach(function(v){v.textContent=str});
      if(timerSec<=30){
        document.querySelectorAll('[data-el="timer"] [data-el="timer-value"]').forEach(function(v){
          v.style.animation='none';void v.offsetWidth;v.style.animation='popIn .3s ease-out';
        });
      }
    },1000);
  }` : ''}

  /* ── Init ──────────────────────────────────────────── */
  showSlide(0);
})();
<\/script></body></html>`;
}
