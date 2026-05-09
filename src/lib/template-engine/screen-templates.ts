// ═══════════════════════════════════════════════════════════════
// SCREEN TEMPLATES — Named templates with slot schemas & render()
// Each template = reusable screen with data slots
// ═══════════════════════════════════════════════════════════════

import type { ScreenTemplate, RenderContext } from './template-types';
import { esc } from '@/lib/shared/constants';

// ── Navbar helper ────────────────────────────────────────────
function navbar(logo: string, progress: number, score: number): string {
  return `<nav class="navbar">
    <span class="nav-logo">${esc(logo)}</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:${progress}%"></div></div>
    <span class="nav-score">${score} ⭐</span>
  </nav>`;
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: COVER — Halaman pembuka visual
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_COVER: ScreenTemplate = {
  id: 'cover',
  name: 'Cover / Pembuka',
  icon: '🎬',
  description: 'Halaman pembuka dengan ikon, judul, chips, dan tombol mulai',
  category: 'opening',
  color: '#f9c12e',
  slots: [
    { id: 'ikon', label: 'Ikon', type: 'icon', default: '📚' },
    { id: 'judul', label: 'Judul', type: 'text', required: true },
    { id: 'subjudul', label: 'Subjudul', type: 'text' },
    { id: 'mapel', label: 'Mapel', type: 'text', default: 'PPKn' },
    { id: 'kelas', label: 'Kelas', type: 'text', default: 'VII' },
    { id: 'durasi', label: 'Durasi', type: 'text', default: '2 × 40 menit' },
    { id: 'kurikulum', label: 'Kurikulum', type: 'text', default: 'Kurikulum Merdeka' },
    { id: 'ctaText', label: 'Tombol CTA', type: 'text', default: 'Mulai Belajar →' },
    { id: 'nextScreen', label: 'Screen tujuan', type: 'text', default: 's-cp' },
  ],
  render(data, ctx) {
    const ikon = esc(data.ikon as string || '📚');
    const judul = esc(data.judul as string || 'Media Pembelajaran');
    const subjudul = esc(data.subjudul as string || '');
    const mapel = esc(data.mapel as string || 'PPKn');
    const kelas = esc(data.kelas as string || 'VII');
    const durasi = esc(data.durasi as string || '2 × 40 menit');
    const kurikulum = esc(data.kurikulum as string || 'Kurikulum Merdeka');
    const cta = esc(data.ctaText as string || 'Mulai Belajar →');
    const next = esc(data.nextScreen as string || 's-cp');
    return `<div class="screen active" id="${ctx.screenId}">
  <div id="s-cover" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:36px 18px;">
    <div class="cover-icon">${ikon}</div>
    <div class="cover-chips">
      <span class="chip" style="background:rgba(249,193,46,.15);color:var(--y)">${mapel} ${kelas}</span>
      <span class="chip" style="background:rgba(62,207,207,.15);color:var(--c)">${durasi}</span>
      <span class="chip" style="background:rgba(52,211,153,.15);color:var(--g)">${kurikulum}</span>
    </div>
    <div class="cover-title">${judul}</div>
    <p class="sub" style="max-width:480px;margin:0 auto 24px">${subjudul}</p>
    <button class="btn btn-y" onclick="goScreen('${next}')">${cta}</button>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: CP / TP / ATP — Dokumen Pembelajaran
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_CP_TP_ATP: ScreenTemplate = {
  id: 'cp-tp-atp',
  name: 'CP / TP / ATP',
  icon: '📋',
  description: 'Dokumen pembelajaran dengan tab Capaian, Tujuan, dan ATP',
  category: 'dokumen',
  color: '#3ecfcf',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'cpElemen', label: 'CP Elemen', type: 'text' },
    { id: 'cpSubElemen', label: 'CP Sub-Elemen', type: 'text' },
    { id: 'cpCapaianFase', label: 'Capaian Fase', type: 'richtext' },
    { id: 'cpProfil', label: 'Profil Pancasila', type: 'list' },
    { id: 'tpList', label: 'Tujuan Pembelajaran', type: 'items' },
    { id: 'atpList', label: 'ATP Pertemuan', type: 'items' },
    { id: 'alurList', label: 'Alur Pembelajaran', type: 'items' },
    { id: 'tpCoverList', label: 'TP Pertemuan Ini', type: 'items' },
    { id: 'nextScreen', label: 'Screen tujuan', type: 'text', default: 's-modules' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const cpElemen = esc(data.cpElemen as string || '-');
    const cpSubElemen = esc(data.cpSubElemen as string || '-');
    const cpCapaianFase = esc(data.cpCapaianFase as string || 'Capaian pembelajaran belum diisi.');
    const cpProfil = (data.cpProfil as string[]) || ['Beriman & Bertakwa', 'Bernalar Kritis', 'Bergotong Royong'];
    const tpFullHTML = (data.tpList as string) || '<p style="color:var(--muted);font-size:.82rem">Tujuan Pembelajaran belum diisi.</p>';
    const atpHTML = (data.atpList as string) || '<p style="color:var(--muted);font-size:.82rem">ATP belum diisi.</p>';
    const alurHTML = (data.alurList as string) || '<p style="color:var(--muted);font-size:.82rem">Alur pembelajaran belum diisi.</p>';
    const tpCoverHTML = (data.tpCoverList as string) || '<p style="color:var(--muted);font-size:.82rem">TP pertemuan 1 belum diisi.</p>';
    const next = esc(data.nextScreen as string || 's-modules');

    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 16, ctx.score)}
  <div class="main">
    <div class="card">
      <div class="h2">📋 <span class="hl">Dokumen</span> Pembelajaran</div>
      <div class="ktab-row">
        <div class="ktab active" onclick="switchKtab('kcp',this)">Capaian</div>
        <div class="ktab" onclick="switchKtab('ktp',this)">Tujuan Pembelajaran</div>
        <div class="ktab" onclick="switchKtab('katp',this)">ATP</div>
      </div>
      <div class="ktab-content active" id="kcp">
        <div style="font-size:.8rem;color:var(--muted);line-height:1.7;margin-bottom:10px">
          <strong style="color:var(--text)">Elemen:</strong> ${cpElemen} ·
          <strong style="color:var(--text)">Sub-Elemen:</strong> ${cpSubElemen}
        </div>
        <div class="def-box">${cpCapaianFase}</div>
        <div style="background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);border-radius:12px;padding:12px;font-size:.82rem;line-height:1.6">
          <strong style="color:var(--g)">🔗 Profil Pelajar Pancasila:</strong><br>
          <span style="color:var(--muted)">${cpProfil.map(esc).join(' · ')}</span>
        </div>
      </div>
      <div class="ktab-content" id="ktp">${tpFullHTML}</div>
      <div class="ktab-content" id="katp"><div class="atp-pertemuan-grid">${atpHTML}</div></div>
    </div>
    <div class="card mt14">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">🗓️ Alur Pembelajaran Hari Ini</div>
      <div class="alur-steps">${alurHTML}</div>
    </div>
    <div class="card mt14">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">🎯 Tujuan Pertemuan Ini</div>
      <div class="tp-list">${tpCoverHTML}</div>
    </div>
    <div class="btn-row btn-center">
      <button class="btn btn-y" onclick="goScreen('${next}')">Mulai Pembelajaran →</button>
      <button class="btn btn-ghost" onclick="goScreen('s-cover')">← Kembali</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: TUJUAN — Tujuan Pembelajaran (standalone)
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_TUJUAN: ScreenTemplate = {
  id: 'tujuan',
  name: 'Tujuan Pembelajaran',
  icon: '🎯',
  description: 'Daftar tujuan pembelajaran dengan visual warna',
  category: 'dokumen',
  color: '#34d399',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'title', label: 'Judul', type: 'text', default: '🎯 Tujuan Pembelajaran' },
    { id: 'tpItems', label: 'TP Items HTML', type: 'richtext', required: true },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const title = esc(data.title as string || '🎯 Tujuan Pembelajaran');
    const items = data.tpItems as string || '';
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 20, ctx.score)}
  <div class="main">
    <div class="card"><div class="h2">${title}</div></div>
    <div class="tp-list mt14">${items}</div>
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goScreen('s-modules')">Mulai Materi →</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: MATERI — Materi Pembelajaran (modul-based)
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_MATERI: ScreenTemplate = {
  id: 'materi',
  name: 'Materi Pembelajaran',
  icon: '📖',
  description: 'Halaman materi dengan konten modul (tab-icons, accordion, dll)',
  category: 'materi',
  color: '#a78bfa',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'modulesHtml', label: 'Modules HTML', type: 'richtext' },
    { id: 'materiHtml', label: 'Materi Blok HTML', type: 'richtext' },
    { id: 'fungsiHtml', label: 'Fungsi Tab HTML', type: 'richtext' },
    { id: 'prevScreen', label: 'Screen sebelumnya', type: 'text', default: 's-cp' },
    { id: 'nextScreen', label: 'Screen selanjutnya', type: 'text', default: 's-kuis' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const modulesHtml = data.modulesHtml as string || '';
    const materiHtml = data.materiHtml as string || '';
    const fungsiHtml = data.fungsiHtml as string || '';
    const prev = esc(data.prevScreen as string || 's-cp');
    const next = esc(data.nextScreen as string || 's-kuis');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 45, ctx.score)}
  <div class="main">
    ${materiHtml}
    ${modulesHtml}
    ${fungsiHtml}
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goScreen('${next}')">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goScreen('${prev}')">← Kembali</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: DISKUSI + TIMER — Diskusi interaktif dengan timer
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_DISKUSI_TIMER: ScreenTemplate = {
  id: 'diskusi-timer',
  name: 'Diskusi + Timer',
  icon: '💬',
  description: 'Halaman diskusi dengan countdown timer untuk kelompok',
  category: 'interaksi',
  color: '#ef4444',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'judul', label: 'Judul Diskusi', type: 'text', default: '💬 Diskusi Kelompok' },
    { id: 'pertanyaan', label: 'Pertanyaan Diskusi', type: 'richtext', required: true },
    { id: 'durasi', label: 'Durasi (menit)', type: 'text', default: '05:00' },
    { id: 'petunjuk', label: 'Petunjuk', type: 'text', default: 'Diskusikan dalam kelompok dan tuliskan kesimpulan kalian!' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const judul = esc(data.judul as string || '💬 Diskusi Kelompok');
    const pertanyaan = data.pertanyaan as string || '';
    const durasi = esc(data.durasi as string || '05:00');
    const petunjuk = esc(data.petunjuk as string || 'Diskusikan dalam kelompok dan tuliskan kesimpulan kalian!');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 50, ctx.score)}
  <div class="main">
    <div class="card">
      <div class="h2">${judul}</div>
      <div style="display:flex;align-items:center;gap:12px;margin:14px 0">
        <div style="background:rgba(239,68,68,.1);border:2px solid rgba(239,68,68,.3);border-radius:12px;padding:12px 18px;display:flex;align-items:center;gap:8px">
          <span style="font-size:1.5rem">⏱️</span>
          <span style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:#ef4444">${durasi}</span>
        </div>
        <p class="sub">${petunjuk}</p>
      </div>
      <div style="background:rgba(249,193,46,.06);border:1px solid rgba(249,193,46,.2);border-radius:14px;padding:18px;margin:14px 0">
        <div style="font-size:.82rem;font-weight:800;color:var(--y);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">📌 Pertanyaan Diskusi</div>
        <div style="font-size:1rem;font-weight:700;line-height:1.7">${pertanyaan}</div>
      </div>
      <div style="margin-top:14px">
        <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:12px;color:var(--text);font-family:'Nunito',sans-serif;font-size:.85rem;resize:vertical;min-height:80px" placeholder="Tulis jawaban diskusi di sini…"></textarea>
      </div>
    </div>
    <div class="btn-row btn-center mt20">
      <button class="btn btn-g" onclick="goScreen('s-kuis')">Selesai Diskusi →</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: REVIEW — Review / Ringkasan Materi
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_REVIEW: ScreenTemplate = {
  id: 'review',
  name: 'Review / Ringkasan',
  icon: '📝',
  description: 'Ringkasan dan review materi sebelum evaluasi',
  category: 'evaluasi',
  color: '#fb923c',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'judul', label: 'Judul', type: 'text', default: '📝 Review Materi' },
    { id: 'poinHtml', label: 'Poin-poin HTML', type: 'richtext', required: true },
    { id: 'nextScreen', label: 'Screen selanjutnya', type: 'text', default: 's-kuis' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const judul = esc(data.judul as string || '📝 Review Materi');
    const poinHtml = data.poinHtml as string || '';
    const next = esc(data.nextScreen as string || 's-kuis');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 60, ctx.score)}
  <div class="main">
    <div class="card">
      <div class="h2">${judul}</div>
      <p class="sub mt8">Ringkasan poin-poin penting dari pembelajaran hari ini:</p>
    </div>
    ${poinHtml}
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goScreen('${next}')">Lanjut ke Evaluasi →</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: SKENARIO — Skenario Interaktif
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_SKENARIO: ScreenTemplate = {
  id: 'skenario',
  name: 'Skenario Interaktif',
  icon: '🎭',
  description: 'Skenario bercabang dengan pilihan dan konsekuensi',
  category: 'interaksi',
  color: '#f9c12e',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'nextScreen', label: 'Screen selanjutnya', type: 'text', default: 's-materi' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const next = esc(data.nextScreen as string || 's-materi');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 33, ctx.score)}
  <div class="main">
    <div class="sk-shell">
      <div class="sk-hud">
        <div class="sk-hud-title">🎭 Skenario Interaktif</div>
        <span id="skTitle" style="font-size:.78rem;color:var(--muted)"></span>
        <span class="sk-badge" id="skScoreBadge" style="background:rgba(249,193,46,.15);color:var(--y)">0 poin</span>
      </div>
      <div id="skBody"></div>
      <div id="skProgress" style="display:flex;gap:4px;padding:8px 14px;background:#060d18;border-top:1px solid #1e3a5a;"></div>
    </div>
    <button id="btnNextAfterSk" style="display:none" class="btn btn-y mt14" onclick="goScreen('${next}')">Lanjut →</button>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: KUIS — Kuis Pengetahuan
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_KUIS: ScreenTemplate = {
  id: 'kuis',
  name: 'Kuis Pengetahuan',
  icon: '❓',
  description: 'Kuis pilihan ganda dengan penjelasan langsung',
  category: 'evaluasi',
  color: '#f5c842',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'judul', label: 'Judul', type: 'text', default: '❓ Kuis Pengetahuan' },
    { id: 'deskripsi', label: 'Deskripsi', type: 'text', default: 'Jawab dan lihat penjelasannya langsung.' },
    { id: 'soalCount', label: 'Jumlah Soal', type: 'text', default: '0' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const judul = esc(data.judul as string || '❓ Kuis Pengetahuan');
    const deskripsi = esc(data.deskripsi as string || 'Jawab dan lihat penjelasannya langsung.');
    const soalCount = esc(data.soalCount as string || '0');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 75, ctx.score)}
  <div class="main">
    <div class="card" style="margin-bottom:14px">
      <div class="h2">${judul}</div>
      <p class="sub mt8">${soalCount} soal · ${deskripsi}</p>
    </div>
    <div id="kuisContainer"></div>
    <div class="btn-row btn-center">
      <button class="btn btn-y" id="btnKuisSubmit" onclick="submitKuis()" style="display:none">Lihat Hasil 📊</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: HASIL — Hasil Evaluasi
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_HASIL: ScreenTemplate = {
  id: 'hasil',
  name: 'Hasil Evaluasi',
  icon: '📊',
  description: 'Lingkaran skor, level, dan refleksi',
  category: 'evaluasi',
  color: '#34d399',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'refleksi1', label: 'Pertanyaan Refleksi 1', type: 'text', default: '💭 Apa yang paling kamu pelajari hari ini?' },
    { id: 'refleksi2', label: 'Pertanyaan Refleksi 2', type: 'text', default: '🌟 Bagaimana kamu akan menerapkannya?' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const refl1 = esc(data.refleksi1 as string || '💭 Apa yang paling kamu pelajari hari ini?');
    const refl2 = esc(data.refleksi2 as string || '🌟 Bagaimana kamu akan menerapkannya?');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 100, ctx.score)}
  <div class="main" style="text-align:center">
    <div class="hasil-circle" id="hasilCircle">
      <div class="hasil-score">
        <div style="font-family:'Fredoka One',cursive;font-size:2rem;color:var(--g)" id="hasilNum">0</div>
        <div style="font-size:.7rem;color:var(--muted)">SKOR</div>
      </div>
    </div>
    <div id="hasilLevel" style="padding:10px 20px;border-radius:12px;font-weight:800;font-size:.92rem;margin:12px 0;display:inline-block"></div>
    <div class="card mt14" style="text-align:left">
      <div class="refl-item"><label>${refl1}</label>
        <textarea placeholder="Tuliskan refleksimu…"></textarea></div>
      <div class="refl-item"><label>${refl2}</label>
        <textarea placeholder="Rencana aksi nyata…"></textarea></div>
    </div>
    <div class="btn-row btn-center mt14">
      <button class="btn btn-y" onclick="launchConfetti()">🎉 Selesai!</button>
      <button class="btn btn-ghost" onclick="goScreen('s-cover')">↩ Ulangi</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: REFLEKSI — Refleksi Pembelajaran
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_REFLEKSI: ScreenTemplate = {
  id: 'refleksi',
  name: 'Refleksi',
  icon: '💭',
  description: 'Halaman refleksi dengan pertanyaan terbimbing',
  category: 'penutup',
  color: '#a78bfa',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'judul', label: 'Judul', type: 'text', default: '💭 Refleksi Pembelajaran' },
    { id: 'pertanyaan', label: 'Pertanyaan Refleksi', type: 'items', required: true },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const judul = esc(data.judul as string || '💭 Refleksi Pembelajaran');
    const pertanyaan = (data.pertanyaan as Array<{ teks: string; placeholder: string }>) || [
      { teks: 'Apa yang paling kamu pelajari hari ini?', placeholder: 'Tuliskan refleksimu…' },
      { teks: 'Bagaimana kamu akan menerapkannya?', placeholder: 'Rencana aksi nyata…' },
    ];
    const itemsHtml = pertanyaan.map(p =>
      `<div class="refl-item"><label>${esc(p.teks)}</label>
        <textarea placeholder="${esc(p.placeholder)}"></textarea></div>`
    ).join('');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 90, ctx.score)}
  <div class="main">
    <div class="card"><div class="h2">${judul}</div></div>
    <div class="card mt14" style="text-align:left">${itemsHtml}</div>
    <div class="btn-row btn-center mt20">
      <button class="btn btn-g" onclick="launchConfetti();goScreen('s-penutup')">Selesai 🎉</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: PENUTUP — Halaman penutup
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_PENUTUP: ScreenTemplate = {
  id: 'penutup',
  name: 'Penutup',
  icon: '🎓',
  description: 'Halaman penutup dengan pesan terakhir dan tombol ulangi',
  category: 'penutup',
  color: '#22c55e',
  slots: [
    { id: 'judul', label: 'Judul', type: 'text', default: '🎓 Pembelajaran Selesai!' },
    { id: 'pesan', label: 'Pesan', type: 'richtext', default: 'Terima kasih sudah belajar hari ini. Terus terapkan apa yang sudah dipelajari!' },
    { id: 'ikon', label: 'Ikon besar', type: 'icon', default: '🌟' },
  ],
  render(data, ctx) {
    const judul = esc(data.judul as string || '🎓 Pembelajaran Selesai!');
    const pesan = data.pesan as string || 'Terima kasih sudah belajar hari ini. Terus terapkan apa yang sudah dipelajari!';
    const ikon = esc(data.ikon as string || '🌟');
    return `<div class="screen" id="${ctx.screenId}">
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:36px 18px;background:radial-gradient(ellipse 90% 60% at 50% 0%,rgba(52,211,153,.15),transparent 60%),linear-gradient(180deg,#0e1c2f,#09121f);">
    <div style="font-size:5rem;margin-bottom:16px;animation:float 3s ease-in-out infinite">${ikon}</div>
    <div style="font-family:'Fredoka One',cursive;font-size:clamp(1.5rem,5vw,2.4rem);color:#fff;margin-bottom:12px">${judul}</div>
    <p class="sub" style="max-width:480px;margin:0 auto 24px">${pesan}</p>
    <div class="btn-row btn-center">
      <button class="btn btn-y" onclick="goScreen('s-cover')">↩ Ulangi Pembelajaran</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: GAME — Game Interaktif (sortir, roda, memory)
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_GAME: ScreenTemplate = {
  id: 'game',
  name: 'Game Interaktif',
  icon: '🎮',
  description: 'Game interaktif: sortir, roda, memory match',
  category: 'interaksi',
  color: '#3ecfcf',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'gamesHtml', label: 'Games HTML', type: 'richtext' },
    { id: 'nextScreen', label: 'Screen selanjutnya', type: 'text', default: 's-kuis' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const gamesHtml = data.gamesHtml as string || '';
    const next = esc(data.nextScreen as string || 's-kuis');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 66, ctx.score)}
  <div class="main">
    ${gamesHtml}
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goScreen('${next}')">Lanjut →</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: HUBUNGAN KONSEP — Peta konsep / hubungan
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_HUBUNGAN_KONSEP: ScreenTemplate = {
  id: 'hubungan-konsep',
  name: 'Hubungan Konsep',
  icon: '🕸️',
  description: 'Peta hubungan konsep dengan visual interaktif',
  category: 'materi',
  color: '#a78bfa',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'judul', label: 'Judul', type: 'text', default: '🕸️ Hubungan Konsep' },
    { id: 'modulesHtml', label: 'Module HTML', type: 'richtext' },
    { id: 'nextScreen', label: 'Screen selanjutnya', type: 'text', default: 's-kuis' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const judul = esc(data.judul as string || '🕸️ Hubungan Konsep');
    const modulesHtml = data.modulesHtml as string || '';
    const next = esc(data.nextScreen as string || 's-kuis');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 55, ctx.score)}
  <div class="main">
    <div class="card"><div class="h2">${judul}</div></div>
    ${modulesHtml}
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goScreen('${next}')">Lanjut →</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: FLASHCARD — Kartu belajar
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_FLASHCARD: ScreenTemplate = {
  id: 'flashcard',
  name: 'Flashcard',
  icon: '🃏',
  description: 'Kartu belajar depan/belakang dengan progress',
  category: 'materi',
  color: '#a855f7',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'modulesHtml', label: 'Flashcard HTML', type: 'richtext' },
    { id: 'nextScreen', label: 'Screen selanjutnya', type: 'text', default: 's-kuis' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const modulesHtml = data.modulesHtml as string || '';
    const next = esc(data.nextScreen as string || 's-kuis');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 40, ctx.score)}
  <div class="main">
    ${modulesHtml}
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goScreen('${next}')">Lanjut →</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: PETUNJUK — Petunjuk Pembelajaran
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_PETUNJUK: ScreenTemplate = {
  id: 'petunjuk',
  name: 'Petunjuk',
  icon: '📋',
  description: 'Halaman petunjuk navigasi pembelajaran',
  category: 'opening',
  color: '#3ecfcf',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'judul', label: 'Judul', type: 'text', default: '📋 Petunjuk Pembelajaran' },
    { id: 'petunjukItems', label: 'Item Petunjuk', type: 'items' },
    { id: 'accent', label: 'Warna Aksen', type: 'text', default: '--y' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const judul = esc(data.judul as string || '📋 Petunjuk Pembelajaran');
    const items = (data.petunjukItems as Array<{ icon: string; teks: string }>) || [
      { icon: '📖', teks: 'Baca materi dengan saksama.' },
      { icon: '💬', teks: 'Ikuti diskusi.' },
      { icon: '🎮', teks: 'Selesaikan game.' },
    ];
    const accent = esc(data.accent as string || '--y');
    const itemsHtml = items.map(it =>
      `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px">
        <span style="font-size:1.4rem;flex-shrink:0">${esc(it.icon)}</span>
        <span style="font-size:.88rem;line-height:1.6;color:var(--text)">${esc(it.teks)}</span>
      </div>`
    ).join('');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 8, ctx.score)}
  <div class="main">
    <div class="card"><div class="h2">${judul}</div><p class="sub mt8">Ikuti langkah-langkah berikut untuk memaksimalkan pembelajaran:</p></div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">${itemsHtml}</div>
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goScreen('s-dokumen')">Mulai Belajar →</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: MATERI TAB-ICONS — Materi dengan tab ikon (norma mode)
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_MATERI_TABICONS: ScreenTemplate = {
  id: 'materi-tabicons',
  name: 'Materi Tab Ikon',
  icon: '📑',
  description: 'Materi dengan tab navigasi ikon (pola fungsi norma)',
  category: 'materi',
  color: '#3ecfcf',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'modulesHtml', label: 'Modules HTML', type: 'richtext' },
    { id: 'materiHtml', label: 'Materi Blok HTML', type: 'richtext' },
    { id: 'fungsiHtml', label: 'Fungsi Tab HTML', type: 'richtext' },
    { id: 'variant', label: 'Variant', type: 'text', default: 'tabicons' },
    { id: 'accent', label: 'Accent', type: 'text', default: '--y' },
    { id: 'prevScreen', label: 'Screen sebelumnya', type: 'text', default: 's-cp' },
    { id: 'nextScreen', label: 'Screen selanjutnya', type: 'text', default: 's-kuis' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const modulesHtml = data.modulesHtml as string || '';
    const materiHtml = data.materiHtml as string || '';
    const fungsiHtml = data.fungsiHtml as string || '';
    const prev = esc(data.prevScreen as string || 's-cp');
    const next = esc(data.nextScreen as string || 's-kuis');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 45, ctx.score)}
  <div class="main">
    <div class="card"><div class="h2">📖 <span class="hl">Materi</span> Pembelajaran</div><p class="sub mt8">Pelajari setiap tab dengan mengklik ikon di bawah.</p></div>
    ${materiHtml}
    ${modulesHtml}
    ${fungsiHtml}
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goScreen('${next}')">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goScreen('${prev}')">← Kembali</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: MATERI ACCORDION — Materi dengan accordion
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_MATERI_ACCORDION: ScreenTemplate = {
  id: 'materi-accordion',
  name: 'Materi Accordion',
  icon: '🗂️',
  description: 'Materi dengan accordion lipat buka-tutup',
  category: 'materi',
  color: '#fb923c',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'modulesHtml', label: 'Modules HTML', type: 'richtext' },
    { id: 'materiHtml', label: 'Materi Blok HTML', type: 'richtext' },
    { id: 'fungsiHtml', label: 'Fungsi Tab HTML', type: 'richtext' },
    { id: 'variant', label: 'Variant', type: 'text', default: 'accordion' },
    { id: 'accent', label: 'Accent', type: 'text', default: '--y' },
    { id: 'prevScreen', label: 'Screen sebelumnya', type: 'text', default: 's-cp' },
    { id: 'nextScreen', label: 'Screen selanjutnya', type: 'text', default: 's-kuis' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const modulesHtml = data.modulesHtml as string || '';
    const materiHtml = data.materiHtml as string || '';
    const fungsiHtml = data.fungsiHtml as string || '';
    const prev = esc(data.prevScreen as string || 's-cp');
    const next = esc(data.nextScreen as string || 's-kuis');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 45, ctx.score)}
  <div class="main">
    <div class="card"><div class="h2">📖 <span class="hl">Materi</span> Pembelajaran</div><p class="sub mt8">Klik setiap bagian untuk membuka konten.</p></div>
    ${materiHtml}
    ${modulesHtml}
    ${fungsiHtml}
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goScreen('${next}')">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goScreen('${prev}')">← Kembali</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: HOTSPOT — Gambar interaktif dengan pin
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_HOTSPOT: ScreenTemplate = {
  id: 'hotspot',
  name: 'Hotspot Image',
  icon: '🗺️',
  description: 'Gambar interaktif dengan hotspot pin',
  category: 'materi',
  color: '#34d399',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'modulesHtml', label: 'Hotspot HTML', type: 'richtext' },
    { id: 'accent', label: 'Accent', type: 'text', default: '--g' },
    { id: 'nextScreen', label: 'Screen selanjutnya', type: 'text', default: 's-kuis' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const modulesHtml = data.modulesHtml as string || '<div class="card"><p style="color:var(--muted)">Hotspot belum dikonfigurasi.</p></div>';
    const next = esc(data.nextScreen as string || 's-kuis');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 52, ctx.score)}
  <div class="main">
    <div class="card"><div class="h2">🗺️ <span class="hl">Eksplorasi</span> Visual</div><p class="sub mt8">Klik pada area yang ditandai untuk informasi detail.</p></div>
    ${modulesHtml}
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goScreen('${next}')">Lanjut →</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: SORTIR GAME — Game kelompokkan item
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_SORTIR_GAME: ScreenTemplate = {
  id: 'sortir-game',
  name: 'Game Sortir',
  icon: '🔄',
  description: 'Game menyortir/mengelompokkan item ke kategori',
  category: 'interaksi',
  color: '#34d399',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'modulesHtml', label: 'Game HTML', type: 'richtext' },
    { id: 'accent', label: 'Accent', type: 'text', default: '--g' },
    { id: 'nextScreen', label: 'Screen selanjutnya', type: 'text', default: 's-kuis' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const modulesHtml = data.modulesHtml as string || '<div class="card"><p style="color:var(--muted)">Game sortir belum dikonfigurasi.</p></div>';
    const next = esc(data.nextScreen as string || 's-kuis');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 68, ctx.score)}
  <div class="main">
    <div class="card"><div class="h2">🔄 <span class="hl">Game</span> Sortir</div><p class="sub mt8">Kelompokkan item ke kategori yang tepat!</p></div>
    ${modulesHtml}
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goScreen('${next}')">Lanjut →</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE: RODA GAME — Roda putar / spinwheel
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_RODA_GAME: ScreenTemplate = {
  id: 'roda-game',
  name: 'Game Roda',
  icon: '🎡',
  description: 'Roda putar / spinwheel interaktif',
  category: 'interaksi',
  color: '#fb923c',
  slots: [
    { id: 'logo', label: 'Navbar Logo', type: 'text' },
    { id: 'modulesHtml', label: 'Game HTML', type: 'richtext' },
    { id: 'accent', label: 'Accent', type: 'text', default: '--o' },
    { id: 'nextScreen', label: 'Screen selanjutnya', type: 'text', default: 's-kuis' },
  ],
  render(data, ctx) {
    const logo = esc(data.logo as string || 'Media');
    const modulesHtml = data.modulesHtml as string || '<div class="card"><p style="color:var(--muted)">Game roda belum dikonfigurasi.</p></div>';
    const next = esc(data.nextScreen as string || 's-kuis');
    return `<div class="screen" id="${ctx.screenId}">
  ${navbar(logo, 70, ctx.score)}
  <div class="main">
    <div class="card"><div class="h2">🎡 <span class="hl">Roda</span> Putar</div><p class="sub mt8">Putar roda dan jawab pertanyaan!</p></div>
    ${modulesHtml}
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goScreen('${next}')">Lanjut →</button>
    </div>
  </div>
</div>`;
  },
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE REGISTRY — All templates indexed by ID
// ═══════════════════════════════════════════════════════════════
export const SCREEN_TEMPLATES: Record<string, ScreenTemplate> = {
  'cover': TEMPLATE_COVER,
  'petunjuk': TEMPLATE_PETUNJUK,
  'cp-tp-atp': TEMPLATE_CP_TP_ATP,
  'tujuan': TEMPLATE_TUJUAN,
  'skenario': TEMPLATE_SKENARIO,
  'materi': TEMPLATE_MATERI,
  'materi-tabicons': TEMPLATE_MATERI_TABICONS,
  'materi-accordion': TEMPLATE_MATERI_ACCORDION,
  'diskusi-timer': TEMPLATE_DISKUSI_TIMER,
  'review': TEMPLATE_REVIEW,
  'game': TEMPLATE_GAME,
  'hubungan-konsep': TEMPLATE_HUBUNGAN_KONSEP,
  'flashcard': TEMPLATE_FLASHCARD,
  'hotspot': TEMPLATE_HOTSPOT,
  'kuis': TEMPLATE_KUIS,
  'sortir-game': TEMPLATE_SORTIR_GAME,
  'roda-game': TEMPLATE_RODA_GAME,
  'hasil': TEMPLATE_HASIL,
  'refleksi': TEMPLATE_REFLEKSI,
  'penutup': TEMPLATE_PENUTUP,
};

export const ALL_TEMPLATES = Object.values(SCREEN_TEMPLATES);

export const TEMPLATE_CATEGORIES = [
  { id: 'opening', label: '🎬 Pembuka', color: '#f9c12e' },
  { id: 'dokumen', label: '📋 Dokumen', color: '#3ecfcf' },
  { id: 'materi', label: '📖 Materi', color: '#a78bfa' },
  { id: 'interaksi', label: '💬 Interaksi', color: '#ef4444' },
  { id: 'evaluasi', label: '📊 Evaluasi', color: '#f5c842' },
  { id: 'penutup', label: '🎓 Penutup', color: '#22c55e' },
] as const;

/** Get a template by ID */
export function getTemplate(id: string): ScreenTemplate | undefined {
  return SCREEN_TEMPLATES[id];
}

/** Render a template by ID with data and context */
export function renderTemplate(id: string, data: Record<string, unknown>, ctx: RenderContext): string {
  const tmpl = SCREEN_TEMPLATES[id];
  if (!tmpl) return `<div class="screen" id="${ctx.screenId}"><div class="main"><div class="card"><p style="color:var(--r)">Template "${id}" tidak ditemukan</p></div></div></div>`;
  return tmpl.render(data, ctx);
}
