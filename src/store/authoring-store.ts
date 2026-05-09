'use client';

import { create } from 'zustand';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────
export type PanelId = 'dashboard' | 'dokumen' | 'konten' | 'canva' | 'autogen' | 'projects' | 'import' | 'preview' | 'versions';

export interface MetaState {
  judulPertemuan: string;
  subjudul: string;
  ikon: string;
  durasi: string;
  namaBab: string;
  mapel: string;
  kelas: string;
  kurikulum: string;
}

export interface CpState {
  elemen: string;
  subElemen: string;
  capaianFase: string;
  profil: string[];
  fase: string;
  kelas: string;
}

export interface TpItem {
  verb: string;
  desc: string;
  pertemuan: number;
  color: string;
}

export interface AtpPertemuan {
  judul: string;
  tp: string;
  durasi: string;
  kegiatan: string;
  penilaian: string;
}

export interface AtpState {
  namaBab: string;
  jumlahPertemuan: number;
  pertemuan: AtpPertemuan[];
}

export interface AlurItem {
  fase: string;
  durasi: string;
  judul: string;
  deskripsi: string;
}

export interface KuisItem {
  q: string;
  opts: string[];
  ans: number;
  ex: string;
}

export interface MateriBlok {
  tipe: string;
  judul?: string;
  isi?: string;
  icon?: string;
  warna?: string;
  butir?: string[];
  baris?: string[][];
  langkah?: Array<{ icon: string; judul: string; isi: string }>;
  kiri?: { icon?: string; judul?: string; isi?: string };
  kanan?: { icon?: string; judul?: string; isi?: string };
  items?: Array<{ icon?: string; angka?: string; satuan?: string; label?: string; warna?: string; judul?: string; isi?: string }>;
  style?: string;
  karakter?: string;
  situasi?: string;
  pertanyaan?: string;
  pesan?: string;
}

export interface MateriState {
  blok: MateriBlok[];
}

// ── Preset Types ─────────────────────────────────────────────────
interface MetaPreset {
  id: string;
  label: string;
  mapel: string;
  kelas: string;
  kurikulum: string;
  judulPertemuan: string;
  subjudul: string;
  ikon: string;
  durasi: string;
  namaBab: string;
}

interface CpPreset {
  id: string;
  label: string;
  elemen: string;
  subElemen: string;
  capaianFase: string;
  profil: string[];
  fase: string;
  kelas: string;
}

interface TpPreset {
  id: string;
  label: string;
  items: TpItem[];
}

interface AtpPreset {
  id: string;
  label: string;
  namaBab: string;
  jumlahPertemuan: number;
  pertemuan: AtpPertemuan[];
}

interface AlurPreset {
  id: string;
  label: string;
  steps: AlurItem[];
}

interface KuisPreset {
  id: string;
  label: string;
  soal: KuisItem[];
}

// ── Preset Data ──────────────────────────────────────────────────
const PRESETS_META: Record<string, MetaPreset> = {
  'hakikat-norma': {
    id: 'hakikat-norma', label: 'Bab 3 – Pertemuan 1: Hakikat Norma',
    mapel: 'PPKn', kelas: 'VII', kurikulum: 'Kurikulum Merdeka',
    judulPertemuan: 'Pertemuan 1 – Hakikat Norma',
    subjudul: 'Mengapa manusia membutuhkan norma?',
    ikon: '\uD83E\uDDD1\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1', durasi: '2 \u00D7 40 menit', namaBab: 'Hakikat Norma',
  },
  'macam-norma': {
    id: 'macam-norma', label: 'Bab 3 – Pertemuan 2: Macam-Macam Norma',
    mapel: 'PPKn', kelas: 'VII', kurikulum: 'Kurikulum Merdeka',
    judulPertemuan: 'Pertemuan 2 – Macam-Macam Norma',
    subjudul: 'Apa saja jenis norma yang mengatur kehidupan kita?',
    ikon: '\uD83D\uDCDC', durasi: '2 \u00D7 40 menit', namaBab: 'Macam-Macam Norma',
  },
  blank: {
    id: 'blank', label: 'Kosong – Mulai dari Nol',
    mapel: '', kelas: '', kurikulum: 'Kurikulum Merdeka',
    judulPertemuan: '', subjudul: '', ikon: '\uD83D\uDCDA', durasi: '2 \u00D7 40 menit', namaBab: '',
  },
};

const PRESETS_CP: Record<string, CpPreset> = {
  'ppkn-smp-bab3': {
    id: 'ppkn-smp-bab3',
    label: 'PPKn SMP – Bab 3: Patuh terhadap Norma',
    elemen: 'Pancasila',
    subElemen: 'Pemahaman norma dan nilai',
    capaianFase: 'Peserta didik mampu menganalisis pentingnya norma dalam kehidupan bermasyarakat, berbangsa, dan bernegara; serta menunjukkan perilaku patuh terhadap norma sebagai wujud kesadaran hukum.',
    profil: ['Beriman & Bertakwa kepada Tuhan YME', 'Berkebhinekaan Global', 'Bergotong Royong', 'Bernalar Kritis'],
    fase: 'D', kelas: 'VII',
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', elemen: '', subElemen: '', capaianFase: '', profil: [], fase: 'D', kelas: '' },
};

const PRESETS_TP: Record<string, TpPreset> = {
  'bab3-full': {
    id: 'bab3-full', label: 'Bab 3 – 5 TP Lengkap',
    items: [
      { verb: 'Menjelaskan', desc: 'pengertian norma sebagai aturan yang mengikat warga masyarakat dan berfungsi sebagai pedoman tingkah laku dalam kehidupan bersama', pertemuan: 1, color: '#f9c82e' },
      { verb: 'Mengidentifikasi', desc: 'macam-macam norma (agama, kesusilaan, kesopanan, dan hukum) beserta sumber, sanksi, dan sifatnya masing-masing', pertemuan: 2, color: '#3ecfcf' },
      { verb: 'Menganalisis', desc: 'pentingnya patuh terhadap norma dan dampak pelanggaran norma bagi diri sendiri, masyarakat, serta kehidupan berbangsa dan bernegara', pertemuan: 2, color: '#a78bfa' },
      { verb: 'Memberikan contoh', desc: 'penerapan norma di lingkungan keluarga, sekolah, dan masyarakat dalam kehidupan sehari-hari', pertemuan: 3, color: '#34d399' },
      { verb: 'Menerapkan', desc: 'perilaku patuh terhadap norma sebagai wujud kesadaran hukum dan tanggung jawab sebagai warga negara yang baik', pertemuan: 3, color: '#ff6b6b' },
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', items: [] },
};

const PRESETS_ATP: Record<string, AtpPreset> = {
  'bab3-3pertemuan': {
    id: 'bab3-3pertemuan', label: 'Bab 3 – 3 Pertemuan',
    namaBab: 'Bab 3 \u2014 Patuh terhadap Norma',
    jumlahPertemuan: 3,
    pertemuan: [
      { judul: 'Hakikat Norma', tp: 'TP 1 \u2014 Menjelaskan pengertian & fungsi norma', durasi: '2\u00D740 menit', kegiatan: 'Apersepsi skenario \u2192 Manusia makhluk sosial (Zoon Politikon) \u2192 Pengertian norma \u2192 Fungsi norma \u2192 Diskusi kelompok & kuis tim', penilaian: 'Observasi + Pemantik' },
      { judul: 'Macam-Macam Norma', tp: 'TP 2 & 3 \u2014 Mengidentifikasi 4 jenis norma + menganalisis sanksi & dampak pelanggaran', durasi: '2\u00D740 menit', kegiatan: '4 jenis norma (agama, kesusilaan, kesopanan, hukum) \u2192 sanksinya \u2192 Game Sortir Norma \u2192 Roda Norma \u2192 Diskusi kelompok', penilaian: 'Game + Presentasi' },
      { judul: 'Perilaku Patuh terhadap Norma', tp: 'TP 4 & 5 \u2014 Memberikan contoh penerapan + menerapkan perilaku patuh', durasi: '2\u00D740 menit', kegiatan: 'Penerapan norma di 4 lingkungan (keluarga, sekolah, masyarakat, negara) \u2192 Budaya patuh \u2192 Kuis 10 soal \u2192 Refleksi & portofolio', penilaian: 'Kuis + Portofolio' },
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', namaBab: '', jumlahPertemuan: 3, pertemuan: [] },
};

const PRESETS_ALUR: Record<string, AlurPreset> = {
  'hakikat-norma-80menit': {
    id: 'hakikat-norma-80menit', label: 'Hakikat Norma \u2013 2\u00D740 menit',
    steps: [
      { fase: 'Pendahuluan', durasi: '10 menit', judul: 'Apersepsi & Motivasi', deskripsi: 'Guru menyapa, memeriksa kesiapan, menampilkan skenario konflik Kampung. Siswa memprediksi apa yang terjadi tanpa norma.' },
      { fase: 'Inti', durasi: '15 menit', judul: 'Skenario Interaktif', deskripsi: 'Siswa bermain 3 skenario konflik norma secara individual di perangkat masing-masing. Guru memantau dan mencatat respons.' },
      { fase: 'Inti', durasi: '20 menit', judul: 'Materi Konsep', deskripsi: 'Guru menjelaskan Zoon Politikon (Aristoteles), pengertian norma, sumber norma, dan pentingnya norma dalam kehidupan sosial.' },
      { fase: 'Inti', durasi: '20 menit', judul: 'Fungsi Norma & Diskusi', deskripsi: 'Eksplorasi 5 fungsi norma melalui tab interaktif. Siswa menulis jawaban refleksi di kolom diskusi masing-masing fungsi.' },
      { fase: 'Penutup', durasi: '15 menit', judul: 'Kuis Tim & Refleksi', deskripsi: 'Kuis tim 5 soal antar kelompok. Siswa mengisi refleksi akhir. Guru memberi umpan balik dan menutup pembelajaran.' },
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', steps: [] },
};

const PRESETS_KUIS: Record<string, KuisPreset> = {
  'norma-10-soal': {
    id: 'norma-10-soal', label: 'Kuis Norma \u2013 10 Soal Pilihan Ganda',
    soal: [
      { q: 'Norma adalah aturan atau pedoman yang mengatur...', opts: ['Cara berpakaian di sekolah saja', 'Perilaku manusia dalam kehidupan bermasyarakat', 'Peraturan tentang pajak negara', 'Tata cara beribadah di tempat ibadah'], ans: 1, ex: 'Norma mengatur perilaku manusia secara umum dalam kehidupan sosial bersama.' },
      { q: 'Aristoteles menyebut manusia sebagai Zoon Politikon karena...', opts: ['Manusia adalah makhluk paling cerdas di bumi', 'Manusia selalu membutuhkan orang lain dalam hidupnya', 'Manusia bisa berpolitik dan memimpin negara', 'Manusia memiliki akal budi yang membedakan dari hewan'], ans: 1, ex: 'Zoon Politikon berarti makhluk sosial \u2014 manusia tidak bisa hidup sendiri tanpa bantuan orang lain.' },
      { q: 'Fungsi norma yang paling utama dalam masyarakat adalah...', opts: ['Memberikan sanksi bagi pelanggar', 'Mengatur dan menciptakan ketertiban bersama', 'Menghukum orang yang berbuat salah', 'Membatasi kebebasan setiap warga'], ans: 1, ex: 'Fungsi utama norma adalah menciptakan ketertiban agar kehidupan bersama berjalan dengan harmonis.' },
      { q: 'Norma yang bersumber dari keyakinan tentang perintah dan larangan Tuhan disebut norma...', opts: ['Hukum', 'Kesopanan', 'Kesusilaan', 'Agama'], ans: 3, ex: 'Norma agama bersumber dari wahyu Tuhan dan pedoman keagamaan masing-masing agama.' },
      { q: 'Pak Budi membuang sampah di sungai dan diabaikan oleh warga. Fungsi norma apa yang gagal?', opts: ['Pedoman tingkah laku', 'Memperkuat solidaritas', 'Melindungi hak warga', 'Menciptakan ketertiban'], ans: 3, ex: 'Norma seharusnya menjaga ketertiban lingkungan \u2014 membuang sampah sembarangan merusak ketertiban bersama.' },
      { q: 'Contoh norma kesopanan di sekolah adalah...', opts: ['Membayar iuran sekolah tepat waktu', 'Mengucap salam kepada guru saat berpapasan', 'Tidak mencuri barang milik teman', 'Berdoa sebelum memulai pelajaran'], ans: 1, ex: 'Mengucap salam adalah norma kesopanan yang mengatur etika pergaulan dan menghormati orang lain.' },
      { q: 'Norma yang pelanggarannya dikenai sanksi berupa hukuman dari negara disebut norma...', opts: ['Agama', 'Kesusilaan', 'Kesopanan', 'Hukum'], ans: 3, ex: 'Norma hukum punya sanksi tegas dari negara berupa denda, penjara, atau sanksi formal lainnya.' },
      { q: 'Ketika ada warga yang terkena musibah dan tetangga membantu gotong royong, ini menunjukkan fungsi norma sebagai...', opts: ['Pedoman tingkah laku', 'Penentu sanksi', 'Memperkuat solidaritas', 'Melindungi hak warga'], ans: 2, ex: 'Gotong royong adalah wujud norma yang memperkuat solidaritas dan rasa kebersamaan antaranggota masyarakat.' },
      { q: 'Jika seseorang melanggar norma agama, sanksi yang paling utama diterimanya adalah...', opts: ['Denda dari pemerintah', 'Penjara', 'Dikucilkan dari masyarakat', 'Dosa dan hukuman dari Tuhan'], ans: 3, ex: 'Sanksi norma agama bersifat spiritual \u2014 berupa dosa yang dipercaya akan dipertanggungjawabkan kepada Tuhan.' },
      { q: 'Tujuan utama mempelajari norma bagi siswa kelas VII adalah...', opts: ['Agar bisa menjadi hakim di masa depan', 'Agar paham cara menghindari hukuman', 'Agar dapat berperilaku sesuai aturan sebagai warga negara yang baik', 'Agar tahu sanksi yang akan diterima jika melanggar'], ans: 2, ex: 'Mempelajari norma bertujuan membentuk karakter warga negara yang baik, taat aturan, dan bertanggung jawab.' },
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', soal: [] },
};

// ── Full Preset Mapping ──────────────────────────────────────────
const FULL_PRESET_MAP: Record<string, { meta: string; cp: string; tp: string; atp: string; alur: string; kuis: string }> = {
  'hakikat-norma': { meta: 'hakikat-norma', cp: 'ppkn-smp-bab3', tp: 'bab3-full', atp: 'bab3-3pertemuan', alur: 'hakikat-norma-80menit', kuis: 'norma-10-soal' },
  'macam-norma': { meta: 'macam-norma', cp: 'ppkn-smp-bab3', tp: 'bab3-full', atp: 'bab3-3pertemuan', alur: 'hakikat-norma-80menit', kuis: 'norma-10-soal' },
  blank: { meta: 'blank', cp: 'blank', tp: 'blank', atp: 'blank', alur: 'blank', kuis: 'blank' },
};

// ── Skenario Preset Data ────────────────────────────────────────
const PRESETS_SKENARIO: Record<string, Array<Record<string, unknown>>> = {
  'hakikat-norma': [
    {
      title: 'Kampung Tanpa Aturan',
      bg: 'sbg-kampung',
      charEmoji: '🧑', charColor: '#3ecfcf', charPants: '#2563eb',
      choicePrompt: 'Apa yang akan kamu lakukan?',
      setup: [
        { speaker: 'NARRATOR', text: 'Di sebuah kampung, semua warga melakukan apapun yang mereka mau. Tidak ada aturan, tidak ada sanksi, tidak ada norma yang berlaku.' },
        { speaker: 'NARRATOR', text: 'Ada yang membuang sampah ke sungai, ada yang mengambil barang tetangga, ada yang berteriak di tengah malam. Kampung menjadi kacau balau!' },
      ],
      choices: [
        { icon: '🤝', label: 'Mengajak warga membuat aturan', detail: 'Berkumpul dan menyusun norma bersama', good: true, pts: 10, level: 'good', norma: 'Norma sosial muncul dari kesepakatan bersama', resultTitle: 'Langkah Bijak!', resultBody: 'Kamu memahami bahwa norma lahir dari kebutuhan manusia untuk hidup tertib bersama.', consequences: [{ icon: '✅', text: 'Warga setuju membuat aturan bersama' }, { icon: '✅', text: 'Kampung mulai tertib dan rukun' }] },
        { icon: '🤷', label: 'Ikuti saja, yang penting selamat', detail: 'Biarin aja, nggak mau repot', good: false, pts: 2, level: 'bad', norma: 'Tanpa norma, kekacauan akan terus berlanjut', resultTitle: 'Kampung Tetap Kacau', resultBody: 'Diam berarti membiarkan kekacauan. Norma tidak akan tercipta jika tidak ada yang memulai.', consequences: [{ icon: '⚠️', text: 'Kampung semakin kacau' }, { icon: '⚠️', text: 'Warga saling bertengkar' }] },
      ],
    },
    {
      title: 'Aristoteles dan Zoon Politikon',
      bg: 'sbg-kelas',
      charEmoji: '🧑‍🏫', charColor: '#f9c82e', charPants: '#34d399',
      choicePrompt: 'Bagaimana kamu merespons?',
      setup: [
        { speaker: 'GURU', text: 'Aristoteles mengatakan manusia adalah Zoon Politikon — makhluk sosial. Manusia tidak bisa hidup sendiri tanpa bantuan orang lain.' },
        { speaker: 'GURU', text: 'Jadi, manusia BUTUH norma untuk mengatur hubungan antar manusia. Tanpa norma, kehidupan bersama tidak mungkin berjalan.' },
      ],
      choices: [
        { icon: '💡', label: 'Setuju, manusia butuh aturan', detail: 'Norma menjaga ketertiban kehidupan bersama', good: true, pts: 10, level: 'good', norma: 'Norma adalah syarat mutlak kehidupan bermasyarakat', resultTitle: 'Pemahaman Tepat!', resultBody: 'Kamu memahami esensi norma sebagai fondasi kehidupan sosial manusia.', consequences: [{ icon: '✅', text: 'Manusia saling bergantung satu sama lain' }, { icon: '✅', text: 'Norma menjaga hubungan sosial tetap harmonis' }] },
        { icon: '🤔', label: 'Tidak setuju, bisa hidup sendiri', detail: 'Yang penting bisa mandiri aja', good: false, pts: 3, level: 'mid', norma: 'Manusia memang bisa mandiri sebagian, tapi tetap butuh orang lain', resultTitle: 'Kurang Tepat', resultBody: 'Meskipun mandiri, kamu tetap butuh dokter, guru, petani, dan orang lain. Itulah Zoon Politikon!', consequences: [{ icon: '💡', text: 'Coba bayangkan hidup tanpa bantuan siapapun' }, { icon: '💡', text: 'Manusia tetap saling membutuhkan' }] },
      ],
    },
  ],
  'macam-norma': [
    {
      title: '4 Jenis Norma di Pasar',
      bg: 'sbg-pasar',
      charEmoji: '🧑', charColor: '#3ecfcf', charPants: '#2563eb',
      choicePrompt: 'Norma apa yang dilanggar pedagang ini?',
      setup: [
        { speaker: 'NARRATOR', text: 'Di pasar, seorang pedagang menimbun barang agar harganya naik. Dia juga mengganggu pedagang lain yang menjual lebih murah.' },
      ],
      choices: [
        { icon: '⚖️', label: 'Norma Hukum', detail: 'Penimbunan barang melanggar hukum', good: true, pts: 10, level: 'good', norma: 'Penimbunan barang melanggar UU Persaingan Usaha — sanksi negara', resultTitle: 'Benar!', resultBody: 'Penimbunan adalah pelanggaran norma hukum dengan sanksi dari negara.', consequences: [{ icon: '⚖️', text: 'Bisa dikenakan denda atau sanksi hukum' }, { icon: '⚠️', text: 'Merugikan masyarakat banyak' }] },
        { icon: '🙏', label: 'Norma Agama', detail: 'Berbohong itu dosa', good: false, pts: 5, level: 'mid', norma: 'Memang dosa, tapi yang paling tepat adalah norma hukum karena ada sanksi tegas dari negara', resultTitle: 'Kurang Tepat', resultBody: 'Meskipun melanggar norma agama, penimbunan barang lebih tepat dikategorikan pelanggaran norma hukum karena ada sanksi formal dari negara.', consequences: [{ icon: '💡', text: 'Norma hukum punya sanksi paling tegas' }, { icon: '💡', text: 'Pelanggaran ekonomi diatur dalam hukum' }] },
      ],
    },
  ],
  blank: [],
};

// ── Modules Preset Data ─────────────────────────────────────────
const PRESETS_MODULES: Record<string, Array<Record<string, unknown>>> = {
  'hakikat-norma': [
    { type: 'hero', title: 'Hakikat Norma', subjudul: 'Mengapa manusia membutuhkan norma?', ikon: '🤝', gradient: 'sunset', chips: ['PPKn', 'Kelas VII', 'Bab 3'], cta: 'Mulai Belajar' },
    { type: 'kutipan', title: 'Aristoteles', teks: 'Manusia adalah makhluk sosial (Zoon Politikon) yang selalu membutuhkan orang lain dalam hidupnya.', sumber: 'Aristoteles', jabatan: 'Filosof Yunani', warna: '#f9c82e', style: 'card' },
    { type: 'tab-icons', title: '5 Fungsi Norma', intro: 'Klik setiap tab untuk menjelajahi fungsi norma dalam kehidupan.', layout: 'vertical', animasi: 'fade-in', tabs: [
      { icon: '🗺️', label: 'Pedoman Tingkah Laku', color: '#f9c82e', content: 'Norma memberi petunjuk kepada setiap individu tentang cara bertindak yang baik dan benar.' },
      { icon: '🤝', label: 'Menciptakan Ketertiban', color: '#3ecfcf', content: 'Norma mencegah kekacauan dan konflik. Dengan norma, setiap orang tahu apa yang boleh dan tidak boleh dilakukan.' },
      { icon: '🛡️', label: 'Melindungi Hak Warga', color: '#ff6b6b', content: 'Norma menjamin setiap anggota masyarakat mendapatkan hak-haknya dan diperlakukan secara adil.' },
      { icon: '💚', label: 'Memperkuat Solidaritas', color: '#34d399', content: 'Norma mempererat rasa kebersamaan, persatuan, dan kepedulian antaranggota masyarakat.' },
      { icon: '⚖️', label: 'Mewujudkan Keadilan', color: '#a78bfa', content: 'Norma memastikan setiap orang diperlakukan setara dan adil tanpa diskriminasi.' },
    ] },
    { type: 'diskusi', title: 'Diskusi Kelompok', pertanyaan: 'Mengapa manusia membutuhkan norma dalam kehidupan bermasyarakat? Berikan 2 contoh konkrit!', durasi: '05:00', petunjuk: 'Diskusikan dalam kelompok dan tuliskan kesimpulan kalian!' },
  ],
  'macam-norma': [
    { type: 'hero', title: 'Macam-Macam Norma', subjudul: '4 jenis norma yang mengatur kehidupan kita', ikon: '📜', gradient: 'sunset', chips: ['PPKn', 'Kelas VII', 'Bab 3'], cta: 'Mulai Belajar' },
    { type: 'comparison', title: 'Perbandingan 4 Jenis Norma', intro: 'Bandingkan sumber, sanksi, dan sifat masing-masing norma.', kolom: ['Norma Agama', 'Norma Kesusilaan', 'Norma Kesopanan', 'Norma Hukum'], baris: [['Sumber', 'Tuhan/Wahyu', 'Hati Nurani', 'Masyarakat', 'Negara/UUD'], ['Sanksi', 'Dosa/Kutukan', 'Rasa Bersalah', 'Cemoohan/Dikucilkan', 'Denda/Penjara'], ['Sifat', 'Mutlak', 'Mutlak', 'Relatif', 'Memaksa']], tanya: 'Norma mana yang sanksinya paling tegas? Mengapa?' },
    { type: 'memory', title: 'Memory Match — Jenis Norma', pasangan: [
      { kiri: 'Norma Agama', kanan: 'Bersumber dari wahyu Tuhan' },
      { kiri: 'Norma Kesusilaan', kanan: 'Bersumber dari hati nurani' },
      { kiri: 'Norma Kesopanan', kanan: 'Bersumber dari kebiasaan masyarakat' },
      { kiri: 'Norma Hukum', kanan: 'Bersumber dari negara dan berlaku memaksa' },
    ] },
    { type: 'roda', title: 'Roda Norma', opsi: ['Norma Agama', 'Norma Kesusilaan', 'Norma Kesopanan', 'Norma Hukum', 'Adat Istiadat', 'Norma Kesusilaan'] },
    { type: 'diskusi', title: 'Diskusi Kelompok', pertanyaan: 'Berikan 1 contoh pelanggaran norma di sekolah dan jelaskan sanksi yang sesuai untuk masing-masing jenis norma!', durasi: '05:00', petunjuk: 'Diskusikan dalam kelompok dan tuliskan kesimpulan kalian!' },
  ],
  blank: [],
};

// ── Materi Preset Data ──────────────────────────────────────────
const PRESETS_MATERI: Record<string, { blok: MateriBlok[] }> = {
  'hakikat-norma': { blok: [
    { tipe: 'definisi', judul: 'Pengertian Norma', isi: 'Norma adalah aturan atau pedoman tingkah laku yang mengikat warga masyarakat dan berfungsi sebagai landasan untuk mengatur tata tertib kehidupan bersama. Norma lahir dari kesepakatan bersama dan memiliki sanksi bagi pelanggarnya.' },
    { tipe: 'highlight', judul: 'Zoon Politikon', isi: 'Aristoteles menyatakan bahwa manusia adalah Zoon Politikon — makhluk sosial yang tidak bisa hidup sendiri tanpa bantuan orang lain. Karena itulah manusia membutuhkan norma untuk mengatur hubungan antar sesama.', icon: '🧠', warna: '#f9c82e' },
    { tipe: 'poin', judul: '5 Fungsi Norma', butir: ['Pedoman tingkah laku — memberi petunjuk cara bertindak yang benar', 'Menciptakan ketertiban — mencegah kekacauan dan konflik', 'Melindungi hak warga — menjamin hak setiap orang diperlakukan adil', 'Memperkuat solidaritas — mempererat rasa kebersamaan', 'Mewujudkan keadilan — memastikan perlakuan setara tanpa diskriminasi'] },
    { tipe: 'compare', judul: 'Kehidupan Dengan vs Tanpa Norma', kiri: { icon: '❌', judul: 'Tanpa Norma', isi: 'Kekacauan, konflik, tidak ada keadilan, hak warga tidak terlindungi, egoisme merajalela' }, kanan: { icon: '✅', judul: 'Dengan Norma', isi: 'Tertib, damai, adil, hak terlindungi, gotong royong, kepastian hukum' } },
    { tipe: 'studi', judul: 'Studi Kasus: Kampung Harmoni', karakter: '🧑', situasi: 'Di Kampung Harmoni, warga membuat peraturan bersama: antri di sumur, tidak buang sampah di sungai, dan saling menghormati. Suatu hari, ada warga baru yang tidak mau mengikuti peraturan.', pertanyaan: 'Apa yang sebaiknya dilakukan warga Kampung Harmoni?', pesan: 'Norma efektif bila ada kesadaran dan kesepakatan bersama.' },
  ] },
  'macam-norma': { blok: [
    { tipe: 'definisi', judul: 'Macam-Macam Norma', isi: 'Norma dalam masyarakat terdiri dari 4 jenis utama: Norma Agama, Norma Kesusilaan, Norma Kesopanan, dan Norma Hukum. Masing-masing memiliki sumber, sifat, dan sanksi yang berbeda.' },
    { tipe: 'tabel', judul: 'Perbandingan 4 Jenis Norma', baris: [['Jenis Norma', 'Sumber', 'Sifat', 'Contoh Sanksi'], ['Agama', 'Tuhan/Wahyu', 'Mutlak', 'Dosa, kutukan'], ['Kesusilaan', 'Hati Nurani', 'Mutlak', 'Rasa bersalah, menyesal'], ['Kesopanan', 'Masyarakat', 'Relatif', 'Cemoohan, dikucilkan'], ['Hukum', 'Negara/UUD', 'Memaksa', 'Denda, penjara']] },
    { tipe: 'highlight', judul: 'Norma Hukum Paling Tegas', isi: 'Di antara keempat jenis norma, norma hukum memiliki sanksi paling tegas karena ditegakkan oleh negara. Pelanggaran norma hukum dapat dikenai denda, penjara, atau sanksi formal lainnya.', icon: '⚖️', warna: '#ff6b6b' },
    { tipe: 'poin', judul: 'Contoh Pelanggaran per Jenis Norma', butir: ['Agama: Tidak beribadah, berbohong, mencuri', 'Kesusilaan: Melakukan tindakan tidak bermoral', 'Kesopanan: Tidak sopan kepada guru, membuang sampah sembarangan', 'Hukum: Mencuri, melanggar lampu merah, korupsi'] },
  ] },
  blank: { blok: [] },
};

// ── Verb options ─────────────────────────────────────────────────
export const VERB_OPTIONS = [
  'Menjelaskan', 'Mengidentifikasi', 'Menganalisis', 'Memberikan contoh',
  'Menerapkan', 'Mengevaluasi', 'Membandingkan', 'Menyimpulkan',
  'Mendeskripsikan', 'Merancang', 'Membuat', 'Mempresentasikan',
];

const COLOR_OPTIONS = ['#f9c82e', '#3ecfcf', '#a78bfa', '#34d399', '#ff6b6b', '#fb923c'];
export { COLOR_OPTIONS };

function colorForIndex(i: number): string {
  return COLOR_OPTIONS[i % COLOR_OPTIONS.length];
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const STORAGE_KEY = 'at_state_v1';

// ── Store Interface ──────────────────────────────────────────────
interface AuthoringState {
  // Navigation
  activePanel: PanelId;

  // Data
  meta: MetaState;
  cp: CpState;
  tp: TpItem[];
  atp: AtpState;
  alur: AlurItem[];
  skenario: Array<Record<string, unknown>>;
  kuis: KuisItem[];
  modules: Array<Record<string, unknown>>;
  games: Array<Record<string, unknown>>;
  materi: MateriState;

  // System
  dirty: boolean;
  guruPw: string;

  // Navigation actions
  setActivePanel: (panel: PanelId) => void;

  // Meta actions
  updateMeta: (key: keyof MetaState, value: string) => void;

  // CP actions
  updateCp: (key: string, value: unknown) => void;
  addProfil: (value: string) => void;
  removeProfil: (index: number) => void;

  // TP actions
  addTp: () => void;
  deleteTp: (index: number) => void;
  updateTp: (index: number, key: keyof TpItem, value: unknown) => void;
  reorderTp: (fromIndex: number, toIndex: number) => void;

  // ATP actions
  updateAtpNamaBab: (value: string) => void;
  addAtpPertemuan: () => void;
  deleteAtpPertemuan: (index: number) => void;
  updateAtpPertemuan: (index: number, key: keyof AtpPertemuan, value: string) => void;

  // Alur actions
  addAlur: () => void;
  deleteAlur: (index: number) => void;
  updateAlur: (index: number, key: keyof AlurItem, value: string) => void;
  reorderAlur: (fromIndex: number, toIndex: number) => void;

  // Kuis actions
  addKuis: () => void;
  deleteKuis: (index: number) => void;
  updateKuis: (index: number, key: string, value: unknown) => void;
  updateKuisOpt: (index: number, optIndex: number, value: string) => void;
  reorderKuis: (fromIndex: number, toIndex: number) => void;

  // Materi block actions
  addMateriBlok: (tipe: string) => void;
  removeMateriBlok: (index: number) => void;
  updateMateriBlok: (index: number, key: string, value: unknown) => void;
  moveMateriBlok: (fromIndex: number, toIndex: number) => void;

  // Module actions
  addModule: (typeId: string) => void;
  removeModule: (index: number) => void;
  updateModuleField: (index: number, key: string, value: unknown) => void;
  moveModule: (fromIndex: number, toIndex: number) => void;

  // Skenario actions
  setSkenario: (data: Array<Record<string, unknown>>) => void;
  addSkenarioChapter: () => void;
  removeSkenarioChapter: (index: number) => void;
  updateSkenarioChapter: (index: number, key: string, value: unknown) => void;
  addSkenarioSetup: (chapterIndex: number) => void;
  removeSkenarioSetup: (chapterIndex: number, setupIndex: number) => void;
  updateSkenarioSetup: (chapterIndex: number, setupIndex: number, key: string, value: unknown) => void;
  addSkenarioChoice: (chapterIndex: number) => void;
  removeSkenarioChoice: (chapterIndex: number, choiceIndex: number) => void;
  updateSkenarioChoice: (chapterIndex: number, choiceIndex: number, key: string, value: unknown) => void;
  addSkenarioConsequence: (chapterIndex: number, choiceIndex: number) => void;
  removeSkenarioConsequence: (chapterIndex: number, choiceIndex: number, consIndex: number) => void;
  updateSkenarioConsequence: (chapterIndex: number, choiceIndex: number, consIndex: number, key: string, value: unknown) => void;

  // System actions
  markDirty: () => void;
  markClean: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => boolean;

  // Completeness
  calcCompleteness: () => number;

  // Presets
  applyFullPreset: (presetKey: string) => void;
  applyKuisPreset: (presetKey: string) => void;
  applyTpPreset: (presetKey: string) => void;
  applyCpPreset: (presetKey: string) => void;
  applyAtpPreset: (presetKey: string) => void;
  applyAlurPreset: (presetKey: string) => void;
  applyMetaPreset: (presetKey: string) => void;
  newProject: () => void;
}

// ── Create Store ─────────────────────────────────────────────────
export const useAuthoringStore = create<AuthoringState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────
  activePanel: 'dashboard' as PanelId,

  meta: {
    judulPertemuan: '', subjudul: '', ikon: '\uD83D\uDCDA', durasi: '',
    namaBab: '', mapel: '', kelas: '', kurikulum: '',
  },
  cp: {
    elemen: '', subElemen: '', capaianFase: '', profil: [],
    fase: 'D', kelas: '',
  },
  tp: [],
  atp: { namaBab: '', jumlahPertemuan: 3, pertemuan: [] },
  alur: [],
  skenario: [],
  kuis: [],
  modules: [],
  games: [],
  materi: { blok: [] },

  dirty: false,
  guruPw: 'guru123',

  // ── Navigation ─────────────────────────────────────────────────
  setActivePanel: (panel) => set({ activePanel: panel }),

  // ── Meta ───────────────────────────────────────────────────────
  updateMeta: (key, value) => {
    set((s) => ({ meta: { ...s.meta, [key]: value }, dirty: true }));
  },

  // ── CP ─────────────────────────────────────────────────────────
  updateCp: (key, value) => {
    set((s) => ({ cp: { ...s.cp, [key]: value }, dirty: true }));
  },
  addProfil: (value) => {
    set((s) => ({ cp: { ...s.cp, profil: [...s.cp.profil, value] }, dirty: true }));
  },
  removeProfil: (index) => {
    set((s) => ({
      cp: { ...s.cp, profil: s.cp.profil.filter((_, i) => i !== index) },
      dirty: true,
    }));
  },

  // ── TP ─────────────────────────────────────────────────────────
  addTp: () => {
    const { tp } = get();
    const newTp: TpItem = {
      verb: 'Menjelaskan', desc: '', pertemuan: 1,
      color: colorForIndex(tp.length),
    };
    set({ tp: [...tp, newTp], dirty: true });
  },
  deleteTp: (index) => {
    set((s) => ({ tp: s.tp.filter((_, i) => i !== index), dirty: true }));
  },
  updateTp: (index, key, value) => {
    set((s) => {
      const newTp = [...s.tp];
      newTp[index] = { ...newTp[index], [key]: value };
      return { tp: newTp, dirty: true };
    });
  },
  reorderTp: (fromIndex, toIndex) => {
    set((s) => {
      const tp = [...s.tp];
      const [moved] = tp.splice(fromIndex, 1);
      tp.splice(toIndex, 0, moved);
      return { tp, dirty: true };
    });
  },

  // ── ATP ────────────────────────────────────────────────────────
  updateAtpNamaBab: (value) => {
    set((s) => ({ atp: { ...s.atp, namaBab: value }, dirty: true }));
  },
  addAtpPertemuan: () => {
    set((s) => ({
      atp: {
        ...s.atp,
        pertemuan: [...s.atp.pertemuan, { judul: '', tp: '', durasi: '2\u00D740 menit', kegiatan: '', penilaian: '' }],
      },
      dirty: true,
    }));
  },
  deleteAtpPertemuan: (index) => {
    set((s) => ({
      atp: { ...s.atp, pertemuan: s.atp.pertemuan.filter((_, i) => i !== index) },
      dirty: true,
    }));
  },
  updateAtpPertemuan: (index, key, value) => {
    set((s) => {
      const newPertemuan = [...s.atp.pertemuan];
      newPertemuan[index] = { ...newPertemuan[index], [key]: value };
      return { atp: { ...s.atp, pertemuan: newPertemuan }, dirty: true };
    });
  },

  // ── Alur ───────────────────────────────────────────────────────
  addAlur: () => {
    set((s) => ({
      alur: [...s.alur, { fase: 'Inti', durasi: '15 menit', judul: '', deskripsi: '' }],
      dirty: true,
    }));
  },
  deleteAlur: (index) => {
    set((s) => ({ alur: s.alur.filter((_, i) => i !== index), dirty: true }));
  },
  updateAlur: (index, key, value) => {
    set((s) => {
      const newAlur = [...s.alur];
      newAlur[index] = { ...newAlur[index], [key]: value };
      return { alur: newAlur, dirty: true };
    });
  },
  reorderAlur: (fromIndex, toIndex) => {
    set((s) => {
      const alur = [...s.alur];
      const [moved] = alur.splice(fromIndex, 1);
      alur.splice(toIndex, 0, moved);
      return { alur, dirty: true };
    });
  },

  // ── Kuis ───────────────────────────────────────────────────────
  addKuis: () => {
    set((s) => ({
      kuis: [...s.kuis, { q: '', opts: ['', '', '', ''], ans: 0, ex: '' }],
      dirty: true,
    }));
  },
  deleteKuis: (index) => {
    set((s) => ({ kuis: s.kuis.filter((_, i) => i !== index), dirty: true }));
  },
  updateKuis: (index, key, value) => {
    set((s) => {
      const newKuis = [...s.kuis];
      newKuis[index] = { ...newKuis[index], [key]: value };
      return { kuis: newKuis, dirty: true };
    });
  },
  updateKuisOpt: (index, optIndex, value) => {
    set((s) => {
      const newKuis = [...s.kuis];
      const opts = [...(newKuis[index].opts || ['', '', '', ''])];
      opts[optIndex] = value;
      newKuis[index] = { ...newKuis[index], opts };
      return { kuis: newKuis, dirty: true };
    });
  },
  reorderKuis: (fromIndex, toIndex) => {
    set((s) => {
      const kuis = [...s.kuis];
      const [moved] = kuis.splice(fromIndex, 1);
      kuis.splice(toIndex, 0, moved);
      return { kuis, dirty: true };
    });
  },

  // ── Materi Block ─────────────────────────────────────────────
  addMateriBlok: (tipe) => {
    const base: MateriBlok = { tipe };
    switch (tipe) {
      case 'teks':      base.judul = ''; base.isi = ''; break;
      case 'definisi':  base.judul = ''; base.isi = ''; break;
      case 'poin':      base.judul = ''; base.butir = ['']; break;
      case 'tabel':     base.judul = ''; base.baris = [['', ''], ['', '']]; break;
      case 'kutipan':   base.judul = ''; base.isi = ''; break;
      case 'gambar':    base.judul = ''; base.isi = ''; break;
      case 'timeline':  base.judul = ''; base.langkah = [{ icon: '📌', judul: '', isi: '' }]; break;
      case 'highlight': base.judul = ''; base.icon = '⚡'; base.warna = '#f9c82e'; base.isi = ''; break;
      case 'compare':   base.judul = ''; base.kiri = { icon: '', judul: '', isi: '' }; base.kanan = { icon: '', judul: '', isi: '' }; break;
      case 'infobox':   base.judul = ''; base.style = 'info'; base.isi = ''; break;
      case 'checklist': base.judul = ''; base.butir = ['']; break;
      case 'statistik': base.judul = ''; base.items = [{ icon: '📊', angka: '', label: '', warna: '#3ecfcf' }]; break;
      case 'studi':     base.judul = ''; base.karakter = '🧑'; base.situasi = ''; base.pertanyaan = ''; base.pesan = ''; break;
    }
    set((s) => ({ materi: { blok: [...s.materi.blok, base] }, dirty: true }));
  },
  removeMateriBlok: (index) => {
    set((s) => ({ materi: { blok: s.materi.blok.filter((_, i) => i !== index) }, dirty: true }));
  },
  updateMateriBlok: (index, key, value) => {
    set((s) => {
      const blok = [...s.materi.blok];
      blok[index] = { ...blok[index], [key]: value };
      return { materi: { blok }, dirty: true };
    });
  },
  moveMateriBlok: (fromIndex, toIndex) => {
    set((s) => {
      const blok = [...s.materi.blok];
      const [moved] = blok.splice(fromIndex, 1);
      blok.splice(toIndex, 0, moved);
      return { materi: { blok }, dirty: true };
    });
  },

  // ── Modules ──────────────────────────────────────────────────
  addModule: (typeId) => {
    const defaults: Record<string, Record<string, unknown>> = {
      skenario: { type: 'skenario', title: '', chapters: [] },
      video: { type: 'video', title: '', url: '', platform: 'youtube', durasi: '', instruksi: '', pertanyaan: [] },
      flashcard: { type: 'flashcard', title: '', instruksi: '', kartu: [] },
      infografis: { type: 'infografis', title: '', layout: 'grid', intro: '', kartu: [] },
      'studi-kasus': { type: 'studi-kasus', title: '', teks: '', sumber: '', pertanyaan: [] },
      debat: { type: 'debat', title: '', pertanyaan: '', konteks: '', pihakA: { label: 'Pro / Setuju' }, pihakB: { label: 'Kontra / Tidak Setuju' } },
      timeline: { type: 'timeline', title: '', intro: '', events: [] },
      matching: { type: 'matching', title: '', instruksi: '', pasangan: [] },
      materi: { type: 'materi', title: '', intro: '', blok: [] },
      truefalse: { type: 'truefalse', title: '', instruksi: '', soal: [] },
      memory: { type: 'memory', title: '', pasangan: [] },
      roda: { type: 'roda', title: '', opsi: [] },
      hero: { type: 'hero', title: '', subjudul: '', ikon: '📚', gradient: 'sunset', chips: [], cta: '' },
      kutipan: { type: 'kutipan', title: '', teks: '', sumber: '', jabatan: '', warna: '#a78bfa', style: 'card' },
      langkah: { type: 'langkah', title: '', intro: '', style: 'numbered', langkah: [] },
      accordion: { type: 'accordion', title: '', intro: '', items: [] },
      statistik: { type: 'statistik', title: '', intro: '', layout: 'grid', items: [] },
      polling: { type: 'polling', title: '', instruksi: '', tipe: 'single', anonim: true, opsi: [] },
      embed: { type: 'embed', title: '', url: '', tinggi: 420, label: 'Buka di tab baru' },
      'tab-icons': { type: 'tab-icons', title: '', intro: '', layout: 'vertical', animasi: 'fade-in', tabs: [] },
      'icon-explore': { type: 'icon-explore', title: '', intro: '', layout: 'grid', animasi: 'zoom', items: [] },
      comparison: { type: 'comparison', title: '', intro: '', kolom: [], baris: [], tanya: '' },
      'card-showcase': { type: 'card-showcase', title: '', intro: '', layout: 'grid', animasi: 'fade-in', cards: [] },
      'hotspot-image': { type: 'hotspot-image', title: '', intro: '', imageUrl: '', imageHeight: 400, mode: 'pin', animasi: 'bounce', hotspots: [] },
    };
    const base = defaults[typeId] || { type: typeId, title: '' };
    set((s) => ({ modules: [...s.modules, { ...base }], dirty: true }));
  },
  removeModule: (index) => {
    set((s) => ({ modules: s.modules.filter((_, i) => i !== index), dirty: true }));
  },
  updateModuleField: (index, key, value) => {
    set((s) => {
      const modules = [...s.modules];
      modules[index] = { ...modules[index], [key]: value };
      return { modules, dirty: true };
    });
  },
  moveModule: (fromIndex, toIndex) => {
    set((s) => {
      const modules = [...s.modules];
      const [moved] = modules.splice(fromIndex, 1);
      modules.splice(toIndex, 0, moved);
      return { modules, dirty: true };
    });
  },

  // ── Skenario ───────────────────────────────────────────────────
  setSkenario: (data) => set({ skenario: data, dirty: true }),
  addSkenarioChapter: () => {
    const newChapter: Record<string, unknown> = {
      title: '',
      bg: 'sbg-kampung',
      charEmoji: '🧑',
      charColor: '#3ecfcf',
      charPants: '#2563eb',
      choicePrompt: 'Apa yang akan kamu lakukan?',
      setup: [{ speaker: 'NARRATOR', text: '' }],
      choices: [{
        icon: '🤝', label: '', detail: '', good: true, pts: 10, level: 'good',
        norma: '', resultTitle: '', resultBody: '',
        consequences: [{ icon: '✅', text: '' }],
      }],
    };
    set((s) => ({ skenario: [...s.skenario, newChapter], dirty: true }));
  },
  removeSkenarioChapter: (index) => {
    set((s) => ({ skenario: s.skenario.filter((_, i) => i !== index), dirty: true }));
  },
  updateSkenarioChapter: (index, key, value) => {
    set((s) => {
      const next = [...s.skenario];
      next[index] = { ...next[index], [key]: value };
      return { skenario: next, dirty: true };
    });
  },
  addSkenarioSetup: (chapterIndex) => {
    set((s) => {
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const setup = [...((chapter.setup as Array<Record<string, unknown>>) || []), { speaker: '', text: '' }];
      chapter.setup = setup;
      next[chapterIndex] = chapter;
      return { skenario: next, dirty: true };
    });
  },
  removeSkenarioSetup: (chapterIndex, setupIndex) => {
    set((s) => {
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const setup = ((chapter.setup as Array<Record<string, unknown>>) || []).filter((_, i) => i !== setupIndex);
      chapter.setup = setup.length > 0 ? setup : [{ speaker: '', text: '' }];
      next[chapterIndex] = chapter;
      return { skenario: next, dirty: true };
    });
  },
  updateSkenarioSetup: (chapterIndex, setupIndex, key, value) => {
    set((s) => {
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const setup = [...((chapter.setup as Array<Record<string, unknown>>) || [])];
      setup[setupIndex] = { ...setup[setupIndex], [key]: value };
      chapter.setup = setup;
      next[chapterIndex] = chapter;
      return { skenario: next, dirty: true };
    });
  },
  addSkenarioChoice: (chapterIndex) => {
    set((s) => {
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const choices = [...((chapter.choices as Array<Record<string, unknown>>) || []), {
        icon: '🤝', label: '', detail: '', good: false, pts: 5, level: 'mid',
        norma: '', resultTitle: '', resultBody: '',
        consequences: [{ icon: '⚠️', text: '' }],
      }];
      chapter.choices = choices;
      next[chapterIndex] = chapter;
      return { skenario: next, dirty: true };
    });
  },
  removeSkenarioChoice: (chapterIndex, choiceIndex) => {
    set((s) => {
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const choices = ((chapter.choices as Array<Record<string, unknown>>) || []).filter((_, i) => i !== choiceIndex);
      chapter.choices = choices;
      next[chapterIndex] = chapter;
      return { skenario: next, dirty: true };
    });
  },
  updateSkenarioChoice: (chapterIndex, choiceIndex, key, value) => {
    set((s) => {
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const choices = [...((chapter.choices as Array<Record<string, unknown>>) || [])];
      choices[choiceIndex] = { ...choices[choiceIndex], [key]: value };
      chapter.choices = choices;
      next[chapterIndex] = chapter;
      return { skenario: next, dirty: true };
    });
  },
  addSkenarioConsequence: (chapterIndex, choiceIndex) => {
    set((s) => {
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const choices = [...((chapter.choices as Array<Record<string, unknown>>) || [])];
      const choice = { ...choices[choiceIndex] };
      const consequences = [...((choice.consequences as Array<Record<string, unknown>>) || []), { icon: '📌', text: '' }];
      choice.consequences = consequences;
      choices[choiceIndex] = choice;
      chapter.choices = choices;
      next[chapterIndex] = chapter;
      return { skenario: next, dirty: true };
    });
  },
  removeSkenarioConsequence: (chapterIndex, choiceIndex, consIndex) => {
    set((s) => {
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const choices = [...((chapter.choices as Array<Record<string, unknown>>) || [])];
      const choice = { ...choices[choiceIndex] };
      const consequences = ((choice.consequences as Array<Record<string, unknown>>) || []).filter((_, i) => i !== consIndex);
      choice.consequences = consequences;
      choices[choiceIndex] = choice;
      chapter.choices = choices;
      next[chapterIndex] = chapter;
      return { skenario: next, dirty: true };
    });
  },
  updateSkenarioConsequence: (chapterIndex, choiceIndex, consIndex, key, value) => {
    set((s) => {
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const choices = [...((chapter.choices as Array<Record<string, unknown>>) || [])];
      const choice = { ...choices[choiceIndex] };
      const consequences = [...((choice.consequences as Array<Record<string, unknown>>) || [])];
      consequences[consIndex] = { ...consequences[consIndex], [key]: value };
      choice.consequences = consequences;
      choices[choiceIndex] = choice;
      chapter.choices = choices;
      next[chapterIndex] = chapter;
      return { skenario: next, dirty: true };
    });
  },

  // ── System ─────────────────────────────────────────────────────
  markDirty: () => set({ dirty: true }),
  markClean: () => set({ dirty: false }),

  saveToStorage: () => {
    try {
      const s = get();
      const data = {
        meta: s.meta, cp: s.cp, tp: s.tp, atp: s.atp, alur: s.alur,
        skenario: s.skenario, kuis: s.kuis, modules: s.modules,
        games: s.games, materi: s.materi, guruPw: s.guruPw,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      set({ dirty: false });
      toast.success('\u2705 Tersimpan ke browser');
      return true;
    } catch {
      toast.error('\u274C Gagal menyimpan');
      return false;
    }
  },

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      set({
        meta: data.meta || get().meta,
        cp: data.cp || get().cp,
        tp: data.tp || [],
        atp: data.atp || get().atp,
        alur: data.alur || [],
        skenario: data.skenario || [],
        kuis: data.kuis || [],
        modules: data.modules || [],
        games: data.games || [],
        materi: data.materi || { blok: [] },
        guruPw: data.guruPw || 'guru123',
        dirty: false,
      });
      toast.info('\uD83D\uDCC2 Data tersimpan dimuat');
      return true;
    } catch {
      return false;
    }
  },

  // ── Completeness ───────────────────────────────────────────────
  calcCompleteness: () => {
    const s = get();
    let pts = 0;
    let max = 0;
    const check = (val: boolean, w = 1) => { max += w; if (val) pts += w; };
    check(!!s.meta.judulPertemuan, 2);
    check(!!s.meta.kelas);
    check(!!s.cp.capaianFase, 2);
    check(s.tp.length > 0, 2);
    check(s.atp.pertemuan.length > 0, 2);
    check(s.alur.length >= 3, 2);
    check(s.kuis.length >= 5, 2);
    check(s.modules.length > 0, 1);
    return Math.round((pts / max) * 100);
  },

  // ── Full Preset ────────────────────────────────────────────────
  applyFullPreset: (presetKey) => {
    const mapping = FULL_PRESET_MAP[presetKey];
    if (!mapping) { toast.error('Preset tidak ditemukan'); return; }

    const mp = PRESETS_META[mapping.meta];
    const cp = PRESETS_CP[mapping.cp];
    const tp = PRESETS_TP[mapping.tp];
    const atp = PRESETS_ATP[mapping.atp];
    const alur = PRESETS_ALUR[mapping.alur];
    const kuis = PRESETS_KUIS[mapping.kuis];
    const skenario = PRESETS_SKENARIO[presetKey] || [];
    const modules = PRESETS_MODULES[presetKey] || [];
    const materi = PRESETS_MATERI[presetKey] || { blok: [] };

    set({
      meta: mp ? deepClone(mp) : get().meta,
      cp: cp ? deepClone(cp) : get().cp,
      tp: tp ? deepClone(tp.items) : [],
      atp: atp ? deepClone(atp) : get().atp,
      alur: alur ? deepClone(alur.steps) : [],
      kuis: kuis ? deepClone(kuis.soal) : [],
      skenario: deepClone(skenario),
      modules: deepClone(modules),
      games: [],
      materi: deepClone(materi),
      dirty: true,
    });
    toast.success(`⚡ Preset diterapkan: ${presetKey}`);
  },

  applyKuisPreset: (presetKey) => {
    const p = PRESETS_KUIS[presetKey];
    if (!p) return;
    set({ kuis: deepClone(p.soal), dirty: true });
    toast.success(`\u2705 Preset Kuis diterapkan: ${p.label}`);
  },

  applyTpPreset: (presetKey) => {
    const p = PRESETS_TP[presetKey];
    if (!p) return;
    set({ tp: deepClone(p.items), dirty: true });
    toast.success(`\u2705 Preset TP diterapkan: ${p.label}`);
  },

  applyCpPreset: (presetKey) => {
    const p = PRESETS_CP[presetKey];
    if (!p) return;
    set({ cp: deepClone(p), dirty: true });
    toast.success(`\u2705 Preset CP diterapkan: ${p.label}`);
  },

  applyAtpPreset: (presetKey) => {
    const p = PRESETS_ATP[presetKey];
    if (!p) return;
    set({ atp: deepClone(p), dirty: true });
    toast.success(`\u2705 Preset ATP diterapkan: ${p.label}`);
  },

  applyAlurPreset: (presetKey) => {
    const p = PRESETS_ALUR[presetKey];
    if (!p) return;
    set({ alur: deepClone(p.steps), dirty: true });
    toast.success(`\u2705 Preset Alur diterapkan: ${p.label}`);
  },

  applyMetaPreset: (presetKey) => {
    const p = PRESETS_META[presetKey];
    if (!p) return;
    set({ meta: deepClone(p), dirty: true });
    toast.success(`\u2705 Preset meta diterapkan: ${p.label}`);
  },

  newProject: () => {
    set({
      meta: { judulPertemuan: '', subjudul: '', ikon: '\uD83D\uDCDA', durasi: '', namaBab: '', mapel: '', kelas: '', kurikulum: '' },
      cp: { elemen: '', subElemen: '', capaianFase: '', profil: [], fase: 'D', kelas: '' },
      tp: [],
      atp: { namaBab: '', jumlahPertemuan: 3, pertemuan: [] },
      alur: [],
      skenario: [],
      kuis: [],
      modules: [],
      games: [],
      materi: { blok: [] },
      dirty: false,
      activePanel: 'dashboard',
    });
    toast.success('\u2728 Proyek baru dibuat');
  },
}));
