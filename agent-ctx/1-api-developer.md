# Task 1 — Backend API Developer

## Task
Create a backend API route for AI-powered content generation using z-ai-web-dev-sdk.

## Result
✅ Successfully created `/home/z/my-project/src/app/api/ai-generate/route.ts`

## What was built
- POST API route at `/api/ai-generate` that uses `z-ai-web-dev-sdk` for AI chat completions
- 9 content types supported: `cp`, `tp`, `atp`, `alur`, `kuis`, `materi`, `skenario`, `flashcard`, `all`
- Each type has a dedicated system prompt in Bahasa Indonesia with Kurikulum Merdeka context
- JSON output structures match the existing Zustand store types from `authoring-store.ts`
- Robust JSON parser handles markdown code blocks, trailing commas, single quotes
- Error handling with appropriate HTTP status codes and Indonesian error messages
- Token usage reporting when available

## Testing Results
- ✅ CP generation returns `{elemen, subElemen, capaianFase, profil, fase, kelas}`
- ✅ TP generation returns `[{verb, desc, pertemuan, color}]` with Bloom verbs
- ✅ Kuis generation returns `[{q, opts, ans, ex}]` with correct 0-based index
- ✅ Flashcard generation returns `[{depan, belakang, hint}]`
- ✅ All generation returns `{cp, tp, atp, alur, kuis, materi, skenario, flashcard}`
- ✅ Error: 400 for missing fields, 400 for invalid type
- ✅ ESLint: 0 errors
- ✅ z-ai-web-dev-sdk only used in backend (never client-side)

## Request Format
```json
{
  "type": "cp" | "tp" | "atp" | "alur" | "kuis" | "materi" | "skenario" | "flashcard" | "all",
  "topic": "Hakikat Norma",
  "mapel": "PPKn",
  "kelas": "VII",
  "kurikulum": "Kurikulum Merdeka",
  "text": "optional reference material",
  "jumlahKuis": 10,
  "pertemuan": 3
}
```

## Response Format
```json
{
  "success": true,
  "type": "cp",
  "data": { ... },
  "tokenUsage": { "prompt": 373, "completion": 135 }
}
```
