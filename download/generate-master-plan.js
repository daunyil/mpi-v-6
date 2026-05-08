const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, PageNumber, PageBreak,
  BorderStyle, WidthType, ShadingType, SectionType } = require("docx");
const fs = require("fs");

// ── Palette: GO-1 Graphite Orange (proposal/plan) ──
const P = {
  primary: "1A2330", body: "182030", secondary: "607080",
  accent: "D4875A", surface: "F8F0EB",
  bg: "1A2330", titleColor: "FFFFFF", subtitleColor: "B0B8C0",
  metaColor: "90989F", footerColor: "687078",
};
const c = (hex) => hex;

// ── Helpers ──
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, color: c(P.primary), font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32 })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    children: [new TextRun({ text, bold: true, color: c(P.primary), font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28 })]
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, color: c(P.accent), font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 26 })]
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 60 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })]
  });
}

function bodyNoIndent(text) {
  return new Paragraph({
    spacing: { line: 312, after: 60 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })]
  });
}

function bulletItem(text) {
  return new Paragraph({
    indent: { left: 480, hanging: 240 },
    spacing: { line: 312, after: 40 },
    children: [
      new TextRun({ text: "\u2022  ", size: 24, color: c(P.accent) }),
      new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } }),
    ]
  });
}

function statusRow(label, status, detail) {
  const statusColor = status === "\u2713" ? "34D399" : status === "\u2717" ? "FF6B6B" : "F9C82E";
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" } },
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: label, size: 22, bold: true, color: c(P.body), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })] })],
      }),
      new TableCell({
        width: { size: 10, type: WidthType.PERCENTAGE },
        borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" } },
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        shading: status === "\u2717" ? { type: ShadingType.CLEAR, fill: "FFF0F0" } : status === "\u2713" ? { type: ShadingType.CLEAR, fill: "F0FFF4" } : { type: ShadingType.CLEAR, fill: "FFFBF0" },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: status, size: 24, bold: true, color: statusColor })] })],
      }),
      new TableCell({
        width: { size: 60, type: WidthType.PERCENTAGE },
        borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" } },
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: detail, size: 22, color: c(P.secondary), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })] })],
      }),
    ]
  });
}

function statusTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: rows.map(r => statusRow(r[0], r[1], r[2])),
  });
}

// ── Cover Page (R4 Top Color Block style) ──
function buildCover() {
  const title = "MPI v6 \u2014 Master Plan";
  const subtitle = "Authoring Tool \u2022 Canvas \u2022 Export";
  const metaLines = [
    "Versi: 1.0",
    "Tanggal: 3 Mei 2026",
    "Status: Dalam Pengembangan",
  ];

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: allNoBorders,
      rows: [new TableRow({
        height: { value: 16838, rule: "exact" },
        children: [new TableCell({
          borders: allNoBorders,
          verticalAlign: "top",
          children: [
            // Top color block
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: allNoBorders,
              rows: [new TableRow({
                height: { value: 6000, rule: "exact" },
                children: [new TableCell({
                  borders: allNoBorders,
                  shading: { type: ShadingType.CLEAR, fill: c(P.bg) },
                  verticalAlign: "bottom",
                  children: [
                    new Paragraph({ spacing: { before: 1200 }, children: [] }),
                    new Paragraph({
                      indent: { left: 600 },
                      children: [new TextRun({ text: title, size: 72, bold: true, color: c(P.titleColor), font: { ascii: "Calibri", eastAsia: "SimHei" } })]
                    }),
                    new Paragraph({ spacing: { before: 200 }, children: [] }),
                    new Paragraph({
                      indent: { left: 600 },
                      children: [new TextRun({ text: subtitle, size: 32, color: c(P.subtitleColor), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })]
                    }),
                    new Paragraph({ spacing: { before: 300 }, children: [] }),
                  ]
                })]
              })]
            }),
            // Accent bar
            new Paragraph({
              spacing: { before: 0, after: 0 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: c(P.accent), space: 0 } },
              children: []
            }),
            // Bottom section with meta
            new Paragraph({ spacing: { before: 800 }, children: [] }),
            ...metaLines.map(line => new Paragraph({
              indent: { left: 600 },
              spacing: { after: 120 },
              children: [new TextRun({ text: line, size: 22, color: c(P.metaColor), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })]
            })),
          ]
        })]
      })]
    }),
  ];
}

// ── Body Content ──
function buildBody() {
  const children = [];

  // ============== SECTION 1: RINGKASAN EKSEKUTIF ==============
  children.push(heading1("1. Ringkasan Eksekutif"));
  children.push(body("Dokumen ini merupakan master plan untuk proyek MPI v6, sebuah platform authoring tool dan canvas interaktif berbasis Next.js 16 yang dirancang untuk membuat konten pembelajaran digital sesuai Kurikulum Merdeka. Proyek ini mencakup tiga komponen utama yang saling terintegrasi: Authoring Tool sebagai pusat pembuatan konten, Canvas sebagai editor visual untuk tata letak halaman, dan Export sebagai mekanisme output ke format HTML mandiri yang bisa di-deploy secara independen."));
  children.push(body("Berdasarkan investigasi mendalam terhadap kondisi kode saat ini, ditemukan beberapa celah signifikan yang perlu ditangani secara sistematis. Authoring Tool sudah memiliki fondasi yang kuat dengan 19 editor modul dan 14 generator konten berbasis regex, namun belum memiliki sistem preset untuk modul, tombol auto-generate tingkat tab, dan mekanisme sinkronisasi preset dengan Canvas. Canvas sudah bisa menampilkan modul dari store, tetapi belum ada integrasi preset dua arah. Export sudah berfungsi dengan buildPreviewPage() dan deduplicateCss(), namun belum diuji secara menyeluruh untuk semua tipe modul."));
  children.push(body("Prioritas pengembangan telah disepakati: (1) Tuntaskan Authoring Tool terlebih dahulu, (2) kemudian sempurnakan Canvas, dan (3) terakhir finalisasi Export. Pendekatan ini memastikan data yang mengalir ke Canvas dan Export sudah lengkap dan terstruktur dengan baik sebelum kedua komponen tersebut diintegrasikan."));

  // ============== SECTION 2: ARSITEKTUR SAAT INI ==============
  children.push(heading1("2. Arsitektur Saat Ini"));

  children.push(heading2("2.1 Tech Stack"));
  children.push(body("Proyek MPI v6 dibangun menggunakan Next.js 16 sebagai framework utama dengan App Router, Tailwind CSS 4 untuk styling, shadcn/ui untuk komponen UI, dan Zustand untuk state management. Data disimpan di localStorage dengan dua key utama: at_state_v1 untuk data authoring dan canva-project untuk data canvas. Prisma dengan SQLite sudah dikonfigurasi namun belum digunakan secara aktif, hanya berisi model User dan Post placeholder. Template engine menghasilkan HTML mandiri dengan semua CSS dan JS inline, mendukung 21 tipe modul pembelajaran dan 6 tipe game interaktif."));

  children.push(heading2("2.2 Panel Authoring Tool"));
  children.push(body("Authoring tool terdiri dari 9 panel yang dinavigasi melalui sidebar: Dashboard untuk overview dan skor kelengkapan, Dokumen untuk pengeditan CP/TP/ATP/Alur/Meta, Konten untuk Materi/Skenario/Modul/Kuis, Canvas untuk editor visual, AutoGenerate untuk pembuatan konten mandiri, Projects untuk manajemen proyek, Import untuk import/export JSON, Preview untuk tampilan lengkap, dan Versions untuk riwayat versi. Panel Konten memiliki 4 tab: Materi (blok konten kaya), Skenario (editor skenario interaktif), Modul dan Game (picker, daftar, editor modul), serta Evaluasi (editor kuis pilihan ganda)."));

  children.push(heading2("2.3 Tipe Modul dan Game"));
  children.push(body("Sistem mendukung 21 tipe modul pembelajaran dan 6 tipe game interaktif. Modul pembelajaran mencakup: skenario, video, flashcard, infografis, studi-kasus, debat, timeline, matching, materi, hero, kutipan, langkah, accordion, statistik, polling, embed, tab-icons, icon-explore, comparison, card-showcase, dan hotspot-image. Game interaktif meliputi: truefalse, sorting, memory, roda, teambuzzer, dan wordsearch. Setiap tipe memiliki renderer khusus di template engine yang mendukung 3 varian layout dan efek visual enhanced (shimmer, scroll-reveal, count-up, confetti, dll)."));

  // ============== SECTION 3: TEMUAN DAN CELAH ==============
  children.push(heading1("3. Temuan dan Celah"));

  children.push(heading2("3.1 Status Fitur Authoring Tool"));
  children.push(body("Tabel berikut merangkum status setiap fitur utama authoring tool berdasarkan investigasi kode mendalam:"));
  children.push(statusTable([
    ["Editor form per modul (19 editor)", "\u2713", "Semua 19 editor modul sudah ada dan fungsional"],
    ["AutoGenButton di dalam editor", "\u26A0", "14 dari 19 editor punya; 5 editor manual saja (video, studi-kasus, debat, hero, embed)"],
    ["Preset Kuis (tab Evaluasi)", "\u2713", "2 preset + blank; UI card preset sudah ada"],
    ["Preset Modul dan Game", "\u2717", "TIDAK ADA \u2014 hanya MODULE_DEFAULTS kosongan"],
    ["Tab-level auto-generate (Modul)", "\u2717", "TIDAK ADA \u2014 hanya per-editor"],
    ["Tab-level auto-generate (Kuis)", "\u2713", "Tombol Auto-Generate Kuis di KuisTab"],
    ["Link preset authoring \u2194 canvas", "\u2717", "TIDAK ADA \u2014 canvas baca store tapi preset tidak tersinkronisasi"],
    ["Full Preset (termasuk modul)", "\u26A0", "FULL_PRESET_MAP hanya meta+cp+tp+atp+alur+kuis, tanpa modules"],
    ["InlinePreview per modul", "\u2713", "Tombol Preview di ModuleCard dengan 3 scope mode"],
    ["Content generator (regex)", "\u2713", "14 generator modul + kuis + skenario + matching"],
    ["AI generate (LLM)", "\u26A0", "Hanya 9 tipe di API; belum semua modul"],
    ["Drag-and-drop reordering modul", "\u2717", "TIDAK ADA \u2014 KuisTab punya, ModulesTab belum"],
    ["Editor untuk sorting/wordsearch/teambuzzer", "\u2717", "TIDAK ADA \u2014 hanya dideklarasikan di GAME_TYPES"],
  ]));

  children.push(heading2("3.2 Celah Kritis: Preset Modul"));
  children.push(body("Celah paling signifikan adalah ketiadaan sistem preset untuk modul dan game. Saat ini, ketika pengguna menambahkan modul baru, yang muncul hanya scaffold kosongan dari MODULE_DEFAULTS tanpa data konten. Pengguna harus mengisi setiap field secara manual atau menggunakan AutoGenButton di dalam editor masing-masing. Ini kontras dengan KuisTab yang sudah memiliki preset cards berisi 10 soal siap pakai. Tanpa preset modul, pengguna tidak bisa dengan cepat mengisi konten pembelajaran \u2014 harus menambahkan modul satu per satu, lalu generate satu per satu, proses yang sangat tidak efisien untuk konten yang sebenarnya memiliki pola berulang (misalnya paket modul untuk topik tertentu)."));
  children.push(body("Selain itu, FULL_PRESET_MAP yang seharusnya menjadi mekanisme satu klik untuk mengisi seluruh proyek juga belum menyertakan modul. Ketika pengguna memilih preset Hakikat Norma, semua data meta, CP, TP, ATP, Alur, dan Kuis terisi otomatis, tapi modul tetap kosong. Ini menciptakan pengalaman yang terputus: data dokumen lengkap, tapi tidak ada konten interaktif."));

  children.push(heading2("3.3 Celah Kritis: Auto-Generate Tingkat Tab"));
  children.push(body("Saat ini, auto-generate hanya tersedia di dalam masing-masing editor modul (via AutoGenButton). Jika pengguna menambahkan 5 modul sekaligus, ia harus membuka editor satu per satu dan klik AutoGenButton di setiap editor. Tidak ada cara untuk mengisi semua modul sekaligus dari satu tombol. KuisTab sudah punya mekanisme ini \u2014 satu tombol Auto-Generate Kuis yang mengisi semua soal. ModulTab membutuhkan fungsionalitas serupa: satu tombol Auto-Generate Semua yang mengisi semua modul yang kosong berdasarkan teks materi."));

  children.push(heading2("3.4 Celah: Sinkronisasi Preset Authoring \u2194 Canvas"));
  children.push(body("Canvas sudah bisa membaca data dari authoring store melalui fungsi seperti addModulElement(idx), addKuisElement(idx), dan generateFromPageType(). Namun, tidak ada mekanisme untuk menyinkronkan pilihan preset. Ketika pengguna memilih preset Hakikat Norma di Authoring Tool, Canvas tidak otomatis tahu konteksnya. Warna, ikon, dan tema yang relevan dengan preset tidak terbawa ke canvas. Ini menyebabkan inkonsistensi visual antara konten yang di-generate dari authoring tool dan tampilan di canvas. Diperlukan mekanisme di mana pilihan preset di authoring tool mempengaruhi variabel template di canvas (misalnya warna utama, font, ikon default)."));

  children.push(heading2("3.5 Celah Minor: Editor Game yang Belum Ada"));
  children.push(body("Dari 6 tipe game yang dideklarasikan (truefalse, sorting, memory, roda, teambuzzer, wordsearch), hanya truefalse, memory, dan roda yang memiliki editor form. Sorting, teambuzzer, dan wordsearch hanya ada sebagai deklarasi tipe tanpa UI editor. Pengguna bisa menambahkan modul bertipe ini melalui quick-add grid, tapi setelah ditambahkan tidak bisa mengedit datanya karena editor modal tidak punya rute untuk tipe tersebut. Ini perlu ditangani meskipun bukan prioritas utama."));

  // ============== SECTION 4: RENCANA IMPLEMENTASI ==============
  children.push(heading1("4. Rencana Implementasi"));

  children.push(heading2("4.1 Fase 1: Authoring Tool (Prioritas Tertinggi)"));
  children.push(body("Fase ini berfokus pada penuntasan semua celah di authoring tool sebelum melanjutkan ke canvas dan export. Estimasi waktu: 3-4 hari kerja."));

  children.push(heading3("Task 1.1: Tambah PRESETS_MODULES"));
  children.push(bulletItem("File: src/store/authoring-presets.ts, src/store/authoring-types.ts"));
  children.push(bulletItem("Tambah tipe ModulePreset: { id, label, desc, icon, modules: Array<Record<string, unknown>> }"));
  children.push(bulletItem("Buat PRESETS_MODULES dengan 3 preset: hakikat-norma-modules (5 modul), macam-norma-modules (5 modul), blank"));
  children.push(bulletItem("Setiap preset berisi modul dengan data lengkap (bukan kosongan), mengikuti struktur MODULE_DEFAULTS"));
  children.push(bulletItem("Update FULL_PRESET_MAP untuk menyertakan key modules di setiap mapping"));

  children.push(heading3("Task 1.2: Tambah applyModulePreset di Store"));
  children.push(bulletItem("File: src/store/authoring-store.ts"));
  children.push(bulletItem("Tambah action applyModulePreset(presetKey) yang mengisi modules dari PRESETS_MODULES"));
  children.push(bulletItem("Update applyFullPreset agar juga mengisi modules dari preset modul yang sesuai"));
  children.push(bulletItem("Tambah re-export PRESETS_MODULES dari store"));

  children.push(heading3("Task 1.3: UI Preset Cards di ModulesTab"));
  children.push(bulletItem("File: src/components/authoring/konten-modules-tab.tsx"));
  children.push(bulletItem("Tambah bagian Preset Modul (mirip KuisTab) dengan card-card preset yang bisa diklik"));
  children.push(bulletItem("Setiap card menampilkan: ikon, nama preset, deskripsi singkat, jumlah modul"));
  children.push(bulletItem("Klik preset \u2192 applyModulePreset() \u2192 modul terisi otomatis"));

  children.push(heading3("Task 1.4: Tab-Level Auto-Generate di ModulesTab"));
  children.push(bulletItem("File: src/components/authoring/konten-modules-tab.tsx"));
  children.push(bulletItem("Tambah tombol Auto-Generate Semua di header ModulesTab"));
  children.push(bulletItem("Logika: baca materi teks \u2192 untuk setiap modul, panggil generator yang sesuai \u2192 tulis hasil ke store"));
  children.push(bulletItem("Mendukung 14 tipe modul yang punya generator (flashcard, infografis, timeline, matching, truefalse, memory, accordion, statistik, langkah, icon-explore, tab-icons, comparison, card-showcase, polling, roda)"));
  children.push(bulletItem("Tampilkan toast dengan jumlah modul yang berhasil di-generate"));

  children.push(heading3("Task 1.5: Perbaiki Modul yang Tidak Render"));
  children.push(bulletItem("Investigasi modul-modul yang tidak muncul di InlinePreview"));
  children.push(bulletItem("Kemungkinan penyebab: data field tidak cocok dengan renderer, tipe modul tidak terdaftar, atau renderer error"));
  children.push(bulletItem("Perbaiki mapping data antara editor form dan renderer output"));
  children.push(bulletItem("Uji semua 21+6 tipe modul di preview untuk memastikan semuanya render"));

  children.push(heading3("Task 1.6: Tambah Drag-and-Drop Reordering"));
  children.push(bulletItem("File: src/components/authoring/konten-modules-tab.tsx"));
  children.push(bulletItem("Integrasikan useDragSort hook (sudah dipakai di KuisTab)"));
  children.push(bulletItem("Ganti tombol panah atas/bawah dengan drag handle yang lebih intuitif"));

  children.push(heading2("4.2 Fase 2: Canvas (Prioritas Menengah)"));
  children.push(body("Fase ini dimulai setelah authoring tool selesai. Fokus pada integrasi preset dan penyempurnaan canvas editor. Estimasi waktu: 3-4 hari kerja."));

  children.push(heading3("Task 2.1: Link Preset Authoring \u2194 Canvas"));
  children.push(bulletItem("Ketika preset dipilih di authoring \u2192 simpan presetKey di store"));
  children.push(bulletItem("Canvas baca presetKey untuk menentukan warna tema, ikon default, dan variabel template"));
  children.push(bulletItem("generateFromPageType() dan generateFromTemplate() sudah baca authoring store; cukup pastikan data preset tersedia"));
  children.push(bulletItem("Tambah visual indicator di canvas yang menunjukkan preset aktif (misalnya badge di toolbar)"));

  children.push(heading3("Task 2.2: Auto-Generate Canvas Pages"));
  children.push(bulletItem("Tambah tombol Generate Pages di canvas yang membaca semua modul dari authoring store"));
  children.push(bulletItem("Secara otomatis membuat halaman canvas per modul dengan layout yang sesuai"));
  children.push(bulletItem("Gunakan template canvas yang sudah ada, isi dengan data dari authoring store"));

  children.push(heading3("Task 2.3: Penyempurnaan Canvas Editor"));
  children.push(bulletItem("Perbaiki UX canvas: zoom controls, snap-to-grid, alignment guides"));
  children.push(bulletItem("Optimasi performa rendering untuk banyak elemen"));
  children.push(bulletItem("Tambah undo/redo history yang lebih robust"));

  children.push(heading2("4.3 Fase 3: Export (Prioritas Akhir)"));
  children.push(body("Fase ini fokus pada finalisasi export ke HTML mandiri. Estimasi waktu: 2-3 hari kerja."));

  children.push(heading3("Task 3.1: Testing Export Semua Tipe Modul"));
  children.push(bulletItem("Uji auto-build.ts untuk semua 21 tipe modul + 6 game"));
  children.push(bulletItem("Pastikan buildPreviewPage() dan deduplicateCss() bekerja dengan benar"));
  children.push(bulletItem("Verifikasi output HTML bisa di-deploy secara independen tanpa server"));

  children.push(heading3("Task 3.2: Export Multi-Format"));
  children.push(bulletItem("Tambah opsi export SCORM untuk LMS"));
  children.push(bulletItem("Tambah opsi export PDF (via Puppeteer)"));
  children.push(bulletItem("Tambah opsi export ZIP (HTML + aset terbundel)"));

  children.push(heading3("Task 3.3: Optimasi Output"));
  children.push(bulletItem("Minifikasi CSS dan JS di output HTML"));
  children.push(bulletItem("Optimasi gambar (lazy loading, WebP fallback)"));
  children.push(bulletItem("Tambah meta tags SEO dan Open Graph"));

  // ============== SECTION 5: PRIORITAS DAN TIMELINE ==============
  children.push(heading1("5. Prioritas dan Timeline"));
  children.push(body("Berikut ringkasan prioritas dan estimasi timeline untuk keseluruhan proyek. Estimasi didasarkan pada kompleksitas setiap task dan ketergantungan antar komponen. Fase 1 harus selesai sebelum Fase 2 dimulai karena Canvas bergantung pada data lengkap dari Authoring Tool. Fase 3 bisa dimulai parsial bersamaan dengan Fase 2 untuk testing export dasar."));

  children.push(statusTable([
    ["Fase 1: Authoring Tool", "\u26A0", "3-4 hari \u2014 Prioritas tertinggi, semua celah kritis di sini"],
    ["Fase 2: Canvas", "\u26A0", "3-4 hari \u2014 Mulai setelah Fase 1 selesai"],
    ["Fase 3: Export", "\u26A0", "2-3 hari \u2014 Bisa parsial paralel dengan Fase 2"],
  ]));

  // ============== SECTION 6: DETAIL MODUL YANG SUDAH ADA ==============
  children.push(heading1("6. Detail Modul yang Sudah Ada"));

  children.push(heading2("6.1 Editor dengan AutoGenButton (14 editor)"));
  children.push(body("Empat belas editor modul sudah dilengkapi dengan tombol AutoGenButton yang memungkinkan pengisian otomatis dari teks materi. Setiap editor menggunakan generator regex yang sesuai dari content-generator.ts. Berikut daftar lengkap beserta generator yang digunakan:"));
  children.push(statusTable([
    ["SkenarioEditor", "\u2713", "parse() + genSkenario \u2014 2 chapter template"],
    ["FlashcardEditor", "\u2713", "generateFlashcardModuleData \u2014 kartu depan/belakang"],
    ["InfografisEditor", "\u2713", "generateInfografisModuleData \u2014 kartu dengan ikon + warna"],
    ["TimelineModuleEditor", "\u2713", "generateTimelineModuleData \u2014 events dengan deteksi tahun"],
    ["MatchingEditor", "\u2713", "generateMatchingModuleData \u2014 pasangan istilah-definisi"],
    ["TrueFalseEditor", "\u2713", "generateTrueFalseModuleData \u2014 pernyataan benar/salah"],
    ["MemoryEditor", "\u2713", "generateMatchingModuleData \u2014 reuse matching pairs"],
    ["LangkahEditor", "\u2713", "generateLangkahModuleData \u2014 langkah-langkah berurutan"],
    ["AccordionEditor", "\u2713", "generateAccordionModuleData \u2014 item bisa dilipat"],
    ["StatistikModuleEditor", "\u2713", "generateStatistikModuleData \u2014 angka dan persentase"],
    ["PollingEditor", "\u2713", "generatePollingModuleData \u2014 opsi polling"],
    ["TabIconsEditor", "\u2713", "generateTabIconsModuleData \u2014 tab dengan ikon"],
    ["IconExploreEditor", "\u2713", "generateIconExploreModuleData \u2014 grid ikon interaktif"],
    ["ComparisonEditor", "\u2713", "generateComparisonModuleData \u2014 tabel perbandingan"],
    ["CardShowcaseEditor", "\u2713", "generateCardShowcaseModuleData \u2014 kartu showcase"],
  ]));

  children.push(heading2("6.2 Editor tanpa AutoGenButton (5 editor)"));
  children.push(body("Lima editor tidak memiliki AutoGenButton karena kontennya bersifat manual atau membutuhkan input eksternal yang tidak bisa digenerate dari teks materi:"));
  children.push(statusTable([
    ["VideoEditor", "\u2717", "Konten eksternal (URL/platform YouTube), tidak bisa digenerate"],
    ["StudiKasusEditor", "\u2717", "Naratif studi kasus membutuhkan konteks khusus"],
    ["DebatEditor", "\u2717", "Mosi dan argumen pro/kontra bersifat subjektif"],
    ["HeroEditor", "\u2717", "UI chrome (judul/subjudul/gradient), konten dekoratif"],
    ["EmbedEditor", "\u2717", "URL embed eksternal, tidak bisa digenerate"],
  ]));

  // ============== SECTION 7: DATA PRESET YANG PERLU DIBUAT ==============
  children.push(heading1("7. Data Preset yang Perlu Dibuat"));

  children.push(heading2("7.1 Preset Hakikat Norma (5 modul)"));
  children.push(body("Preset ini dirancang untuk Pertemuan 1: Hakikat Norma, PPKn SMP Kelas VII. Kelima modul saling melengkapi untuk menciptakan pengalaman belajar yang komprehensif, dimulai dari skenario interaktif yang membangun konteks, infografis yang menyajikan konsep kunci, flashcard untuk menghafal definisi, matching untuk menguji pemahaman istilah, dan truefalse untuk asesmen cepat. Setiap modul sudah terisi data lengkap sesuai struktur MODULE_DEFAULTS."));

  children.push(heading2("7.2 Preset Macam-Macam Norma (5 modul)"));
  children.push(body("Preset ini dirancang untuk Pertemuan 2: Macam-Macam Norma. Modul-modulnya fokus pada 4 jenis norma (agama, kesusilaan, kesopanan, hukum) dengan pendekatan visual dan komparatif. Icon-explore menampilkan 4 jenis norma secara visual, tab-icons mengeksplorasi sumber dan sanksi masing-masing, comparison membuat tabel perbandingan antar norma, dan skenario memberikan konteks penerapan. Kombinasi ini memastikan siswa memahami perbedaan dan persamaan antar jenis norma secara mendalam."));

  children.push(heading2("7.3 Update FULL_PRESET_MAP"));
  children.push(body("FULL_PRESET_MAP perlu ditambahkan key modules di setiap mapping. Saat ini hanya mencakup meta, cp, tp, atp, alur, dan kuis. Dengan penambahan modules, ketika pengguna memilih preset Hakikat Norma, seluruh proyek akan terisi lengkap: dari dokumen perencanaan (CP, TP, ATP, Alur) hingga konten interaktif (modul) dan asesmen (kuis). Ini menciptakan pengalaman one-click setup yang sangat efisien."));

  // ============== SECTION 8: RISIKO DAN MITIGASI ==============
  children.push(heading1("8. Risiko dan Mitigasi"));

  children.push(heading2("8.1 Kualitas Konten Generate"));
  children.push(body("Generator regex memiliki keterbatasan dalam memahami konteks mendalam. Hasil generate bisa kurang relevan jika teks materi terlalu pendek atau tidak mengandung pola yang bisa diekstrak (definisi, enumerasi, fungsi). Mitigasi: tetap pertahankan minimum 50 karakter materi, tambahkan fallback yang lebih cerdas, dan pertimbangkan integrasi AI (z-ai-web-dev-sdk) untuk generate yang lebih kontekstual. AI generate sudah ada di AutoGenerate panel dan API /api/ai-generate, tapi belum diintegrasikan ke editor modul individual."));

  children.push(heading2("8.2 Konsistensi Data antara Store dan Renderer"));
  children.push(body("Modul disimpan sebagai Record<string, unknown> yang loosely typed. Tidak ada validasi schema, sehingga data yang disimpan di editor bisa tidak cocok dengan yang diharapkan renderer. Mitigasi: tambahkan validasi runtime di setiap editor sebelum menyimpan ke store, dan di renderer sebelum render. Pertimbangkan migrasi ke typed schema (misalnya Zod) untuk modul data di fase selanjutnya."));

  children.push(heading2("8.3 Performa dengan Banyak Modul"));
  children.push(body("InlinePreview me-render semua modul dalam satu iframe. Dengan 10+ modul, performa bisa menurun. Mitigasi: gunakan virtual scrolling atau lazy rendering di preview, dan pastikan CSS deduplication bekerja efisien. buildPreviewPage() sudah menggunakan deduplicateCss() dan stripAllEnhancedCss(), tapi perlu diuji dengan beban modul yang banyak."));

  children.push(heading2("8.4 Kompatibilitas Cross-Browser untuk Export"));
  children.push(body("Output HTML harus bisa berjalan di berbagai browser tanpa dependensi server. Efek CSS modern seperti backdrop-filter, CSS Grid, dan custom properties mungkin tidak didukung di browser lama. Mitigasi: tambahkan fallback CSS dan test output di Chrome, Firefox, Safari, dan Edge. Pertimbangkan auto-prefixer untuk CSS output."));

  // ============== SECTION 9: KESIMPULAN ==============
  children.push(heading1("9. Kesimpulan"));
  children.push(body("Proyek MPI v6 sudah memiliki fondasi teknis yang kuat dengan arsitektur yang terstruktur dan komponen-komponen yang fungsional. Namun, ada beberapa celah kritis yang menghambat produktivitas pengguna, terutama dalam hal preset modul dan auto-generate tingkat tab. Dengan mengimplementasikan rencana di atas secara berurutan (Authoring Tool \u2192 Canvas \u2192 Export), kita bisa memastikan setiap komponen dibangun di atas fondasi yang sudah solid."));
  children.push(body("Titik kritis keberhasilan proyek ini terletak pada Fase 1: jika authoring tool bisa memberikan pengalaman one-click setup yang mulus (preset lengkap + auto-generate semua modul), maka Fase 2 dan 3 akan berjalan jauh lebih lancar karena data yang mengalir ke canvas dan export sudah terstruktur dengan baik. Fokus utama adalah memberikan value kepada pengguna sesegera mungkin: preset modul adalah fitur dengan impact tertinggi dan effort yang paling reasonable untuk segera diimplementasikan."));

  return children;
}

// ── Build Document ──
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 24, color: c(P.body) },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.primary) },
      },
      heading2: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) },
      },
      heading3: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 26, bold: true, color: c(P.accent) },
      },
    },
  },
  sections: [
    // Cover Section
    {
      properties: {
        page: {
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
          size: { width: 11906, height: 16838 },
        },
      },
      children: buildCover(),
    },
    // Body Section
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          size: { width: 11906, height: 16838 },
          pageNumbers: { start: 1, formatType: "decimal" },
        },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary) }),
            ]
          })]
        })
      },
      children: buildBody(),
    }
  ]
});

// ── Write ──
Packer.toBuffer(doc).then(buf => {
  const outPath = "/home/z/my-project/download/MPI-v6-Master-Plan.docx";
  fs.writeFileSync(outPath, buf);
  console.log(`Generated: ${outPath}`);
});
