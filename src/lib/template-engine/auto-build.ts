// ═══════════════════════════════════════════════════════════════
// AUTO-BUILD — Data → pick templates → fill slots → generate pages
// Reads authoring store data and builds a complete screen set
// V7 Reference Architecture: 17 possible screens, content-analysis driven
// ═══════════════════════════════════════════════════════════════

import type { AutoBuildData, BuiltScreen, RenderContext } from './template-types';
import { renderTemplate } from './screen-templates';
import { generateHead, generateBaseJS, generateSkenarioJS, generateFungsiJS, generateKuisJS } from './base-engine';
import { FUNGSI_NORMA, esc } from '@/lib/shared/constants';
import { getAccentForPertemuan } from '@/lib/shared/types';

// ── Helper: Extract pertemuan number from judulPertemuan ──────
function extractPertemuanKe(judul: string): number {
  const m = judul.match(/pertemuan\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : 1;
}

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

// ── Helper: Render TP for cover (filtered by pertemuan) ──────
function renderTpCoverHTML(tp: AutoBuildData['tp'], ke: number): string {
  const filtered = tp.filter(t => (t.pertemuan || 1) === ke);
  if (!filtered.length) return '<p style="color:var(--muted);font-size:.82rem">TP pertemuan ' + ke + ' belum diisi.</p>';
  return filtered.map((t, i) =>
    `<div class="tp-item">
      <div class="tp-num" style="background:${esc(t.color || 'var(--y)')}22;color:${esc(t.color || 'var(--y)')}">${i + 1}</div>
      <div><div class="tp-verb">${esc(t.verb)}</div><div class="tp-desc">${esc(t.desc)}</div></div>
    </div>`
  ).join('');
}

// ── Helper: Render TP for tujuan page (standalone) ───────────
function renderTpStandaloneHTML(tp: AutoBuildData['tp'], ke: number): string {
  const filtered = tp.filter(t => (t.pertemuan || 1) === ke);
  if (!filtered.length) return '<p style="color:var(--muted);font-size:.82rem">TP pertemuan ' + ke + ' belum diisi.</p>';
  return filtered.map((t, i) =>
    `<div class="tp-full-item" style="border-color:${esc(t.color || 'var(--y)')}44;background:${esc(t.color || 'var(--y)')}0a">
      <div class="tp-full-num" style="background:${esc(t.color || 'var(--y)')}22;color:${esc(t.color || 'var(--y)')}">${i + 1}</div>
      <div>
        <div class="tp-full-verb" style="color:${esc(t.color || 'var(--y)')}">${esc(t.verb)}</div>
        <div class="tp-full-desc">${esc(t.desc)}</div>
      </div>
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

// ── Helper: Render Review poin HTML from TP + materi ─────────
function renderReviewPoinHTML(tp: AutoBuildData['tp'], ke: number): string {
  const filtered = tp.filter(t => (t.pertemuan || 1) === ke);
  if (!filtered.length) return '<p style="color:var(--muted);font-size:.82rem">Tidak ada poin review.</p>';
  return filtered.map((t, i) =>
    `<div class="card mt14">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <div style="width:28px;height:28px;border-radius:50%;background:${esc(t.color || 'var(--y)')}22;color:${esc(t.color || 'var(--y)')};display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:900;flex-shrink:0">${i + 1}</div>
        <div style="font-weight:900;font-size:.88rem;color:${esc(t.color || 'var(--y)')}">${esc(t.verb)}</div>
      </div>
      <div style="font-size:.82rem;color:var(--muted);line-height:1.6;margin-left:38px">${esc(t.desc)}</div>
    </div>`
  ).join('');
}

// ── Smart Content Analysis ───────────────────────────────────
// Detect module types from data.modules[] to decide which screens to include

interface ContentAnalysis {
  hasModules: boolean;
  hasSkenario: boolean;
  hasMateri: boolean;
  hasKuis: boolean;
  hasFlashcard: boolean;
  hasHotspot: boolean;
  hasComparison: boolean;
  hasIconExplore: boolean;
  hasRoda: boolean;
  hasSorting: boolean;
  hasDiskusi: boolean;
  hasCpOrTp: boolean;
  useNormaMode: boolean;
  pertemuanKe: number;
  accent: string;
}

function analyzeContent(data: AutoBuildData): ContentAnalysis {
  const M = data.meta;
  const modules = data.modules || [];
  const pertemuanKe = extractPertemuanKe(M.judulPertemuan || '');
  const accent = getAccentForPertemuan(pertemuanKe);

  // Detect module types
  const moduleTypes = new Set(modules.map(m => String(m.type || '')));

  // Detect if ATP has discussion activities
  const hasDiskusiInAtp = (data.atp?.pertemuan || []).some(p =>
    /diskusi/i.test(p.kegiatan || '')
  );

  // Detect if modules array has diskusi modules
  const hasDiskusiInModules = moduleTypes.has('diskusi');

  // useNormaMode: if there's a tab-icons module (fungsi norma content pattern)
  const useNormaMode = moduleTypes.has('tab-icons');

  return {
    hasModules: modules.length > 0,
    hasSkenario: !!(data.skenario && data.skenario.length > 0),
    hasMateri: !!(data.materi?.blok && data.materi.blok.length > 0),
    hasKuis: !!(data.kuis && data.kuis.length > 0),
    hasFlashcard: moduleTypes.has('flashcard'),
    hasHotspot: moduleTypes.has('hotspot-image'),
    hasComparison: moduleTypes.has('comparison'),
    hasIconExplore: moduleTypes.has('icon-explore'),
    hasRoda: moduleTypes.has('roda'),
    hasSorting: moduleTypes.has('matching') || moduleTypes.has('memory') || moduleTypes.has('truefalse'),
    hasDiskusi: hasDiskusiInAtp || hasDiskusiInModules,
    hasCpOrTp: !!(data.cp?.capaianFase || data.tp?.length),
    useNormaMode,
    pertemuanKe,
    accent,
  };
}

// ═══════════════════════════════════════════════════════════════
// AUTO-BUILD: Data → Built Screens (V7 Architecture)
// Generates up to 17 screens based on content analysis
// ═══════════════════════════════════════════════════════════════
export function autoBuildScreens(data: AutoBuildData): BuiltScreen[] {
  const screens: BuiltScreen[] = [];
  const M = data.meta;
  const ca = analyzeContent(data);

  // ── 1. COVER — always included ─────────────────────────────
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
      nextScreen: 's-petunjuk',
    },
  });

  // ── 2. PETUNJUK — always included ──────────────────────────
  screens.push({
    templateId: 'petunjuk',
    screenId: 's-petunjuk',
    label: 'Petunjuk',
    included: true,
    data: {
      logo: M.namaBab || M.judulPertemuan || 'Media',
      judul: '📋 Petunjuk Pembelajaran',
      petunjukItems: [
        { icon: '📖', teks: 'Baca setiap materi dengan saksama sebelum melanjutkan.' },
        { icon: '💬', teks: 'Ikuti diskusi dan tuliskan jawabanmu di kolom yang tersedia.' },
        { icon: '🎮', teks: 'Selesaikan game dan aktivitas interaktif untuk mendapatkan poin.' },
        { icon: '❓', teks: 'Jawab kuis di akhir pembelajaran untuk mengukur pemahamanmu.' },
        { icon: '⏱️', teks: 'Perhatikan waktu pada aktivitas yang berbatas waktu.' },
      ],
      accent: ca.accent,
    },
  });

  // ── 3. REVIEW — if pertemuan >= 2 ──────────────────────────
  if (ca.pertemuanKe >= 2) {
    screens.push({
      templateId: 'review',
      screenId: 's-review',
      label: 'Review',
      included: true,
      data: {
        logo: M.namaBab || M.judulPertemuan || 'Media',
        judul: '📝 Review Pertemuan Sebelumnya',
        poinHtml: renderReviewPoinHTML(data.tp, ca.pertemuanKe - 1),
      },
    });
  }

  // ── 4. DOKUMEN (cp-tp-atp) — always if CP or TP data exists ─
  if (ca.hasCpOrTp) {
    screens.push({
      templateId: 'cp-tp-atp',
      screenId: 's-dokumen',
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
        tpCoverList: renderTpCoverHTML(data.tp, ca.pertemuanKe),
      },
    });
  }

  // ── 5. TUJUAN — if TP data exists (standalone TP page) ─────
  if (data.tp && data.tp.length > 0) {
    screens.push({
      templateId: 'tujuan',
      screenId: 's-tujuan',
      label: 'Tujuan Pembelajaran',
      included: true,
      data: {
        logo: M.namaBab || M.judulPertemuan || 'Media',
        title: '🎯 Tujuan Pembelajaran',
        tpItems: renderTpStandaloneHTML(data.tp, ca.pertemuanKe),
      },
    });
  }

  // ── 6. SKENARIO — if skenario data exists ──────────────────
  if (ca.hasSkenario) {
    screens.push({
      templateId: 'skenario',
      screenId: 's-sk',
      label: 'Skenario',
      included: true,
      data: {
        logo: M.namaBab || M.judulPertemuan || 'Media',
      },
    });
  }

  // ── 7. MATERI — if modules or materi exists ────────────────
  // Smart variant: if useNormaMode (has tab-icons / fungsi norma), use tabicons; else accordion
  if (ca.hasModules || ca.hasMateri) {
    const materiTemplateId = ca.useNormaMode ? 'materi-tabicons' : 'materi-accordion';
    screens.push({
      templateId: materiTemplateId,
      screenId: 's-materi',
      label: 'Materi',
      included: true,
      data: {
        logo: M.namaBab || M.judulPertemuan || 'Media',
        modulesHtml: '',  // will be filled by module renderer at export time
        materiHtml: '',   // will be filled by materi renderer
        fungsiHtml: '',   // will be filled by fungsi renderer
        variant: ca.useNormaMode ? 'tabicons' : 'accordion',
        accent: ca.accent,
      },
    });
  }

  // ── 8. DISKUSI+TIMER — if ATP or modules have discussion ────
  if (ca.hasDiskusi) {
    // Prefer diskusi module data over ATP — modules have richer content
    const diskusiModule = (data.modules || []).find(m => String(m.type || '') === 'diskusi');
    const discAtp = (data.atp?.pertemuan || []).find(p => /diskusi/i.test(p.kegiatan || ''));

    // Use module data if available, fall back to ATP
    const diskusiPertanyaan = diskusiModule
      ? String(diskusiModule.pertanyaan || '')
      : (discAtp?.kegiatan || 'Diskusikan pertanyaan berikut dalam kelompokmu!');
    const diskusiDurasi = diskusiModule
      ? String(diskusiModule.durasi || '05:00')
      : '05:00';
    const diskusiPetunjuk = diskusiModule
      ? String(diskusiModule.petunjuk || '')
      : 'Diskusikan dalam kelompok dan tuliskan kesimpulan kalian!';
    const diskusiJudul = diskusiModule
      ? String(diskusiModule.title || '💬 Diskusi Kelompok')
      : '💬 Diskusi Kelompok';

    screens.push({
      templateId: 'diskusi-timer',
      screenId: 's-diskusi',
      label: 'Diskusi',
      included: true,
      data: {
        logo: M.namaBab || M.judulPertemuan || 'Media',
        judul: diskusiJudul,
        pertanyaan: diskusiPertanyaan,
        durasi: diskusiDurasi,
        petunjuk: diskusiPetunjuk,
        modulesHtml: '',  // will be filled at export time by bridge
      },
    });
  }

  // ── 9. HUBUNGAN KONSEP — if comparison/icon-explore modules ─
  if (ca.hasComparison || ca.hasIconExplore) {
    screens.push({
      templateId: 'hubungan-konsep',
      screenId: 's-hubungan',
      label: 'Hubungan Konsep',
      included: true,
      data: {
        logo: M.namaBab || M.judulPertemuan || 'Media',
        judul: '🕸️ Hubungan Konsep',
        modulesHtml: '',  // will be filled at export time
        accent: ca.accent,
      },
    });
  }

  // ── 10. FLASHCARD — if flashcard modules exist ─────────────
  if (ca.hasFlashcard) {
    screens.push({
      templateId: 'flashcard',
      screenId: 's-flashcard',
      label: 'Flashcard',
      included: true,
      data: {
        logo: M.namaBab || M.judulPertemuan || 'Media',
        modulesHtml: '',  // will be filled at export time
        accent: ca.accent,
      },
    });
  }

  // ── 11. HOTSPOT — if hotspot-image modules exist ───────────
  if (ca.hasHotspot) {
    screens.push({
      templateId: 'hotspot',
      screenId: 's-hotspot',
      label: 'Hotspot',
      included: true,
      data: {
        logo: M.namaBab || M.judulPertemuan || 'Media',
        modulesHtml: '',  // will be filled at export time
        accent: ca.accent,
      },
    });
  }

  // ── 12. KUIS — if kuis data exists ─────────────────────────
  if (ca.hasKuis) {
    screens.push({
      templateId: 'kuis',
      screenId: 's-kuis',
      label: 'Kuis',
      included: true,
      data: {
        logo: M.namaBab || M.judulPertemuan || 'Media',
        soalCount: String(data.kuis.length),
      },
    });
  }

  // ── 13. SORTIR GAME — if sorting modules exist ─────────────
  if (ca.hasSorting) {
    screens.push({
      templateId: 'sortir-game',
      screenId: 's-sortir',
      label: 'Game Sortir',
      included: true,
      data: {
        logo: M.namaBab || M.judulPertemuan || 'Media',
        modulesHtml: '',  // will be filled at export time
        accent: ca.accent,
      },
    });
  }

  // ── 14. RODA GAME — if roda/spinwheel modules exist ────────
  if (ca.hasRoda) {
    screens.push({
      templateId: 'roda-game',
      screenId: 's-roda',
      label: 'Game Roda',
      included: true,
      data: {
        logo: M.namaBab || M.judulPertemuan || 'Media',
        modulesHtml: '',  // will be filled at export time
        accent: ca.accent,
      },
    });
  }

  // ── 15. HASIL — always included (score/results) ────────────
  screens.push({
    templateId: 'hasil',
    screenId: 's-hasil',
    label: 'Hasil',
    included: true,
    data: {
      logo: M.namaBab || M.judulPertemuan || 'Media',
      refleksi1: '💭 Apa yang paling kamu pelajari hari ini?',
      refleksi2: '🌟 Bagaimana kamu akan menerapkannya?',
    },
  });

  // ── 16. REFLEKSI — always included ─────────────────────────
  screens.push({
    templateId: 'refleksi',
    screenId: 's-refleksi',
    label: 'Refleksi',
    included: true,
    data: {
      logo: M.namaBab || M.judulPertemuan || 'Media',
      judul: '💭 Refleksi Pembelajaran',
      pertanyaan: [
        { teks: 'Apa yang paling kamu pelajari hari ini?', placeholder: 'Tuliskan refleksimu…' },
        { teks: 'Bagaimana kamu akan menerapkannya dalam kehidupan sehari-hari?', placeholder: 'Rencana aksi nyata…' },
        { teks: 'Apa tantangan terbesar yang kamu hadapi saat belajar?', placeholder: 'Tuliskan tantanganmu…' },
      ],
    },
  });

  // ── 17. PENUTUP — always included ──────────────────────────
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

  // ═══════════════════════════════════════════════════════════
  // POST-PROCESS: Compute navigation links (nextScreen/prevScreen)
  // Only among included screens
  // ═══════════════════════════════════════════════════════════
  const included = screens.filter(s => s.included);
  for (let i = 0; i < included.length; i++) {
    const prev = i > 0 ? included[i - 1].screenId : undefined;
    const next = i < included.length - 1 ? included[i + 1].screenId : undefined;

    // Set nextScreen on data (for templates that use it)
    if (next) {
      included[i].data.nextScreen = next;
    }
    if (prev) {
      included[i].data.prevScreen = prev;
    }
  }

  // Special: Cover's next is always the second included screen
  if (included.length > 1) {
    included[0].data.nextScreen = included[1].screenId;
  }

  return screens;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT: Build complete HTML from data using template system
// ═══════════════════════════════════════════════════════════════
export function exportWithTemplateSystem(
  data: AutoBuildData,
  modulesHtml = '',
  gamesHtml = '',
  materiHtml = '',
  extraScreenHtml: Record<string, string> = {},
): string {
  const screens = autoBuildScreens(data);
  const M = data.meta;

  // ── Fill in module/game/materi HTML for the relevant screens ──
  for (const screen of screens) {
    // Materi screen: receives the main module, materi, and fungsi HTML
    if (screen.screenId === 's-materi') {
      screen.data.modulesHtml = modulesHtml;
      screen.data.materiHtml = materiHtml;
      // Use bridge-provided fungsi HTML if available, else generate default
      if (extraScreenHtml['fungsiHtml']) {
        screen.data.fungsiHtml = extraScreenHtml['fungsiHtml'];
      } else {
        screen.data.fungsiHtml = `<div class="card mt14">
          <div class="h2">⚖️ Fungsi <span class="hl">Norma</span></div>
          <p class="sub mt8">Klik setiap tab untuk menjelajahi fungsi norma dalam kehidupan.</p>
          <div class="ftab-row" id="ftabRow"></div>
          <div id="ftabContent"></div>
        </div>`;
      }
    }

    // Games screen (legacy — kept for backward compat with s-games)
    if (screen.screenId === 's-games') {
      screen.data.gamesHtml = gamesHtml;
    }

    // Diskusi screen: receives diskusi module HTML from bridge
    if (screen.screenId === 's-diskusi' && extraScreenHtml['s-diskusi']) {
      screen.data.modulesHtml = extraScreenHtml['s-diskusi'];
    }

    // Hubungan Konsep screen: receives comparison/icon-explore module HTML
    if (screen.screenId === 's-hubungan' && extraScreenHtml['s-hubungan']) {
      screen.data.modulesHtml = extraScreenHtml['s-hubungan'];
    }

    // Flashcard screen
    if (screen.screenId === 's-flashcard' && extraScreenHtml['s-flashcard']) {
      screen.data.modulesHtml = extraScreenHtml['s-flashcard'];
    }

    // Hotspot screen
    if (screen.screenId === 's-hotspot' && extraScreenHtml['s-hotspot']) {
      screen.data.modulesHtml = extraScreenHtml['s-hotspot'];
    }

    // Sortir game screen
    if (screen.screenId === 's-sortir' && extraScreenHtml['s-sortir']) {
      screen.data.modulesHtml = extraScreenHtml['s-sortir'];
    }

    // Roda game screen
    if (screen.screenId === 's-roda' && extraScreenHtml['s-roda']) {
      screen.data.modulesHtml = extraScreenHtml['s-roda'];
    }
  }

  // ── Render each screen using its template ────────────────────
  const includedScreens = screens.filter(s => s.included);
  const totalScreens = includedScreens.length;
  let screenIndex = 0;

  const screensHtml = includedScreens.map((screen) => {
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

  // ── Generate JS sections ─────────────────────────────────────
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
