// ═══════════════════════════════════════════════════════════════
// AUTO-BUILD — Data → pick templates → fill slots → generate pages
// Reads authoring store data and builds a complete screen set
// ═══════════════════════════════════════════════════════════════

import type { AutoBuildData, BuiltScreen, RenderContext } from './template-types';
import { renderTemplate } from './screen-templates';
import { generateHead, generateBaseJS, generateSkenarioJS, generateFungsiJS, generateKuisJS } from './base-engine';

// ── HTML escaping ─────────────────────────────────────────────
function esc(str: string | number | null | undefined): string {
  if (str == null) return '';
  const s = String(str);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Fungsi Norma Preset Data ─────────────────────────────────
const FUNGSI_NORMA = [
  {
    icon: '🗺️', label: 'Pedoman Tingkah Laku', color: 'var(--y)',
    bg: 'rgba(249,193,46,.06)', bc: 'rgba(249,193,46,.25)',
    desc: 'Norma memberi petunjuk kepada setiap individu tentang cara bertindak yang baik dan benar dalam pergaulan sehari-hari.',
    contoh: [
      'Norma sopan santun mengajarkan kita untuk mengucapkan salam saat bertemu',
      'Norma hukum lalu lintas memberi tahu kita harus berhenti saat lampu merah',
      'Norma agama memandu kita untuk berdoa sebelum makan dan bekerja',
    ],
    tanya: 'Sebutkan 1 norma yang selama ini menjadi panduan perilakumu di sekolah!',
  },
  {
    icon: '🤝', label: 'Menciptakan Ketertiban', color: 'var(--c)',
    bg: 'rgba(62,207,207,.06)', bc: 'rgba(62,207,207,.25)',
    desc: 'Norma mencegah kekacauan dan konflik. Dengan norma, setiap orang tahu apa yang boleh dan tidak boleh dilakukan sehingga kehidupan berjalan teratur.',
    contoh: [
      'Norma antrian di kasir mencegah keributan dan memastikan semua dilayani adil',
      'Peraturan sekolah membuat proses belajar-mengajar berlangsung kondusif',
      'Aturan lalu lintas mencegah kecelakaan dan kemacetan di jalan raya',
    ],
    tanya: 'Bayangkan jika tidak ada aturan di kelasmu — apa yang akan terjadi dalam 1 jam pelajaran?',
  },
  {
    icon: '🛡️', label: 'Melindungi Hak Warga', color: 'var(--r)',
    bg: 'rgba(255,107,107,.06)', bc: 'rgba(255,107,107,.25)',
    desc: 'Norma menjamin setiap anggota masyarakat mendapatkan hak-haknya dan diperlakukan secara adil tanpa diskriminasi.',
    contoh: [
      'Hukum melindungi hak milik — orang tidak boleh mencuri barang orang lain',
      'Norma agama melindungi hak beribadah setiap pemeluknya dari gangruan',
      'Aturan sekolah melindungi setiap siswa dari perundungan (bullying)',
    ],
    tanya: 'Hak apa yang kamu rasakan paling terlindungi oleh norma di lingkunganmu?',
  },
  {
    icon: '💚', label: 'Memperkuat Solidaritas', color: 'var(--g)',
    bg: 'rgba(52,211,153,.06)', bc: 'rgba(52,211,153,.25)',
    desc: 'Norma mempererat rasa kebersamaan, persatuan, dan kepedulian antaranggota masyarakat. Norma mengajarkan bahwa kita saling membutuhkan satu sama lain.',
    contoh: [
      'Norma gotong royong mendorong warga saling membantu saat ada musibah',
      'Norma saling menghormati memperkuat persatuan di tengah keberagaman',
      'Tradisi saling mengunjungi saat Lebaran/Natal mempererat tali silaturahmi',
    ],
    tanya: 'Contoh kegiatan gotong royong apa yang masih ada di lingkunganmu saat ini?',
  },
  {
    icon: '⚖️', label: 'Mewujudkan Keadilan', color: 'var(--p)',
    bg: 'rgba(167,139,250,.06)', bc: 'rgba(167,139,250,.25)',
    desc: 'Norma memastikan setiap orang diperlakukan setara dan adil. Tidak ada yang boleh mendapat perlakuan berbeda hanya karena kekayaan, jabatan, atau kekuasaan.',
    contoh: [
      'Hukum berlaku sama untuk semua orang — kaya atau miskin, pejabat atau rakyat biasa',
      'Norma antrian memastikan semua orang mendapat giliran yang sama tanpa pengecualian',
      'Penilaian di sekolah menggunakan kriteria yang sama untuk semua siswa',
    ],
    tanya: 'Pernahkah kamu melihat ketidakadilan di sekitarmu? Norma apa yang seharusnya ditegakkan?',
  },
];

// ── Helper: Render TP items HTML ─────────────────────────────
function renderTpFullHTML(tp: AutoBuildData['tp']): string {
  if (!tp.length) return '<p style="color:var(--muted);font-size:.82rem">Tujuan Pembelajaran belum diisi.</p>';
  return tp.map((t, i) =>
    `<div class="tp-full-item" style="border-color:${esc(t.color || 'var(--y)')}44;background:${esc(t.color || 'var(--y)')}0a">
      <div class="tp-full-num" style="background:${esc(t.color || 'var(--y)')}22;color:${esc(t.color || 'var(--y)')}">${i + 1}</div>
      <div>
        <div class="tp-full-verb" style="color:${esc(t.color || 'var(--y)')}">${esc(t.verb)}</div>
        <div class="tp-full-desc">${esc(t.desc)}</div>
        <span style="font-size:.68rem;font-weight:900;color:${esc(t.color || 'var(--y)')};background:${esc(t.color || 'var(--y)')}18;padding:1px 8px;border-radius:99px;display:inline-block;margin-top:4px">→ Pertemuan ${t.pertemuan || 1}</span>
      </div>
    </div>`
  ).join('');
}

function renderTpCoverHTML(tp: AutoBuildData['tp']): string {
  const filtered = tp.filter(t => (t.pertemuan || 1) === 1);
  if (!filtered.length) return '<p style="color:var(--muted);font-size:.82rem">TP pertemuan 1 belum diisi.</p>';
  return filtered.map((t, i) =>
    `<div class="tp-item">
      <div class="tp-num" style="background:${esc(t.color || 'var(--y)')}22;color:${esc(t.color || 'var(--y)')}">${i + 1}</div>
      <div><div class="tp-verb">${esc(t.verb)}</div><div class="tp-desc">${esc(t.desc)}</div></div>
    </div>`
  ).join('');
}

// ── Helper: Render ATP HTML ──────────────────────────────────
function renderAtpHTML(atp: AutoBuildData['atp']): string {
  if (!atp.pertemuan.length) return '<p style="color:var(--muted);font-size:.82rem">ATP belum diisi.</p>';
  return atp.pertemuan.map((p, i) =>
    `<div class="atp-p-card${i === 0 ? ' active-p' : ''}">
      <div class="atp-p-head">
        <span class="atp-p-badge" style="background:rgba(245,200,66,.2);color:#f5c842">${i === 0 ? '📍 ' : '→ '}Pertemuan ${i + 1}</span>
        <span style="font-size:.72rem;color:#5a7499">${esc(p.durasi)}</span>
        ${i === 0 ? '<span style="margin-left:auto;font-size:.72rem;font-weight:800;color:#34d399">✅ Sekarang</span>' : ''}
      </div>
      <div class="atp-p-title">${esc(p.judul)}</div>
      <div class="atp-p-tp">📚 ${esc(p.tp)}</div>
      <div class="atp-p-kegiatan">${esc(p.kegiatan)}</div>
      <span class="atp-p-penilaian">📋 ${esc(p.penilaian)}</span>
    </div>`
  ).join('');
}

// ── Helper: Render Alur HTML ─────────────────────────────────
function renderAlurHTML(alur: AutoBuildData['alur']): string {
  if (!alur.length) return '<p style="color:var(--muted);font-size:.82rem">Alur pembelajaran belum diisi.</p>';
  const fc: Record<string, string> = { Pendahuluan: '#f5c842', Inti: '#38d9d9', Penutup: '#34d399' };
  return alur.map(s => {
    const col = fc[s.fase] || '#a78bfa';
    return `<div class="alur-step">
      <span class="alur-jp" style="background:${col}22;color:${col}">${esc(s.fase)}</span>
      <span class="alur-dur">${esc(s.durasi)}</span>
      <div class="alur-txt"><strong>${esc(s.judul)}</strong>${s.deskripsi ? ' — ' + esc(s.deskripsi) : ''}</div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
// AUTO-BUILD: Data → Built Screens
// ═══════════════════════════════════════════════════════════════
export function autoBuildScreens(data: AutoBuildData): BuiltScreen[] {
  const screens: BuiltScreen[] = [];
  const M = data.meta;
  const hasModules = data.modules && data.modules.length > 0;
  const hasSkenario = data.skenario && data.skenario.length > 0;
  const hasMateri = data.materi?.blok && data.materi.blok.length > 0;
  const hasKuis = data.kuis && data.kuis.length > 0;
  const hasGames = data.games && data.games.length > 0;

  // 1. COVER — always included
  screens.push({
    templateId: 'cover',
    screenId: 's-cover',
    label: 'Cover',
    included: true,
    data: {
      ikon: M.ikon || '📚',
      judul: M.judulPertemuan || 'Media Pembelajaran',
      subjudul: M.subjudul || '',
      mapel: M.mapel || 'PPKn',
      kelas: M.kelas || 'VII',
      durasi: M.durasi || '2 × 40 menit',
      kurikulum: M.kurikulum || 'Kurikulum Merdeka',
      nextScreen: 's-cp',
    },
  });

  // 2. CP / TP / ATP — always included if there's any data
  const cpNextScreen = hasModules ? 's-modules' : hasSkenario ? 's-sk' : hasMateri ? 's-materi' : hasKuis ? 's-kuis' : 's-hasil';
  screens.push({
    templateId: 'cp-tp-atp',
    screenId: 's-cp',
    label: 'CP / TP / ATP',
    included: true,
    data: {
      logo: M.namaBab || M.judulPertemuan || 'Media',
      cpElemen: data.cp.elemen,
      cpSubElemen: data.cp.subElemen,
      cpCapaianFase: data.cp.capaianFase,
      cpProfil: data.cp.profil,
      tpList: renderTpFullHTML(data.tp),
      atpList: renderAtpHTML(data.atp),
      alurList: renderAlurHTML(data.alur),
      tpCoverList: renderTpCoverHTML(data.tp),
      nextScreen: cpNextScreen,
    },
  });

  // 3. SKENARIO — if data exists
  if (hasSkenario) {
    const skNext = hasModules ? 's-modules' : hasMateri ? 's-materi' : hasKuis ? 's-kuis' : 's-hasil';
    screens.push({
      templateId: 'skenario',
      screenId: 's-sk',
      label: 'Skenario',
      included: true,
      data: {
        logo: M.namaBab || 'Media',
        nextScreen: skNext,
      },
    });
  }

  // 4. MATERI — modules + materi blok + fungsi
  if (hasModules || hasMateri) {
    const matNext = hasKuis ? 's-kuis' : 's-hasil';
    const matPrev = hasSkenario ? 's-sk' : 's-cp';
    screens.push({
      templateId: 'materi',
      screenId: 's-materi',
      label: 'Materi',
      included: true,
      data: {
        logo: M.namaBab || 'Media',
        modulesHtml: '', // will be filled by module renderer at export time
        materiHtml: '',  // will be filled by materi renderer
        fungsiHtml: '',  // will be filled by fungsi renderer
        prevScreen: matPrev,
        nextScreen: matNext,
      },
    });
  }

  // 5. GAME — if games exist
  if (hasGames) {
    screens.push({
      templateId: 'game',
      screenId: 's-games',
      label: 'Game',
      included: true,
      data: {
        logo: M.namaBab || 'Media',
        gamesHtml: '',
        nextScreen: hasKuis ? 's-kuis' : 's-hasil',
      },
    });
  }

  // 6. KUIS — if kuis data exists
  if (hasKuis) {
    screens.push({
      templateId: 'kuis',
      screenId: 's-kuis',
      label: 'Kuis',
      included: true,
      data: {
        logo: M.namaBab || 'Media',
        soalCount: String(data.kuis.length),
        nextScreen: 's-hasil',
      },
    });
  }

  // 7. HASIL — if there's a kuis
  if (hasKuis) {
    screens.push({
      templateId: 'hasil',
      screenId: 's-hasil',
      label: 'Hasil',
      included: true,
      data: {
        logo: M.namaBab || 'Media',
      },
    });
  }

  // 8. PENUTUP — always included
  screens.push({
    templateId: 'penutup',
    screenId: 's-penutup',
    label: 'Penutup',
    included: true,
    data: {
      judul: '🎓 Pembelajaran Selesai!',
      pesan: 'Terima kasih sudah belajar hari ini. Terus terapkan apa yang sudah dipelajari!',
      ikon: '🌟',
    },
  });

  return screens;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT: Build complete HTML from data using template system
// ═══════════════════════════════════════════════════════════════
export function exportWithTemplateSystem(data: AutoBuildData, modulesHtml = '', gamesHtml = '', materiHtml = ''): string {
  const screens = autoBuildScreens(data);
  const M = data.meta;

  // Fill in module/game/materi HTML for the relevant screens
  for (const screen of screens) {
    if (screen.screenId === 's-materi') {
      screen.data.modulesHtml = modulesHtml;
      screen.data.materiHtml = materiHtml;
      // Generate fungsi section HTML
      screen.data.fungsiHtml = `<div class="card mt14">
        <div class="h2">⚖️ Fungsi <span class="hl">Norma</span></div>
        <p class="sub mt8">Klik setiap tab untuk menjelajahi fungsi norma dalam kehidupan.</p>
        <div class="ftab-row" id="ftabRow"></div>
        <div id="ftabContent"></div>
      </div>`;
    }
    if (screen.screenId === 's-games') {
      screen.data.gamesHtml = gamesHtml;
    }
  }

  // Render each screen using its template
  const totalScreens = screens.filter(s => s.included).length;
  let screenIndex = 0;
  const screensHtml = screens.filter(s => s.included).map((screen) => {
    const ctx: RenderContext = {
      screenId: screen.screenId,
      progress: Math.round(((screenIndex + 1) / totalScreens) * 100),
      score: 0,
      hasNavbar: screen.templateId !== 'cover' && screen.templateId !== 'penutup',
      screenIndex,
      totalScreens,
    };
    screenIndex++;
    return renderTemplate(screen.templateId, screen.data, ctx);
  }).join('\n\n');

  // Generate JS sections
  const skJS = JSON.stringify(data.skenario || []);
  const kuisJS = JSON.stringify((data.kuis || []).map(s => ({ q: s.q, opts: s.opts || ['', '', '', ''], ans: s.ans, ex: s.ex })));
  const fungsiJS = JSON.stringify(FUNGSI_NORMA);

  return `<!DOCTYPE html>
<html lang="id">
${generateHead(`${esc(M.judulPertemuan || 'Media Pembelajaran')} | ${esc(M.mapel)} ${esc(M.kelas)}`)}
<body>
<div id="confWrap"></div>

${screensHtml}

<script>
var S={score:0,skScore:0};
${generateBaseJS()}

${data.skenario?.length ? generateSkenarioJS(skJS) : ''}

${generateFungsiJS(fungsiJS)}

${data.kuis?.length ? generateKuisJS(kuisJS) : ''}
<\/script>
</body>
</html>`;
}
