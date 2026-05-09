// ═══════════════════════════════════════════════════════════════
// MODULE RENDERERS — HTML render functions for each module type
// ═══════════════════════════════════════════════════════════════
//
// Each renderer produces inline-styled HTML that works inside
// the exported slideshow without any external CSS or JS files.
// ═══════════════════════════════════════════════════════════════

import { esc } from '@/lib/shared/constants';
import { getModuleTypeInfo } from '@/lib/shared/module-types';
import { hasGameRenderer, buildAllGamesHtml } from '@/lib/export/game-populator';

// ── Shared types ───────────────────────────────────────────────
type ModData = Record<string, unknown>;

// ═══════════════════════════════════════════════════════════════
// 1. FLIPCARD DECK  (type: 'flipcard' | 'flashcard')
// ═══════════════════════════════════════════════════════════════
// Data shape: { type, title, cards: Array<{depan, belakang, hint?}> }
// Also supports legacy `kartu` key from authoring store.
// ═══════════════════════════════════════════════════════════════
export function renderFlipcard(mod: ModData): string {
  const info = getModuleTypeInfo(String(mod.type || 'flipcard'));
  const title = String(mod.title || info.label);

  // Support both `cards` (spec) and `kartu` (authoring store) keys
  const cards = (mod.cards || mod.kartu) as Array<{ depan?: string; belakang?: string; hint?: string }> | undefined;
  if (!cards || cards.length === 0) {
    return `<div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
      <div style="font-weight:900;font-size:.95rem;color:${info.color}">${info.icon} ${esc(title)}</div>
      <div style="font-size:.82rem;color:var(--muted);margin-top:6px">Belum ada kartu.</div>
    </div>`;
  }

  const deckId = `fc-${Math.random().toString(36).slice(2, 8)}`;
  const total = cards.length;

  const cardsHtml = cards.map((c, i) => {
    const hintHtml = c.hint
      ? `<div style="font-size:.72rem;color:var(--muted);font-style:italic;margin-top:8px">💡 ${esc(c.hint)}</div>`
      : '';

    return `
      <div style="flex:0 0 260px;perspective:800px;cursor:pointer" onclick="this.querySelector('.fc-inner').classList.toggle('fc-flipped')">
        <div class="fc-inner" style="position:relative;width:100%;height:180px;transition:transform .6s;transform-style:preserve-3d">
          <!-- Front -->
          <div style="position:absolute;inset:0;backface-visibility:hidden;background:${info.color}15;border:2px solid ${info.color}40;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;text-align:center">
            <div style="font-size:.68rem;font-weight:800;color:${info.color};margin-bottom:8px">DEPAN</div>
            <div style="font-size:.92rem;font-weight:700;color:var(--text);line-height:1.5">${esc(c.depan || '')}</div>
            ${hintHtml}
          </div>
          <!-- Back -->
          <div style="position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);background:${info.color}30;border:2px solid ${info.color}60;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;text-align:center">
            <div style="font-size:.68rem;font-weight:800;color:${info.color};margin-bottom:8px">JAWABAN</div>
            <div style="font-size:.92rem;font-weight:700;color:var(--text);line-height:1.5">${esc(c.belakang || '')}</div>
          </div>
        </div>
      </div>`;
  }).join('\n');

  // Inline CSS for flip transform + JS for navigation
  return `
  <style>
    .fc-inner.fc-flipped { transform: rotateY(180deg) !important; }
  </style>
  <div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <span style="font-size:1.5rem">${info.icon}</span>
      <div>
        <div style="font-weight:900;font-size:.95rem;color:${info.color}">${esc(title)}</div>
        <div style="font-size:.72rem;color:var(--muted);font-weight:600">${esc(info.desc)}</div>
      </div>
    </div>
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:12px">Klik kartu untuk membalik. Geser untuk melihat kartu lainnya.</div>
    <!-- Scrollable deck -->
    <div id="${deckId}" style="display:flex;gap:14px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch">
      ${cardsHtml}
    </div>
    <!-- Progress indicator -->
    <div style="text-align:center;margin-top:10px;font-size:.78rem;font-weight:800;color:${info.color}" id="${deckId}-prog">Kartu 1 dari ${total}</div>
  </div>
  <script>
  (function(){
    var d=document.getElementById('${deckId}'),p=document.getElementById('${deckId}-prog');
    if(!d||!p)return;
    d.addEventListener('scroll',function(){
      var s=d.scrollLeft,w=d.querySelector('div').offsetWidth+14;
      var idx=Math.round(s/w)+1;
      p.textContent='Kartu '+idx+' dari ${total}';
    });
  })();
  <\/script>`;
}

// ═══════════════════════════════════════════════════════════════
// 2. DISKUSI  (type: 'diskusi')
// ═══════════════════════════════════════════════════════════════
// Data shape: { type, title, pertanyaan, durasi?, petunjuk? }
// ═══════════════════════════════════════════════════════════════
export function renderDiskusi(mod: ModData): string {
  const info = getModuleTypeInfo('diskusi');
  const title = String(mod.title || info.label);
  const pertanyaan = String(mod.pertanyaan || 'Diskusikan pertanyaan berikut!');
  const durasi = String(mod.durasi || '');
  const petunjuk = String(mod.petunjuk || '');

  // Parse durasi for timer display (e.g. "05:00" → 300 seconds)
  const timerSeconds = parseDuration(durasi);
  const timerDisplay = durasi || '';
  const timerId = `disk-timer-${Math.random().toString(36).slice(2, 8)}`;
  const textareaId = `disk-ta-${Math.random().toString(36).slice(2, 8)}`;

  // Timer section
  const timerHtml = durasi
    ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <span style="font-size:1.3rem">⏱️</span>
        <div id="${timerId}" style="font-family:'Fredoka One',cursive;font-size:1.4rem;color:var(--y);letter-spacing:2px">${esc(timerDisplay)}</div>
        <button onclick="(function(){var e=document.getElementById('${timerId}');if(e.dataset.running==='1'){e.dataset.running='0';this.textContent='▶ Mulai'}else{e.dataset.running='1';this.textContent='⏸ Jeda';var s=${timerSeconds};var iv=setInterval(function(){if(e.dataset.running==='0')return;s--;if(s<=0){clearInterval(iv);e.textContent='00:00';e.dataset.running='0';return;}var m=Math.floor(s/60),ss=s%60;e.textContent=(m<10?'0':'')+m+':'+(ss<10?'0':'')+ss;},1000);e._iv=iv;}}).call(this)" style="margin-left:auto;padding:6px 14px;border-radius:10px;background:var(--y)22;color:var(--y);border:1px solid var(--y)44;font-weight:800;font-size:.78rem;cursor:pointer">▶ Mulai</button>
      </div>`
    : '';

  // Petunjuk
  const petunjukHtml = petunjuk
    ? `<div style="font-size:.8rem;color:var(--muted);margin-bottom:10px;font-style:italic">📝 ${esc(petunjuk)}</div>`
    : '';

  return `<div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <span style="font-size:1.5rem">${info.icon}</span>
      <div>
        <div style="font-weight:900;font-size:.95rem;color:${info.color}">${esc(title)}</div>
        <div style="font-size:.72rem;color:var(--muted);font-weight:600">${esc(info.desc)}</div>
      </div>
    </div>

    ${timerHtml}
    ${petunjukHtml}

    <!-- Question prompt -->
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px">
      <div style="font-size:.72rem;font-weight:800;color:${info.color};margin-bottom:6px">PERTANYAAN DISKUSI</div>
      <div style="font-size:.95rem;font-weight:700;line-height:1.7;color:var(--text)">${esc(pertanyaan)}</div>
    </div>

    <!-- Answer textarea -->
    <textarea id="${textareaId}" placeholder="Tuliskan jawaban diskusimu di sini…" style="width:100%;min-height:100px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;padding:12px;font-size:.86rem;color:var(--text);resize:vertical;font-family:inherit;line-height:1.6"></textarea>

    <!-- Save button -->
    <div style="text-align:right;margin-top:10px">
      <button onclick="(function(){var t=this;var ta=document.getElementById('${textareaId}');if(ta&&ta.value.trim()){t.textContent='✅ Tersimpan!';t.style.background='rgba(52,211,153,.2)';t.style.color='var(--g)';ta.disabled=true;ta.style.opacity='.6';}else{t.textContent='⚠️ Isi jawaban dulu';setTimeout(function(){t.textContent='Simpan Jawaban';t.style.background='';t.style.color='';},1500);}}).call(this)" style="padding:10px 22px;border-radius:12px;background:${info.color}22;color:${info.color};border:1px solid ${info.color}44;font-weight:800;font-size:.85rem;cursor:pointer;transition:all .2s">Simpan Jawaban</button>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// 3. CALLOUT  (type: 'callout')
// ═══════════════════════════════════════════════════════════════
// Data shape: { type, title, isi, variant?: 'info'|'warning'|'success'|'danger' }
// ═══════════════════════════════════════════════════════════════
export function renderCallout(mod: ModData): string {
  const variant = String(mod.variant || 'info');
  const title = String(mod.title || '');
  const isi = String(mod.isi || '');

  const variants: Record<string, { icon: string; color: string; bg: string; border: string }> = {
    info:    { icon: '💡', color: '#3ecfcf', bg: 'rgba(62,207,207,.08)',  border: 'rgba(62,207,207,.35)' },
    warning: { icon: '⚠️', color: '#fbbf24', bg: 'rgba(251,191,36,.08)',  border: 'rgba(251,191,36,.35)' },
    success: { icon: '✅', color: '#34d399', bg: 'rgba(52,211,153,.08)',  border: 'rgba(52,211,153,.35)' },
    danger:  { icon: '🚨', color: '#ff6b6b', bg: 'rgba(255,107,107,.08)', border: 'rgba(255,107,107,.35)' },
  };

  const v = variants[variant] || variants.info;

  const titleHtml = title
    ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:1.3rem">${v.icon}</span>
        <div style="font-weight:900;font-size:.92rem;color:${v.color}">${esc(title)}</div>
      </div>`
    : `<div style="font-size:1.3rem;margin-bottom:6px">${v.icon}</div>`;

  return `<div style="background:${v.bg};border-left:4px solid ${v.border};border-radius:12px;padding:16px 18px;margin:8px 0">
    ${titleHtml}
    <div style="font-size:.88rem;line-height:1.7;color:var(--muted)">${esc(isi)}</div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// 4. FILL-IN-THE-BLANK  (type: 'fillblank')
// ═══════════════════════════════════════════════════════════════
// Data shape: { type, title, teks, jawaban: Array<{slot, benar}> }
// The `teks` has [___] placeholders that are replaced by input fields.
// ═══════════════════════════════════════════════════════════════
export function renderFillblank(mod: ModData): string {
  const info = getModuleTypeInfo('fillblank');
  const title = String(mod.title || info.label);
  const teks = String(mod.teks || '');
  const jawaban = (mod.jawaban as Array<{ slot?: string; benar?: string }>) || [];

  // Build a map: slot → benar
  const answerMap: Record<string, string> = {};
  for (const j of jawaban) {
    if (j.slot) answerMap[j.slot] = j.benar || '';
  }

  // Unique ID for this fillblank instance
  const fbId = `fb-${Math.random().toString(36).slice(2, 8)}`;

  // Replace [___] or [slotName] patterns with inline input + check button
  let slotIndex = 0;
  const processedTeks = teks.replace(/\[([^\]]*)\]/g, (match, slotName: string) => {
    const slotKey = slotName.trim() || `slot${slotIndex}`;
    const inputId = `${fbId}-inp-${slotIndex}`;
    const feedbackId = `${fbId}-fb-${slotIndex}`;
    const correctAnswer = answerMap[slotKey] || answerMap[Object.keys(answerMap)[slotIndex]] || '';

    const html = `<span style="display:inline-flex;align-items:center;gap:4px;vertical-align:middle">
      <input id="${inputId}" type="text" data-answer="${esc(correctAnswer)}" placeholder="${esc(slotKey)}" style="width:120px;padding:4px 8px;border:1px solid var(--border);border-radius:8px;background:rgba(255,255,255,.06);color:var(--text);font-size:.84rem;text-align:center;font-family:inherit" />
      <button onclick="(function(){var i=document.getElementById('${inputId}'),f=document.getElementById('${feedbackId}'),a=i.dataset.answer.toLowerCase().trim(),v=i.value.toLowerCase().trim();if(!v){f.textContent='';return;}if(v===a){f.textContent='✓';f.style.color='var(--g)';i.style.borderColor='var(--g)';i.disabled=true;}else{f.textContent='✗';f.style.color='var(--r)';i.style.borderColor='var(--r)';}}).call(this)" style="padding:4px 10px;border-radius:8px;background:${info.color}22;color:${info.color};border:1px solid ${info.color}33;font-size:.72rem;font-weight:800;cursor:pointer">Cek</button>
      <span id="${feedbackId}" style="font-weight:900;font-size:.9rem;min-width:16px"></span>
    </span>`;

    slotIndex++;
    return html;
  });

  return `<div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <span style="font-size:1.5rem">${info.icon}</span>
      <div>
        <div style="font-weight:900;font-size:.95rem;color:${info.color}">${esc(title)}</div>
        <div style="font-size:.72rem;color:var(--muted);font-weight:600">${esc(info.desc)}</div>
      </div>
    </div>
    <div style="font-size:.9rem;line-height:2.2;color:var(--text)">${processedTeks}</div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// RENDERER DISPATCH — Maps module type → render function
// ═══════════════════════════════════════════════════════════════
const RENDERER_MAP: Record<string, (mod: ModData) => string> = {
  flipcard:  renderFlipcard,
  flashcard: renderFlipcard,   // 'flashcard' type also uses flipcard renderer
  diskusi:   renderDiskusi,
  callout:   renderCallout,
  fillblank: renderFillblank,
};

/** Check if a module type has a dedicated renderer (module or game) */
export function hasModuleRenderer(type: string): boolean {
  return type in RENDERER_MAP || hasGameRenderer(type);
}

/** Render a module using its dedicated renderer; returns '' if no renderer */
export function renderModule(type: string, mod: ModData): string {
  // First check module renderers
  const renderer = RENDERER_MAP[type];
  if (renderer) return renderer(mod);

  // Then check game renderers (for game-type modules in the modules[] array)
  if (hasGameRenderer(type)) {
    return buildAllGamesHtml([mod]);
  }

  return '';
}

// ── Internal Helpers ──────────────────────────────────────────

/** Parse duration string like "05:00" or "5 menit" to seconds */
function parseDuration(text: string): number {
  if (!text) return 0;
  const match = text.match(/(\d{1,2}):(\d{2})/);
  if (match) return (parseInt(match[1]) || 0) * 60 + (parseInt(match[2]) || 0);
  const mins = text.match(/(\d+)\s*menit/i);
  if (mins) return parseInt(mins[1]) * 60;
  return 300; // default 5 minutes
}
