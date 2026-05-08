// ═══════════════════════════════════════════════════════════════
// BASE ENGINE — Shared CSS + JS for all template-based exports
// Extracted from export-html.ts & canva-export.ts for reuse
// ═══════════════════════════════════════════════════════════════

import { DEFAULT_THEME, type ThemeConfig } from './template-types';

// ── Generate CSS Variables from Theme ────────────────────────
function themeVars(t: ThemeConfig): string {
  return `--bg:${t.bg};--bg2:${t.bg2};--card:${t.card};--border:${t.border};
  --y:${t.yellow};--c:${t.cyan};--r:${t.red};--p:${t.purple};--g:${t.green};--o:${t.orange};
  --text:${t.text};--muted:${t.muted};--rad:${t.radius};`;
}

// ── BASE CSS ─────────────────────────────────────────────────
export function generateBaseCSS(theme: Partial<ThemeConfig> = {}): string {
  const t = { ...DEFAULT_THEME, ...theme };
  return `:root{${themeVars(t)}}
*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{font-family:'Nunito',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden;}
.screen{display:none;min-height:100vh;animation:fadeIn .4s ease;}
.screen.active{display:flex;flex-direction:column;}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}

/* ── Navbar ─────────────────────────────────────── */
.navbar{background:rgba(14,28,47,.96);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);
  padding:10px 18px;display:flex;align-items:center;gap:10px;position:sticky;top:0;z-index:200;}
.nav-logo{font-family:'Fredoka One',cursive;font-size:.95rem;color:var(--y);white-space:nowrap;}
.nav-prog{flex:1;height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin:0 8px;}
.nav-prog-fill{height:100%;background:linear-gradient(90deg,var(--y),var(--c));border-radius:99px;transition:width .5s;}
.nav-score{font-size:.8rem;font-weight:800;color:var(--y);white-space:nowrap;}

/* ── Buttons ────────────────────────────────────── */
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 24px;border-radius:99px;
  font-family:'Nunito',sans-serif;font-weight:800;font-size:.9rem;border:none;cursor:pointer;transition:all .18s;}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.3);}
.btn-y{background:var(--y);color:#0e1c2f;}.btn-c{background:var(--c);color:#0e1c2f;}
.btn-g{background:var(--g);color:#0e1c2f;}.btn-ghost{background:rgba(255,255,255,.08);color:var(--text);border:1px solid var(--border);}
.btn-sm{padding:7px 15px;font-size:.78rem;}
.btn-row{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px;}
.btn-center{justify-content:center;}

/* ── Card ────────────────────────────────────────── */
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--rad);padding:20px;}
.h2{font-family:'Fredoka One',cursive;font-size:1.6rem;line-height:1.2;}
.sub{color:var(--muted);font-size:.86rem;line-height:1.6;}
.chip{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:99px;font-size:.74rem;font-weight:800;}
.hl{color:var(--y);}
.mt8{margin-top:8px;}.mt14{margin-top:14px;}.mt20{margin-top:20px;}
.def-box{border-left:4px solid var(--y);background:rgba(249,193,46,.07);border-radius:0 11px 11px 0;padding:13px 15px;margin:13px 0;font-size:.91rem;line-height:1.7;}
.main{flex:1;padding:22px 16px;max-width:860px;width:100%;margin:0 auto;}

/* ── Cover ───────────────────────────────────────── */
#s-cover{background:radial-gradient(ellipse 90% 60% at 50% 0%,rgba(249,193,46,.18),transparent 60%),linear-gradient(180deg,#0e1c2f,#09121f);}
.cover-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:36px 18px;}
.cover-icon{font-size:4.5rem;animation:float 3s ease-in-out infinite;}
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
.cover-title{font-family:'Fredoka One',cursive;font-size:clamp(1.7rem,5.5vw,2.8rem);line-height:1.1;margin:10px 0 6px;}
.cover-chips{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:14px 0 26px;}

/* ── TP Items ────────────────────────────────────── */
.tp-list{display:flex;flex-direction:column;gap:9px;margin-top:10px;}
.tp-item{display:flex;align-items:flex-start;gap:12px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;padding:12px 14px;}
.tp-num{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:900;flex-shrink:0;}
.tp-verb{font-weight:900;font-size:.86rem;margin-bottom:2px;}
.tp-desc{color:var(--muted);font-size:.79rem;line-height:1.5;}
.tp-full-item{display:flex;gap:12px;padding:11px 13px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;margin-bottom:8px;}
.tp-full-num{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:900;flex-shrink:0;margin-top:2px;}
.tp-full-verb{font-weight:900;font-size:.84rem;margin-bottom:2px;}
.tp-full-desc{font-size:.78rem;color:var(--muted);line-height:1.5;}

/* ── ATP ─────────────────────────────────────────── */
.atp-pertemuan-grid{display:flex;flex-direction:column;gap:10px;margin:12px 0;}
.atp-p-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px;}
.atp-p-card.active-p{border-color:rgba(249,193,46,.3);background:rgba(249,193,46,.04);}
.atp-p-head{display:flex;align-items:center;gap:8px;margin-bottom:7px;flex-wrap:wrap;}
.atp-p-badge{padding:3px 10px;border-radius:99px;font-size:.7rem;font-weight:900;}
.atp-p-title{font-weight:900;font-size:.95rem;margin-bottom:4px;}
.atp-p-tp{font-size:.78rem;color:var(--c);margin-bottom:5px;font-weight:700;}
.atp-p-kegiatan{font-size:.76rem;color:var(--muted);line-height:1.5;margin-bottom:7px;}
.atp-p-penilaian{font-size:.7rem;font-weight:800;color:var(--g);}

/* ── Alur ────────────────────────────────────────── */
.alur-steps{display:flex;flex-direction:column;gap:8px;margin:14px 0;}
.alur-step{display:flex;gap:12px;align-items:flex-start;padding:11px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);}
.alur-jp{font-size:.68rem;font-weight:900;padding:3px 9px;border-radius:99px;white-space:nowrap;flex-shrink:0;margin-top:2px;}
.alur-dur{font-size:.75rem;font-weight:900;color:var(--y);min-width:52px;flex-shrink:0;margin-top:2px;}
.alur-txt{font-size:.82rem;line-height:1.5;}
.alur-txt strong{color:var(--text);}

/* ── Tabs (CP & Fungsi) ─────────────────────────── */
.ktab-row{display:flex;gap:0;border-bottom:2px solid var(--border);margin-bottom:16px;}
.ktab{padding:9px 16px;font-size:.78rem;font-weight:800;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .2s;}
.ktab.active{color:var(--y);border-bottom-color:var(--y);}
.ktab-content{display:none;animation:fadeIn .3s ease;}
.ktab-content.active{display:block;}
.ftab-row{display:flex;gap:6px;margin:12px 0;flex-wrap:wrap;}
.ftab{padding:6px 12px;border-radius:99px;font-size:.76rem;font-weight:800;cursor:pointer;border:1px solid var(--border);background:rgba(255,255,255,.04);color:var(--muted);transition:all .2s;}

/* ── Skenario ────────────────────────────────────── */
.sk-shell{background:#0a0f1a;border:3px solid #1e3a5a;border-radius:16px;overflow:hidden;margin:12px 0;}
.sk-hud{background:linear-gradient(90deg,#0d1b2f,#0f2340);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #1e3a5a;gap:12px;}
.sk-hud-title{font-family:'Fredoka One',cursive;font-size:.9rem;color:var(--y);}
.sk-badge{padding:3px 10px;border-radius:99px;font-size:.7rem;font-weight:800;}
.sk-scene{position:relative;width:100%;height:180px;overflow:hidden;}
.sbg-pasar{background:linear-gradient(180deg,#87CEEB 0%,#b0d4f0 45%,#999 60%,#a08050 100%);}
.sbg-masjid{background:linear-gradient(180deg,#fce4ec 0%,#f8d7e3 45%,#81c784 100%);}
.sbg-kelas{background:linear-gradient(180deg,#e8f4fd,#d0eaf8 100%);}
.sbg-kampung{background:linear-gradient(180deg,#c8e6c9 0%,#81c784 48%,#b09060 100%);}
.sbg-hutan{background:linear-gradient(180deg,#a8d5ba 0%,#2d6a4f 48%,#1a3a2a 100%);}
.sbg-pantai{background:linear-gradient(180deg,#87ceeb 0%,#4ea8de 40%,#f2cc8f 75%,#deb887 100%);}
.sk-char{position:absolute;bottom:28%;display:flex;flex-direction:column;align-items:center;}
.sk-head{width:32px;height:32px;border-radius:50%;border:2px solid rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;font-size:1.1rem;}
.sk-body{width:24px;height:26px;border-radius:5px 5px 3px 3px;border:2px solid rgba(0,0,0,.1);margin-top:-2px;}
.sk-legs{display:flex;gap:3px;margin-top:1px;}
.sk-leg{width:8px;height:16px;border-radius:0 0 4px 4px;border:1px solid rgba(0,0,0,.1);}
.sk-dialogue{position:absolute;bottom:0;left:0;right:0;background:rgba(8,16,30,.92);border-top:2px solid #1e3a5a;padding:12px 14px;min-height:76px;}
.sk-speaker{font-size:.7rem;font-weight:800;color:var(--c);margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em;}
.sk-text{font-size:.85rem;font-weight:700;line-height:1.5;color:#e8f2ff;}
.sk-tap{font-size:.68rem;color:var(--muted);margin-top:5px;animation:tapP 1.4s ease-in-out infinite;}
@keyframes tapP{0%,100%{opacity:1;}50%{opacity:.3;}}
.sk-choices{padding:14px;}
.sk-choice-prompt{font-size:.83rem;font-weight:800;color:var(--y);margin-bottom:10px;text-align:center;}
.sk-choice{background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);border-radius:12px;padding:11px 14px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:10px;font-size:.83rem;font-weight:700;margin-bottom:8px;}
.sk-choice:hover{background:rgba(255,255,255,.1);border-color:var(--c);}
.sk-result{padding:14px;}
.sk-result-banner{border-radius:12px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;}
.sk-result-banner.good{background:rgba(52,211,153,.1);border:2px solid rgba(52,211,153,.3);}
.sk-result-banner.bad{background:rgba(255,107,107,.1);border:2px solid rgba(255,107,107,.3);}
.sk-result-banner.mid{background:rgba(249,193,46,.1);border:2px solid rgba(249,193,46,.3);}
.sk-result-title{font-weight:900;font-size:.92rem;margin-bottom:3px;}
.sk-result-body{font-size:.8rem;line-height:1.5;color:var(--muted);}
.sk-result-banner.good .sk-result-title{color:var(--g);}
.sk-result-banner.bad .sk-result-title{color:var(--r);}
.sk-result-banner.mid .sk-result-title{color:var(--y);}

/* ── Kuis ────────────────────────────────────────── */
.q-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px;}
.q-text{font-weight:700;font-size:.9rem;line-height:1.5;margin-bottom:12px;}
.q-opts{display:flex;flex-direction:column;gap:7px;}
.q-opt{display:flex;align-items:flex-start;gap:10px;padding:10px 13px;border-radius:10px;background:rgba(255,255,255,.04);border:2px solid rgba(255,255,255,.07);cursor:pointer;font-size:.83rem;font-weight:700;transition:all .18s;line-height:1.4;}
.q-opt:hover:not(.dis){border-color:var(--c);background:rgba(62,207,207,.06);}
.q-opt.ok{border-color:var(--g);background:rgba(52,211,153,.1);color:var(--g);}
.q-opt.no{border-color:var(--r);background:rgba(255,107,107,.1);color:var(--r);}
.q-opt.shok{border-color:var(--g);background:rgba(52,211,153,.05);}
.q-opt.dis{cursor:default;pointer-events:none;}
.q-fb{padding:9px 12px;border-radius:9px;margin-top:8px;font-size:.79rem;font-weight:700;line-height:1.5;}
.q-fb.ok{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:var(--g);}
.q-fb.no{background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);color:var(--r);}

/* ── Hasil ────────────────────────────────────────── */
.hasil-circle{width:140px;height:140px;border-radius:50%;background:conic-gradient(var(--g) 0%,var(--g) var(--prog,0%),rgba(255,255,255,.06) var(--prog,0%) 100%);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;position:relative;}
.hasil-circle::before{content:'';position:absolute;inset:10px;border-radius:50%;background:var(--bg2);}
.hasil-score{position:relative;z-index:1;text-align:center;}
.refl-item{border-radius:12px;padding:12px;border:1px solid rgba(255,255,255,.08);margin-bottom:10px;}
.refl-item label{font-size:.78rem;font-weight:800;display:block;margin-bottom:5px;}
.refl-item textarea{width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:'Nunito',sans-serif;font-size:.8rem;resize:vertical;min-height:58px;}

/* ── Confetti ────────────────────────────────────── */
.conf{position:fixed;border-radius:2px;animation:confFall linear both;pointer-events:none;z-index:9999;}
@keyframes confFall{to{transform:translateY(110vh) rotate(720deg);opacity:0;}}
#confWrap{position:fixed;inset:0;pointer-events:none;z-index:9998;}

/* ── Hero ────────────────────────────────────────── */
.hero-banner{border-radius:18px;padding:32px 22px;text-align:center;margin-bottom:14px;position:relative;overflow:hidden;}
.hero-banner .hero-glow{position:absolute;inset:0;background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(255,255,255,.1),transparent 70%);pointer-events:none;}
.hero-banner .hero-icon{font-size:3.2rem;margin-bottom:12px;animation:float 3s ease-in-out infinite;}
.hero-banner .hero-title{font-family:'Fredoka One',cursive;font-size:clamp(1.5rem,6vw,2.4rem);color:#fff;line-height:1.2;margin-bottom:10px;text-shadow:0 2px 20px rgba(0,0,0,.4);}
.hero-banner .hero-sub{color:rgba(255,255,255,.8);font-size:.88rem;line-height:1.6;max-width:400px;margin:0 auto 18px;}
.hero-banner .hero-chips{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;}
.hero-banner .hero-chip{background:rgba(255,255,255,.15);backdrop-filter:blur(8px);color:#fff;padding:3px 11px;border-radius:99px;font-size:.7rem;font-weight:800;border:1px solid rgba(255,255,255,.2);}
.hero-banner .hero-cta{display:inline-flex;align-items:center;gap:7px;padding:10px 22px;background:rgba(255,255,255,.2);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.35);border-radius:99px;font-weight:800;font-size:.85rem;color:#fff;cursor:default;}

/* ── Misc ────────────────────────────────────────── */
@keyframes popIn{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes correctPulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}50%{box-shadow:0 0 0 12px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
@keyframes wrongShake{0%,100%{transform:translateX(0)}15%,45%,75%{transform:translateX(-6px)}30%,60%,90%{transform:translateX(6px)}}`;
}

// ── BASE JS — Screen Navigation & Shared Logic ──────────────
export function generateBaseJS(): string {
  return `// ── SCREEN NAVIGATION ────────────────────────────────────
function goScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  var el=document.getElementById(id);
  if(el){el.classList.add('active');window.scrollTo(0,0);}
  if(id==='s-sk')initSk();
  if(id==='s-materi')initFtab();
  if(id==='s-kuis')renderKuis();
}

// ── CP TABS ────────────────────────────────────────────────
function switchKtab(id,el){
  document.querySelectorAll('.ktab').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('.ktab-content').forEach(function(t){t.classList.remove('active');});
  if(el)el.classList.add('active');
  var cont=document.getElementById(id);
  if(cont)cont.classList.add('active');
}

// ── CONFETTI ───────────────────────────────────────────────
function launchConfetti(){
  var w=document.getElementById('confWrap');
  var cols=['#f9c12e','#3ecfcf','#ff6b6b','#a78bfa','#34d399'];
  for(var i=0;i<80;i++){
    var c=document.createElement('div');c.className='conf';
    var sz=4+Math.random()*9;
    c.style.cssText='left:'+Math.random()*100+'%;top:'+(-20-Math.random()*30)+'px;width:'+sz+'px;height:'+sz+'px;background:'+cols[Math.floor(Math.random()*cols.length)]+';border-radius:'+(Math.random()>.5?'50%':'2px')+';animation-duration:'+(2+Math.random()*2)+'s;animation-delay:'+(Math.random()*.6)+'s;';
    w.appendChild(c);
  }
  setTimeout(function(){w.innerHTML='';},5000);
}`;
}

// ── SKENARIO JS ─────────────────────────────────────────────
export function generateSkenarioJS(chaptersJSON: string): string {
  return `var CHAPTERS=${chaptersJSON};
var skCh=0,skStep=0;
function initSk(){
  if(!CHAPTERS.length){
    document.getElementById('skBody').innerHTML='<div style="padding:30px;text-align:center;color:var(--muted)">Skenario belum diisi.</div>';
    if(document.getElementById('btnNextAfterSk'))document.getElementById('btnNextAfterSk').style.display='inline-flex';
    return;
  }
  skCh=0;renderSkProg();startChapter();
}
function renderSkProg(){
  var el=document.getElementById('skProgress');
  if(!el)return;
  el.innerHTML=CHAPTERS.map(function(_,i){
    return '<div style="flex:1;height:4px;border-radius:99px;background:'+(i<skCh?'#34d399':i===skCh?'#f9c12e':'#1e3a5a')+';transition:all .3s'+(i===skCh?';box-shadow:0 0 6px #f9c12e':'')+'"></div>';
  }).join('');
}
function startChapter(){
  var ch=CHAPTERS[skCh];if(!ch)return;
  document.getElementById('skTitle').textContent=ch.title||'';
  skStep=0;showSetup();
}
function showSetup(){
  var ch=CHAPTERS[skCh];var step=ch.setup[skStep];
  if(!step)return showChoices();
  document.getElementById('skBody').innerHTML=
    '<div class="sk-scene '+(ch.bg||'sbg-kampung')+'">'+
      '<div class="sk-char" style="left:50%;transform:translateX(-50%)">'+
        '<div class="sk-head" style="background:#fff2d9">'+(ch.charEmoji||'😊')+'</div>'+
        '<div class="sk-body" style="background:'+(ch.charColor||'#3a7a9a')+'"></div>'+
        '<div class="sk-legs"><div class="sk-leg" style="background:'+(ch.charPants||'#3a5a7a')+'"></div><div class="sk-leg" style="background:'+(ch.charPants||'#3a5a7a')+'"></div></div>'+
      '</div>'+
    '</div>'+
    '<div class="sk-dialogue">'+
      '<div class="sk-speaker">'+step.speaker+'</div>'+
      '<div class="sk-text" id="skTypedText"></div>'+
      '<div class="sk-tap">Ketuk untuk lanjut ▶</div>'+
    '</div>';
  document.getElementById('skBody').onclick=advanceSetup;
  typeText('skTypedText',step.text||'');
}
function typeText(id,text){
  var el=document.getElementById(id);if(!el)return;
  el.textContent='';var i=0;
  var t=setInterval(function(){if(i>=text.length){clearInterval(t);return;}el.textContent+=text[i++];},22);
}
function advanceSetup(){
  document.getElementById('skBody').onclick=null;
  skStep++;
  if(skStep<CHAPTERS[skCh].setup.length)showSetup();
  else showChoices();
}
function showChoices(){
  var ch=CHAPTERS[skCh];
  document.getElementById('skBody').innerHTML=
    '<div class="sk-choices">'+
      '<div class="sk-choice-prompt">'+(ch.choicePrompt||'Apa yang kamu lakukan?')+'</div>'+
      ch.choices.map(function(c,i){
        return '<div class="sk-choice" onclick="pickChoice('+i+')">'+
          '<span style="font-size:1.3rem">'+(c.icon||'')+'</span>'+
          '<div><div>'+(c.label||'')+'</div>'+
          '<div style="font-size:.72rem;color:var(--muted);font-weight:600">'+(c.detail||'')+'</div></div>'+
        '</div>';
      }).join('')+
    '</div>';
}
function pickChoice(i){
  var ch=CHAPTERS[skCh];var c=ch.choices[i];
  S.skScore+=(c.pts||0);
  var icons={good:'🌟',mid:'🤔',bad:'⚠️'};
  document.getElementById('skBody').innerHTML=
    '<div class="sk-result">'+
      '<div class="sk-result-banner '+(c.level||'mid')+'">'+
        '<div style="font-size:2rem">'+(icons[c.level]||'💡')+'</div>'+
        '<div>'+
          '<div class="sk-result-title">'+(c.resultTitle||'')+'</div>'+
          '<div class="sk-result-body">'+(c.resultBody||'')+'</div>'+
        '</div>'+
      '</div>'+
      '<div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:11px;padding:11px 13px;margin-bottom:10px">'+
        '<div style="font-size:.72rem;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:5px">🔍 Kaitannya dengan Norma</div>'+
        '<div style="font-size:.8rem;font-weight:700;color:var(--c);margin-bottom:6px">'+(c.norma||'')+'</div>'+
        (c.consequences||[]).map(function(k){return '<div style="display:flex;gap:8px;font-size:.8rem;margin-bottom:4px">'+k.icon+' '+k.text+'</div>';}).join('')+
      '</div>'+
      '<div style="text-align:center">'+
        (skCh<CHAPTERS.length-1
          ?'<button class="btn btn-y btn-sm" onclick="skCh++;renderSkProg();startChapter()">Skenario Berikutnya →</button>'
          :'<button class="btn btn-g btn-sm" onclick="endSk()">Selesai! 🎉</button>')+
      '</div>'+
    '</div>';
  document.getElementById('skScoreBadge').textContent=S.skScore+' poin';
}
function endSk(){
  document.getElementById('skBody').innerHTML=
    '<div style="padding:20px;text-align:center;background:#060d18;border-top:2px solid #1e3a5a">'+
      '<div style="font-size:3rem;margin-bottom:10px">🎭</div>'+
      '<div style="font-family:Fredoka One,cursive;font-size:1.2rem;margin-bottom:6px">Skenario Selesai!</div>'+
      '<div style="font-family:Fredoka One,cursive;font-size:1.8rem;color:var(--g)">'+S.skScore+' poin</div>'+
    '</div>';
  if(document.getElementById('btnNextAfterSk'))document.getElementById('btnNextAfterSk').style.display='inline-flex';
}`;
}

// ── FUNGSI TABS JS ──────────────────────────────────────────
export function generateFungsiJS(fungsiJSON: string): string {
  return `var FUNGSI=${fungsiJSON};
var curFtab=0;
function initFtab(){curFtab=0;renderFtabUI();}
function renderFtabUI(){
  document.getElementById('ftabRow').innerHTML=FUNGSI.map(function(f,i){
    return '<div class="ftab'+(i===curFtab?' active':'')+'" onclick="switchFtabF('+i+')" style="'+(i===curFtab?'background:'+f.color+';color:#0e1c2f;border-color:transparent;':'')+'">'+f.icon+' '+f.label+'</div>';
  }).join('');
  var f=FUNGSI[curFtab];
  document.getElementById('ftabContent').innerHTML=
    '<div style="background:'+f.bg+';border:1px solid '+f.bc+';border-radius:14px;padding:16px;animation:fadeIn .3s ease">'+
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'+
        '<span style="font-size:2rem">'+f.icon+'</span>'+
        '<div style="font-weight:900;font-size:1rem;color:'+f.color+'">'+f.label+'</div>'+
      '</div>'+
      '<p style="font-size:.84rem;line-height:1.7;margin-bottom:12px">'+f.desc+'</p>'+
      f.contoh.map(function(c){return '<div style="display:flex;gap:8px;font-size:.8rem;margin-bottom:5px;line-height:1.5"><span style="color:'+f.color+';font-weight:900">→</span><span>'+c+'</span></div>';}).join('')+
      '<div style="background:rgba(255,255,255,.05);border-radius:9px;padding:10px;margin-top:10px;font-size:.8rem">'+
        '<span style="font-weight:800;color:'+f.color+'">💬 Diskusi:</span> '+f.tanya+
      '</div>'+
    '</div>';
}
function switchFtabF(i){curFtab=i;renderFtabUI();}`;
}

// ── KUIS JS ─────────────────────────────────────────────────
export function generateKuisJS(kuisJSON: string): string {
  return `var KUIS_SOAL=${kuisJSON};
var kuisAnswers={};
function renderKuis(){
  kuisAnswers={};
  if(!KUIS_SOAL.length){
    document.getElementById('kuisContainer').innerHTML='<div class="card" style="text-align:center;padding:30px;color:var(--muted)">Kuis belum diisi.</div>';
    return;
  }
  document.getElementById('kuisContainer').innerHTML=KUIS_SOAL.map(function(s,i){
    return '<div class="q-card">'+
      '<div class="q-text">'+(i+1)+'. '+s.q+'</div>'+
      '<div class="q-opts">'+
        (s.opts||[]).map(function(o,j){
          return '<div class="q-opt" id="qo_'+i+'_'+j+'" onclick="answerQ('+i+','+j+','+s.ans+')">'+
            '<span style="font-weight:900;color:var(--c)'+'ABCD'[j]+'. </span>'+o+
          '</div>';
        }).join('')+
      '</div>'+
      '<div id="qfb_'+i+'" style="display:none" class="q-fb"></div>'+
    '</div>';
  }).join('');
}
function answerQ(qi,choice,correct){
  if(kuisAnswers[qi]!==undefined)return;
  kuisAnswers[qi]=choice;
  document.querySelectorAll('[id^="qo_'+qi+'_"]').forEach(function(o){o.classList.add('dis');});
  document.getElementById('qo_'+qi+'_'+choice).classList.add(choice===correct?'ok':'no');
  if(choice!==correct)document.getElementById('qo_'+qi+'_'+correct).classList.add('shok');
  var fb=document.getElementById('qfb_'+qi);
  fb.style.display='block';
  fb.className='q-fb '+(choice===correct?'ok':'no');
  fb.textContent=(choice===correct?'✅ Benar! ':'❌ Salah. ')+(KUIS_SOAL[qi].ex||'');
  if(Object.keys(kuisAnswers).length===KUIS_SOAL.length)
    document.getElementById('btnKuisSubmit').style.display='inline-flex';
}
function submitKuis(){
  var correct=KUIS_SOAL.filter(function(_,i){return kuisAnswers[i]===KUIS_SOAL[i].ans;}).length;
  var skor=Math.round((correct/KUIS_SOAL.length)*100);
  goScreen('s-hasil');
  var hc=document.getElementById('hasilCircle');
  hc.style.setProperty('--prog',skor+'%');
  document.getElementById('hasilNum').textContent=skor;
  var lv=document.getElementById('hasilLevel');
  if(skor>=85){lv.textContent='🌟 Sangat Baik!';lv.style.cssText='background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:var(--g);padding:10px 20px;border-radius:12px;display:inline-block';}
  else if(skor>=70){lv.textContent='👍 Baik';lv.style.cssText='background:rgba(249,193,46,.1);border:1px solid rgba(249,193,46,.3);color:var(--y);padding:10px 20px;border-radius:12px;display:inline-block';}
  else{lv.textContent='💪 Perlu Latihan';lv.style.cssText='background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);color:var(--r);padding:10px 20px;border-radius:12px;display:inline-block';}
  if(skor>=70)launchConfetti();
}`;
}

// ── HTML HEADER — generates <head> with base CSS + fonts ─────
export function generateHead(title: string, theme: Partial<ThemeConfig> = {}): string {
  return `<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap" rel="stylesheet">
<style>${generateBaseCSS(theme)}</style>
</head>`;
}
