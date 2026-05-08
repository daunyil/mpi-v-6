import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

type GenType = 'cp' | 'tp' | 'atp' | 'alur' | 'kuis' | 'materi' | 'skenario' | 'flashcard' | 'all';

interface GenerateRequest {
  type: GenType;
  topic: string;
  mapel: string;
  kelas: string;
  kurikulum: string;
  text?: string;
  jumlahKuis?: number;
  pertemuan?: number;
}

interface TokenUsage {
  prompt: number;
  completion: number;
}

interface GenerateResponse {
  success: boolean;
  type: string;
  data: unknown;
  tokenUsage?: TokenUsage;
}

// ═══════════════════════════════════════════════════════════════════
// System Prompts — Indonesian Education Context (Kurikulum Merdeka)
// ═══════════════════════════════════════════════════════════════════

function buildCpPrompt(req: GenerateRequest): string {
  const context = req.text ? `\n\nReferensi materi:\n${req.text.slice(0, 3000)}` : '';
  return `Kamu adalah ahli pendidikan Indonesia yang memahami Kurikulum Merdeka. Buatkan data Capaian Pembelajaran (CP) untuk:
- Topik: ${req.topic}
- Mata Pelajaran: ${req.mapel}
- Kelas: ${req.kelas}
- Kurikulum: ${req.kurikulum}
${context}

Kembalikan HANYA JSON dengan struktur berikut (tanpa markdown, tanpa penjelasan):
{
  "elemen": "Nama elemen CP (misal: Pancasila, Bahasa Indonesia, dll)",
  "subElemen": "Sub-elemen dari elemen CP",
  "capaianFase": "Deskripsi lengkap capaian pembelajaran sesuai fase dan kelas",
  "profil": ["Profil Pelajar Pancasila 1", "Profil Pelajar Pancasila 2", "..."],
  "fase": "Fase huruf (misal: D untuk kelas VII SMP)",
  "kelas": "${req.kelas}"
}

Catatan:
- Profil Pelajar Pancasila mencakup: Beriman & Bertakwa, Berkebhinekaan Global, Bergotong Royong, Bernalar Kritis, Kreatif, Mandiri
- Fase D untuk kelas VII-VIII SMP, Fase C untuk kelas V-VI SD
- capaianFase harus detail dan sesuai konteks Kurikulum Merdeka
- Jangan bungkus JSON dalam markdown code block`;
}

function buildTpPrompt(req: GenerateRequest): string {
  const context = req.text ? `\n\nReferensi materi:\n${req.text.slice(0, 3000)}` : '';
  return `Kamu adalah ahli pendidikan Indonesia yang memahami Kurikulum Merdeka dan Taksonomi Bloom. Buatkan Tujuan Pembelajaran (TP) untuk:
- Topik: ${req.topic}
- Mata Pelajaran: ${req.mapel}
- Kelas: ${req.kelas}
- Jumlah Pertemuan: ${req.pertemuan || 3}
${context}

Gunakan kata kerja operasional Taksonomi Bloom (C1-C6):
- C1 (Mengingat): Menyebutkan, Mendefinisikan, Mengidentifikasi, Menuliskan
- C2 (Memahami): Menjelaskan, Mendeskripsikan, Menguraikan, Merangkum
- C3 (Menerapkan): Menerapkan, Mengklasifikasikan, Mencontohkan, Melaksanakan
- C4 (Menganalisis): Menganalisis, Membandingkan, Membedakan, Menghubungkan
- C5 (Mengevaluasi): Mengevaluasi, Menilai, Mengkritik, Menguji
- C6 (Menciptakan): Merancang, Menyusun, Merumuskan, Mengembangkan

Kembalikan HANYA JSON array (tanpa markdown, tanpa penjelasan):
[
  {
    "verb": "Kata kerja Bloom (misal: Menjelaskan)",
    "desc": "Deskripsi lengkap tujuan pembelajaran",
    "pertemuan": 1,
    "color": "#f9c82e"
  }
]

Catatan:
- Buat minimal 3 TP, idealnya 5-7 TP
- Distribusikan TP ke pertemuan secara merata (1-${req.pertemuan || 3})
- Gunakan warna dari palet: #f9c82e, #3ecfcf, #a78bfa, #34d399, #ff6b6b, #fb923c
- TP harus berurutan dari C1/C2 hingga C5/C6 (lower to higher order thinking)
- Jangan bungkus JSON dalam markdown code block`;
}

function buildAtpPrompt(req: GenerateRequest): string {
  const pertemuan = req.pertemuan || 3;
  const context = req.text ? `\n\nReferensi materi:\n${req.text.slice(0, 3000)}` : '';
  return `Kamu adalah ahli pendidikan Indonesia yang memahami Kurikulum Merdeka. Buatkan Alur Tujuan Pembelajaran (ATP) untuk:
- Topik: ${req.topic}
- Mata Pelajaran: ${req.mapel}
- Kelas: ${req.kelas}
- Jumlah Pertemuan: ${pertemuan}
${context}

Kembalikan HANYA JSON (tanpa markdown, tanpa penjelasan):
{
  "namaBab": "Nama bab sesuai topik",
  "jumlahPertemuan": ${pertemuan},
  "pertemuan": [
    {
      "judul": "Judul pertemuan",
      "tp": "TP yang dicapai (misal: TP 1 — Menjelaskan pengertian norma)",
      "durasi": "2×40 menit",
      "kegiatan": "Deskripsi kegiatan pembelajaran (menggunakan arrow → untuk alur)",
      "penilaian": "Teknik penilaian (misal: Observasi + Pemantik, Kuis + Portofolio)"
    }
  ]
}

Catatan:
- Setiap pertemuan harus memiliki kegiatan yang detail dan runtut
- Kegiatan menggunakan format: Langkah1 → Langkah2 → Langkah3
- Penilaian bervariasi: Observasi, Diskusi, Kuis, Portofolio, Presentasi, Proyek
- Jangan bungkus JSON dalam markdown code block`;
}

function buildAlurPrompt(req: GenerateRequest): string {
  const context = req.text ? `\n\nReferensi materi:\n${req.text.slice(0, 3000)}` : '';
  return `Kamu adalah ahli pendidikan Indonesia. Buatkan Alur Kegiatan pembelajaran untuk:
- Topik: ${req.topic}
- Mata Pelajaran: ${req.mapel}
- Kelas: ${req.kelas}
- Total waktu: 2×40 menit (80 menit)
${context}

Kembalikan HANYA JSON array (tanpa markdown, tanpa penjelasan):
[
  {
    "fase": "Pendahuluan",
    "durasi": "10 menit",
    "judul": "Judul kegiatan",
    "deskripsi": "Deskripsi detail kegiatan"
  },
  {
    "fase": "Inti",
    "durasi": "20 menit",
    "judul": "Judul kegiatan",
    "deskripsi": "Deskripsi detail kegiatan"
  },
  {
    "fase": "Penutup",
    "durasi": "10 menit",
    "judul": "Judul kegiatan",
    "deskripsi": "Deskripsi detail kegiatan"
  }
]

Catatan:
- fase HARUS salah satu dari: "Pendahuluan", "Inti", "Penutup"
- Minimal ada 1 Pendahuluan, 2-3 Inti, 1 Penutup
- Total durasi = 80 menit
- Pendahuluan: 10 menit (apersepsi, motivasi)
- Inti: 50-60 menit (dibagi beberapa kegiatan)
- Penutup: 10-15 menit (kesimpulan, refleksi, evaluasi)
- Deskripsi harus detail dan kontekstual
- Jangan bungkus JSON dalam markdown code block`;
}

function buildKuisPrompt(req: GenerateRequest): string {
  const jumlah = req.jumlahKuis || 10;
  const context = req.text ? `\n\nReferensi materi:\n${req.text.slice(0, 3000)}` : '';
  return `Kamu adalah ahli pendidikan Indonesia. Buatkan soal kuis pilihan ganda untuk:
- Topik: ${req.topic}
- Mata Pelajaran: ${req.mapel}
- Kelas: ${req.kelas}
- Jumlah soal: ${jumlah}
${context}

Kembalikan HANYA JSON array (tanpa markdown, tanpa penjelasan):
[
  {
    "q": "Pertanyaan",
    "opts": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
    "ans": 0,
    "ex": "Penjelasan mengapa jawaban ini benar"
  }
]

Catatan:
- ans adalah index 0-based dari jawaban benar dalam array opts (0=A, 1=B, 2=C, 3=D)
- Setiap soal harus punya tepat 4 opsi jawaban
- Opsi yang salah (distraktor) harus masuk akal dan relevan
- Penjelasan (ex) harus edukatif dan informatif
- Soal harus bervariasi: definisi, penerapan, analisis, evaluasi
- Tingkat kesulitan bervariasi dari mudah hingga sulit
- Jangan bungkus JSON dalam markdown code block`;
}

function buildMateriPrompt(req: GenerateRequest): string {
  const context = req.text ? `\n\nReferensi materi (gunakan sebagai dasar konten):\n${req.text.slice(0, 4000)}` : '';
  return `Kamu adalah ahli pendidikan Indonesia. Buatkan materi pembelajaran interaktif untuk:
- Topik: ${req.topic}
- Mata Pelajaran: ${req.mapel}
- Kelas: ${req.kelas}
${context}

Kembalikan HANYA JSON (tanpa markdown, tanpa penjelasan):
{
  "blok": [
    {
      "tipe": "definisi",
      "judul": "Judul Definisi",
      "isi": "Konten definisi"
    },
    {
      "tipe": "poin",
      "judul": "Poin-Poin Penting",
      "butir": ["Poin 1", "Poin 2", "Poin 3"]
    },
    {
      "tipe": "highlight",
      "judul": "Info Penting",
      "icon": "⚡",
      "warna": "#f9c82e",
      "isi": "Konten highlight"
    },
    {
      "tipe": "compare",
      "judul": "Perbandingan",
      "kiri": { "icon": "🔵", "judul": "Sisi Kiri", "isi": "Penjelasan kiri" },
      "kanan": { "icon": "🔴", "judul": "Sisi Kanan", "isi": "Penjelasan kanan" }
    },
    {
      "tipe": "tabel",
      "judul": "Tabel Perbandingan",
      "baris": [["Header 1", "Header 2"], ["Data 1", "Data 2"]]
    },
    {
      "tipe": "kutipan",
      "judul": "Kutipan",
      "isi": "Kutipan relevan"
    },
    {
      "tipe": "timeline",
      "judul": "Alur Tahapan",
      "langkah": [{ "icon": "📌", "judul": "Tahap 1", "isi": "Deskripsi tahap" }]
    },
    {
      "tipe": "studi",
      "judul": "Studi Kasus",
      "karakter": "🧑",
      "situasi": "Deskripsi situasi",
      "pertanyaan": "Pertanyaan refleksi",
      "pesan": "Pesan moral"
    },
    {
      "tipe": "infobox",
      "judul": "Tahukah Kamu?",
      "style": "info",
      "isi": "Fakta menarik"
    },
    {
      "tipe": "teks",
      "judul": "Penjelasan",
      "isi": "Paragraf penjelasan"
    }
  ]
}

Catatan:
- tipe yang tersedia: teks, definisi, poin, highlight, compare, tabel, kutipan, timeline, studi, infobox
- Buat 6-10 blok yang beragam dan saling melengkapi
- Urutkan dari konsep dasar ke penerapan
- Konten harus sesuai konteks kelas ${req.kelas} dan ${req.mapel}
- Gunakan bahasa Indonesia yang mudah dipahami siswa
- Jangan bungkus JSON dalam markdown code block`;
}

function buildSkenarioPrompt(req: GenerateRequest): string {
  const context = req.text ? `\n\nReferensi materi:\n${req.text.slice(0, 3000)}` : '';
  return `Kamu adalah ahli pendidikan Indonesia yang memahami pembelajaran berbasis skenario. Buatkan skenario interaktif untuk:
- Topik: ${req.topic}
- Mata Pelajaran: ${req.mapel}
- Kelas: ${req.kelas}
${context}

Kembalikan HANYA JSON array (tanpa markdown, tanpa penjelasan):
[
  {
    "title": "Judul Bab Skenario",
    "setup": "Deskripsi situasi awal yang menghadapkan siswa pada dilema terkait topik",
    "dialog": [
      { "speaker": "NAMA_KARAKTER", "text": "Dialog karakter" },
      { "speaker": "Anda", "text": "Respons siswa" }
    ],
    "choices": [
      {
        "text": "Pilihan 1 — tindakan yang tepat/benar",
        "feedback": "Umpan balik positif dan edukatif",
        "correct": true
      },
      {
        "text": "Pilihan 2 — tindakan yang kurang tepat",
        "feedback": "Umpan balik konstruktif",
        "correct": false
      },
      {
        "text": "Pilihan 3 — tindakan yang salah",
        "feedback": "Umpan balik korektif dengan penjelasan",
        "correct": false
      }
    ]
  }
]

Catatan:
- Buat 2-3 bab skenario
- Setiap bab harus menghadapkan siswa pada dilema nyata terkait ${req.topic}
- Dialog melibatkan karakter yang relatable untuk siswa kelas ${req.kelas}
- Setiap bab punya 2-3 pilihan dengan hanya 1 yang correct
- Feedback harus edukatif, bukan menghakimi
- Skenario harus kontekstual dalam kehidupan sehari-hari siswa Indonesia
- Jangan bungkus JSON dalam markdown code block`;
}

function buildFlashcardPrompt(req: GenerateRequest): string {
  const context = req.text ? `\n\nReferensi materi:\n${req.text.slice(0, 3000)}` : '';
  return `Kamu adalah ahli pendidikan Indonesia. Buatkan kartu flashcard untuk belajar:
- Topik: ${req.topic}
- Mata Pelajaran: ${req.mapel}
- Kelas: ${req.kelas}
${context}

Kembalikan HANYA JSON array (tanpa markdown, tanpa penjelasan):
[
  {
    "depan": "Pertanyaan atau istilah di sisi depan kartu",
    "belakang": "Jawaban atau definisi di sisi belakang kartu",
    "hint": "Petunjuk singkat untuk membantu mengingat"
  }
]

Catatan:
- Buat 8-12 kartu flashcard
- depan: pertanyaan singkat atau istilah kunci
- belakang: jawaban/definisi yang jelas dan ringkas
- hint: petunjuk asosiatif yang membantu mengingat
- Variasikan jenis: definisi, fungsi, perbedaan, contoh
- Gunakan bahasa Indonesia yang mudah dipahami siswa kelas ${req.kelas}
- Jangan bungkus JSON dalam markdown code block`;
}

function buildAllPrompt(req: GenerateRequest): string {
  const pertemuan = req.pertemuan || 3;
  const jumlahKuis = req.jumlahKuis || 10;
  const context = req.text ? `\n\nReferensi materi:\n${req.text.slice(0, 4000)}` : '';
  return `Kamu adalah ahli pendidikan Indonesia yang memahami Kurikulum Merdeka secara menyeluruh. Buatkan SEMUA komponen perencanaan pembelajaran untuk:
- Topik: ${req.topic}
- Mata Pelajaran: ${req.mapel}
- Kelas: ${req.kelas}
- Kurikulum: ${req.kurikulum}
- Jumlah Pertemuan: ${pertemuan}
- Jumlah Soal Kuis: ${jumlahKuis}
${context}

Kembalikan HANYA JSON (tanpa markdown, tanpa penjelasan):
{
  "cp": {
    "elemen": "Nama elemen CP",
    "subElemen": "Sub-elemen",
    "capaianFase": "Deskripsi capaian pembelajaran lengkap",
    "profil": ["Profil 1", "Profil 2", "Profil 3", "Profil 4"],
    "fase": "D",
    "kelas": "${req.kelas}"
  },
  "tp": [
    {
      "verb": "Kata kerja Bloom",
      "desc": "Deskripsi tujuan pembelajaran",
      "pertemuan": 1,
      "color": "#f9c82e"
    }
  ],
  "atp": {
    "namaBab": "Nama bab",
    "jumlahPertemuan": ${pertemuan},
    "pertemuan": [
      {
        "judul": "Judul pertemuan",
        "tp": "TP yang dicapai",
        "durasi": "2×40 menit",
        "kegiatan": "Alur kegiatan dengan arrow →",
        "penilaian": "Teknik penilaian"
      }
    ]
  },
  "alur": [
    {
      "fase": "Pendahuluan",
      "durasi": "10 menit",
      "judul": "Judul kegiatan",
      "deskripsi": "Deskripsi detail"
    },
    {
      "fase": "Inti",
      "durasi": "20 menit",
      "judul": "Judul kegiatan",
      "deskripsi": "Deskripsi detail"
    },
    {
      "fase": "Penutup",
      "durasi": "10 menit",
      "judul": "Judul kegiatan",
      "deskripsi": "Deskripsi detail"
    }
  ],
  "kuis": [
    {
      "q": "Pertanyaan",
      "opts": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "ans": 0,
      "ex": "Penjelasan"
    }
  ],
  "materi": {
    "blok": [
      {
        "tipe": "definisi",
        "judul": "Judul",
        "isi": "Konten"
      }
    ]
  },
  "skenario": [
    {
      "title": "Judul bab",
      "setup": "Situasi awal",
      "dialog": [{ "speaker": "KARAKTER", "text": "Dialog" }],
      "choices": [{ "text": "Pilihan", "feedback": "Umpan balik", "correct": true }]
    }
  ],
  "flashcard": [
    {
      "depan": "Pertanyaan/istilah",
      "belakang": "Jawaban/definisi",
      "hint": "Petunjuk"
    }
  ]
}

Catatan penting:
- Semua komponen harus KOHEREN dan saling terkait dalam satu topik ${req.topic}
- CP: sesuai Kurikulum Merdeka, Profil Pelajar Pancasila
- TP: gunakan kata kerja Bloom C1-C6, distribusikan ke ${pertemuan} pertemuan, warna: #f9c82e, #3ecfcf, #a78bfa, #34d399, #ff6b6b, #fb923c
- ATP: kegiatan detail dengan arrow →, penilaian bervariasi
- Alur: fase hanya "Pendahuluan"/"Inti"/"Penutup", total 80 menit
- Kuis: ${jumlahKuis} soal PG, ans 0-based, ex edukatif
- Materi: 6-10 blok beragam (tipe: teks, definisi, poin, highlight, compare, tabel, kutipan, timeline, studi, infobox)
- Skenario: 2-3 bab dengan dialog dan pilihan
- Flashcard: 8-12 kartu
- Jangan bungkus JSON dalam markdown code block`;
}

// ═══════════════════════════════════════════════════════════════════
// JSON Parser — Handles AI response edge cases
// ═══════════════════════════════════════════════════════════════════

function extractJSON(raw: string): string {
  // Strip markdown code blocks if present
  let cleaned = raw.trim();

  // Remove ```json ... ``` or ``` ... ``` wrapping
  const codeBlockMatch = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  // Try to find JSON array or object if there's extra text
  const jsonPatterns = [
    // Array pattern
    /^\s*\[[\s\S]*\]\s*$/,
    // Object pattern
    /^\s*\{[\s\S]*\}\s*$/,
  ];

  const isAlreadyValidJSON = jsonPatterns.some((p) => p.test(cleaned));

  if (!isAlreadyValidJSON) {
    // Try extracting the first complete JSON structure
    // Look for array
    const arrStart = cleaned.indexOf('[');
    const arrEnd = cleaned.lastIndexOf(']');
    if (arrStart !== -1 && arrEnd > arrStart) {
      cleaned = cleaned.slice(arrStart, arrEnd + 1);
    } else {
      // Look for object
      const objStart = cleaned.indexOf('{');
      const objEnd = cleaned.lastIndexOf('}');
      if (objStart !== -1 && objEnd > objStart) {
        cleaned = cleaned.slice(objStart, objEnd + 1);
      }
    }
  }

  return cleaned;
}

function parseAIResponse(raw: string): unknown {
  const jsonStr = extractJSON(raw);

  try {
    return JSON.parse(jsonStr);
  } catch (firstError) {
    // Try fixing common JSON issues
    let fixed = jsonStr;

    // Remove trailing commas before } or ]
    fixed = fixed.replace(/,\s*([}\]])/g, '$1');

    // Fix single quotes to double quotes (common AI mistake)
    // Only replace single quotes that look like JSON string delimiters
    fixed = fixed.replace(/:\s*'([^']*?)'/g, ': "$1"');

    try {
      return JSON.parse(fixed);
    } catch {
      // Last resort: try to find any valid JSON substring
      const jsonMatch = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error(
            `Gagal memparse respons AI sebagai JSON. Error: ${(firstError as Error).message}`,
          );
        }
      }
      throw new Error(
        `Respons AI tidak mengandung JSON yang valid. Error: ${(firstError as Error).message}`,
      );
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// AI Generation Logic
// ═══════════════════════════════════════════════════════════════════

function getSystemPrompt(type: GenType, req: GenerateRequest): string {
  switch (type) {
    case 'cp':
      return buildCpPrompt(req);
    case 'tp':
      return buildTpPrompt(req);
    case 'atp':
      return buildAtpPrompt(req);
    case 'alur':
      return buildAlurPrompt(req);
    case 'kuis':
      return buildKuisPrompt(req);
    case 'materi':
      return buildMateriPrompt(req);
    case 'skenario':
      return buildSkenarioPrompt(req);
    case 'flashcard':
      return buildFlashcardPrompt(req);
    case 'all':
      return buildAllPrompt(req);
    default:
      return buildCpPrompt(req);
  }
}

async function generateContent(
  type: GenType,
  req: GenerateRequest,
): Promise<{ data: unknown; tokenUsage?: TokenUsage }> {
  const zai = await ZAI.create();
  const systemPrompt = getSystemPrompt(type, req);

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Generate konten "${type}" untuk topik "${req.topic}" mata pelajaran ${req.mapel} kelas ${req.kelas}. Kembalikan HANYA JSON tanpa penjelasan apapun.`,
      },
    ],
  });

  // Extract the response text
  const rawContent =
    completion?.choices?.[0]?.message?.content ||
    completion?.content ||
    '';

  if (!rawContent || typeof rawContent !== 'string') {
    throw new Error('Respons AI kosong atau tidak valid');
  }

  const data = parseAIResponse(rawContent);

  // Try to extract token usage if available
  const tokenUsage: TokenUsage | undefined =
    completion?.usage
      ? {
          prompt: completion.usage.prompt_tokens || 0,
          completion: completion.usage.completion_tokens || 0,
        }
      : undefined;

  return { data, tokenUsage };
}

// ═══════════════════════════════════════════════════════════════════
// API Route Handler
// ═══════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { type, topic, mapel, kelas, kurikulum } = body as GenerateRequest;

    if (!type || !topic || !mapel || !kelas || !kurikulum) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Field wajib belum lengkap. Dibutuhkan: type, topic, mapel, kelas, kurikulum',
        },
        { status: 400 },
      );
    }

    const validTypes: GenType[] = [
      'cp',
      'tp',
      'atp',
      'alur',
      'kuis',
      'materi',
      'skenario',
      'flashcard',
      'all',
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Tipe "${type}" tidak valid. Tipe yang didukung: ${validTypes.join(', ')}`,
        },
        { status: 400 },
      );
    }

    // Build the request object with defaults
    const req: GenerateRequest = {
      type,
      topic: String(topic),
      mapel: String(mapel),
      kelas: String(kelas),
      kurikulum: String(kurikulum),
      text: body.text ? String(body.text) : undefined,
      jumlahKuis: body.jumlahKuis ? Number(body.jumlahKuis) : 10,
      pertemuan: body.pertemuan ? Number(body.pertemuan) : 3,
    };

    // Generate content
    const { data, tokenUsage } = await generateContent(type, req);

    const response: GenerateResponse = {
      success: true,
      type,
      data,
      tokenUsage,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[AI Generate] Error:', error);

    const message =
      error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';

    // Determine appropriate status code
    let status = 500;
    if (message.includes('Gagal memparse') || message.includes('tidak mengandung JSON')) {
      status = 502; // Bad Gateway — AI returned unparseable response
    } else if (message.includes('kosong') || message.includes('tidak valid')) {
      status = 502;
    }

    return NextResponse.json(
      {
        success: false,
        error: `Gagal generate konten: ${message}`,
      },
      { status },
    );
  }
}
