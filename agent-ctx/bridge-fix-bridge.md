# Task: Fix bridge — preset → canva-store → canva-export → renderers

## Summary
Created a proper bridge module at `src/lib/template-engine/bridge.ts` that connects the authoring store to the template engine export pipeline, fixing the end-to-end data flow.

## Changes Made

### 1. NEW: `src/lib/template-engine/bridge.ts`
- **`AuthoringExportData` interface**: Uses actual store types (`MetaState`, `CpState`, `TpItem[]`, etc.) instead of `AutoBuildData` references, so consumers can pass store data directly without type casting
- **`buildModulesHtml()`**: Iterates `modules[]`, uses `MODUL_TYPE_MAP` for icon/color/label, renders type-specific HTML (hero, kutipan, statistik, langkah, accordion get real rendering; others get placeholder cards)
- **`buildMateriHtml()`**: Iterates `materi.blok[]`, renders each block by `tipe` — handles all 13 block types: teks, definisi, poin, tabel, kutipan, gambar, timeline, highlight, compare, infobox, checklist, statistik, studi
- **`buildGamesHtml()`**: Iterates `games[]`, renders placeholder cards with type info from `MODUL_TYPE_MAP`
- **`buildFungsiHtml()`**: Generates the fungsi norma tab shell HTML using `FUNGSI_NORMA` data
- **`buildExtraScreenHtml()`**: Distributes modules into per-screen HTML segments (s-hubungan, s-flashcard, s-hotspot, s-sortir, s-roda) based on module type
- **`exportProject()`**: The unified entry point — takes authoring store data, builds all HTML segments, calls `autoBuildScreens()` + `exportWithTemplateSystem()` with everything filled in

### 2. MODIFIED: `src/lib/template-engine/auto-build.ts`
- Updated `exportWithTemplateSystem()` to use bridge-provided fungsi HTML via `extraScreenHtml['_fungsiHtml']` when available, falling back to the hardcoded default

### 3. MODIFIED: `src/lib/template-engine/index.ts`
- Added re-exports for all bridge functions: `exportProject`, `buildModulesHtml`, `buildMateriHtml`, `buildGamesHtml`, `buildFungsiHtml`, `buildExtraScreenHtml`, and `AuthoringExportData` type

### 4. MODIFIED: `src/components/authoring/ImportExport.tsx`
- Changed import from `exportWithTemplateSystem` to `exportProject` from the bridge
- `exportStudentHtml()` now calls `exportProject()` which fills all HTML slots automatically

### 5. MODIFIED: `src/components/authoring/LivePreview.tsx`
- Changed import from `exportWithTemplateSystem` to `exportProject` from the bridge
- Template mode preview now uses `exportProject()` for complete HTML with all slots filled

## Key Design Decisions
- Bridge works on both client-side (preview) and server-side (export) — no `require()`, no `'use client'`, receives data explicitly
- Uses `import type` from authoring-store to avoid runtime dependency
- `MateriBlok[]` → `Record<string, unknown>[]` cast only at the boundary to `AutoBuildData`, not at the consumer level
- Module/game rendering is placeholder HTML for most types, with real rendering for: hero, kutipan, statistik, langkah, accordion (to be fleshed out in Priority 5)
- Fungsi HTML shell is passed through `extraScreenHtml['_fungsiHtml']` to avoid changing the `exportWithTemplateSystem` function signature

## TS Errors
No new TypeScript errors introduced. The 65 pre-existing errors in the project are unrelated to these changes.
