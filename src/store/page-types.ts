// ═══════════════════════════════════════════════════════════════
// PAGE TYPE DEFINITIONS — Auto-Generate System for Canva Assembler
// ═══════════════════════════════════════════════════════════════
//
// Konsep: Guru memilih tipe halaman → Sistem auto-generate semua
// halaman lengkap dengan navbar, skor, progress, timer, apresiasi.
// Guru tinggal isi konten dan sesuaikan visual.
//

import type { CanvaElement } from '@/components/canva/types';

// ── Types ─────────────────────────────────────────────────────

export interface PageTypeOption {
  id: string;
  label: string;
  type: 'number' | 'select' | 'toggle';
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

export interface PageBlueprint {
  label: string;
  bgColor: string;
  elements: Omit<CanvaElement, 'id'>[];
}

export interface PageTypeDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'kuis' | 'game' | 'materi' | 'interaksi';
  color: string;
  options: PageTypeOption[];
  generate: (config: Record<string, number | string | boolean>) => {
    pages: PageBlueprint[];
    navbarStyle?: string;
  };
}

// ── Helper ────────────────────────────────────────────────────

function el(
  type: string,
  overrides: Partial<Omit<CanvaElement, 'id'>> & Pick<CanvaElement, 'x' | 'y' | 'w' | 'h'>
): Omit<CanvaElement, 'id'> {
  return {
    type,
    opacity: 100,
    hidden: false,
    system: false,
    ...overrides,
  };
}

function sysEl(
  type: string,
  overrides: Partial<Omit<CanvaElement, 'id'>> & Pick<CanvaElement, 'x' | 'y' | 'w' | 'h'>
): Omit<CanvaElement, 'id'> {
  return {
    type,
    opacity: 100,
    hidden: false,
    system: true, // Mark as system element
    ...overrides,
  };
}

// ── SYSTEM ELEMENT BUILDERS ──────────────────────────────────
// These create consistent system elements across page types.

function navbarBottom(): Omit<CanvaElement, 'id'> {
  return sysEl('navbar', {
    x: 0, y: 88, w: 100, h: 12,
    icon: '🧭',
    label: 'Navbar Sistem',
    navStyle: 'bottom-bar',
    color: '#1e293b',
  });
}

function progressTop(pageNum: number, totalPages: number): Omit<CanvaElement, 'id'> {
  return sysEl('progress', {
    x: 10, y: 3, w: 80, h: 3,
    icon: '📊',
    label: `Progress ${pageNum}/${totalPages}`,
    color: '#3b82f6',
    text: `${((pageNum - 1) / totalPages) * 100}`,
  });
}

function scoreDisplay(): Omit<CanvaElement, 'id'> {
  return sysEl('score', {
    x: 78, y: 3, w: 20, h: 7,
    icon: '⭐',
    label: 'Skor Sistem',
    text: '0',
    color: '#f59e0b',
  });
}

function timerDisplay(): Omit<CanvaElement, 'id'> {
  return sysEl('timer', {
    x: 35, y: 3, w: 30, h: 10,
    icon: '⏱️',
    label: 'Timer Sistem',
    text: '02:00',
    color: '#ef4444',
  });
}

function pageCounter(pageNum: number, totalPages: number): Omit<CanvaElement, 'id'> {
  return sysEl('teks', {
    x: 5, y: 3, w: 25, h: 5,
    icon: '📄',
    label: 'Counter Sistem',
    text: `Soal ${pageNum} dari ${totalPages}`,
    fontSize: 11,
  });
}

function questionPlaceholder(): Omit<CanvaElement, 'id'> {
  return el('teks', {
    x: 8, y: 16, w: 84, h: 14,
    icon: '❓',
    label: 'Pertanyaan',
    text: 'Tulis pertanyaan di sini...',
    fontSize: 20,
  });
}

function optionButton(letter: string, yPos: number): Omit<CanvaElement, 'id'> {
  return el('button', {
    x: 10, y: yPos, w: 80, h: 9,
    icon: letter,
    label: `Opsi ${letter}`,
    text: `${letter}. Tulis jawaban...`,
    color: '#1e3a5f',
    radius: 10,
  });
}

// ── PAGE TYPE: KUIS PILIHAN GANDA ────────────────────────────

const KUIS_PG: PageTypeDefinition = {
  id: 'kuis-pg',
  name: 'Kuis Pilihan Ganda',
  icon: '❓',
  description: 'Kuis dengan opsi A/B/C/D, skor otomatis, dan apresiasi',
  category: 'kuis',
  color: '#f5c842',
  options: [
    { id: 'jumlahSoal', label: 'Jumlah Soal', type: 'number', default: 5, min: 2, max: 20, step: 1 },
    { id: 'timer', label: 'Timer (menit)', type: 'number', default: 0, min: 0, max: 30, step: 1 },
    { id: 'opsi', label: 'Jumlah Opsi', type: 'select', default: '4', options: [
      { value: '2', label: '2 Opsi (A-B)' },
      { value: '3', label: '3 Opsi (A-C)' },
      { value: '4', label: '4 Opsi (A-D)' },
    ]},
    { id: 'apresiasi', label: 'Halaman Apresiasi', type: 'toggle', default: true },
    { id: 'navbar', label: 'Navbar Otomatis', type: 'toggle', default: true },
  ],
  generate: (config) => {
    const numQ = (config.jumlahSoal as number) || 5;
    const hasTimer = (config.timer as number) > 0;
    const numOpts = parseInt(config.opsi as string) || 4;
    const hasApresiasi = config.apresiasi !== false;
    const hasNavbar = config.navbar !== false;

    const pages: PageBlueprint[] = [];

    // Page 1: Start
    const startElements: Omit<CanvaElement, 'id'>[] = [
      sysEl('shape', { x: 10, y: 5, w: 80, h: 30, label: 'Area Ilustrasi', color: 'rgba(59,130,246,0.15)', radius: 16 }),
      sysEl('teks', { x: 15, y: 10, w: 70, h: 10, label: 'Judul Utama', text: 'Judul Kuis', fontSize: 32 }),
      sysEl('teks', { x: 20, y: 22, w: 60, h: 6, label: 'Deskripsi', text: 'Deskripsi singkat tentang kuis ini', fontSize: 14 }),
      el('teks', { x: 25, y: 45, w: 50, h: 4, label: 'Petunjuk', text: `${numQ} soal pilihan ganda${hasTimer ? ' dengan timer' : ''}`, fontSize: 12 }),
      el('button', { x: 30, y: 55, w: 40, h: 10, icon: '🚀', label: 'Mulai Kuis', text: '🚀  Mulai Kuis', color: '#3b82f6', radius: 12 }),
      sysEl('divider', { x: 5, y: 75, w: 90, h: 1, label: 'Divider', color: 'rgba(255,255,255,0.06)' }),
      el('teks', { x: 35, y: 78, w: 30, h: 4, label: 'Footer', text: 'PKN Kelas 7', fontSize: 11 }),
    ];
    pages.push({ label: 'Mulai Kuis', bgColor: '#0f172a', elements: startElements });

    // Pages 2..N+1: Soal
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const baseY = hasTimer ? 20 : 15;
    const optionH = 9;
    const optionGap = 10.5;

    for (let i = 1; i <= numQ; i++) {
      const questionElements: Omit<CanvaElement, 'id'>[] = [];

      // System elements
      questionElements.push(pageCounter(i, numQ));
      questionElements.push(progressTop(i, numQ));
      questionElements.push(scoreDisplay());
      if (hasTimer) questionElements.push(timerDisplay());

      // Content: question
      questionElements.push(questionPlaceholder());

      // Content: options
      for (let j = 0; j < numOpts; j++) {
        questionElements.push(optionButton(letters[j], baseY + (i === 1 ? 15 : 0) + j * optionGap));
      }

      // Navbar
      if (hasNavbar) questionElements.push(navbarBottom());

      pages.push({
        label: `Soal ${i}`,
        bgColor: '#0c1222',
        elements: questionElements,
      });
    }

    // Last page: Apresiasi
    if (hasApresiasi) {
      const resultElements: Omit<CanvaElement, 'id'>[] = [
        sysEl('confetti', { x: 5, y: 2, w: 90, h: 40, label: 'Area Confetti' }),
        sysEl('badge', { x: 30, y: 5, w: 40, h: 20, icon: '🏆', label: 'Badge Juara', text: 'Luar Biasa!', color: '#f59e0b' }),
        sysEl('score', { x: 25, y: 30, w: 50, h: 12, icon: '⭐', label: 'Skor Akhir', text: '100', color: '#22c55e' }),
        sysEl('teks', { x: 20, y: 45, w: 60, h: 5, label: 'Feedback Otomatis', text: 'Semua jawaban benar!', fontSize: 14 }),
        sysEl('progress', { x: 15, y: 53, w: 70, h: 3, label: 'Akurasi', color: '#22c55e' }),
        sysEl('shape', { x: 15, y: 60, w: 70, h: 15, label: 'Area Statistik', color: 'rgba(255,255,255,0.05)', radius: 12 }),
        sysEl('teks', { x: 18, y: 62, w: 20, h: 4, label: 'Stat Benar', text: '✅ Benar: 5', fontSize: 11 }),
        sysEl('teks', { x: 42, y: 62, w: 20, h: 4, label: 'Stat Salah', text: '❌ Salah: 0', fontSize: 11 }),
        sysEl('teks', { x: 65, y: 62, w: 20, h: 4, label: 'Stat Waktu', text: '⏱️ Waktu: 02:30', fontSize: 11 }),
        el('button', { x: 10, y: 80, w: 35, h: 8, icon: '🔄', label: 'Ulangi', text: '🔄  Ulangi', color: '#3b82f6', radius: 10 }),
        el('button', { x: 55, y: 80, w: 35, h: 8, icon: '📊', label: 'Detail', text: '📊  Lihat Detail', color: '#6b7280', radius: 10 }),
      ];

      if (hasNavbar) resultElements.push(navbarBottom());

      pages.push({ label: 'Hasil Kuis', bgColor: '#0f172a', elements: resultElements });
    }

    return { pages, navbarStyle: hasNavbar ? 'bottom-bar' : undefined };
  },
};

// ── PAGE TYPE: KUIS BENAR/SALAH ─────────────────────────────

const KUIS_BS: PageTypeDefinition = {
  id: 'kuis-bs',
  name: 'Kuis Benar / Salah',
  icon: '✅',
  description: 'Pernyataan benar/salah dengan 2 tombol besar',
  category: 'kuis',
  color: '#22c55e',
  options: [
    { id: 'jumlahSoal', label: 'Jumlah Soal', type: 'number', default: 5, min: 2, max: 15, step: 1 },
    { id: 'timer', label: 'Timer (menit)', type: 'number', default: 0, min: 0, max: 15, step: 1 },
    { id: 'navbar', label: 'Navbar Otomatis', type: 'toggle', default: true },
  ],
  generate: (config) => {
    const numQ = (config.jumlahSoal as number) || 5;
    const hasTimer = (config.timer as number) > 0;
    const hasNavbar = config.navbar !== false;

    const pages: PageBlueprint[] = [];

    // Start
    pages.push({
      label: 'Mulai Benar/Salah',
      bgColor: '#0d1117',
      elements: [
        sysEl('teks', { x: 20, y: 15, w: 60, h: 12, label: 'Judul', text: 'Benar atau Salah?', fontSize: 30 }),
        sysEl('teks', { x: 25, y: 30, w: 50, h: 6, label: 'Deskripsi', text: `Jawab ${numQ} pernyataan dengan cepat!`, fontSize: 14 }),
        el('button', { x: 30, y: 50, w: 40, h: 10, icon: '🚀', label: 'Mulai', text: '🚀  Mulai', color: '#16a34a', radius: 12 }),
      ],
    });

    // Questions
    for (let i = 1; i <= numQ; i++) {
      const qEls: Omit<CanvaElement, 'id'>[] = [
        pageCounter(i, numQ),
        progressTop(i, numQ),
        scoreDisplay(),
      ];
      if (hasTimer) qEls.push(timerDisplay());

      qEls.push(el('teks', {
        x: 8, y: 18, w: 84, h: 15,
        label: 'Pernyataan',
        text: `Pernyataan ${i} — tulis di sini...`,
        fontSize: 22,
      }));
      qEls.push(el('button', { x: 8, y: 45, w: 38, h: 20, icon: '✅', label: 'Benar', text: '✅  Benar', color: '#16a34a', radius: 14 }));
      qEls.push(el('button', { x: 54, y: 45, w: 38, h: 20, icon: '❌', label: 'Salah', text: '❌  Salah', color: '#dc2626', radius: 14 }));

      if (hasNavbar) qEls.push(navbarBottom());

      pages.push({ label: `Soal ${i}`, bgColor: '#0d1117', elements: qEls });
    }

    // Result
    pages.push({
      label: 'Hasil',
      bgColor: '#0f172a',
      elements: [
        sysEl('confetti', { x: 5, y: 2, w: 90, h: 40, label: 'Confetti' }),
        sysEl('badge', { x: 30, y: 8, w: 40, h: 18, icon: '🏆', label: 'Hasil', text: 'Luar Biasa!', color: '#22c55e' }),
        sysEl('score', { x: 25, y: 32, w: 50, h: 12, icon: '⭐', label: 'Skor Akhir', text: '100', color: '#22c55e' }),
        el('button', { x: 10, y: 80, w: 80, h: 8, icon: '🔄', label: 'Ulangi', text: '🔄  Coba Lagi', color: '#22c55e', radius: 10 }),
      ],
    });

    return { pages, navbarStyle: hasNavbar ? 'bottom-bar' : undefined };
  },
};

// ── PAGE TYPE: GAME INTERAKTIF ───────────────────────────────

const GAME_INTERAKTIF: PageTypeDefinition = {
  id: 'game-interactive',
  name: 'Game Interaktif',
  icon: '🎮',
  description: 'Start game → level → hasil dengan skor & apresiasi',
  category: 'game',
  color: '#3ecfcf',
  options: [
    { id: 'jumlahLevel', label: 'Jumlah Level', type: 'number', default: 3, min: 2, max: 10, step: 1 },
    { id: 'tipeGame', label: 'Tipe Game', type: 'select', default: 'petualangan', options: [
      { value: 'petualangan', label: 'Petualangan' },
      { value: 'teka-teki', label: 'Teka-Teki' },
      { value: 'menyusun', label: 'Menyusun Kata' },
    ]},
    { id: 'timer', label: 'Timer per Level', type: 'number', default: 2, min: 0, max: 10, step: 1 },
    { id: 'navbar', label: 'Navbar Otomatis', type: 'toggle', default: true },
  ],
  generate: (config) => {
    const numLevels = (config.jumlahLevel as number) || 3;
    const gameType = config.tipeGame as string || 'petualangan';
    const hasTimer = (config.timer as number) > 0;
    const hasNavbar = config.navbar !== false;

    const gameLabels: Record<string, string> = {
      petualangan: 'Petualangan',
      'teka-teki': 'Teka-Teki',
      'menyusun': 'Menyusun Kata',
    };

    const pages: PageBlueprint[] = [];

    // Start
    pages.push({
      label: 'Mulai Game',
      bgColor: '#0f172a',
      elements: [
        sysEl('shape', { x: 10, y: 5, w: 80, h: 30, label: 'Area Ilustrasi', color: 'rgba(56,217,217,0.12)', radius: 16 }),
        sysEl('teks', { x: 15, y: 10, w: 70, h: 10, label: 'Judul Game', text: `${gameLabels[gameType]} - Judul Game`, fontSize: 30 }),
        sysEl('teks', { x: 20, y: 22, w: 60, h: 6, label: 'Deskripsi', text: 'Deskripsi singkat tentang game ini', fontSize: 14 }),
        sysEl('badge', { x: 35, y: 40, w: 30, h: 10, icon: '🏆', label: 'Level Info', text: `${numLevels} Level`, color: '#3ecfcf' }),
        el('button', { x: 30, y: 55, w: 40, h: 10, icon: '🚀', label: 'Mulai', text: '🚀  Mulai Bermain', color: '#0891b2', radius: 12 }),
      ],
    });

    // Levels
    for (let i = 1; i <= numLevels; i++) {
      const levelEls: Omit<CanvaElement, 'id'>[] = [
        pageCounter(i, numLevels),
        progressTop(i, numLevels),
        scoreDisplay(),
      ];
      if (hasTimer) levelEls.push(timerDisplay());

      levelEls.push(sysEl('shape', { x: 5, y: 15, w: 90, h: 60, label: 'Area Game', color: 'rgba(56,217,217,0.05)', radius: 12 }));
      levelEls.push(el('teks', { x: 10, y: 18, w: 80, h: 8, label: 'Instruksi Level', text: `Level ${i}: Tulis instruksi di sini...`, fontSize: 16 }));

      if (hasNavbar) levelEls.push(navbarBottom());

      pages.push({ label: `Level ${i}`, bgColor: '#0a1628', elements: levelEls });
    }

    // Result
    pages.push({
      label: 'Hasil Game',
      bgColor: '#0f172a',
      elements: [
        sysEl('confetti', { x: 5, y: 2, w: 90, h: 35, label: 'Confetti' }),
        sysEl('badge', { x: 30, y: 5, w: 40, h: 18, icon: '🏆', label: 'Badge Game', text: 'Game Selesai!', color: '#0891b2' }),
        sysEl('score', { x: 25, y: 28, w: 50, h: 12, icon: '⭐', label: 'Skor Total', text: '0', color: '#3ecfcf' }),
        sysEl('teks', { x: 20, y: 43, w: 60, h: 5, label: 'Feedback', text: 'Kamu menyelesaikan semua level!', fontSize: 14 }),
        el('button', { x: 10, y: 80, w: 35, h: 8, icon: '🔄', label: 'Main Lagi', text: '🔄  Main Lagi', color: '#0891b2', radius: 10 }),
        el('button', { x: 55, y: 80, w: 35, h: 8, icon: '📊', label: 'Detail', text: '📊  Detail', color: '#6b7280', radius: 10 }),
      ],
    });

    return { pages, navbarStyle: hasNavbar ? 'bottom-bar' : undefined };
  },
};

// ── PAGE TYPE: MATERI PEMBELAJARAN ──────────────────────────

const MATERI: PageTypeDefinition = {
  id: 'materi',
  name: 'Materi Pembelajaran',
  icon: '📖',
  description: 'Header bab + halaman konten materi dengan navigasi',
  category: 'materi',
  color: '#a78bfa',
  options: [
    { id: 'jumlahHalaman', label: 'Jumlah Halaman', type: 'number', default: 3, min: 2, max: 10, step: 1 },
    { id: 'navbar', label: 'Navbar Otomatis', type: 'toggle', default: true },
  ],
  generate: (config) => {
    const numPages = (config.jumlahHalaman as number) || 3;
    const hasNavbar = config.navbar !== false;

    const pages: PageBlueprint[] = [];

    // Header
    pages.push({
      label: 'Header Materi',
      bgColor: '#1e1b4b',
      elements: [
        sysEl('shape', { x: 0, y: 0, w: 100, h: 30, label: 'Header BG', color: 'rgba(99,102,241,0.12)', radius: 0 }),
        sysEl('badge', { x: 5, y: 4, w: 18, h: 6, icon: '📚', label: 'Bab', text: 'Bab 1', color: '#6366f1' }),
        el('teks', { x: 5, y: 13, w: 90, h: 8, label: 'Judul Bab', text: 'Judul Materi Pembelajaran', fontSize: 24 }),
        sysEl('teks', { x: 5, y: 23, w: 90, h: 4, label: 'Subjudul', text: 'PKN Kelas 7 • Semester 1', fontSize: 12 }),
        sysEl('shape', { x: 5, y: 35, w: 2, h: 30, label: 'Accent Bar', color: '#6366f1', radius: 2 }),
        el('teks', { x: 12, y: 35, w: 83, h: 5, label: 'Label CP', text: 'Capaian Pembelajaran:', fontSize: 14 }),
        el('teks', { x: 12, y: 42, w: 83, h: 12, label: 'Deskripsi CP', text: 'Tulis capaian pembelajaran di sini...', fontSize: 13 }),
        sysEl('divider', { x: 10, y: 60, w: 80, h: 1, label: 'Divider' }),
        el('teks', { x: 10, y: 65, w: 80, h: 15, label: 'Area Konten', text: 'Konten materi akan tampil di sini. Kamu bisa menambahkan teks, gambar, atau elemen lainnya.', fontSize: 14 }),
      ],
    });

    // Content pages
    for (let i = 1; i <= numPages; i++) {
      const contentEls: Omit<CanvaElement, 'id'>[] = [
        pageCounter(i, numPages),
        progressTop(i, numPages),
        el('teks', { x: 8, y: 14, w: 84, h: 10, label: `Judul Hal ${i}`, text: `Halaman ${i}: Judul Sub Materi`, fontSize: 20 }),
        el('teks', { x: 8, y: 28, w: 84, h: 45, label: 'Konten', text: 'Tulis konten materi di sini...\n\nBisa berupa teks penjelasan, poin-poin penting, atau gambar ilustrasi.', fontSize: 14 }),
      ];

      if (hasNavbar) contentEls.push(navbarBottom());

      pages.push({ label: `Materi ${i}`, bgColor: '#0f0e1a', elements: contentEls });
    }

    return { pages, navbarStyle: hasNavbar ? 'bottom-bar' : undefined };
  },
};

// ── PAGE TYPE: FLASHCARD ─────────────────────────────────────

const FLASHCARD: PageTypeDefinition = {
  id: 'flashcard',
  name: 'Flashcard',
  icon: '🃏',
  description: 'Kartu belajar depan/belakang dengan progress',
  category: 'materi',
  color: '#a855f7',
  options: [
    { id: 'jumlahKartu', label: 'Jumlah Kartu', type: 'number', default: 5, min: 2, max: 20, step: 1 },
    { id: 'navbar', label: 'Navbar Otomatis', type: 'toggle', default: true },
  ],
  generate: (config) => {
    const numCards = (config.jumlahKartu as number) || 5;
    const hasNavbar = config.navbar !== false;

    const pages: PageBlueprint[] = [];

    // Header
    pages.push({
      label: 'Header Flashcard',
      bgColor: '#0c0a1a',
      elements: [
        sysEl('teks', { x: 25, y: 20, w: 50, h: 10, label: 'Judul', text: 'Flashcard Belajar', fontSize: 26 }),
        sysEl('teks', { x: 30, y: 35, w: 40, h: 5, label: 'Info', text: `${numCards} kartu`, fontSize: 13 }),
        el('button', { x: 30, y: 50, w: 40, h: 10, icon: '🃏', label: 'Mulai', text: '🃏  Mulai Belajar', color: '#a855f7', radius: 12 }),
      ],
    });

    // Cards
    for (let i = 1; i <= numCards; i++) {
      const cardEls: Omit<CanvaElement, 'id'>[] = [
        pageCounter(i, numCards),
        progressTop(i, numCards),
        sysEl('shape', { x: 10, y: 18, w: 80, h: 55, label: 'Kartu', color: 'rgba(168,85,247,0.08)', radius: 20 }),
        el('badge', { x: 15, y: 22, w: 70, h: 8, icon: '❓', label: 'Pertanyaan', text: `Pertanyaan kartu ${i}`, color: '#a855f7' }),
        el('teks', { x: 18, y: 34, w: 64, h: 18, label: 'Jawaban', text: 'Tulis jawaban di sini...', fontSize: 16 }),
        sysEl('teks', { x: 20, y: 55, w: 60, h: 5, label: 'Petunjuk', text: 'Klik kartu untuk membalik', fontSize: 11 }),
      ];

      if (hasNavbar) cardEls.push(navbarBottom());

      pages.push({ label: `Kartu ${i}`, bgColor: '#0c0a1a', elements: cardEls });
    }

    return { pages, navbarStyle: hasNavbar ? 'bottom-bar' : undefined };
  },
};

// ── PAGE TYPE: TANTANGAN TIMER ──────────────────────────────

const TANTANGAN_TIMER: PageTypeDefinition = {
  id: 'tantangan-timer',
  name: 'Tantangan Timer',
  icon: '⏱️',
  description: 'Jawab cepat dalam waktu terbatas',
  category: 'interaksi',
  color: '#ef4444',
  options: [
    { id: 'jumlahSoal', label: 'Jumlah Soal', type: 'number', default: 5, min: 2, max: 15, step: 1 },
    { id: 'durasi', label: 'Durasi (menit)', type: 'number', default: 2, min: 1, max: 30, step: 1 },
    { id: 'navbar', label: 'Navbar Otomatis', type: 'toggle', default: true },
  ],
  generate: (config) => {
    const numQ = (config.jumlahSoal as number) || 5;
    const durasi = (config.durasi as number) || 2;
    const hasNavbar = config.navbar !== false;
    const timerText = durasi < 10 ? `0${durasi}:00` : `${durasi}:00`;

    const pages: PageBlueprint[] = [];

    // Start
    pages.push({
      label: 'Mulai Tantangan',
      bgColor: '#1a0a0a',
      elements: [
        sysEl('timer', { x: 30, y: 10, w: 40, h: 18, icon: '⏱️', label: 'Timer Info', text: timerText, color: '#ef4444' }),
        sysEl('teks', { x: 10, y: 35, w: 80, h: 8, label: 'Judul', text: `Tantangan ${numQ} Soal`, fontSize: 22 }),
        sysEl('teks', { x: 15, y: 48, w: 70, h: 5, label: 'Instruksi', text: `Jawab ${numQ} soal dalam ${durasi} menit!`, fontSize: 14 }),
        el('button', { x: 30, y: 60, w: 40, h: 10, icon: '🚀', label: 'Mulai', text: '🚀  Mulai!', color: '#ef4444', radius: 12 }),
      ],
    });

    // Questions
    for (let i = 1; i <= numQ; i++) {
      const qEls: Omit<CanvaElement, 'id'>[] = [
        pageCounter(i, numQ),
        progressTop(i, numQ),
        sysEl('timer', { x: 75, y: 3, w: 20, h: 6, icon: '⏱️', label: 'Timer Sistem', text: timerText, color: '#ef4444' }),
        scoreDisplay(),
        el('teks', { x: 8, y: 16, w: 84, h: 12, label: 'Pertanyaan', text: `Soal ${i}: Tulis pertanyaan...`, fontSize: 20 }),
        optionButton('A', 32), optionButton('B', 42), optionButton('C', 52), optionButton('D', 62),
      ];

      if (hasNavbar) qEls.push(navbarBottom());

      pages.push({ label: `Soal ${i}`, bgColor: '#1a0a0a', elements: qEls });
    }

    // Result
    pages.push({
      label: 'Hasil Tantangan',
      bgColor: '#0f172a',
      elements: [
        sysEl('confetti', { x: 5, y: 2, w: 90, h: 35, label: 'Confetti' }),
        sysEl('badge', { x: 28, y: 5, w: 44, h: 18, icon: '⏱️', label: 'Waktu', text: 'Waktu Habis!', color: '#ef4444' }),
        sysEl('score', { x: 25, y: 28, w: 50, h: 12, icon: '⭐', label: 'Skor Akhir', text: '0', color: '#f59e0b' }),
        sysEl('teks', { x: 20, y: 43, w: 60, h: 5, label: 'Feedback', text: 'Waktu habis! Coba lagi untuk skor lebih tinggi.', fontSize: 14 }),
        el('button', { x: 10, y: 80, w: 80, h: 8, icon: '🔄', label: 'Ulangi', text: '🔄  Coba Lagi', color: '#ef4444', radius: 10 }),
      ],
    });

    return { pages, navbarStyle: hasNavbar ? 'bottom-bar' : undefined };
  },
};

// ── ALL PAGE TYPES ───────────────────────────────────────────

export const ALL_PAGE_TYPES: PageTypeDefinition[] = [
  KUIS_PG,
  KUIS_BS,
  GAME_INTERAKTIF,
  MATERI,
  FLASHCARD,
  TANTANGAN_TIMER,
];

export const PAGE_TYPE_CATEGORIES = [
  { id: 'kuis', label: '❓ Kuis', color: '#f5c842' },
  { id: 'game', label: '🎮 Game', color: '#3ecfcf' },
  { id: 'materi', label: '📖 Materi', color: '#a78bfa' },
  { id: 'interaksi', label: '💬 Interaksi', color: '#ef4444' },
] as const;
