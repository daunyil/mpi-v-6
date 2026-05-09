// ═══════════════════════════════════════════════════════════════
// GAME POPULATOR — Generates complete interactive game HTML
// ═══════════════════════════════════════════════════════════════
//
// Takes games from the authoring store and produces self-contained
// HTML for each game type. Each output includes inline CSS + JS
// for full interactivity — no external dependencies needed.
//
// Supported game types:
//   - memory    → Memory matching game with card grid
//   - matching  → Match items by clicking pairs
//   - roda      → Spin wheel with random selection
//   - sorting   → Sort items into categories
//   - truefalse → True/false quiz cards
// ═══════════════════════════════════════════════════════════════

import { esc } from '@/lib/shared/constants';
import { getModuleTypeInfo } from '@/lib/shared/module-types';

type GameData = Record<string, unknown>;

// ═══════════════════════════════════════════════════════════════
// 1. MEMORY MATCH GAME
// ═══════════════════════════════════════════════════════════════
// Data: { type:'memory', title, pasangan: Array<{kiri,kanan}> }
// Creates a grid of face-down cards. Flip two at a time to match.
// ═══════════════════════════════════════════════════════════════
function renderMemoryGame(game: GameData): string {
  const info = getModuleTypeInfo('memory');
  const title = String(game.title || info.label);
  const pasangan = (game.pasangan as Array<{ kiri?: string; kanan?: string }>) || [];

  if (pasangan.length === 0) {
    return `<div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
      <div style="font-weight:900;font-size:.95rem;color:${info.color}">${info.icon} ${esc(title)}</div>
      <div style="font-size:.82rem;color:var(--muted);margin-top:6px">Belum ada pasangan kartu.</div>
    </div>`;
  }

  const gid = `mem-${Math.random().toString(36).slice(2, 8)}`;

  // Build card pairs: each pair produces 2 cards (kiri + kanan)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cards: Array<{ id: number; pairId: number; text: string }> = [];
  let cid = 0;
  pasangan.forEach((p, pi) => {
    cards.push({ id: cid++, pairId: pi, text: p.kiri || '' });
    cards.push({ id: cid++, pairId: pi, text: p.kanan || '' });
  });

  // Shuffle cards (Fisher-Yates) — done in JS at runtime instead
  const cardsJson = JSON.stringify(cards);

  // Determine grid columns based on card count
  const cols = cards.length <= 4 ? 2 : cards.length <= 9 ? 3 : 4;

  return `
  <style>
    .${gid}-card{perspective:600px;cursor:pointer;aspect-ratio:1}
    .${gid}-card-inner{position:relative;width:100%;height:100%;transition:transform .5s;transform-style:preserve-3d}
    .${gid}-card.flipped .${gid}-card-inner{transform:rotateY(180deg)}
    .${gid}-card-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:12px;display:flex;align-items:center;justify-content:center;padding:8px;text-align:center;font-size:.82rem;font-weight:700;line-height:1.3}
    .${gid}-card-front{background:rgba(167,139,250,.12);border:2px solid rgba(167,139,250,.3);color:var(--muted)}
    .${gid}-card-back{transform:rotateY(180deg);background:rgba(167,139,250,.22);border:2px solid rgba(167,139,250,.5);color:var(--text)}
    .${gid}-card.matched .${gid}-card-inner{transform:rotateY(180deg)}
    .${gid}-card.matched{pointer-events:none;opacity:.6}
  </style>
  <div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <span style="font-size:1.5rem">${info.icon}</span>
      <div>
        <div style="font-weight:900;font-size:.95rem;color:${info.color}">${esc(title)}</div>
        <div style="font-size:.72rem;color:var(--muted)">Temukan pasangan yang cocok!</div>
      </div>
    </div>
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
      <span id="${gid}-score" style="font-family:'Fredoka One',cursive;font-size:1rem;color:var(--g)">✓ 0</span>
      <span id="${gid}-moves" style="font-size:.78rem;color:var(--muted)">Langkah: 0</span>
      <button onclick="(function(){location.reload()})()" style="margin-left:auto;padding:4px 12px;border-radius:8px;background:rgba(255,255,255,.06);color:var(--muted);border:1px solid var(--border);font-size:.72rem;cursor:pointer">🔄 Ulang</button>
    </div>
    <div id="${gid}-grid" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;max-width:480px;margin:0 auto"></div>
    <div id="${gid}-result" style="text-align:center;margin-top:14px;font-weight:900;font-size:1rem;color:var(--g);display:none">🎉 Semua pasangan ditemukan!</div>
  </div>
  <script>
  (function(){
    var cards=${cardsJson};
    var gid='${gid}',flipped=[],matched=0,moves=0,lock=false,total=${pasangan.length};
    // Shuffle
    for(var i=cards.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=cards[i];cards[i]=cards[j];cards[j]=t;}
    var grid=document.getElementById(gid+'-grid');
    cards.forEach(function(c,ci){
      var el=document.createElement('div');
      el.className=gid+'-card';
      el.dataset.idx=ci;
      el.dataset.pair=c.pairId;
      el.innerHTML='<div class="'+gid+'-card-inner"><div class="'+gid+'-card-face '+gid+'-card-front">🧠</div><div class="'+gid+'-card-face '+gid+'-card-back">'+escJS(c.text)+'</div></div>';
      el.addEventListener('click',function(){
        if(lock)return;if(el.classList.contains('flipped')||el.classList.contains('matched'))return;
        el.classList.add('flipped');flipped.push({el:el,pair:c.pairId});
        if(flipped.length===2){
          lock=true;moves++;document.getElementById(gid+'-moves').textContent='Langkah: '+moves;
          if(flipped[0].pair===flipped[1].pair){
            flipped[0].el.classList.add('matched');flipped[1].el.classList.add('matched');
            matched++;document.getElementById(gid+'-score').textContent='✓ '+matched;
            flipped=[];lock=false;
            if(matched>=total){document.getElementById(gid+'-result').style.display='block';}
          }else{
            setTimeout(function(){flipped[0].el.classList.remove('flipped');flipped[1].el.classList.remove('flipped');flipped=[];lock=false;},800);
          }
        }
      });
      grid.appendChild(el);
    });
    function escJS(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
  })();
  <\/script>`;
}

// ═══════════════════════════════════════════════════════════════
// 2. MATCHING GAME
// ═══════════════════════════════════════════════════════════════
// Data: { type:'matching', title, instruksi?, pasangan: Array<{kiri,kanan}> }
// Two columns: select one from left, one from right to match.
// ═══════════════════════════════════════════════════════════════
function renderMatchingGame(game: GameData): string {
  const info = getModuleTypeInfo('matching');
  const title = String(game.title || info.label);
  const instruksi = String(game.instruksi || 'Cocokkan istilah di kiri dengan definisi di kanan');
  const pasangan = (game.pasangan as Array<{ kiri?: string; kanan?: string }>) || [];

  if (pasangan.length === 0) {
    return `<div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
      <div style="font-weight:900;font-size:.95rem;color:${info.color}">${info.icon} ${esc(title)}</div>
      <div style="font-size:.82rem;color:var(--muted);margin-top:6px">Belum ada pasangan.</div>
    </div>`;
  }

  const gid = `match-${Math.random().toString(36).slice(2, 8)}`;

  // Build left/right items — right side is shuffled
  const leftItems = pasangan.map((p, i) => ({ idx: i, text: p.kiri || '' }));
  const rightItems = pasangan.map((p, i) => ({ idx: i, text: p.kanan || '' }));
  const leftJson = JSON.stringify(leftItems);

  // Shuffle right items for the puzzle
  const shuffledRight = [...rightItems];
  for (let i = shuffledRight.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledRight[i], shuffledRight[j]] = [shuffledRight[j], shuffledRight[i]];
  }
  const rightJson = JSON.stringify(shuffledRight);

  return `
  <div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <span style="font-size:1.5rem">${info.icon}</span>
      <div>
        <div style="font-weight:900;font-size:.95rem;color:${info.color}">${esc(title)}</div>
        <div style="font-size:.78rem;color:var(--muted)">${esc(instruksi)}</div>
      </div>
    </div>
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
      <span id="${gid}-score" style="font-family:'Fredoka One',cursive;font-size:1rem;color:var(--g)">✓ 0/${pasangan.length}</span>
      <button onclick="(function(){location.reload()})()" style="margin-left:auto;padding:4px 12px;border-radius:8px;background:rgba(255,255,255,.06);color:var(--muted);border:1px solid var(--border);font-size:.72rem;cursor:pointer">🔄 Ulang</button>
    </div>
    <div id="${gid}" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"></div>
    <div id="${gid}-result" style="text-align:center;margin-top:14px;font-weight:900;font-size:1rem;color:var(--g);display:none">🎉 Semua pasangan cocok!</div>
  </div>
  <script>
  (function(){
    var left=${leftJson},right=${rightJson},gid='${gid}';
    var selected={left:null,right:null},matched=0,total=${pasangan.length};
    var container=document.getElementById(gid);
    var leftCol=document.createElement('div'),rightCol=document.createElement('div');
    leftCol.style.cssText='display:flex;flex-direction:column;gap:8px';
    rightCol.style.cssText='display:flex;flex-direction:column;gap:8px';

    left.forEach(function(item){
      var el=document.createElement('div');
      el.textContent=item.text;
      el.dataset.idx=item.idx;
      el.style.cssText='padding:12px 14px;background:rgba(96,165,250,.1);border:2px solid rgba(96,165,250,.3);border-radius:12px;font-size:.84rem;font-weight:700;color:var(--text);cursor:pointer;transition:all .2s;text-align:center';
      el.addEventListener('click',function(){
        if(el.dataset.matched)return;
        leftCol.querySelectorAll('[data-idx]').forEach(function(e){if(!e.dataset.matched)e.style.borderColor='rgba(96,165,250,.3)';});
        el.style.borderColor='#60a5fa';selected.left=el;
        checkMatch();
      });
      leftCol.appendChild(el);
    });

    right.forEach(function(item){
      var el=document.createElement('div');
      el.textContent=item.text;
      el.dataset.idx=item.idx;
      el.style.cssText='padding:12px 14px;background:rgba(52,211,153,.1);border:2px solid rgba(52,211,153,.3);border-radius:12px;font-size:.84rem;font-weight:700;color:var(--text);cursor:pointer;transition:all .2s;text-align:center';
      el.addEventListener('click',function(){
        if(el.dataset.matched)return;
        rightCol.querySelectorAll('[data-idx]').forEach(function(e){if(!e.dataset.matched)e.style.borderColor='rgba(52,211,153,.3)';});
        el.style.borderColor='#34d399';selected.right=el;
        checkMatch();
      });
      rightCol.appendChild(el);
    });

    container.appendChild(leftCol);container.appendChild(rightCol);

    function checkMatch(){
      if(!selected.left||!selected.right)return;
      if(selected.left.dataset.idx===selected.right.dataset.idx){
        selected.left.dataset.matched='1';selected.right.dataset.matched='1';
        selected.left.style.opacity='.5';selected.right.style.opacity='.5';
        selected.left.style.pointerEvents='none';selected.right.style.pointerEvents='none';
        selected.left.style.borderColor='var(--g)';selected.right.style.borderColor='var(--g)';
        matched++;document.getElementById(gid+'-score').textContent='✓ '+matched+'/'+total;
        if(matched>=total){document.getElementById(gid+'-result').style.display='block';}
      }else{
        var l=selected.left,r=selected.right;
        l.style.borderColor='var(--r)';r.style.borderColor='var(--r)';
        setTimeout(function(){l.style.borderColor='rgba(96,165,250,.3)';r.style.borderColor='rgba(52,211,153,.3)';},600);
      }
      selected={left:null,right:null};
    }
  })();
  <\/script>`;
}

// ═══════════════════════════════════════════════════════════════
// 3. RODA PUTAR (Spin Wheel)
// ═══════════════════════════════════════════════════════════════
// Data: { type:'roda', title, opsi: string[] }
// Renders a colorful wheel that spins and lands on a random option.
// ═══════════════════════════════════════════════════════════════
function renderRodaGame(game: GameData): string {
  const info = getModuleTypeInfo('roda');
  const title = String(game.title || info.label);
  const opsi = (game.opsi as string[]) || [];

  if (opsi.length === 0) {
    return `<div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
      <div style="font-weight:900;font-size:.95rem;color:${info.color}">${info.icon} ${esc(title)}</div>
      <div style="font-size:.82rem;color:var(--muted);margin-top:6px">Belum ada opsi untuk roda.</div>
    </div>`;
  }

  const gid = `roda-${Math.random().toString(36).slice(2, 8)}`;
  const n = opsi.length;
  const colors = ['#f9c12e', '#3ecfcf', '#a78bfa', '#34d399', '#ff6b6b', '#fb923c', '#f87171', '#60a5fa'];
  const sliceAngle = 360 / n;

  // Build SVG wheel slices
  let slicesSvg = '';
  let labelsSvg = '';
  opsi.forEach((opt, i) => {
    const startAngle = i * sliceAngle - 90;
    const endAngle = (i + 1) * sliceAngle - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 100 + 90 * Math.cos(startRad);
    const y1 = 100 + 90 * Math.sin(startRad);
    const x2 = 100 + 90 * Math.cos(endRad);
    const y2 = 100 + 90 * Math.sin(endRad);
    const largeArc = sliceAngle > 180 ? 1 : 0;
    const color = colors[i % colors.length];

    slicesSvg += `<path d="M100,100 L${x1.toFixed(1)},${y1.toFixed(1)} A90,90 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" fill="${color}" stroke="rgba(0,0,0,.2)" stroke-width="1"/>`;

    // Label positioned at midpoint of arc
    const midAngle = (startAngle + endAngle) / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const lx = 100 + 55 * Math.cos(midRad);
    const ly = 100 + 55 * Math.sin(midRad);
    const shortText = opt.length > 10 ? opt.substring(0, 9) + '…' : opt;
    labelsSvg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" fill="#0e1c2f" font-size="9" font-weight="800" text-anchor="middle" dominant-baseline="central">${esc(shortText)}</text>`;
  });

  const opsiJson = JSON.stringify(opsi);

  return `
  <div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <span style="font-size:1.5rem">${info.icon}</span>
      <div>
        <div style="font-weight:900;font-size:.95rem;color:${info.color}">${esc(title)}</div>
        <div style="font-size:.72rem;color:var(--muted)">Putar roda untuk pilihan acak!</div>
      </div>
    </div>
    <div style="text-align:center;position:relative">
      <!-- Pointer -->
      <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);z-index:2;font-size:1.5rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">▼</div>
      <!-- Wheel SVG -->
      <svg id="${gid}-wheel" viewBox="0 0 200 200" style="width:260px;height:260px;transition:transform 4s cubic-bezier(.17,.67,.12,.99);margin:20px auto;display:block;border-radius:50%;box-shadow:0 0 20px rgba(251,146,60,.2)">
        ${slicesSvg}
        ${labelsSvg}
        <circle cx="100" cy="100" r="16" fill="#0e1c2f" stroke="var(--border)" stroke-width="2"/>
        <text x="100" y="100" fill="#fbbf24" font-size="10" font-weight="900" text-anchor="middle" dominant-baseline="central">🎡</text>
      </svg>
      <button id="${gid}-btn" onclick="(function(){var w=document.getElementById('${gid}-wheel'),b=this,r=document.getElementById('${gid}-result'),opts=${opsiJson};if(w.dataset.spinning==='1')return;w.dataset.spinning='1';b.disabled=true;b.style.opacity='.5';var extra=Math.floor(Math.random()*360)+1440;w.style.transform='rotate('+extra+'deg)';setTimeout(function(){var finalAngle=extra%360;var n=opts.length;var slice=360/n;var idx=Math.floor(((360-finalAngle)%360)/slice)%n;r.innerHTML='🎯 '+opts[idx];r.style.display='block';w.dataset.spinning='0';b.disabled=false;b.style.opacity='1';},4200);}).call(this)" style="margin-top:14px;padding:12px 28px;border-radius:14px;background:${info.color}33;color:${info.color};border:2px solid ${info.color}55;font-weight:900;font-size:.9rem;cursor:pointer;transition:all .2s">🎡 Putar Roda!</button>
      <div id="${gid}-result" style="margin-top:12px;font-family:'Fredoka One',cursive;font-size:1.2rem;color:var(--y);display:none"></div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// 4. SORTING GAME
// ═══════════════════════════════════════════════════════════════
// Data: { type:'sorting', title, instruksi?, kategori: Array<{nama,warna?}>, items: Array<{teks,kategori}> }
// Drag (or click) items into the correct category bucket.
// ═══════════════════════════════════════════════════════════════
function renderSortingGame(game: GameData): string {
  const info = getModuleTypeInfo('sorting');
  const title = String(game.title || info.label);
  const instruksi = String(game.instruksi || 'Kelompokkan item ke kategori yang benar');
  const kategori = (game.kategori as Array<{ nama?: string; warna?: string }>) || [
    { nama: 'Kategori A', warna: '#3ecfcf' },
    { nama: 'Kategori B', warna: '#a78bfa' },
  ];
  const items = (game.items as Array<{ teks?: string; kategori?: string }>) || [];

  if (items.length === 0) {
    return `<div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
      <div style="font-weight:900;font-size:.95rem;color:${info.color}">${info.icon} ${esc(title)}</div>
      <div style="font-size:.82rem;color:var(--muted);margin-top:6px">Belum ada item untuk disortir.</div>
    </div>`;
  }

  const gid = `sort-${Math.random().toString(36).slice(2, 8)}`;
  const itemsJson = JSON.stringify(items);
  const kategoriJson = JSON.stringify(kategori);

  return `
  <div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <span style="font-size:1.5rem">${info.icon}</span>
      <div>
        <div style="font-weight:900;font-size:.95rem;color:${info.color}">${esc(title)}</div>
        <div style="font-size:.78rem;color:var(--muted)">${esc(instruksi)}</div>
      </div>
    </div>
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
      <span id="${gid}-score" style="font-family:'Fredoka One',cursive;font-size:1rem;color:var(--g)">✓ 0/${items.length}</span>
      <button onclick="(function(){location.reload()})()" style="margin-left:auto;padding:4px 12px;border-radius:8px;background:rgba(255,255,255,.06);color:var(--muted);border:1px solid var(--border);font-size:.72rem;cursor:pointer">🔄 Ulang</button>
    </div>
    <!-- Item pool -->
    <div id="${gid}-pool" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;min-height:40px;padding:10px;background:rgba(255,255,255,.02);border:1px dashed var(--border);border-radius:12px"></div>
    <!-- Category buckets -->
    <div id="${gid}-buckets" style="display:grid;grid-template-columns:repeat(${Math.min(kategori.length, 3)},1fr);gap:12px"></div>
    <div id="${gid}-result" style="text-align:center;margin-top:14px;font-weight:900;font-size:1rem;color:var(--g);display:none">🎉 Semua item terurut dengan benar!</div>
  </div>
  <script>
  (function(){
    var items=${itemsJson},kategori=${kategoriJson},gid='${gid}';
    var matched=0,selectedEl=null;
    var pool=document.getElementById(gid+'-pool');
    var buckets=document.getElementById(gid+'-buckets');

    // Shuffle items
    var shuffled=items.slice();
    for(var i=shuffled.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=shuffled[i];shuffled[i]=shuffled[j];shuffled[j]=t;}

    // Create item chips
    shuffled.forEach(function(item,ii){
      var el=document.createElement('div');
      el.textContent=item.teks;
      el.dataset.kategori=item.kategori;
      el.dataset.ii=ii;
      el.style.cssText='padding:8px 14px;background:rgba(255,255,255,.06);border:2px solid var(--border);border-radius:10px;font-size:.82rem;font-weight:700;color:var(--text);cursor:pointer;transition:all .2s;user-select:none';
      el.addEventListener('click',function(){
        if(el.dataset.placed)return;
        pool.querySelectorAll('[data-ii]').forEach(function(e){e.style.borderColor='var(--border)';});
        if(selectedEl===el){selectedEl=null;return;}
        el.style.borderColor='#fb923c';selectedEl=el;
      });
      pool.appendChild(el);
    });

    // Create category buckets
    kategori.forEach(function(kat){
      var bucket=document.createElement('div');
      bucket.dataset.kategori=kat.nama;
      bucket.style.cssText='padding:12px;background:rgba(255,255,255,.03);border:2px dashed '+(kat.warna||'var(--border)')+'44;border-radius:14px;min-height:80px';
      var label=document.createElement('div');
      label.style.cssText='font-weight:900;font-size:.82rem;color:'+(kat.warna||'var(--muted)')+';margin-bottom:8px;text-align:center';
      label.textContent=kat.nama;
      bucket.appendChild(label);

      bucket.addEventListener('click',function(){
        if(!selectedEl)return;
        if(selectedEl.dataset.kategori===bucket.dataset.kategori){
          selectedEl.dataset.placed='1';
          selectedEl.style.borderColor='var(--g)';selectedEl.style.opacity='.5';selectedEl.style.pointerEvents='none';
          bucket.appendChild(selectedEl);
          matched++;document.getElementById(gid+'-score').textContent='✓ '+matched+'/ ${items.length}';
          if(matched>=${items.length}){document.getElementById(gid+'-result').style.display='block';}
        }else{
          selectedEl.style.borderColor='var(--r)';
          var el=selectedEl;setTimeout(function(){el.style.borderColor='var(--border)';},500);
        }
        selectedEl=null;
      });
      buckets.appendChild(bucket);
    });
  })();
  <\/script>`;
}

// ═══════════════════════════════════════════════════════════════
// 5. TRUE/FALSE QUIZ GAME
// ═══════════════════════════════════════════════════════════════
// Data: { type:'truefalse', title, instruksi?, soal: Array<{teks,jawaban:boolean}> }
// Card-based quiz: swipe or click Benar/Salah.
// ═══════════════════════════════════════════════════════════════
function renderTrueFalseGame(game: GameData): string {
  const info = getModuleTypeInfo('truefalse');
  const title = String(game.title || info.label);
  const instruksi = String(game.instruksi || 'Tentukan apakah pernyataan berikut Benar atau Salah');
  const soal = (game.soal as Array<{ teks?: string; jawaban?: boolean }>) || [];

  if (soal.length === 0) {
    return `<div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
      <div style="font-weight:900;font-size:.95rem;color:${info.color}">${info.icon} ${esc(title)}</div>
      <div style="font-size:.82rem;color:var(--muted);margin-top:6px">Belum ada pernyataan.</div>
    </div>`;
  }

  const gid = `tf-${Math.random().toString(36).slice(2, 8)}`;
  const soalJson = JSON.stringify(soal);

  return `
  <div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <span style="font-size:1.5rem">${info.icon}</span>
      <div>
        <div style="font-weight:900;font-size:.95rem;color:${info.color}">${esc(title)}</div>
        <div style="font-size:.78rem;color:var(--muted)">${esc(instruksi)}</div>
      </div>
    </div>
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:14px">
      <span id="${gid}-prog" style="font-size:.78rem;color:var(--muted)">1 / ${soal.length}</span>
      <span id="${gid}-score" style="font-family:'Fredoka One',cursive;font-size:1rem;color:var(--g)">✓ 0</span>
    </div>
    <!-- Card -->
    <div id="${gid}-card" style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:16px;padding:24px;text-align:center;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:all .3s">
      <div style="font-size:.72rem;font-weight:800;color:${info.color};margin-bottom:10px">PERNYATAAN #<span id="${gid}-num">1</span></div>
      <div id="${gid}-teks" style="font-size:1rem;font-weight:700;line-height:1.7;color:var(--text)"></div>
      <div id="${gid}-feedback" style="margin-top:12px;font-weight:900;font-size:.9rem;display:none"></div>
    </div>
    <!-- Buttons -->
    <div id="${gid}-btns" style="display:flex;gap:12px;margin-top:14px;justify-content:center">
      <button onclick="window['${gid}_answer'](false)" style="padding:12px 28px;border-radius:14px;background:rgba(255,107,107,.15);color:var(--r);border:2px solid rgba(255,107,107,.4);font-weight:900;font-size:.9rem;cursor:pointer;flex:1;max-width:180px">✗ Salah</button>
      <button onclick="window['${gid}_answer'](true)" style="padding:12px 28px;border-radius:14px;background:rgba(52,211,153,.15);color:var(--g);border:2px solid rgba(52,211,153,.4);font-weight:900;font-size:.9rem;cursor:pointer;flex:1;max-width:180px">✓ Benar</button>
    </div>
    <div id="${gid}-result" style="text-align:center;margin-top:16px;font-weight:900;font-size:1.1rem;display:none"></div>
  </div>
  <script>
  (function(){
    var soal=${soalJson},gid='${gid}',idx=0,score=0,answered=false;
    function show(){
      if(idx>=soal.length){
        document.getElementById(gid+'-card').innerHTML='<div style="font-size:2rem;margin-bottom:8px">🎓</div><div style="font-weight:900;color:var(--text)">Selesai!</div>';
        document.getElementById(gid+'-btns').style.display='none';
        var r=document.getElementById(gid+'-result');r.style.display='block';
        r.style.color=score>=soal.length*0.7?'var(--g)':'var(--y)';
        r.textContent='Skor: '+score+' / '+soal.length+(score>=soal.length*0.7?' 🎉 Hebat!':' 💪 Tetap semangat!');
        return;
      }
      answered=false;
      document.getElementById(gid+'-num').textContent=idx+1;
      document.getElementById(gid+'-teks').textContent=soal[idx].teks;
      document.getElementById(gid+'-feedback').style.display='none';
      document.getElementById(gid+'-prog').textContent=(idx+1)+' / '+soal.length;
      document.getElementById(gid+'-btns').style.display='flex';
      var c=document.getElementById(gid+'-card');c.style.borderColor='var(--border)';
    }
    window[gid+'_answer']=function(ans){
      if(answered)return;answered=true;
      var correct=soal[idx].jawaban,fb=document.getElementById(gid+'-feedback'),c=document.getElementById(gid+'-card');
      if(ans===correct){
        score++;fb.textContent='✅ Benar!';fb.style.color='var(--g)';c.style.borderColor='var(--g)';
        document.getElementById(gid+'-score').textContent='✓ '+score;
      }else{
        fb.textContent='❌ Salah! Jawaban: '+(correct?'Benar':'Salah');fb.style.color='var(--r)';c.style.borderColor='var(--r)';
      }
      fb.style.display='block';
      setTimeout(function(){idx++;show();},1200);
    };
    show();
  })();
  <\/script>`;
}

// ═══════════════════════════════════════════════════════════════
// GAME RENDERER DISPATCH
// ═══════════════════════════════════════════════════════════════
const GAME_RENDERER_MAP: Record<string, (game: GameData) => string> = {
  memory:    renderMemoryGame,
  matching:  renderMatchingGame,
  roda:      renderRodaGame,
  spinwheel: renderRodaGame,  // alias
  sorting:   renderSortingGame,
  truefalse: renderTrueFalseGame,
};

/**
 * Populate games with interactive HTML.
 * Takes games from the authoring store and returns a map of
 * gameId → HTML string for each game.
 */
export function populateGames(games: Array<Record<string, unknown>>): Map<string, string> {
  const result = new Map<string, string>();

  games.forEach((game, i) => {
    const type = String(game.type || '');
    const renderer = GAME_RENDERER_MAP[type];
    const gameId = `game-${type}-${i}`;

    if (renderer) {
      result.set(gameId, renderer(game));
    } else {
      // Fallback: generic placeholder for unknown game types
      const info = getModuleTypeInfo(type);
      const title = String(game.title || info.label || `Game ${i + 1}`);
      result.set(gameId, `<div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:1.5rem">${info.icon}</span>
          <div>
            <div style="font-weight:900;font-size:.95rem;color:${info.color}">${esc(title)}</div>
            <div style="font-size:.72rem;color:var(--muted);font-weight:600">${esc(info.desc)}</div>
          </div>
        </div>
        <div style="font-size:.82rem;color:var(--muted);line-height:1.6">
          🎮 Game <strong>${esc(info.label)}</strong> — konten akan tersedia di versi lengkap.
        </div>
      </div>`);
    }
  });

  return result;
}

/**
 * Render all games as a single HTML block (for backwards compat).
 * Used by bridge.ts buildGamesHtml().
 */
export function buildAllGamesHtml(games: Array<Record<string, unknown>>): string {
  const map = populateGames(games);
  return Array.from(map.values()).join('\n');
}

/** Check if a game type has a dedicated renderer */
export function hasGameRenderer(type: string): boolean {
  return type in GAME_RENDERER_MAP;
}
